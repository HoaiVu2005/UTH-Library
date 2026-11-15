import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework.exceptions import (
    AuthenticationFailed,
    NotAuthenticated,
    PermissionDenied,
    NotFound,
    ValidationError as DRFValidationError,
    Throttled,
)
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
from .error_codes import ERROR_CODE_MAPPING

logger = logging.getLogger(__name__)

class BusinessLogicError(Exception):
    def __init__(self, code: str, detail: str = None, field: str = None, extra: dict = None):
        self.code = code
        default_meta = ERROR_CODE_MAPPING.get(code, {})
        self.detail = detail or default_meta.get('detail', 'Lỗi quy tắc nghiệp vụ.')
        self.status_code = default_meta.get('status', 422)
        self.field = field
        self.extra = extra or {}
        super().__init__(self.detail)

def custom_exception_handler(exc, context):
    # Call DRF's default exception handler first to get standard response
    response = exception_handler(exc, context)

    # 1. Custom BusinessLogicError
    if isinstance(exc, BusinessLogicError):
        data = {
            'code': exc.code,
            'detail': exc.detail,
        }
        if exc.field:
            data['field'] = exc.field
        if exc.extra:
            data.update(exc.extra)
        return Response(data, status=exc.status_code)

    # 2. Authentication exceptions
    if isinstance(exc, (AuthenticationFailed, NotAuthenticated)):
        code = getattr(exc, 'code', 'UNAUTHORIZED')
        if code not in ERROR_CODE_MAPPING:
            code = 'UNAUTHORIZED' if isinstance(exc, NotAuthenticated) else 'AUTH_INVALID_CREDENTIALS'
        meta = ERROR_CODE_MAPPING[code]
        return Response({
            'code': code,
            'detail': str(exc.detail) if hasattr(exc, 'detail') and str(exc.detail) != 'Invalid credentials' else meta['detail'],
        }, status=meta['status'])

    # 3. Permission exceptions
    if isinstance(exc, PermissionDenied):
        meta = ERROR_CODE_MAPPING['FORBIDDEN']
        return Response({
            'code': 'FORBIDDEN',
            'detail': str(exc.detail) if hasattr(exc, 'detail') else meta['detail'],
        }, status=meta['status'])

    # 4. Not found
    if isinstance(exc, (NotFound, Http404)):
        meta = ERROR_CODE_MAPPING['NOT_FOUND']
        return Response({
            'code': 'NOT_FOUND',
            'detail': str(exc.detail) if hasattr(exc, 'detail') else meta['detail'],
        }, status=meta['status'])

    # 5. Throttled / Rate Limited
    if isinstance(exc, Throttled):
        meta = ERROR_CODE_MAPPING['RATE_LIMITED']
        return Response({
            'code': 'RATE_LIMITED',
            'detail': meta['detail'],
            'wait_seconds': getattr(exc, 'wait', 60),
        }, status=meta['status'])

    # 6. Validation Errors
    if isinstance(exc, (DRFValidationError, DjangoValidationError)):
        meta = ERROR_CODE_MAPPING['VALIDATION_ERROR']
        errors = []
        detail_msg = meta['detail']
        
        detail_dict = exc.detail if hasattr(exc, 'detail') else {}
        if isinstance(detail_dict, dict):
            for field, messages in detail_dict.items():
                msg_text = messages[0] if isinstance(messages, list) and messages else str(messages)
                errors.append({
                    'field': field,
                    'code': 'INVALID_FIELD',
                    'detail': msg_text,
                })
        elif isinstance(detail_dict, list):
            for msg in detail_dict:
                errors.append({
                    'field': None,
                    'code': 'INVALID_ITEM',
                    'detail': str(msg),
                })

        return Response({
            'code': 'VALIDATION_ERROR',
            'detail': detail_msg,
            'errors': errors,
        }, status=meta['status'])

    # 7. Unhandled 500 error - log and return safe message without stack trace
    if response is None:
        logger.exception("Unhandled server exception: %s", exc)
        meta = ERROR_CODE_MAPPING['INTERNAL_ERROR']
        return Response({
            'code': 'INTERNAL_ERROR',
            'detail': meta['detail'],
        }, status=meta['status'])

    return response

