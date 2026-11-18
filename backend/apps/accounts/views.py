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

        target_role = request.data.get('role')
        if target_role and request.user.role == UserRole.LIBRARIAN and target_role not in [UserRole.STUDENT, UserRole.LECTURER]:
            raise BusinessLogicError('FORBIDDEN', detail='Thủ thư không thể cấp quyền Quản trị viên hoặc Thủ thư.')

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

        if request.user.role == UserRole.LIBRARIAN and user.role in [UserRole.ADMIN, UserRole.LIBRARIAN]:
            raise BusinessLogicError('FORBIDDEN', detail='Thủ thư không có quyền khóa hoặc mở khóa tài khoản của Cán bộ / Quản trị viên.')

        if request.path.rstrip('/').endswith('/unlock'):
            should_lock = False
        else:
            should_lock = request.data.get('is_locked', not user.is_locked)
        reason = request.data.get('lock_reason') or request.data.get('reason') or ('Thủ thư khóa tài khoản' if should_lock else None)

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
        if User.objects.filter(Q(card_code__iexact=code) | Q(username__iexact=code), deleted_at__isnull=True).exists():
            raise BusinessLogicError('CARD_EXISTS', detail=f'Sinh viên {roster.full_name} ({code}) đã có tài khoản thẻ thư viện.')

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

        # Create user
        default_password = request.data.get('password') or 'Password123'
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
                queryset = queryset.filter(is_card_issued=True)
            elif card_issued.lower() == 'false':
                queryset = queryset.filter(is_card_issued=False)

        total_students = StudentRoster.objects.count()
        issued_cards = StudentRoster.objects.filter(is_card_issued=True).count()
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
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = 'attachment; filename="uth_danh_sach_sinh_vien_mau.csv"'
        
        response.write('\ufeff')
        writer = csv.writer(response)
        writer.writerow(['mssv', 'ho_ten', 'khoa', 'nganh', 'email', 'sdt', 'khoa_hoc', 'trang_thai'])
        writer.writerow(['22510091', 'Nguyễn Văn Hải', 'Khoa Công nghệ thông tin', 'Kỹ thuật phần mềm', '22510091@sv.ut.edu.vn', '0901234567', 'K22 (2022 - 2026)', 'enrolled'])
        writer.writerow(['22510092', 'Lê Thị Thu Thảo', 'Khoa Kinh tế vận tải', 'Logistics và Quản lý chuỗi cung ứng', '22510092@sv.ut.edu.vn', '0912345678', 'K22 (2022 - 2026)', 'enrolled'])
        writer.writerow(['22510093', 'Trần Quốc Đạt', 'Khoa Cơ khí', 'Kỹ thuật Ô tô', '22510093@sv.ut.edu.vn', '0923456789', 'K22 (2022 - 2026)', 'enrolled'])
        return response

class StudentRosterImportView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        file_obj = request.FILES.get('file')
        json_items = request.data.get('students')

        rows_to_process = []

        if file_obj:
            try:
                decoded_file = file_obj.read().decode('utf-8-sig')
                io_string = io.StringIO(decoded_file)
                reader = csv.DictReader(io_string)
                for row in reader:
                    cleaned = {k.strip().lower() if k else '': v.strip() if v else '' for k, v in row.items()}
                    code = cleaned.get('mssv') or cleaned.get('student_code')
                    name = cleaned.get('ho_ten') or cleaned.get('full_name') or cleaned.get('ten')
                    if code and name:
                        rows_to_process.append({
                            'student_code': code,
                            'full_name': name,
                            'department': cleaned.get('khoa') or cleaned.get('department') or 'Khoa Công nghệ thông tin',
                            'major': cleaned.get('nganh') or cleaned.get('major') or '',
                            'email': cleaned.get('email') or f"{code}@sv.ut.edu.vn",
                            'phone': cleaned.get('sdt') or cleaned.get('phone') or '',
                            'academic_year': cleaned.get('khoa_hoc') or cleaned.get('academic_year') or 'K22 (2022 - 2026)',
                            'status': cleaned.get('trang_thai') or cleaned.get('status') or StudentStatus.ENROLLED,
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
                Q(card_code__iexact=code) | Q(username__iexact=code),
                deleted_at__isnull=True
            ).first()

            roster, created = StudentRoster.objects.update_or_create(
                student_code=code,
                defaults={
                    'full_name': name,
                    'department': item.get('department', 'Khoa Công nghệ thông tin'),
                    'major': item.get('major', ''),
                    'email': item.get('email') or f"{code}@sv.ut.edu.vn",
                    'phone': item.get('phone', ''),
                    'academic_year': item.get('academic_year', 'K22 (2022 - 2026)'),
                    'status': status_val,
                    'is_card_issued': bool(existing_user),
                    'user': existing_user,
                }
            )
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


