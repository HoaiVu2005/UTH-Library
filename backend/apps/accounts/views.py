import os
import io
import csv
import secrets
from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from django.http import HttpResponse
from django.contrib.auth.password_validation import validate_password
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema

from apps.core.exceptions import BusinessLogicError
from apps.audit.services import log_action
from .models import (
    User, PasswordResetToken, StudentRoster, StudentStatus,
    PaymentTransaction, PaymentMethod, TransactionStatus, TransactionType,
)
from .serializers import (
    LoginSerializer,
    UserSummarySerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    StudentRosterSerializer,
    PaymentTransactionSerializer,
)
from .services import (
    authenticate_user,
    rotate_refresh_token,
    revoke_refresh_token,
    revoke_all_user_tokens,
    hash_token,
    auto_suspend_violating_users,
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
                'refresh_token': refresh_token,
                'user': UserSummarySerializer(user).data,
            }
        }, status=status.HTTP_200_OK)

        # Set HttpOnly refresh token cookie with root path
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            max_age=30 * 24 * 3600,
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            path='/'
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
                'refresh_token': new_refresh_token,
                'user': UserSummarySerializer(user).data,
            }
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            key='refresh_token',
            value=new_refresh_token,
            max_age=30 * 24 * 3600,
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            path='/'
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
        response.delete_cookie('refresh_token', path='/')
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
from apps.accounts.permissions import IsAdminUserRole, IsAdminOnlyRole
from apps.circulation.models import Loan
from apps.fines.models import Fine
from apps.reservations.models import Reservation
from apps.core.enums import LoanStatus, FineStatus, ReservationStatus, UserRole
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
        target_role = data.get('role', UserRole.STUDENT)
        if request.user.role == UserRole.LIBRARIAN and target_role not in [UserRole.STUDENT, UserRole.LECTURER]:
            raise BusinessLogicError('FORBIDDEN', detail='Thủ thư chỉ có thẩm quyền tạo tài khoản Bạn đọc (Sinh viên hoặc Giảng viên).')

        if 'avatar' in request.FILES:
            data.pop('avatar', None)
        serializer = UserCreateAdminSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        user: User = serializer.save()

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

        target_role = request.data.get('role')
        if target_role and request.user.role == UserRole.LIBRARIAN and target_role not in [UserRole.STUDENT, UserRole.LECTURER]:
            raise BusinessLogicError('FORBIDDEN', detail='Thủ thư không thể cấp quyền Quản trị viên hoặc Thủ thư.')

        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        if 'avatar' in request.FILES:
            data.pop('avatar', None)
        # Chuẩn hóa các trường rỗng sang None để tránh lỗi DateField / CharField
        for date_or_nullable_field in ['card_expiry', 'dob', 'email', 'phone', 'department', 'address']:
            if date_or_nullable_field in data and not data[date_or_nullable_field]:
                data[date_or_nullable_field] = None

        serializer = UserAdminSerializer(user, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        user: User = serializer.save()

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
        elif 'avatar' in request.data and not request.data.get('avatar'):
            # Cho phép xóa ảnh thẻ
            user.avatar = None
            user.save(update_fields=['avatar'])

        # Đồng bộ ngược sang StudentRoster nếu tài khoản liên kết sinh viên
        roster = getattr(user, 'roster_entry', None) or StudentRoster.objects.filter(
            Q(student_code__iexact=user.card_code) | Q(student_code__iexact=user.username)
        ).first()
        if roster:
            roster_updates = []
            if roster.avatar != user.avatar:
                roster.avatar = user.avatar
                roster_updates.append('avatar')
            if user.full_name and roster.full_name != user.full_name:
                roster.full_name = user.full_name
                roster_updates.append('full_name')
            if user.phone and roster.phone != user.phone:
                roster.phone = user.phone
                roster_updates.append('phone')
            if user.department and roster.department != user.department:
                roster.department = user.department
                roster_updates.append('department')
            if 'major' in request.data and request.data.get('major') != roster.major:
                roster.major = request.data.get('major') or ''
                roster_updates.append('major')
            if 'class_name' in request.data and request.data.get('class_name') != roster.class_name:
                roster.class_name = request.data.get('class_name') or ''
                roster_updates.append('class_name')
            if roster_updates:
                roster.save(update_fields=roster_updates)

        log_action(
            user=request.user,
            action='ADMIN_UPDATE_USER',
            entity_type='User',
            entity_id=user.id,
            detail=serializer.validated_data,
            request=request
        )

        return Response({'data': UserAdminSerializer(user).data}, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        return self.put(request, pk)

    def delete(self, request, pk):
        if request.user.role != UserRole.ADMIN:
            raise BusinessLogicError('FORBIDDEN', detail='Chỉ Quản trị viên mới có thẩm quyền xóa tài khoản.')

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
            raise BusinessLogicError('USER_HAS_READY_RESERVATIONS', detail='Không thể xóa bạn đọc đang có sách chờ nhận sách sẵn sàng tại quầy.')

        user.deleted_at = timezone.now()
        user.is_active = False
        user.save(update_fields=['deleted_at', 'is_active'])

        # Đồng bộ ngược sang StudentRoster: reset trạng thái cấp thẻ để danh sách sinh viên cập nhật đúng
        roster = getattr(user, 'roster_entry', None) or StudentRoster.objects.filter(
            Q(student_code__iexact=user.card_code) | Q(student_code__iexact=user.username)
        ).first()
        if roster:
            roster.is_card_issued = False
            roster.user = None
            roster.save(update_fields=['is_card_issued', 'user'])

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

        if request.user.role == UserRole.LIBRARIAN and user.role in [UserRole.ADMIN, UserRole.LIBRARIAN]:
            raise BusinessLogicError('FORBIDDEN', detail='Thủ thư không có quyền khóa hoặc mở khóa tài khoản của Cán bộ / Quản trị viên.')

        if request.path.rstrip('/').endswith('/unlock'):
            should_lock = False
        else:
            should_lock = request.data.get('is_locked', not user.is_locked)
        reason = request.data.get('lock_reason') or request.data.get('reason') or ('Thủ thư khóa tài khoản' if should_lock else None)
        review_reason = str(request.data.get('review_reason') or '').strip()
        previous_lock_reason = user.lock_reason

        if not should_lock and len(review_reason) < 10:
            raise BusinessLogicError(
                'VALIDATION_ERROR',
                detail='Vui lòng ghi lý do xem xét mở khóa (ít nhất 10 ký tự).',
            )

        if should_lock:
            user.is_locked = True
            user.lock_reason = reason
            user.borrow_override_until = None
            user.borrow_override_reason = None
            user.save(update_fields=[
                'is_locked', 'lock_reason', 'borrow_override_until', 'borrow_override_reason'
            ])
        else:
            user.is_locked = False
            user.lock_reason = None
            user.locked_until = None
            user.failed_login_count = 0
            user.borrow_override_until = timezone.now() + timedelta(days=30)
            user.borrow_override_reason = review_reason
            user.save(update_fields=[
                'is_locked', 'lock_reason', 'locked_until', 'failed_login_count',
                'borrow_override_until', 'borrow_override_reason',
            ])

        log_action(
            user=request.user,
            action='ADMIN_LOCK_USER' if should_lock else 'ADMIN_UNLOCK_USER',
            entity_type='User',
            entity_id=user.id,
            detail={
                'is_locked': should_lock,
                'reason': reason,
                'review_reason': review_reason if not should_lock else None,
                'previous_lock_reason': previous_lock_reason,
                'borrow_override_until': (
                    user.borrow_override_until.isoformat() if not should_lock else None
                ),
            },
            request=request
        )

        return Response({
            'data': UserAdminSerializer(user).data,
            'detail': (
                'Đã khóa tài khoản thành công.'
                if should_lock
                else 'Đã mở khóa và cho phép mượn ngoại lệ trong 30 ngày.'
            )
        }, status=status.HTTP_200_OK)

class UserCardExtendView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        user = User.objects.filter(id=pk, deleted_at__isnull=True).first()
        if not user:
            raise BusinessLogicError('NOT_FOUND', detail='Người dùng không tồn tại.')

        if request.user.role == UserRole.LIBRARIAN and user.role in [UserRole.ADMIN, UserRole.LIBRARIAN]:
            raise BusinessLogicError('FORBIDDEN', detail='Thủ thư không thể gia hạn thẻ cho Cán bộ / Quản trị viên.')

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

        if request.user.role == UserRole.LIBRARIAN and user.role in [UserRole.ADMIN, UserRole.LIBRARIAN]:
            raise BusinessLogicError('FORBIDDEN', detail='Thủ thư không có quyền đặt lại mật khẩu cho Cán bộ / Quản trị viên.')

        new_password = str(request.data.get('new_password') or 'UthLibrary@123').strip()

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

class AutoSuspendCheckView(APIView):
    permission_classes = [IsAdminOnlyRole]

    def post(self, request):
        result = auto_suspend_violating_users(admin_user=request.user, request=request)
        return Response({
            'detail': f"Đã quét xong {result['total_checked']} bạn đọc: Tự động khóa {result['total_suspended']} tài khoản vi phạm ngưỡng, mở khóa {result['total_unsuspended']} tài khoản đã khắc phục.",
            'data': result
        }, status=status.HTTP_200_OK)

class StudentLookupView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        code = request.query_params.get('code', '').strip()
        if not code:
            raise BusinessLogicError('VALIDATION_ERROR', detail='Vui lòng nhập MSSV hoặc quét mã vạch thẻ sinh viên.')

        roster = StudentRoster.objects.filter(student_code__iexact=code).first()
        if not roster:
            return Response({
                'found': False,
                'message': f'Không tìm thấy sinh viên có MSSV "{code}" trong danh sách đào tạo trường ĐH Giao thông Vận tải TP.HCM. Vui lòng kiểm tra lại Thẻ sinh viên hoặc liên hệ Phòng Đào tạo.'
            }, status=status.HTTP_200_OK)

        # Check if already has user
        existing_user = User.objects.filter(
            Q(card_code__iexact=roster.student_code) | Q(username__iexact=roster.student_code),
            deleted_at__isnull=True
        ).first()

        if existing_user:
            if not roster.is_card_issued or roster.user != existing_user:
                roster.is_card_issued = True
                roster.user = existing_user
                roster.save(update_fields=['is_card_issued', 'user'])

            return Response({
                'found': True,
                'already_has_card': True,
                'eligible': False,
                'user_id': existing_user.id,
                'card_code': existing_user.card_code,
                'card_expiry': existing_user.card_expiry,
                'is_locked': existing_user.is_locked,
                'data': StudentRosterSerializer(roster).data,
                'message': f'Sinh viên {roster.full_name} đã có thẻ thư viện UTH (Mã thẻ: {existing_user.card_code}, hạn dùng: {existing_user.card_expiry or "Chưa đặt"}). Bạn có thể dùng tính năng Gia hạn thẻ nếu sinh viên muốn tiếp tục sử dụng.'
            }, status=status.HTTP_200_OK)

        # Check eligibility status
        if roster.status != StudentStatus.ENROLLED:
            return Response({
                'found': True,
                'already_has_card': False,
                'eligible': False,
                'data': StudentRosterSerializer(roster).data,
                'reason': f'Sinh viên đang ở tình trạng đào tạo: "{roster.get_status_display()}". Quy chế thư viện chỉ cấp thẻ cho sinh viên đang theo học chính thức.',
                'message': f'Sinh viên {roster.full_name} ({roster.get_status_display()}) không đủ điều kiện mở thẻ thư viện.'
            }, status=status.HTTP_200_OK)

        # Eligible
        suggested_expiry = timezone.localdate() + timedelta(days=365)
        return Response({
            'found': True,
            'already_has_card': False,
            'eligible': True,
            'suggested_expiry': suggested_expiry.isoformat(),
            'fee': 100000,
            'data': StudentRosterSerializer(roster).data,
            'message': f'Sinh viên chính khóa {roster.department} - Đủ điều kiện đăng ký thẻ mượn sách.'
        }, status=status.HTTP_200_OK)

class IssueStudentCardView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        code = request.data.get('student_code', '').strip()
        if not code:
            raise BusinessLogicError('VALIDATION_ERROR', detail='Mã số sinh viên (MSSV) là bắt buộc.')

        roster = StudentRoster.objects.filter(student_code__iexact=code).first()
        if not roster:
            raise BusinessLogicError('NOT_FOUND', detail=f'MSSV {code} không tồn tại trong danh sách sinh viên trường UTH.')

        if roster.status != StudentStatus.ENROLLED:
            raise BusinessLogicError('INELIGIBLE', detail=f'Sinh viên đang trong tình trạng {roster.get_status_display()}, không đủ điều kiện mở thẻ.')

        # Check existing user
        existing_user = User.objects.filter(Q(card_code__iexact=code) | Q(username__iexact=code)).first()
        if existing_user and existing_user.deleted_at is None:
            raise BusinessLogicError('CARD_EXISTS', detail=f'Sinh viên {roster.full_name} ({code}) đã có tài khoản thẻ thư viện đang hoạt động.')

        # Parameters
        card_expiry_str = request.data.get('card_expiry')
        if card_expiry_str:
            try:
                card_expiry = timezone.datetime.strptime(card_expiry_str, '%Y-%m-%d').date()
            except ValueError:
                card_expiry = timezone.localdate() + timedelta(days=365)
        else:
            extend_months = int(request.data.get('extend_months', 12))
            card_expiry = timezone.localdate() + timedelta(days=extend_months * 30)

        phone = request.data.get('phone') or roster.phone or ''
        email = request.data.get('email') or roster.email or f"{code}@sv.ut.edu.vn"
        fee_collected = int(request.data.get('fee_collected', 100000))
        payment_method = request.data.get('payment_method', PaymentMethod.CASH)
        if payment_method not in [PaymentMethod.CASH, PaymentMethod.TRANSFER]:
            payment_method = PaymentMethod.CASH
        note = request.data.get('note', '')

        # Create or reactivate user
        default_password = request.data.get('password') or 'Password123'
        if existing_user:
            user = existing_user
            user.deleted_at = None
            user.is_active = True
            user.is_locked = False
            user.lock_reason = None
            user.locked_until = None
            user.full_name = roster.full_name
            user.card_code = code
            user.username = code
            user.email = email
            user.phone = phone
            user.department = roster.department
            user.role = UserRole.STUDENT
            user.card_expiry = card_expiry
            user.must_change_password = True
            user.set_password(default_password)
            user.save()
        else:
            user = User(
                username=code,
                full_name=roster.full_name,
                card_code=code,
                email=email,
                phone=phone,
                department=roster.department,
                role=UserRole.STUDENT,
                card_expiry=card_expiry,
                must_change_password=True,
            )
            user.set_password(default_password)
            user.save()

        # Handle avatar if uploaded
        avatar_file = request.FILES.get('avatar')
        if avatar_file:
            ext = 'jpg' if 'jpeg' in avatar_file.content_type or 'jpg' in avatar_file.content_type else 'png'
            filename = f"avatar_sv_{user.id}_{secrets.token_hex(6)}.{ext}"
            upload_dir = settings.MEDIA_ROOT / 'avatars'
            upload_dir.mkdir(parents=True, exist_ok=True)
            with open(upload_dir / filename, 'wb+') as dest:
                for chunk in avatar_file.chunks():
                    dest.write(chunk)
            user.avatar = f"{settings.MEDIA_URL}avatars/{filename}"
            user.save(update_fields=['avatar'])
        elif roster.avatar:
            user.avatar = roster.avatar
            user.save(update_fields=['avatar'])

        # Update roster
        roster.is_card_issued = True
        roster.user = user
        if phone and not roster.phone:
            roster.phone = phone
        roster.save(update_fields=['is_card_issued', 'user', 'phone'])

        # Record Payment Transaction & Generate Sequential Codes
        year_now = timezone.now().year
        count_year = PaymentTransaction.objects.filter(collected_at__year=year_now).count() + 1
        transaction_code = f"PAY-{year_now}-{count_year:05d}"
        receipt_code = f"RC-{year_now}-{count_year:05d}"

        transaction = PaymentTransaction.objects.create(
            transaction_code=transaction_code,
            receipt_code=receipt_code,
            transaction_type=TransactionType.CARD_ISSUANCE,
            user=user,
            student_code=code,
            payer_name=roster.full_name,
            amount=fee_collected,
            payment_method=payment_method,
            status=TransactionStatus.SUCCESS,
            collected_by=request.user,
            collected_at=timezone.now(),
            note=note or f"Lệ phí cấp thẻ thư viện năm học cho sinh viên {code}",
        )

        # Audit log
        log_action(
            user=request.user,
            action='ISSUE_STUDENT_CARD',
            entity_type='User',
            entity_id=user.id,
            detail={
                'student_code': code,
                'full_name': roster.full_name,
                'fee_collected': fee_collected,
                'payment_method': payment_method,
                'transaction_code': transaction.transaction_code,
                'receipt_code': transaction.receipt_code,
                'card_expiry': card_expiry.isoformat(),
                'note': note,
            },
            request=request
        )

        return Response({
            'data': UserAdminSerializer(user).data,
            'transaction': {
                'id': transaction.id,
                'transaction_code': transaction.transaction_code,
                'receipt_code': transaction.receipt_code,
                'amount': transaction.amount,
                'payment_method': transaction.payment_method,
                'payment_method_display': transaction.get_payment_method_display(),
                'payer_name': transaction.payer_name,
                'student_code': transaction.student_code,
                'collected_by_name': request.user.full_name or request.user.username,
                'collected_at': transaction.collected_at.isoformat(),
                'card_code': user.card_code,
                'card_expiry': user.card_expiry.isoformat() if user.card_expiry else None,
                'department': user.department,
                'class_name': roster.class_name,
                'avatar': user.avatar,
            },
            'detail': f'Đã cấp thẻ thư viện thành công cho sinh viên {roster.full_name} ({code}). Thu lệ phí: {fee_collected:,.0f} đ ({transaction.get_payment_method_display()}).'
        }, status=status.HTTP_201_CREATED)

class StudentRosterListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        queryset = StudentRoster.objects.all().order_by('-created_at')

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(student_code__icontains=search) |
                Q(full_name__icontains=search) |
                Q(department__icontains=search) |
                Q(major__icontains=search) |
                Q(email__icontains=search)
            )

        status_param = request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        card_issued = request.query_params.get('is_card_issued')
        if card_issued is not None:
            if card_issued.lower() == 'true':
                queryset = queryset.filter(is_card_issued=True, user__deleted_at__isnull=True)
            elif card_issued.lower() == 'false':
                queryset = queryset.filter(Q(is_card_issued=False) | Q(user__deleted_at__isnull=False))

        total_students = StudentRoster.objects.count()
        issued_cards = StudentRoster.objects.filter(is_card_issued=True, user__deleted_at__isnull=True).count()
        unissued_cards = total_students - issued_cards

        paginator = StandardPagination()
        page_records = paginator.paginate_queryset(queryset, request)
        serializer = StudentRosterSerializer(page_records, many=True)
        response = paginator.get_paginated_response(serializer.data)
        response.data['summary'] = {
            'total_students': total_students,
            'issued_cards': issued_cards,
            'unissued_cards': unissued_cards,
        }
        return response

class StudentRosterTemplateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        output = io.StringIO()
        output.write('\ufeff')
        writer = csv.writer(output)
        writer.writerow(['MSSV', 'Họ và tên', 'Khoa', 'Ngành', 'Lớp', 'Email', 'Số điện thoại', 'Khóa học', 'Trạng thái', 'Ảnh thẻ (URL hoặc tên file ảnh)'])
        writer.writerow(['22510091', 'Nguyễn Văn Hải', 'Khoa Công nghệ thông tin', 'Kỹ thuật phần mềm', 'CNTT-K22A', '22510091@sv.ut.edu.vn', '0901234567', 'K22 (2022 - 2026)', 'enrolled', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'])
        writer.writerow(['22510092', 'Lê Thị Thu Thảo', 'Khoa Kinh tế vận tải', 'Logistics và Quản lý chuỗi cung ứng', 'LOG-K22B', '22510092@sv.ut.edu.vn', '0912345678', 'K22 (2022 - 2026)', 'enrolled', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'])
        writer.writerow(['22510093', 'Trần Quốc Đạt', 'Khoa Cơ khí', 'Kỹ thuật Ô tô', 'OTO-K22', '22510093@sv.ut.edu.vn', '0923456789', 'K22 (2022 - 2026)', 'enrolled', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'])

        csv_bytes = output.getvalue().encode('utf-8-sig')
        response = HttpResponse(csv_bytes, content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = 'attachment; filename="uth_danh_sach_sinh_vien_mau.csv"'
        return response

class StudentRosterImportView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        file_obj = request.FILES.get('file')
        csv_payload = request.data.get('csv_data') or request.data.get('csv_text') or request.data.get('csv')
        if not file_obj and isinstance(request.data.get('file'), str):
            csv_payload = request.data.get('file')
        json_items = request.data.get('students')

        rows_to_process = []

        if file_obj or csv_payload:
            try:
                decoded_file = None
                if csv_payload:
                    decoded_file = str(csv_payload)
                elif file_obj:
                    raw_bytes = file_obj.read()
                    
                    # 1. Safe decoding without accidental UTF-16 false positives
                    if raw_bytes.startswith(b'\xef\xbb\xbf'):
                        decoded_file = raw_bytes[3:].decode('utf-8', errors='replace')
                    elif raw_bytes.startswith(b'\xff\xfe'):
                        decoded_file = raw_bytes[2:].decode('utf-16-le', errors='replace')
                    elif raw_bytes.startswith(b'\xfe\xff'):
                        decoded_file = raw_bytes[2:].decode('utf-16-be', errors='replace')
                    elif b'\x00' in raw_bytes[:100]:
                        try:
                            decoded_file = raw_bytes.decode('utf-16', errors='replace')
                        except Exception:
                            pass

                    if not decoded_file:
                        try:
                            decoded_file = raw_bytes.decode('utf-8')
                        except UnicodeDecodeError:
                            for enc in ['cp1258', 'windows-1252', 'latin-1']:
                                try:
                                    decoded_file = raw_bytes.decode(enc)
                                    break
                                except (UnicodeDecodeError, LookupError):
                                    continue

                    if not decoded_file:
                        decoded_file = raw_bytes.decode('utf-8', errors='ignore')

                # Strip all invisible BOMs / zero-width characters across the entire file
                decoded_file = decoded_file.replace('\ufeff', '').replace('\u200b', '').replace('\ufffd', '')

                # Normalize line endings
                text = decoded_file.replace('\r\n', '\n').replace('\r', '\n')
                lines = [line.strip() for line in text.split('\n') if line.strip()]
                if not lines:
                    raise BusinessLogicError('EMPTY_FILE', detail='File tải lên không có nội dung văn bản.')

                import unicodedata, re

                def clean_str(val) -> str:
                    if val is None:
                        return ''
                    return re.sub(r'[\ufeff\u200b\ufffd]', '', str(val)).strip()

                def normalize_key(k: str) -> str:
                    if not k:
                        return ''
                    original = clean_str(k)
                    nfd = unicodedata.normalize('NFD', original.lower())
                    # Disambiguate 'Khóa' (cohort / academic batch) vs 'Khoa' (faculty / department)
                    if 'kho' in nfd and '\u0301' in nfd:
                        return 'khoa_hoc'
                    k = original.lower().replace('đ', 'd').replace('Đ', 'd')
                    k = ''.join(c for c in unicodedata.normalize('NFD', k) if unicodedata.category(c) != 'Mn')
                    return re.sub(r'[^a-z0-9]+', '_', k).strip('_')

                delimiters = [';', ',', '\t', '|']
                known_code_keys = {
                    'mssv', 'ma_sv', 'masv', 'ma_so_sv', 'ma_sinh_vien',
                    'ma_so_sinh_vien', 'student_code', 'student_id', 'code',
                    'id', 'so_the', 'ma_the', 'mssv_sv'
                }
                known_name_keys = {
                    'ho_ten', 'ho_va_ten', 'ho_ten_sinh_vien', 'ten_sinh_vien',
                    'full_name', 'fullname', 'name'
                }
                known_avatar_keys = {
                    'anh_the', 'avatar', 'anh', 'hinh_anh', 'photo', 'url_anh',
                    'image', 'image_url', 'anh_dai_dien', 'avatar_url',
                    'anh_the_url_hoac_ten_file_anh', 'anh_the_url_hoac_duong_dan_anh'
                }

                def is_avatar_key(k: str) -> bool:
                    if not k:
                        return False
                    # Tuyệt đối không nhầm 'nganh' (ngành học / chuyên ngành) với 'anh' (ảnh thẻ)
                    if 'nganh' in k:
                        return False
                    if k in known_avatar_keys:
                        return True
                    return any(sub in k for sub in ['avatar', 'anh_the', 'hinh_anh', 'anh_dai_dien', 'photo', 'image', 'url_anh']) or k.startswith('anh_') or k.endswith('_anh') or k == 'anh'

                def is_valid_avatar_value(val: str) -> bool:
                    if not val:
                        return False
                    v = str(val).strip().lower()
                    if v.startswith(('http://', 'https://', '/media/', 'data:image/')):
                        return True
                    return any(v.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg'])

                best_delimiter = ','
                best_header_idx = -1
                best_score = 0

                # Detect header row among the first 15 lines (handles title/banner rows)
                for line_idx in range(min(15, len(lines))):
                    candidate = lines[line_idx]
                    for d in delimiters:
                        try:
                            parts = [normalize_key(p) for p in next(csv.reader([candidate], delimiter=d), [])]
                            has_code = any(p in known_code_keys for p in parts)
                            has_name = any(p in known_name_keys or p == 'ten' for p in parts)
                            score = sum(1 for p in parts if p in known_code_keys or p in known_name_keys or is_avatar_key(p) or p in {'khoa', 'nganh', 'lop', 'email', 'sdt', 'khoa_hoc', 'trang_thai'})
                            if (has_code or has_name) and score > best_score:
                                best_score = score
                                best_delimiter = d
                                best_header_idx = line_idx
                        except Exception:
                            continue

                if best_header_idx >= 0:
                    data_text = '\n'.join(lines[best_header_idx:])
                    reader = csv.DictReader(io.StringIO(data_text), delimiter=best_delimiter)
                    for row in reader:
                        cleaned = {normalize_key(k): clean_str(v) for k, v in row.items()}
                        code = next((cleaned[k] for k in cleaned if k in known_code_keys and cleaned[k]), '')
                        name = next((cleaned[k] for k in cleaned if k in known_name_keys and cleaned[k]), '')
                        if not name and ('ho' in cleaned or 'ho_lot' in cleaned or 'ho_va_ten_lot' in cleaned) and 'ten' in cleaned:
                            ho = cleaned.get('ho') or cleaned.get('ho_lot') or cleaned.get('ho_va_ten_lot', '')
                            ten = cleaned.get('ten', '')
                            name = f'{ho} {ten}'.strip()

                        avatar = ''
                        for k, v in cleaned.items():
                            if is_avatar_key(k) and v and is_valid_avatar_value(v):
                                avatar = clean_str(v)
                                break
                        if not avatar:
                            for k, v in cleaned.items():
                                if k not in known_code_keys and k not in known_name_keys and 'email' not in k and is_valid_avatar_value(v):
                                    avatar = clean_str(v)
                                    break

                        if code and name:
                            rows_to_process.append({
                                'student_code': clean_str(code),
                                'full_name': clean_str(name),
                                'department': cleaned.get('khoa') or cleaned.get('don_vi') or cleaned.get('khoa_don_vi') or 'Khoa Công nghệ thông tin',
                                'major': cleaned.get('nganh') or cleaned.get('chuyen_nganh') or cleaned.get('major') or '',
                                'class_name': cleaned.get('lop') or cleaned.get('lop_hoc') or cleaned.get('lop_sinh_hoat') or cleaned.get('class_name') or '',
                                'email': cleaned.get('email') or cleaned.get('dia_chi_email') or f'{clean_str(code)}@sv.ut.edu.vn',
                                'phone': cleaned.get('sdt') or cleaned.get('so_dien_thoai') or cleaned.get('dien_thoai') or cleaned.get('phone') or '',
                                'academic_year': cleaned.get('khoa_hoc') or cleaned.get('nam_hoc') or 'K22 (2022 - 2026)',
                                'status': cleaned.get('trang_thai') or cleaned.get('tinh_trang') or StudentStatus.ENROLLED,
                                'avatar': clean_str(avatar),
                            })

                if not rows_to_process:
                    # Positional fallback (handles raw CSV without headers)
                    for d in delimiters:
                        try:
                            parts = next(csv.reader([lines[0]], delimiter=d), [])
                            if len(parts) >= 2:
                                best_delimiter = d
                                break
                        except Exception:
                            continue
                    reader = csv.reader(lines, delimiter=best_delimiter)
                    for row in reader:
                        if len(row) < 2:
                            continue
                        first, second = clean_str(row[0]), clean_str(row[1])
                        code, name = '', ''
                        if re.match(r'^[A-Za-z0-9_-]{5,20}$', first) and any(c.isalpha() for c in second):
                            code, name = first, second
                        elif re.match(r'^[A-Za-z0-9_-]{5,20}$', second) and any(c.isalpha() for c in first):
                            name, code = first, second

                        if code and name and code.lower() not in known_code_keys:
                            pos_avatar = ''
                            for col_idx in range(2, len(row)):
                                f_val = clean_str(row[col_idx])
                                if f_val.startswith(('http://', 'https://', '/media/')) or any(f_val.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                                    pos_avatar = f_val
                                    break

                            rows_to_process.append({
                                'student_code': clean_str(code),
                                'full_name': clean_str(name),
                                'department': clean_str(row[2]) if len(row) > 2 else 'Khoa Công nghệ thông tin',
                                'major': clean_str(row[3]) if len(row) > 3 else '',
                                'class_name': clean_str(row[4]) if len(row) > 4 and not ('@' in row[4]) else '',
                                'email': clean_str(row[4]) if len(row) > 4 and '@' in row[4] else (clean_str(row[5]) if len(row) > 5 and '@' in row[5] else f'{clean_str(code)}@sv.ut.edu.vn'),
                                'phone': clean_str(row[5]) if len(row) > 5 and not ('@' in row[5]) else (clean_str(row[6]) if len(row) > 6 else ''),
                                'academic_year': 'K22 (2022 - 2026)',
                                'status': StudentStatus.ENROLLED,
                                'avatar': pos_avatar,
                            })
            except Exception as e:
                raise BusinessLogicError('IMPORT_FAILED', detail=f'Lỗi đọc file CSV: {str(e)}')
        elif json_items and isinstance(json_items, list):
            rows_to_process = json_items
        else:
            raise BusinessLogicError('VALIDATION_ERROR', detail='Vui lòng chọn file CSV danh sách sinh viên hoặc gửi danh sách qua JSON.')

        if not rows_to_process:
            raise BusinessLogicError('EMPTY_FILE', detail='Không tìm thấy dòng dữ liệu sinh viên hợp lệ trong file.')

        created_count = 0
        updated_count = 0

        for item in rows_to_process:
            code = str(item.get('student_code', '')).strip()
            name = str(item.get('full_name', '')).strip()
            if not code or not name:
                continue

            status_val = str(item.get('status', StudentStatus.ENROLLED)).lower()
            if status_val not in [StudentStatus.ENROLLED, StudentStatus.GRADUATED, StudentStatus.SUSPENDED]:
                status_val = StudentStatus.ENROLLED

            existing_user = User.objects.filter(
                Q(card_code__iexact=code) | Q(username__iexact=code)
            ).first()

            avatar_val = str(item.get('avatar', '') or '').strip()
            defaults = {
                'full_name': name,
                'department': item.get('department', 'Khoa Công nghệ thông tin'),
                'major': item.get('major', ''),
                'class_name': item.get('class_name', ''),
                'email': item.get('email') or f"{code}@sv.ut.edu.vn",
                'phone': item.get('phone', ''),
                'academic_year': item.get('academic_year', 'K22 (2022 - 2026)'),
                'status': status_val,
                'is_card_issued': bool(existing_user),
                'user': existing_user,
            }
            if avatar_val:
                defaults['avatar'] = avatar_val

            roster, created = StudentRoster.objects.update_or_create(
                student_code=code,
                defaults=defaults
            )
            if existing_user and avatar_val:
                existing_user.avatar = avatar_val
                existing_user.save(update_fields=['avatar'])
            if created:
                created_count += 1
            else:
                updated_count += 1

        log_action(
            user=request.user,
            action='IMPORT_STUDENT_ROSTER',
            entity_type='StudentRoster',
            entity_id=0,
            detail={'created': created_count, 'updated': updated_count},
            request=request
        )

        return Response({
            'detail': f'Import thành công: Đã thêm mới {created_count} sinh viên, cập nhật {updated_count} sinh viên.',
            'created_count': created_count,
            'updated_count': updated_count,
            'total': len(rows_to_process),
        }, status=status.HTTP_200_OK)


class StudentRosterExportView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = 'attachment; filename="uth_danh_sach_sinh_vien_export.csv"'
        response.write('\ufeff')

        writer = csv.writer(response)
        writer.writerow([
            'MSSV',
            'Họ và tên',
            'Khoa / Viện',
            'Chuyên ngành',
            'Lớp',
            'Email',
            'Số điện thoại',
            'Khóa học',
            'Tình trạng đào tạo',
            'Đã cấp thẻ',
            'Mã thẻ thư viện',
            'Ảnh thẻ (Avatar URL)',
            'Ngày khởi tạo',
        ])

        queryset = StudentRoster.objects.select_related('user').order_by('student_code')
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(student_code__icontains=search) |
                Q(full_name__icontains=search) |
                Q(department__icontains=search) |
                Q(email__icontains=search)
            )

        status_param = request.query_params.get('status')
        if status_param and status_param != 'all':
            queryset = queryset.filter(status=status_param)

        card_issued = request.query_params.get('is_card_issued')
        if card_issued is not None and card_issued != 'all':
            if card_issued.lower() == 'true':
                queryset = queryset.filter(is_card_issued=True)
            elif card_issued.lower() == 'false':
                queryset = queryset.filter(is_card_issued=False)

        for s in queryset:
            avatar_val = s.avatar or (s.user.avatar if s.user else '') or ''
            writer.writerow([
                s.student_code,
                s.full_name,
                s.department or '',
                s.major or '',
                s.class_name or '',
                s.email or '',
                s.phone or '',
                s.academic_year or '',
                s.get_status_display(),
                'Đã có thẻ' if s.is_card_issued else 'Chưa cấp',
                s.user.card_code if s.user else '',
                avatar_val,
                s.created_at.strftime('%d/%m/%Y %H:%M') if s.created_at else '',
            ])

        return response


class PaymentTransactionListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        qs = PaymentTransaction.objects.select_related('user', 'collected_by').order_by('-collected_at')

        # Role-based restriction: librarians only see their own transactions, Admin sees all
        if request.user.role == UserRole.LIBRARIAN:
            # Librarians can see transactions collected at desk
            pass

        search = request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(transaction_code__icontains=search) |
                Q(receipt_code__icontains=search) |
                Q(student_code__icontains=search) |
                Q(payer_name__icontains=search)
            )

        payment_method = request.query_params.get('payment_method')
        if payment_method:
            qs = qs.filter(payment_method=payment_method)

        transaction_type = request.query_params.get('transaction_type')
        if transaction_type:
            qs = qs.filter(transaction_type=transaction_type)

        collected_by_id = request.query_params.get('collected_by')
        if collected_by_id and collected_by_id.isdigit():
            qs = qs.filter(collected_by_id=int(collected_by_id))

        date_from = request.query_params.get('date_from')
        if date_from:
            qs = qs.filter(collected_at__date__gte=date_from)

        date_to = request.query_params.get('date_to')
        if date_to:
            qs = qs.filter(collected_at__date__lte=date_to)

        # Summary statistics before pagination
        total_revenue = sum(t.amount for t in qs)
        cash_revenue = sum(t.amount for t in qs if t.payment_method == PaymentMethod.CASH)
        transfer_revenue = sum(t.amount for t in qs if t.payment_method == PaymentMethod.TRANSFER)
        total_count = qs.count()

        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = PaymentTransactionSerializer(page, many=True)
        response = paginator.get_paginated_response(serializer.data)
        response.data['summary'] = {
            'total_revenue': total_revenue,
            'cash_revenue': cash_revenue,
            'transfer_revenue': transfer_revenue,
            'total_count': total_count,
        }
        return response


class PaymentTransactionExportView(APIView):
    permission_classes = [IsAdminOnlyRole]

    def get(self, request):
        qs = PaymentTransaction.objects.select_related('user', 'collected_by').order_by('-collected_at')

        search = request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(transaction_code__icontains=search) |
                Q(receipt_code__icontains=search) |
                Q(student_code__icontains=search) |
                Q(payer_name__icontains=search)
            )

        payment_method = request.query_params.get('payment_method')
        if payment_method:
            qs = qs.filter(payment_method=payment_method)

        date_from = request.query_params.get('date_from')
        if date_from:
            qs = qs.filter(collected_at__date__gte=date_from)

        date_to = request.query_params.get('date_to')
        if date_to:
            qs = qs.filter(collected_at__date__lte=date_to)

        response = HttpResponse(content_type='text/csv; charset=utf-8')
        filename = f"uth_library_transactions_{timezone.now().strftime('%Y%m%d_%H%M%S')}.csv"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        # UTF-8 BOM for Excel compatibility in Vietnam
        response.write('\ufeff'.encode('utf8'))

        writer = csv.writer(response)
        writer.writerow([
            'Mã giao dịch', 'Mã biên lai', 'Loại giao dịch', 'MSSV / Mã bạn đọc',
            'Họ và tên người nộp', 'Số tiền (VND)', 'Phương thức thanh toán',
            'Trạng thái', 'Thủ thư thu tiền', 'Thời gian thu', 'Ghi chú'
        ])

        for t in qs:
            writer.writerow([
                t.transaction_code,
                t.receipt_code,
                t.get_transaction_type_display(),
                t.student_code,
                t.payer_name,
                t.amount,
                t.get_payment_method_display(),
                t.get_status_display(),
                t.collected_by.full_name or t.collected_by.username,
                timezone.localtime(t.collected_at).strftime('%d/%m/%Y %H:%M:%S'),
                t.note or ''
            ])

        return response


class CheckStudentCardPaymentStatusView(APIView):
    """
    Kiểm tra trạng thái thanh toán SePay cho sinh viên đang làm thẻ.
    Hỗ trợ polling thời gian thực 2s/lần tại Quầy lưu thông.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.query_params.get('student_code', '').strip()
        if not code:
            return Response({'is_paid': False, 'detail': 'Thiếu mã số sinh viên (MSSV).'}, status=status.HTTP_400_BAD_REQUEST)

        # Tìm giao dịch thu phí thành công gần nhất (trong vòng 30 phút)
        recent_tx = PaymentTransaction.objects.filter(
            student_code__iexact=code,
            status=TransactionStatus.SUCCESS,
            collected_at__gte=timezone.now() - timedelta(minutes=30)
        ).select_related('user', 'collected_by').order_by('-collected_at').first()

        if recent_tx:
            return Response({
                'is_paid': True,
                'transaction': {
                    'id': recent_tx.id,
                    'transaction_code': recent_tx.transaction_code,
                    'receipt_code': recent_tx.receipt_code,
                    'amount': recent_tx.amount,
                    'payment_method': recent_tx.payment_method,
                    'payment_method_display': recent_tx.get_payment_method_display(),
                    'payer_name': recent_tx.payer_name,
                    'student_code': recent_tx.student_code,
                    'collected_by_name': recent_tx.collected_by.full_name if recent_tx.collected_by else 'Cổng thanh toán SePay (Sacombank)',
                    'collected_at': recent_tx.collected_at.isoformat(),
                    'card_code': recent_tx.user.card_code if recent_tx.user else recent_tx.student_code,
                    'card_expiry': recent_tx.user.card_expiry.isoformat() if recent_tx.user and recent_tx.user.card_expiry else None,
                    'department': recent_tx.user.department if recent_tx.user else '',
                }
            }, status=status.HTTP_200_OK)

        return Response({'is_paid': False}, status=status.HTTP_200_OK)


class SimulateSepayCardPaymentView(APIView):
    """
    Mô phỏng Webhook SePay/Sacombank cho việc cấp thẻ thư viện (phục vụ kiểm thử & demo nhanh).
    """
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        code = request.data.get('student_code', '').strip()
        amount = int(request.data.get('amount') or 100000)
        if not code:
            return Response({'detail': 'Thiếu mã số sinh viên.'}, status=status.HTTP_400_BAD_REQUEST)

        from apps.fines.views import BankWebhookView
        from rest_framework.test import APIRequestFactory
        rf = APIRequestFactory()
        sepay_id = int(timezone.now().timestamp() * 1000) % 10000000
        payload = {
            'id': sepay_id,
            'gateway': 'Sacombank',
            'accountNumber': '040117536833',
            'transferType': 'in',
            'transferAmount': amount,
            'content': f'UTH {code} DKTHE',
            'referenceCode': f'STB.{sepay_id}'
        }
        wb_req = rf.post('/api/v1/fines/bank-webhook/', data=payload, format='json')
        wb_res = BankWebhookView().post(wb_req)
        return Response(wb_res.data, status=wb_res.status_code)


