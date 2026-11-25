from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.core.enums import ReservationStatus, NotificationType, NotificationChannel
from apps.reservations.models import Reservation
from apps.reservations.services import record_no_show_and_check_lockout
from apps.circulation.services import process_reservation_queue_for_copy
from apps.notifications.models import Notification

class Command(BaseCommand):
    help = 'Xử lý các yêu cầu giữ sách (ready) đã quá hạn 3 ngày -> chuyển sang expired, phạt no-show và chuyển cho người tiếp theo'

    def handle(self, *args, **options):
        now = timezone.now()

        expired_reservations = Reservation.objects.filter(
            status=ReservationStatus.READY,
            hold_expires_at__lt=now,
        ).select_related('user', 'book', 'copy')

        count = 0
        for reservation in expired_reservations:
            with transaction.atomic():
                res = Reservation.objects.select_for_update().get(id=reservation.id)
                if res.status != ReservationStatus.READY:
                    continue

                res.status = ReservationStatus.EXPIRED
                res.no_show_counted = True
                res.cancel_reason = 'Hết hạn nhận sách sách 3 ngày (no-show tự động)'
                res.save(update_fields=['status', 'no_show_counted', 'cancel_reason', 'updated_at'])

                # Apply no-show check
                record_no_show_and_check_lockout(res.user)

                # Transfer copy to next person in queue or make available
                copy = res.copy
                if copy:
                    process_reservation_queue_for_copy(copy)

                # Send notification
                dedupe_key = f"res_expired_{res.id}"
                if not Notification.objects.filter(dedupe_key=dedupe_key).exists():
                    Notification.objects.create(
                        user=res.user,
                        type=NotificationType.RESERVATION_READY,
                        channel=NotificationChannel.IN_APP,
                        content=(
                            f"Yêu cầu giữ sách '{res.book.title}' đã hết thời gian giữ 3 ngày. "
                            f"Sách đã được chuyển giao cho người tiếp theo hoặc trả về kho. "
                            f"Hệ thống đã ghi nhận 1 lần không đến nhận sách (no-show)."
                        ),
                        link='/patron/reservations',
                        dedupe_key=dedupe_key,
                    )
                count += 1

        self.stdout.write(self.style.SUCCESS(f"Đã xử lý {count} yêu cầu giữ sách hết hạn."))

