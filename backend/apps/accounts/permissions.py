from rest_framework.permissions import BasePermission
from apps.core.enums import UserRole

class IsAdminUserRole(BasePermission):
    message = 'Chỉ có thủ thư hoặc quản trị viên mới có quyền thực hiện thao tác này.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [UserRole.ADMIN, UserRole.LIBRARIAN])

class IsAdminOnlyRole(BasePermission):
    message = 'Chỉ có Lãnh đạo Thư viện hoặc Quản trị viên mới có thẩm quyền thực hiện thao tác này.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == UserRole.ADMIN)

class IsStudentOrLecturer(BasePermission):
    message = 'Chỉ có bạn đọc (sinh viên hoặc giảng viên) mới có quyền truy cập.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [UserRole.STUDENT, UserRole.LECTURER])

class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [UserRole.ADMIN, UserRole.LIBRARIAN]:
            return True
        user_field = getattr(obj, 'user', None)
        return user_field == request.user

