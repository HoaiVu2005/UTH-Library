import uuid
import time
import logging

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.request_id = str(uuid.uuid4())
        start_time = time.time()

        response = self.get_response(request)

        duration = round((time.time() - start_time) * 1000, 2)
        response['X-Request-ID'] = request.request_id

        # Log request if not health check
        if not request.path.endswith('/health'):
            user_repr = f"User({request.user.id})" if hasattr(request, 'user') and request.user.is_authenticated else "Anonymous"
            logger.info(
                f"{request.method} {request.path} {response.status_code} ({duration}ms) - {user_repr} [req:{request.request_id}]"
            )

        return response

