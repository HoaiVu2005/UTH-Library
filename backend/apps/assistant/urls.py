from django.urls import path
from apps.assistant.views import AIChatView, SendOverdueNotificationView

urlpatterns = [
    path('chat/', AIChatView.as_view(), name='ai-chat'),
    path('notify-overdue/', SendOverdueNotificationView.as_view(), name='ai-notify-overdue'),
]
