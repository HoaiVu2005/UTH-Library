from django.urls import path
from .views import (
    DigitalDocumentListView,
    DigitalDocumentDetailView,
    DigitalDocumentCreateView,
    DigitalDocumentUpdateView,
    DigitalDocumentWorkflowActionView,
    StartReadingSessionView,
    StreamDocumentPdfView,
    ReadingSessionHeartbeatView,
    PatronReadingHistoryView,
    DigitalLibraryStatsView,
)

urlpatterns = [
    # Tra cứu & xem chi tiết tài liệu số (Sinh viên & Công chúng)
    path('digital-library/documents', DigitalDocumentListView.as_view(), name='digital-doc-list'),
    path('digital-library/documents/<int:pk>', DigitalDocumentDetailView.as_view(), name='digital-doc-detail'),

    # Tiếp nhận & Quản trị tài liệu (Thủ thư & Admin)
    path('digital-library/documents/create', DigitalDocumentCreateView.as_view(), name='digital-doc-create'),
    path('digital-library/documents/<int:pk>/update', DigitalDocumentUpdateView.as_view(), name='digital-doc-update'),
    path('digital-library/documents/<int:pk>/workflow', DigitalDocumentWorkflowActionView.as_view(), name='digital-doc-workflow'),

    # Phiên đọc bảo mật & Dynamic Watermark
    path('digital-library/documents/<int:pk>/start-session', StartReadingSessionView.as_view(), name='digital-doc-start-session'),
    path('digital-library/sessions/<uuid:session_id>/stream', StreamDocumentPdfView.as_view(), name='digital-doc-stream'),
    path('digital-library/sessions/<uuid:session_id>/heartbeat', ReadingSessionHeartbeatView.as_view(), name='digital-doc-heartbeat'),

    # Lịch sử đọc cá nhân của sinh viên
    path('digital-library/my-history', PatronReadingHistoryView.as_view(), name='digital-doc-my-history'),

    # Báo cáo & Thống kê Quản trị Thư viện số
    path('digital-library/admin/stats', DigitalLibraryStatsView.as_view(), name='digital-doc-admin-stats'),
]

