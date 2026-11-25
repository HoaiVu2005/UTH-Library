from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from apps.core.enums import ReservationStatus, ReservationType

class Reservation(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reservations')
    book = models.ForeignKey('catalog.Book', on_delete=models.CASCADE, related_name='reservations')
    copy = models.ForeignKey('catalog.Copy', on_delete=models.SET_NULL, null=True, blank=True, related_name='reservations')
    
    status = models.CharField(
        max_length=20,
        choices=ReservationStatus.choices,
        default=ReservationStatus.PENDING,
        db_index=True
    )
    type = models.CharField(
        max_length=20,
        choices=ReservationType.choices,
        default=ReservationType.BORROW
    )
    ready_at = models.DateTimeField(null=True, blank=True)
    hold_expires_at = models.DateTimeField(null=True, blank=True)
    queue_position = models.PositiveIntegerField(default=1)
    notified_at = models.DateTimeField(null=True, blank=True)
    no_show_counted = models.BooleanField(default=False)
    cancel_reason = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'reservations'
        verbose_name = 'Yêu cầu mượn sách / chờ nhận sách'
        verbose_name_plural = 'Yêu cầu mượn sách / chờ nhận sách'
        ordering = ['queue_position', 'created_at']
        indexes = [
            models.Index(fields=['book', 'status']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['hold_expires_at']),
        ]
        constraints = [
            # BR17: Mỗi bạn đọc tối đa 1 Reservation pending trên cùng 1 đầu sách
            models.UniqueConstraint(
                fields=['user', 'book'],
                condition=models.Q(status='pending'),
                name='unique_pending_reservation_per_user_book'
            ),
            # Mỗi bản sao chỉ có tối đa 1 Reservation ready
            models.UniqueConstraint(
                fields=['copy'],
                condition=models.Q(status='ready'),
                name='unique_ready_reservation_per_copy'
            ),
        ]

    def __str__(self):
        return f"Reservation #{self.id}: {self.user.card_code} -> {self.book.title} ({self.status})"

