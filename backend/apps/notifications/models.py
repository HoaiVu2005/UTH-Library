from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from apps.core.enums import NotificationType, NotificationChannel

class Notification(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        db_index=True
    )
    channel = models.CharField(
        max_length=20,
        choices=NotificationChannel.choices,
        default=NotificationChannel.IN_APP
    )
    content = models.TextField(verbose_name='Nội dung thông báo')
    link = models.CharField(max_length=500, blank=True, null=True, verbose_name='Đường dẫn hành động')
    is_read = models.BooleanField(default=False, db_index=True)
    dedupe_key = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        db_index=True,
        help_text='Khóa chống gửi trùng lặp cho Cron idempotent'
    )
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        verbose_name = 'Thông báo'
        verbose_name_plural = 'Thông báo'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        return f"Notification #{self.id}: {self.user.card_code} - {self.type}"

