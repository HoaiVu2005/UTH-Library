import jwt
from datetime import datetime
from django.conf import settings
from django.utils import timezone
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed
from .models import User

class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth = get_authorization_header(request).split()
        if not auth or auth[0].lower() != b'bearer':
            return None

        if len(auth) == 1:
            raise AuthenticationFailed('Token không hợp lệ: thiếu mã xác thực.', code='AUTH_TOKEN_INVALID')
        elif len(auth) > 2:
            raise AuthenticationFailed('Token không hợp lệ: định dạng sai.', code='AUTH_TOKEN_INVALID')

        try:
            token = auth[1].decode('utf-8')
        except UnicodeError:
            raise AuthenticationFailed('Token chứa ký tự không hợp lệ.', code='AUTH_TOKEN_INVALID')

        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            exc = AuthenticationFailed('Token đã hết hạn.', code='AUTH_TOKEN_EXPIRED')
            exc.code = 'AUTH_TOKEN_EXPIRED'
            raise exc
        except jwt.InvalidTokenError:
            exc = AuthenticationFailed('Token không hợp lệ.', code='AUTH_TOKEN_INVALID')
            exc.code = 'AUTH_TOKEN_INVALID'
            raise exc

        user_id = payload.get('sub')
        if not user_id:
            raise AuthenticationFailed('Token thiếu thông tin người dùng.', code='AUTH_TOKEN_INVALID')

        try:
            user = User.objects.get(id=user_id, deleted_at__isnull=True)
        except User.DoesNotExist:
            raise AuthenticationFailed('Người dùng không tồn tại.', code='AUTH_TOKEN_INVALID')

        if not user.is_active:
            raise AuthenticationFailed('Tài khoản đã bị vô hiệu hóa.', code='USER_LOCKED')

        # Check if password was changed after token issuance
        token_iat = payload.get('iat')
        if token_iat and user.password_changed_at:
            pwd_ts = int(user.password_changed_at.timestamp())
            # Allow 2 seconds grace for clock skew / creation timing
            if pwd_ts > (token_iat + 2):
                raise AuthenticationFailed('Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.', code='AUTH_TOKEN_INVALID')

        return (user, token)
