from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.core.models import BaseModel
from apps.core.enums import SuggestionStatus, CampaignStatus

class SuggestionCampaign(BaseModel):
    title = models.CharField(max_length=255, verbose_name='Tên đợt khảo sát')
    description = models.TextField(blank=True, null=True, verbose_name='Mô tả / Thể lệ đợt khảo sát')
    start_date = models.DateField(verbose_name='Ngày bắt đầu')
    end_date = models.DateField(verbose_name='Ngày kết thúc')
    status = models.CharField(
        max_length=20,
        choices=CampaignStatus.choices,
        default=CampaignStatus.OPEN,
        db_index=True,
        verbose_name='Trạng thái đợt'
    )
    target_audience = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        default='Toàn trường UTH',
        verbose_name='Đối tượng áp dụng'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_campaigns',
        verbose_name='Người tạo đợt'
    )

    class Meta:
        db_table = 'suggestion_campaigns'
        verbose_name = 'Đợt khảo sát đề xuất sách'
        verbose_name_plural = 'Các đợt khảo sát đề xuất sách'
        ordering = ['-start_date', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"

    @property
    def is_active(self):
        today = timezone.localdate()
        return self.status == CampaignStatus.OPEN and self.start_date <= today <= self.end_date

    @property
    def days_remaining(self):
        today = timezone.localdate()
        if today > self.end_date:
            return 0
        return (self.end_date - today).days


class Suggestion(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='suggestions')
    campaign = models.ForeignKey(
        SuggestionCampaign,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='suggestions',
        verbose_name='Đợt khảo sát'
    )
    book_title = models.CharField(max_length=500, verbose_name='Tên sách đề xuất')
    author = models.CharField(max_length=255, verbose_name='Tác giả', blank=True, null=True)
    department = models.CharField(max_length=150, blank=True, null=True, verbose_name='Khoa / Chuyên ngành')
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
            models.Index(fields=['campaign', 'status']),
        ]

    def __str__(self):
        return f"{self.book_title} ({self.user.card_code}) - {self.status}"

    @property
    def votes_count(self):
        return self.votes.count()


class SuggestionVote(models.Model):
    id = models.BigAutoField(primary_key=True)
    suggestion = models.ForeignKey(Suggestion, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='suggestion_votes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'suggestion_votes'
        verbose_name = 'Lượt ủng hộ đề xuất'
        verbose_name_plural = 'Lượt ủng hộ đề xuất'
        unique_together = ('suggestion', 'user')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['suggestion', 'user']),
        ]

    def __str__(self):
        return f"{self.user.username} ủng hộ {self.suggestion.book_title}"
