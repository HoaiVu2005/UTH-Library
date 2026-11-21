from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from apps.core.enums import FineType, FineStatus, DamageLevel

class Fine(BaseModel):
    objects = models.Manager()
    loan = models.ForeignKey(
        'circulation.Loan',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='fines'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='fines',
        help_text='Phi chuẩn hóa để lọc và chống IDOR'
    )
    type = models.CharField(
        max_length=20,
        choices=FineType.choices,
        default=FineType.OVERDUE,
        db_index=True
    )
    amount = models.BigIntegerField(help_text='Số tiền phạt (VND)')
    paid_amount = models.BigIntegerField(default=0, help_text='Số tiền đã nộp (VND)')
    status = models.CharField(
        max_length=20,
        choices=FineStatus.choices,
        default=FineStatus.UNPAID,
        db_index=True
    )
    damage_level = models.CharField(
        max_length=20,
        choices=DamageLevel.choices,
        blank=True,
        null=True
    )
    note = models.TextField(blank=True, null=True)
    waive_reason = models.TextField(blank=True, null=True)
    waived_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='waived_fines'
    )

    class Meta:
        db_table = 'fines'
        verbose_name = 'Khoản phạt'
        verbose_name_plural = 'Khoản phạt'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status']),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(paid_amount__lte=models.F('amount')),
                name='check_paid_amount_lte_amount'
            ),
            models.CheckConstraint(
                condition=models.Q(amount__gte=0),
                name='check_amount_gte_zero'
            ),
            models.CheckConstraint(
                condition=models.Q(paid_amount__gte=0),
                name='check_paid_amount_gte_zero'
            ),
        ]

    def __str__(self):
        return f"Fine #{self.id}: {self.user.card_code} - {self.type} ({self.amount:,}đ, {self.status})"

    @property
    def remaining_amount(self):
        return max(0, self.amount - self.paid_amount)

class FinePayment(BaseModel):
    objects = models.Manager()
    fine = models.ForeignKey(Fine, on_delete=models.PROTECT, related_name='payments')
    amount = models.BigIntegerField(help_text='Số tiền thanh toán lần này (VND)')
    collected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='collected_payments'
    )
    collected_at = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'fine_payments'
        verbose_name = 'Lịch sử thu tiền phạt'
        verbose_name_plural = 'Lịch sử thu tiền phạt'
        ordering = ['-collected_at']

    def __str__(self):
        return f"Payment #{self.id}: {self.amount:,}đ for Fine #{self.fine.id}"
