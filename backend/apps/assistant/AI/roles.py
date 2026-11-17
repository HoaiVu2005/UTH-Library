from dataclasses import dataclass


@dataclass(frozen=True)
class AIRoleProfile:
    key: str
    audience_label: str
    library_priority: str
    borrow_limit: int | None
    borrow_days: int | None


_ROLE_PROFILES = {
    'admin': AIRoleProfile(
        key='admin',
        audience_label='Quản trị viên / Thủ thư Thư viện UTH',
        library_priority='Ưu tiên nghiệp vụ lưu thông, thống kê và vận hành thư viện.',
        borrow_limit=None,
        borrow_days=None,
    ),
    'lecturer': AIRoleProfile(
        key='lecturer',
        audience_label='Giảng viên UTH',
        library_priority='Ưu tiên tài liệu nghiên cứu, giảng dạy và tài khoản mượn cá nhân.',
        borrow_limit=10,
        borrow_days=30,
    ),
    'student': AIRoleProfile(
        key='student',
        audience_label='Sinh viên UTH',
        library_priority='Ưu tiên giáo trình, tài liệu học tập và tài khoản mượn cá nhân.',
        borrow_limit=5,
        borrow_days=14,
    ),
}


def get_ai_role_profile(role: str | None, *, is_staff: bool = False) -> AIRoleProfile:
    """Return the assistant policy for the authenticated UTH user role."""
    if is_staff or role == 'admin':
        return _ROLE_PROFILES['admin']
    return _ROLE_PROFILES.get(role or '', _ROLE_PROFILES['student'])
