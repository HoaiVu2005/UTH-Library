from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.core.models import SystemConfig
from apps.core.enums import LoanStatus, NotificationType, NotificationChannel
from apps.circulation.models import Loan
from apps.notifications.models import Notification

class Command(BaseCommand):
    help = 'Gửi thông báo nhắc sắp đến hạn trả sách (idempotent)'

    def handle(self, *args, **options):
        config = SystemConfig.get_solo()
        reminder_days = config.reminder_days or 2
        now = timezone.now()
        today = timezone.localdate()
        threshold = now + timedelta(days=reminder_days)

        loans = Loan.objects.filter(
            status=LoanStatus.ACTIVE,
            due_soon_notified=False,
            due_at__lte=threshold,
            due_at__gt=now,
        ).select_related('user', 'copy__book')

        count = 0
        for loan in loans:
            dedupe_key = f"due_soon_{loan.id}_{today.isoformat()}"
            if Notification.objects.filter(dedupe_key=dedupe_key).exists():
                loan.due_soon_notified = True
                loan.save(update_fields=['due_soon_notified'])
                continue

            due_date_str = loan.due_at.strftime('%d/%m/%Y')
            Notification.objects.create(
                user=loan.user,
                type=NotificationType.DUE_SOON,
                channel=NotificationChannel.IN_APP,
                content=(
                    f"Sách '{loan.copy.book.title}' (mã vạch {loan.copy.barcode}) "
                    f"sắp đến hạn trả vào ngày {due_date_str}. Vui lòng gia hạn hoặc trả sách đúng hạn."
                ),
                link='/patron/loans',
                dedupe_key=dedupe_key,
            )
            loan.due_soon_notified = True
            loan.save(update_fields=['due_soon_notified'])
            count += 1

        self.stdout.write(self.style.SUCCESS(f"Đã gửi {count} thông báo nhắc hạn trả."))

