import os
import secrets
from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.password_validation import validate_password
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema

from apps.core.exceptions import BusinessLogicError
from apps.audit.services import log_action
from .models import User, PasswordResetToken
from .serializers import (
    LoginSerializer,
    UserSummarySerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)
from .services import (
    authenticate_user,
    rotate_refresh_token,
    revoke_refresh_token,
    revoke_all_user_tokens,
    hash_token,
)

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')

class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=LoginSerializer, responses={200: UserSummarySerializer})
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        ip = get_client_ip(request)
        ua = request.META.get('HTTP_USER_AGENT', '')

        user, access_token, refresh_token = authenticate_user(
            login_identity=username,
            password=password,
            ip=ip,
            user_agent=ua
        )

        log_action(
            user=user,
            action='LOGIN',
            entity_type='User',
            entity_id=user.id,
            detail={'ip': ip},
            request=request
        )

        response = Response({
            'data': {
                'access_token': access_token,
                'user': UserSummarySerializer(user).data,
            }
        }, status=status.HTTP_200_OK)

        # Set HttpOnly refresh token cookie
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            max_age=7 * 24 * 3600,
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax' if settings.DEBUG else 'Strict',
            path='/api/v1/auth/refresh'
        )
        return response

class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        raw_token = request.COOKIES.get('refresh_token') or request.data.get('refresh_token')
        ip = get_client_ip(request)
        ua = request.META.get('HTTP_USER_AGENT', '')

        user, new_access_token, new_refresh_token = rotate_refresh_token(
            raw_refresh_token=raw_token,
            ip=ip,
            user_agent=ua
        )

        response = Response({
            'data': {
                'access_token': new_access_token,
                'user': UserSummarySerializer(user).data,
            }
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            key='refresh_token',
            value=new_refresh_token,
            max_age=7 * 24 * 3600,
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax' if settings.DEBUG else 'Strict',
            path='/api/v1/auth/refresh'
        )
        return response

class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        raw_token = request.COOKIES.get('refresh_token') or request.data.get('refresh_token')
        if raw_token:
            revoke_refresh_token(raw_token)

        if request.user and request.user.is_authenticated:
            log_action(
                user=request.user,
                action='LOGOUT',
                entity_type='User',
                entity_id=request.user.id,
                request=request
            )

        response = Response({
            'detail': 'Đăng xuất thành công.'
        }, status=status.HTTP_200_OK)
        response.delete_cookie('refresh_token', path='/api/v1/auth/refresh')
        return response

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identity = serializer.validated_data['email_or_username']

        user = User.objects.filter(
            deleted_at__isnull=True,
            is_active=True
        ).filter(
            models_Q := (
                User.objects.filter(email__iexact=identity) |
                User.objects.filter(username__iexact=identity)
            )
        ).first()

        if user:
            raw_token = secrets.token_urlsafe(32)
            token_h = hash_token(raw_token)
            PasswordResetToken.objects.create(
                user=user,
                token_hash=token_h,
                expires_at=timezone.now() + timedelta(hours=1)
            )
            # In a production environment, send email here.

        # Consistent message to prevent user enumeration
        return Response({
            'detail': 'Nếu tài khoản tồn tại, hệ thống đã gửi liên kết đặt lại mật khẩu đến email đã đăng ký.'
        }, status=status.HTTP_200_OK)

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        raw_token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        token_h = hash_token(raw_token)
        now = timezone.now()
        reset_token = PasswordResetToken.objects.filter(
            token_hash=token_h,
            used_at__isnull=True,
            expires_at__gt=now
        ).select_related('user').first()

        if not reset_token:
            raise BusinessLogicError('AUTH_TOKEN_INVALID', detail='Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.')

        user = reset_token.user
        validate_password(new_password, user=user)

        user.set_password(new_password)
        user.password_changed_at = now
        user.must_change_password = False
        user.save(update_fields=['password', 'password_changed_at', 'must_change_password'])

        reset_token.used_at = now
        reset_token.save(update_fields=['used_at'])

        # Revoke all existing sessions
        revoke_all_user_tokens(user)

        log_action(
            user=user,
            action='RESET_PASSWORD',
            entity_type='User',
            entity_id=user.id,
            request=request
        )

        return Response({
            'detail': 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.'
        }, status=status.HTTP_200_OK)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response({'data': serializer.data}, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        log_action(
            user=request.user,
            action='UPDATE_PROFILE',
            entity_type='User',
            entity_id=request.user.id,
            detail=serializer.validated_data,
            request=request
        )

        return Response({'data': serializer.data}, status=status.HTTP_200_OK)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        old_pwd = serializer.validated_data['old_password']
        new_pwd = serializer.validated_data['new_password']

        if not request.user.check_password(old_pwd):
            raise BusinessLogicError('AUTH_INVALID_CREDENTIALS', detail='Mật khẩu cũ không chính xác.')

        validate_password(new_pwd, user=request.user)

        request.user.set_password(new_pwd)
        request.user.password_changed_at = timezone.now()
        request.user.must_change_password = False
        request.user.save(update_fields=['password', 'password_changed_at', 'must_change_password'])

        revoke_all_user_tokens(request.user)

        log_action(
            user=request.user,
            action='CHANGE_PASSWORD',
            entity_type='User',
            entity_id=request.user.id,
            request=request
        )

        return Response({
            'detail': 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại trên các thiết bị khác.'
        }, status=status.HTTP_200_OK)

class AvatarUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file_obj = request.FILES.get('avatar')
        if not file_obj:
            raise BusinessLogicError('VALIDATION_ERROR', detail='Không tìm thấy tập tin ảnh.')

        if file_obj.size > 5 * 1024 * 1024:
            raise BusinessLogicError('FILE_TOO_LARGE')

        # Check magic bytes for JPEG, PNG, WebP
        header = file_obj.read(12)
        file_obj.seek(0)
        is_jpeg = header.startswith(b'\xff\xd8\xff')
        is_png = header.startswith(b'\x89PNG\r\n\x1a\n')
        is_webp = header.startswith(b'RIFF') and header[8:12] == b'WEBP'

        if not (is_jpeg or is_png or is_webp):
            raise BusinessLogicError('FILE_TYPE_NOT_ALLOWED')

        ext = 'jpg' if is_jpeg else ('png' if is_png else 'webp')
        filename = f"avatar_{request.user.id}_{secrets.token_hex(8)}.{ext}"
        upload_dir = settings.MEDIA_ROOT / 'avatars'
        upload_dir.mkdir(parents=True, exist_ok=True)
        file_path = upload_dir / filename

        with open(file_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        avatar_url = f"{settings.MEDIA_URL}avatars/{filename}"
        request.user.avatar = avatar_url
        request.user.save(update_fields=['avatar'])

        return Response({
            'data': {'avatar': avatar_url},
            'detail': 'Cập nhật ảnh đại diện thành công.'
        }, status=status.HTTP_200_OK)



from django.db.models import Q
from apps.core.pagination import StandardPagination
from apps.accounts.permissions import IsAdminUserRole
from apps.circulation.models import Loan
from apps.fines.models import Fine
from apps.reservations.models import Reservation
from apps.core.enums import LoanStatus, FineStatus, ReservationStatus
from .serializers import UserAdminSerializer, UserCreateAdminSerializer

class UserAdminListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        queryset = User.objects.filter(deleted_at__isnull=True).order_by('-created_at')

        role = request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)

        is_locked = request.query_params.get('is_locked')
        if is_locked is not None:
            if is_locked.lower() == 'true':
                queryset = queryset.filter(is_locked=True)
            elif is_locked.lower() == 'false':
                queryset = queryset.filter(is_locked=False)

        card_code = request.query_params.get('card_code')
        if card_code:
            queryset = queryset.filter(
                Q(card_code__iexact=card_code.strip()) |
                Q(username__iexact=card_code.strip())
            )

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(full_name__icontains=search) |
                Q(card_code__icontains=search) |
                Q(department__icontains=search)
            )

        paginator = StandardPagination()
        page_records = paginator.paginate_queryset(queryset, request)
        serializer = UserAdminSerializer(page_records, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        if 'avatar' in request.FILES:
            data.pop('avatar', None)
        serializer = UserCreateAdminSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        avatar_file = request.FILES.get('avatar')
        if avatar_file:
            header = avatar_file.read(12)
            avatar_file.seek(0)
            is_jpeg = header.startswith(b'\xff\xd8\xff')
            is_png = header.startswith(b'\x89PNG\r\n\x1a\n')
            is_webp = header.startswith(b'RIFF') and header[8:12] == b'WEBP'
            ext = 'jpg' if is_jpeg else ('png' if is_png else 'webp')
            filename = f"avatar_{user.id}_{secrets.token_hex(6)}.{ext}"
            upload_dir = settings.MEDIA_ROOT / 'avatars'
            upload_dir.mkdir(parents=True, exist_ok=True)
            file_path = upload_dir / filename
            with open(file_path, 'wb+') as dest:
                for chunk in avatar_file.chunks():
                    dest.write(chunk)
            user.avatar = f"{settings.MEDIA_URL}avatars/{filename}"
            user.save(update_fields=['avatar'])

        log_action(
            user=request.user,
            action='ADMIN_CREATE_USER',
            entity_type='User',
            entity_id=user.id,
            detail={'username': user.username, 'card_code': user.card_code, 'role': user.role},
            request=request
        )

        return Response(UserAdminSerializer(user).data, status=status.HTTP_201_CREATED)

class UserAdminDetailView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request, pk):
        user = User.objects.filter(id=pk, deleted_at__isnull=True).first()
        if not user:
            raise BusinessLogicError('NOT_FOUND', detail='Người dùng không tồn tại.')

        data = UserAdminSerializer(user).data
        data['active_loans_count'] = Loan.objects.filter(user=user, status=LoanStatus.ACTIVE).count()
        data['unpaid_fines_count'] = Fine.objects.filter(user=user, status__in=[FineStatus.UNPAID, FineStatus.PARTIAL]).count()
        data['reservations_count'] = Reservation.objects.filter(user=user, status__in=[ReservationStatus.PENDING, ReservationStatus.READY]).count()
        return Response({'data': data}, status=status.HTTP_200_OK)

    def put(self, request, pk):
        user = User.objects.filter(id=pk, deleted_at__isnull=True).first()
        if not user:
            raise BusinessLogicError('NOT_FOUND', detail='Người dùng không tồn tại.')

        serializer = UserAdminSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        log_action(
            user=request.user,
            action='ADMIN_UPDATE_USER',
            entity_type='User',
            entity_id=user.id,
            detail=serializer.validated_data,
            request=request
        )

        return Response({'data': UserAdminSerializer(user).data}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        user = User.objects.filter(id=pk, deleted_at__isnull=True).first()
        if not user:
            raise BusinessLogicError('NOT_FOUND', detail='Người dùng không tồn tại.')

        # Check active loans
        if Loan.objects.filter(user=user, status=LoanStatus.ACTIVE).exists():
            raise BusinessLogicError('USER_HAS_ACTIVE_LOANS', detail='Không thể xóa bạn đọc đang có sách mượn chưa trả.')

        # Check unpaid fines
        if Fine.objects.filter(user=user, status__in=[FineStatus.UNPAID, FineStatus.PARTIAL]).exists():
            raise BusinessLogicError('USER_HAS_UNPAID_FINES', detail='Không thể xóa bạn đọc đang còn nợ tiền phạt chưa thanh toán.')

        # Check ready reservations
        if Reservation.objects.filter(user=user, status=ReservationStatus.READY).exists():
            raise BusinessLogicError('USER_HAS_READY_RESERVATIONS', detail='Không thể xóa bạn đọc đang có sách giữ chỗ sẵn sàng tại quầy.')

        user.deleted_at = timezone.now()
        user.is_active = False
        user.save(update_fields=['deleted_at', 'is_active'])

        log_action(
            user=request.user,
            action='ADMIN_DELETE_USER',
            entity_type='User',
            entity_id=user.id,
            request=request
        )

        return Response({'detail': f'Đã xóa tài khoản {user.card_code} thành công.'}, status=status.HTTP_200_OK)

class UserLockToggleView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        user = User.objects.filter(id=pk, deleted_at__isnull=True).first()
        if not user:
            raise BusinessLogicError('NOT_FOUND', detail='Người dùng không tồn tại.')

        should_lock = request.data.get('is_locked', not user.is_locked)
        reason = request.data.get('lock_reason', 'Thủ thư khóa tài khoản')

        if should_lock:
            user.is_locked = True
            user.lock_reason = reason
            user.save(update_fields=['is_locked', 'lock_reason'])
        else:
            user.is_locked = False
            user.lock_reason = None
            user.locked_until = None
            user.reservation_locked_until = None
            user.failed_login_count = 0
            user.save(update_fields=[
                'is_locked', 'lock_reason', 'locked_until',
                'reservation_locked_until', 'failed_login_count'
            ])

        log_action(
            user=request.user,
            action='ADMIN_LOCK_USER' if should_lock else 'ADMIN_UNLOCK_USER',
            entity_type='User',
            entity_id=user.id,
            detail={'is_locked': should_lock, 'reason': reason},
            request=request
        )

        return Response({
            'data': UserAdminSerializer(user).data,
            'detail': 'Đã khóa tài khoản thành công.' if should_lock else 'Đã mở khóa tài khoản thành công.'
        }, status=status.HTTP_200_OK)

class UserCardExtendView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        user = User.objects.filter(id=pk, deleted_at__isnull=True).first()
        if not user:
            raise BusinessLogicError('NOT_FOUND', detail='Người dùng không tồn tại.')

        extend_months = int(request.data.get('extend_months', 12))
        base_date = user.card_expiry if (user.card_expiry and user.card_expiry >= timezone.localdate()) else timezone.localdate()
        new_expiry = base_date + timedelta(days=extend_months * 30)

        user.card_expiry = new_expiry
        user.save(update_fields=['card_expiry'])

        log_action(
            user=request.user,
            action='ADMIN_EXTEND_CARD',
            entity_type='User',
            entity_id=user.id,
            detail={'new_expiry': new_expiry.isoformat(), 'extend_months': extend_months},
            request=request
        )

        return Response({
            'data': UserAdminSerializer(user).data,
            'detail': f"Đã gia hạn thẻ bạn đọc đến ngày {new_expiry.strftime('%d/%m/%Y')}."
        }, status=status.HTTP_200_OK)

class UserResetPasswordAdminView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        user = User.objects.filter(id=pk, deleted_at__isnull=True).first()
        if not user:
            raise BusinessLogicError('NOT_FOUND', detail='Người dùng không tồn tại.')

        new_password = request.data.get('new_password', 'UthLibrary@123')
        validate_password(new_password, user=user)

        user.set_password(new_password)
        user.must_change_password = True
        user.password_changed_at = timezone.now()
        user.save(update_fields=['password', 'must_change_password', 'password_changed_at'])

        revoke_all_user_tokens(user)

        log_action(
            user=request.user,
            action='ADMIN_RESET_PASSWORD',
            entity_type='User',
            entity_id=user.id,
            request=request
        )

        return Response({
            'detail': f'Đã đặt lại mật khẩu cho {user.username}. Người dùng sẽ phải đổi mật khẩu ở lần đăng nhập tiếp theo.'
        }, status=status.HTTP_200_OK)
