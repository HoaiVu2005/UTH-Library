from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.core.enums import LoanStatus, NotificationType, NotificationChannel
from apps.circulation.models import Loan
from apps.notifications.models import Notification

class Command(BaseCommand):
    help = 'Gửi thông báo nhắc sách quá hạn trả (idempotent, 1 lần/ngày/phiếu)'

    def handle(self, *args, **options):
        now = timezone.now()
        today = timezone.localdate()

        loans = Loan.objects.filter(
            status=LoanStatus.ACTIVE,
            due_at__lt=now,
        ).exclude(
            last_overdue_notification_date=today
        ).select_related('user', 'copy__book')

        count = 0
        for loan in loans:
            days_late = loan.days_late
            if days_late <= 0:
                continue

            dedupe_key = f"overdue_{loan.id}_{today.isoformat()}"
            if Notification.objects.filter(dedupe_key=dedupe_key).exists():
                loan.last_overdue_notification_date = today
                loan.save(update_fields=['last_overdue_notification_date'])
                continue

            cur_fine = days_late * loan.fine_per_day_snapshot
            due_date_str = loan.due_at.strftime('%d/%m/%Y')

            Notification.objects.create(
                user=loan.user,
                type=NotificationType.OVERDUE,
                channel=NotificationChannel.IN_APP,
                content=(
                    f"Sách '{loan.copy.book.title}' (mã vạch {loan.copy.barcode}) "
                    f"đã quá hạn {days_late} ngày (hạn trả: {due_date_str}). "
                    f"Tiền phạt hiện tại ước tính: {cur_fine:,.0f} đ. Vui lòng trả sách ngay để tránh tăng thêm tiền phạt."
                ),
                link='/patron/loans',
                dedupe_key=dedupe_key,
            )
            loan.last_overdue_notification_date = today
            loan.save(update_fields=['last_overdue_notification_date'])
            count += 1

        self.stdout.write(self.style.SUCCESS(f"Đã gửi {count} thông báo sách quá hạn."))

