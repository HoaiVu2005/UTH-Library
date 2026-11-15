from datetime import timedelta
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.core.models import SystemConfig
from apps.core.enums import (
    LoanStatus,
    CopyStatus,
    FineType,
    FineStatus,
    LockReason,
    NotificationType,
    NotificationChannel,
)
from apps.circulation.models import Loan
from apps.catalog.models import Copy
from apps.fines.models import Fine
from apps.notifications.models import Notification
from apps.audit.services import log_action

class Command(BaseCommand):
    help = 'Tự động chuyển các khoản mượn quá hạn trên 30 ngày sang trạng thái MẤT, tính phạt và khóa thẻ bạn đọc (BR07, BR14)'

    def handle(self, *args, **options):
        config = SystemConfig.get_solo()
        overdue_lost_days = config.overdue_lost_days or 30
        now = timezone.now()
        lost_threshold = now - timedelta(days=overdue_lost_days)

        loans_to_mark_lost = Loan.objects.filter(
            status=LoanStatus.ACTIVE,
            due_at__lt=lost_threshold,
        ).select_related('user', 'copy__book')

        count = 0
        for loan in loans_to_mark_lost:
            with transaction.atomic():
                l = Loan.objects.select_for_update().get(id=loan.id)
                if l.status != LoanStatus.ACTIVE:
                    continue

                l.status = LoanStatus.LOST
                l.lost_at = now
                l.save(update_fields=['status', 'lost_at', 'updated_at'])

                # Update copy status to LOST
                Copy.objects.filter(id=l.copy_id).update(status=CopyStatus.LOST)

                # Overdue Fine (for the 30 days overdue)
                overdue_fine_amount = overdue_lost_days * l.fine_per_day_snapshot
                Fine.objects.get_or_create(
                    loan=l,
                    type=FineType.OVERDUE,
                    defaults={
                        'user': l.user,
                        'amount': overdue_fine_amount,
                        'paid_amount': 0,
                        'status': FineStatus.UNPAID,
                        'note': f"Phạt quá hạn {overdue_lost_days} ngày trước khi chuyển thành sách mất",
                    }
                )

                # Lost Fine: (book_price * 2) + processing_fee
                lost_fine_amount = (l.book_price_snapshot * 2) + l.processing_fee_snapshot
                Fine.objects.get_or_create(
                    loan=l,
                    type=FineType.LOST,
                    defaults={
                        'user': l.user,
                        'amount': lost_fine_amount,
                        'paid_amount': 0,
                        'status': FineStatus.UNPAID,
                        'note': f"Phạt đền sách mất (200% giá sách {l.book_price_snapshot:,.0f} đ + phí xử lý {l.processing_fee_snapshot:,.0f} đ)",
                    }
                )

                # Lock patron card (BR07/BR14)
                patron = l.user
                patron.is_locked = True
                patron.lock_reason = LockReason.UNPAID_LOST_FINE
                patron.save(update_fields=['is_locked', 'lock_reason'])

                # Send Notification
                dedupe_key = f"auto_lost_{l.id}"
                if not Notification.objects.filter(dedupe_key=dedupe_key).exists():
                    Notification.objects.create(
                        user=patron,
                        type=NotificationType.OVERDUE,
                        channel=NotificationChannel.IN_APP,
                        content=(
                            f"Sách '{l.copy.book.title}' (mã vạch {l.copy.barcode}) "
                            f"đã quá hạn hơn {overdue_lost_days} ngày và được tự động xác nhận là MẤT. "
                            f"Tài khoản thư viện của bạn bị tạm khóa cho đến khi thanh toán toàn bộ tiền phạt."
                        ),
                        link='/patron/fines',
                        dedupe_key=dedupe_key,
                    )

                log_action(
                    user=patron,
                    action='AUTO_LOST_LOAN',
                    entity_type='Loan',
                    entity_id=l.id,
                    detail={'barcode': l.copy.barcode, 'overdue_days': overdue_lost_days},
                )
                count += 1

        self.stdout.write(self.style.SUCCESS(f"Đã xử lý {count} phiếu mượn quá hạn sang trạng thái MẤT."))
