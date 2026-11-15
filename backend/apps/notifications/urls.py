from django.urls import path
from .views import MyNotificationsView, MarkReadView, BulkMarkReadView, RealtimeCheckView

urlpatterns = [
    path('notifications/me', MyNotificationsView.as_view(), name='my-notifications'),
    path('notifications/realtime-check', RealtimeCheckView.as_view(), name='realtime-notification-check'),
    path('notifications/<int:pk>/read', MarkReadView.as_view(), name='mark-notification-read'),
    path('notifications/bulk-mark-read', BulkMarkReadView.as_view(), name='bulk-mark-notification-read'),
]
