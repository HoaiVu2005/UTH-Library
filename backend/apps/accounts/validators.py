import re
from django.core.exceptions import ValidationError

TOP_COMMON_PASSWORDS = {
    '12345678', 'password', '123456789', '1234567890', '1234567', 'qwertyuiop',
    'admin123', 'admin888', 'uth@1234', '11111111', '123123123', 'password123',
    'iloveyou', 'welcome1', 'monkey123', 'dragon123', 'football', 'master123',
    'library123', 'sinhvien123', 'giangvien123', 'uthlibrary', 'uth123456',
}

class LetterAndNumberPasswordValidator:
    def validate(self, password, user=None):
        if not re.search(r'[a-zA-Z]', password):
            raise ValidationError(
                'Mật khẩu phải chứa ít nhất một chữ cái.',
                code='password_no_letter',
            )
        if not re.search(r'\d', password):
            raise ValidationError(
                'Mật khẩu phải chứa ít nhất một chữ số.',
                code='password_no_number',
            )

    def get_help_text(self):
        return 'Mật khẩu phải dài ít nhất 8 ký tự và bao gồm cả chữ và số.'

class CommonPasswordListValidator:
    def validate(self, password, user=None):
        if password.lower() in TOP_COMMON_PASSWORDS:
            raise ValidationError(
                'Mật khẩu này quá phổ biến và dễ đoán. Vui lòng chọn một mật khẩu mạnh hơn.',
                code='password_too_common',
            )

    def get_help_text(self):
        return 'Mật khẩu không được nằm trong danh sách các mật khẩu phổ biến nhất.'

