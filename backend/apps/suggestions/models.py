from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from apps.core.enums import SuggestionStatus

class Suggestion(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='suggestions')
    book_title = models.CharField(max_length=500, verbose_name='Tên sách đề xuất')
    author = models.CharField(max_length=255, verbose_name='Tác giả', blank=True, null=True)
    reason = models.TextField(verbose_name='Lý do đề xuất')
    
    status = models.CharField(
        max_length=20,
        choices=SuggestionStatus.choices,
        default=SuggestionStatus.PENDING,
        db_index=True
    )
    review_note = models.TextField(blank=True, null=True, verbose_name='Ghi chú của thủ thư')
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_suggestions'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    received_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'suggestions'
        verbose_name = 'Đề xuất mua sách'
        verbose_name_plural = 'Đề xuất mua sách'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.book_title} ({self.user.card_code}) - {self.status}"

