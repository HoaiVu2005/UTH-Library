from django.urls import path
from .views import (
    LoginView,
    RefreshTokenView,
    LogoutView,
    ForgotPasswordView,
    ResetPasswordView,
    ProfileView,
    ChangePasswordView,
    AvatarUploadView,
    UserAdminListView,
    UserAdminDetailView,
    UserLockToggleView,
    UserCardExtendView,
    UserResetPasswordAdminView,
)

urlpatterns = [
    # Auth endpoints
    path('auth/login', LoginView.as_view(), name='auth-login'),
    path('auth/refresh', RefreshTokenView.as_view(), name='auth-refresh'),
    path('auth/logout', LogoutView.as_view(), name='auth-logout'),
    path('auth/forgot-password', ForgotPasswordView.as_view(), name='auth-forgot-password'),
    path('auth/reset-password', ResetPasswordView.as_view(), name='auth-reset-password'),

    # Profile endpoints
    path('profile', ProfileView.as_view(), name='profile-detail'),
    path('profile/change-password', ChangePasswordView.as_view(), name='profile-change-password'),
    path('profile/avatar', AvatarUploadView.as_view(), name='profile-avatar-upload'),

    # Admin User Management endpoints
    path('users', UserAdminListView.as_view(), name='user-admin-list'),
    path('users/<int:pk>', UserAdminDetailView.as_view(), name='user-admin-detail'),
    path('users/<int:pk>/lock', UserLockToggleView.as_view(), name='user-admin-lock'),
    path('users/<int:pk>/extend-card', UserCardExtendView.as_view(), name='user-admin-extend-card'),
    path('users/<int:pk>/reset-password', UserResetPasswordAdminView.as_view(), name='user-admin-reset-password'),
]
