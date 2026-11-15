from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=100, db_index=True)
    entity_type = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    entity_id = models.CharField(max_length=100, blank=True, null=True)
    detail = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'audit_logs'
        verbose_name = 'Nhật ký thao tác'
        verbose_name_plural = 'Nhật ký thao tác'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at', 'user']),
            models.Index(fields=['action', 'created_at']),
        ]

    def __str__(self):
        user_str = self.user.username if self.user else "Hệ thống"
        return f"[{self.created_at}] {user_str} - {self.action} ({self.entity_type} #{self.entity_id})"

