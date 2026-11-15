import hashlib
import secrets
import uuid
from datetime import timedelta
import jwt
from django.conf import settings
from django.utils import timezone
from django.db.models import Q
from django.core.cache import cache
from apps.core.exceptions import BusinessLogicError
from apps.core.enums import LockReason
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

    # Re-use of revoked token -> Compromised family! Revoke all tokens in family!
    if token_instance.revoked_at is not None:
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
