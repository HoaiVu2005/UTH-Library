from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.core.models import BaseModel
from apps.core.enums import LoanStatus, ReturnCondition

class Loan(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='loans')
    copy = models.ForeignKey('catalog.Copy', on_delete=models.PROTECT, related_name='loans')
    book = models.ForeignKey('catalog.Book', on_delete=models.PROTECT, related_name='loans', help_text='Phi chuẩn hóa để ràng buộc BR04')
    
    borrowed_at = models.DateTimeField(default=timezone.now)
    due_at = models.DateTimeField(db_index=True)
    returned_at = models.DateTimeField(null=True, blank=True)
    renewal_count = models.PositiveIntegerField(default=0)
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_loans'
    )
    status = models.CharField(
        max_length=20,
        choices=LoanStatus.choices,
        default=LoanStatus.ACTIVE,
        db_index=True
    )
    lost_at = models.DateTimeField(null=True, blank=True)
    return_condition = models.CharField(
        max_length=20,
        choices=ReturnCondition.choices,
        default=ReturnCondition.NORMAL
    )
    handled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='handled_loans'
    )
    note = models.TextField(blank=True, null=True)

    # Snapshots (Immutable once borrowed)
    fine_per_day_snapshot = models.BigIntegerField(default=2000)
    loan_days_snapshot = models.PositiveIntegerField(default=14)
    renewal_limit_snapshot = models.PositiveIntegerField(default=1)
    book_price_snapshot = models.BigIntegerField(default=100000)
    processing_fee_snapshot = models.BigIntegerField(default=20000)
    policy_id_snapshot = models.BigIntegerField(null=True, blank=True)

    # Idempotent notification tracking
    last_overdue_notification_date = models.DateField(null=True, blank=True)
    due_soon_notified = models.BooleanField(default=False)

    class Meta:
        db_table = 'loans'
        verbose_name = 'Phiếu mượn'
        verbose_name_plural = 'Phiếu mượn'
        ordering = ['-borrowed_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['due_at']),
            models.Index(fields=['status']),
        ]
        constraints = [
            # BR12: Mỗi bản sao chỉ có tối đa 1 Loan đang active
            models.UniqueConstraint(
                fields=['copy'],
                condition=models.Q(status='active'),
                name='unique_active_loan_per_copy'
            ),
            # BR04: Mỗi bạn đọc chỉ mượn 1 bản của cùng một đầu sách tại một thời điểm
            models.UniqueConstraint(
                fields=['user', 'book'],
                condition=models.Q(status='active'),
                name='unique_active_loan_per_user_book'
            ),
        ]

    def __str__(self):
        return f"Loan #{self.id}: {self.user.card_code} -> {self.copy.barcode}"

    @property
    def is_overdue(self):
        # overdue = Loan.status = active AND due_at < now (calculated, not stored)
        if self.status == LoanStatus.ACTIVE and self.due_at < timezone.now():
            return True
        return False

    @property
    def days_late(self):
        if not self.is_overdue:
            return 0
        now_date = timezone.localdate()
        due_date = self.due_at.astimezone(timezone.get_current_timezone()).date()
        return max(0, (now_date - due_date).days)

