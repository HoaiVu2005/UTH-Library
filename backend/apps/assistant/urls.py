from django.urls import path
from apps.assistant.views import AIChatView, AIMemoryView, SendOverdueNotificationView

urlpatterns = [
    path('chat/', AIChatView.as_view(), name='ai-chat'),
    path('memory/', AIMemoryView.as_view(), name='ai-memory'),
    path('notify-overdue/', SendOverdueNotificationView.as_view(), name='ai-notify-overdue'),
]
