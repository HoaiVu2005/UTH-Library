import hashlib
import secrets
import uuid
from datetime import timedelta
import jwt
from django.conf import settings
from django.utils import timezone
from django.db.models import Q, Sum
from django.core.cache import cache
from apps.core.exceptions import BusinessLogicError
from apps.core.enums import LockReason, LoanStatus, FineStatus, NotificationType
from .models import User, RefreshToken, PasswordResetToken

def hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode('utf-8')).hexdigest()

def create_access_token(user: User) -> str:
    now = timezone.now()
    exp = now + timedelta(minutes=getattr(settings, 'JWT_ACCESS_EXPIRATION_MINUTES', 15))
    payload = {
        'sub': str(user.id),
        'username': user.username,
        'full_name': user.full_name,
        'role': user.role,
        'card_code': user.card_code,
        'iat': int(now.timestamp()),
        'exp': int(exp.timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')

def create_refresh_token(user: User, family_id: uuid.UUID = None, ip: str = None, user_agent: str = None):
    raw_token = secrets.token_urlsafe(48)
    token_h = hash_token(raw_token)
    now = timezone.now()
    
    expires_at = now + timedelta(days=getattr(settings, 'JWT_REFRESH_EXPIRATION_DAYS', 7))
    idle_expires_at = now + timedelta(hours=getattr(settings, 'JWT_IDLE_EXPIRATION_HOURS', 8))
    
    token_instance = RefreshToken.objects.create(
        user=user,
        token_hash=token_h,
        family_id=family_id or uuid.uuid4(),
        expires_at=expires_at,
        idle_expires_at=idle_expires_at,
        ip=ip,
        user_agent=user_agent,
    )
    return raw_token, token_instance

def check_ip_rate_limit(ip: str):
    if not ip:
        return
    cache_key = f"login_rate_{ip}"
    # Use memory or simple counter with 60 seconds TTL
    count = cache.get(cache_key, 0)
    if count >= 5:
        raise BusinessLogicError('RATE_LIMITED', detail='Quá nhiều yêu cầu đăng nhập từ IP này. Vui lòng chờ 1 phút.')
    cache.set(cache_key, count + 1, 60)

def authenticate_user(login_identity: str, password: str, ip: str = None, user_agent: str = None):
    check_ip_rate_limit(ip)
    
    login_identity = (login_identity or '').strip()
    user = User.objects.filter(
        Q(username__iexact=login_identity) |
        Q(card_code__iexact=login_identity) |
        Q(email__iexact=login_identity),
        deleted_at__isnull=True
    ).first()

    if not user:
        raise BusinessLogicError('AUTH_INVALID_CREDENTIALS')

    now = timezone.now()

    # Check lock status
    if user.is_currently_locked:
        extra = {}
        if user.locked_until:
            extra['locked_until'] = user.locked_until.isoformat()
        raise BusinessLogicError('USER_LOCKED', extra=extra)

    # Check password
    if not user.check_password(password):
        # Update failed count
        user.failed_login_count += 1
        user.last_failed_login_at = now
        
        # Lock for 15 minutes after 5 consecutive failures
        if user.failed_login_count >= 5:
            user.locked_until = now + timedelta(minutes=15)
            user.lock_reason = LockReason.LOGIN

        user.save(update_fields=['failed_login_count', 'last_failed_login_at', 'locked_until', 'lock_reason'])
        raise BusinessLogicError('AUTH_INVALID_CREDENTIALS')

    # Successful login: reset counters
    user.failed_login_count = 0
    user.locked_until = None
    user.lock_reason = None
    user.last_login = now
    user.save(update_fields=['failed_login_count', 'locked_until', 'lock_reason', 'last_login'])

    access_token = create_access_token(user)
    raw_refresh_token, _ = create_refresh_token(user, ip=ip, user_agent=user_agent)

    return user, access_token, raw_refresh_token

def rotate_refresh_token(raw_refresh_token: str, ip: str = None, user_agent: str = None):
    if not raw_refresh_token:
        raise BusinessLogicError('AUTH_TOKEN_INVALID', detail='Thiếu Refresh Token.')

    token_h = hash_token(raw_refresh_token)
    token_instance = RefreshToken.objects.filter(token_hash=token_h).select_related('user').first()

    if not token_instance:
        raise BusinessLogicError('AUTH_TOKEN_INVALID', detail='Refresh Token không tồn tại.')

    now = timezone.now()

    # Re-use of revoked token -> Check grace period (60s) for concurrent requests (F5 / React StrictMode / multi-tabs)
    if token_instance.revoked_at is not None:
        time_since_revocation = (now - token_instance.revoked_at).total_seconds()
        if time_since_revocation < 60:
            latest_token = RefreshToken.objects.filter(
                family_id=token_instance.family_id,
                revoked_at__isnull=True
            ).order_by('-created_at').first()
            if latest_token and now <= latest_token.expires_at and now <= latest_token.idle_expires_at:
                new_access_token = create_access_token(latest_token.user)
                new_raw_refresh, _ = create_refresh_token(
                    user=latest_token.user,
                    family_id=token_instance.family_id,
                    ip=ip,
                    user_agent=user_agent
                )
                return latest_token.user, new_access_token, new_raw_refresh

        RefreshToken.objects.filter(family_id=token_instance.family_id).update(revoked_at=now)
        raise BusinessLogicError('AUTH_REFRESH_REVOKED')

    # Check expiry
    if now > token_instance.expires_at or now > token_instance.idle_expires_at:
        token_instance.revoked_at = now
        token_instance.save(update_fields=['revoked_at'])
        raise BusinessLogicError('AUTH_TOKEN_EXPIRED')

    # Revoke current token
    token_instance.revoked_at = now
    token_instance.last_used_at = now
    token_instance.save(update_fields=['revoked_at', 'last_used_at'])

    # Issue new refresh token within same family and new access token
    new_raw_refresh, _ = create_refresh_token(
        user=token_instance.user,
        family_id=token_instance.family_id,
        ip=ip,
        user_agent=user_agent
    )
    new_access_token = create_access_token(token_instance.user)

    return token_instance.user, new_access_token, new_raw_refresh

def revoke_refresh_token(raw_refresh_token: str):
    if not raw_refresh_token:
        return
    token_h = hash_token(raw_refresh_token)
    RefreshToken.objects.filter(token_hash=token_h, revoked_at__isnull=True).update(revoked_at=timezone.now())

def revoke_all_user_tokens(user: User):
    RefreshToken.objects.filter(user=user, revoked_at__isnull=True).update(revoked_at=timezone.now())

def check_and_suspend_user(user: User, admin_user: User = None, request=None) -> dict:
    """
    Tự động kiểm tra điều kiện vi phạm của bạn đọc:
    - Có sách quá hạn > 7 ngày.
    - Hoặc có tổng nợ tiền phạt chưa thanh toán > 50.000đ.
    Nếu vi phạm: Tự động khóa thẻ mượn và gửi thông báo.
    Nếu đã khắc phục và trước đó bị khóa vì lý do ngưỡng: Tự động mở khóa thẻ.
    """
    if user.role in ['admin', 'librarian']:
        return {'status': 'skipped', 'reason': 'staff_exempt'}

    if user.has_active_borrow_override and not user.is_currently_locked:
        return {
            'status': 'skipped',
            'reason': 'documented_borrow_override',
            'until': user.borrow_override_until.isoformat(),
        }

    from apps.circulation.models import Loan
    from apps.fines.models import Fine
    from apps.notifications.models import Notification
    from apps.audit.services import log_action

    now = timezone.now()
    threshold_date = now - timedelta(days=7)
    fine_threshold = 50000

    # No-show uses the same borrowing lock as every other violation, but it is
    # time-bound. Keep it active until the configured deadline, then clear it.
    if user.lock_reason == LockReason.NO_SHOW_THRESHOLD:
        if user.locked_until and user.locked_until > now:
            return {'status': 'already_suspended', 'reason': user.lock_reason}
        user.is_locked = False
        user.lock_reason = None
        user.locked_until = None
        user.save(update_fields=['is_locked', 'lock_reason', 'locked_until'])

    overdue_loans_count = Loan.objects.filter(
        user=user,
        status=LoanStatus.ACTIVE,
        due_at__lt=threshold_date
    ).count()

    unpaid_fines = Fine.objects.filter(
        user=user,
        status__in=[FineStatus.UNPAID, FineStatus.PARTIAL]
    ).aggregate(total=Sum('amount'))['total'] or 0

    is_overdue_violated = overdue_loans_count > 0
    is_fine_violated = unpaid_fines > fine_threshold

    if is_overdue_violated or is_fine_violated:
        reason = LockReason.OVERDUE_THRESHOLD if is_overdue_violated else LockReason.UNPAID_FINE_THRESHOLD
        reason_text = (
            f"Tự động khóa thẻ do có {overdue_loans_count} lượt mượn quá hạn trên 7 ngày."
            if is_overdue_violated
            else f"Tự động khóa thẻ do tổng nợ tiền phạt {unpaid_fines:,.0f}đ vượt ngưỡng quy định (> 50.000đ)."
        )

        if not user.is_locked:
            user.is_locked = True
            user.lock_reason = reason
            user.save(update_fields=['is_locked', 'lock_reason'])

            Notification.objects.create(
                user=user,
                content=f"Thẻ bạn đọc bị tạm khóa tự động: {reason_text}",
                type=NotificationType.OVERDUE if is_overdue_violated else NotificationType.FINE_CREATED
            )

            log_action(
                user=admin_user or user,
                action='AUTO_SUSPEND_USER',
                entity_type='User',
                entity_id=user.id,
                detail={'reason': reason, 'message': reason_text},
                request=request
            )
            return {'status': 'suspended', 'reason': reason, 'detail': reason_text}

        return {'status': 'already_suspended', 'reason': user.lock_reason}

    # Nếu không còn vi phạm và trước đó bị khóa vì lý do ngưỡng -> Mở khóa lại
    if user.lock_reason in [LockReason.OVERDUE_THRESHOLD, LockReason.UNPAID_FINE_THRESHOLD]:
        user.is_locked = False
        user.lock_reason = None
        user.save(update_fields=['is_locked', 'lock_reason'])

        Notification.objects.create(
            user=user,
            content='Thẻ bạn đọc đã được tự động mở khóa. Tài khoản đã hoàn tất các nghĩa vụ sách quá hạn và tiền phạt. Quyền mượn sách được khôi phục.',
            type=NotificationType.CARD_EXPIRING
        )

        log_action(
            user=admin_user or user,
            action='AUTO_UNSUSPEND_USER',
            entity_type='User',
            entity_id=user.id,
            detail={'message': 'Đã hoàn tất nghĩa vụ mượn trả và nộp phạt.'},
            request=request
        )
        return {'status': 'unsuspended', 'detail': 'Khôi phục thẻ thành công.'}

    return {'status': 'normal'}

def auto_suspend_violating_users(admin_user: User = None, request=None) -> dict:
    """
    Quét toàn bộ tài khoản bạn đọc đang hoạt động trong hệ thống để tự động khóa thẻ
    hoặc mở khóa theo các ngưỡng quy định.
    """
    patrons = User.objects.filter(
        role__in=['student', 'lecturer'],
        is_active=True,
        deleted_at__isnull=True
    )
    total_checked = 0
    total_suspended = 0
    total_unsuspended = 0

    for patron in patrons:
        total_checked += 1
        res = check_and_suspend_user(patron, admin_user=admin_user, request=request)
        if res.get('status') == 'suspended':
            total_suspended += 1
        elif res.get('status') == 'unsuspended':
            total_unsuspended += 1

    return {
        'total_checked': total_checked,
        'total_suspended': total_suspended,
        'total_unsuspended': total_unsuspended
    }

