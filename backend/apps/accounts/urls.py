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
    AutoSuspendCheckView,
    StudentLookupView,
    IssueStudentCardView,
    StudentRosterListView,
    StudentRosterTemplateView,
    StudentRosterImportView,
    StudentRosterExportView,
    PaymentTransactionListView,
    PaymentTransactionExportView,
    CheckStudentCardPaymentStatusView,
    SimulateSepayCardPaymentView,
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
    path('users/auto-suspend-check', AutoSuspendCheckView.as_view(), name='user-auto-suspend-check'),
    path('users', UserAdminListView.as_view(), name='user-admin-list'),
    path('users/', UserAdminListView.as_view(), name='user-admin-list-slash'),
    path('users/<int:pk>', UserAdminDetailView.as_view(), name='user-admin-detail'),
    path('users/<int:pk>/lock', UserLockToggleView.as_view(), name='user-admin-lock'),
    path('users/<int:pk>/unlock', UserLockToggleView.as_view(), name='user-admin-unlock'),
    path('users/<int:pk>/extend-card', UserCardExtendView.as_view(), name='user-admin-extend-card'),
    path('users/<int:pk>/reset-password', UserResetPasswordAdminView.as_view(), name='user-admin-reset-password'),

    # UTH Student Roster & 1-Click Card Issuance
    path('students/lookup', StudentLookupView.as_view(), name='student-lookup'),
    path('students/issue-card', IssueStudentCardView.as_view(), name='student-issue-card'),
    path('students/payment-status', CheckStudentCardPaymentStatusView.as_view(), name='student-payment-status'),
    path('students/simulate-sepay-transfer', SimulateSepayCardPaymentView.as_view(), name='student-simulate-sepay-transfer'),
    path('students/template', StudentRosterTemplateView.as_view(), name='student-roster-template'),
    path('students/import', StudentRosterImportView.as_view(), name='student-roster-import'),
    path('students/export', StudentRosterExportView.as_view(), name='student-roster-export'),
    path('students', StudentRosterListView.as_view(), name='student-roster-list'),

    # Financial Transactions & Receipts Reconciliation
    path('transactions', PaymentTransactionListView.as_view(), name='payment-transaction-list'),
    path('transactions/export', PaymentTransactionExportView.as_view(), name='payment-transaction-export'),
]
