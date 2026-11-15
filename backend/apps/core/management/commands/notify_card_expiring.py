from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.core.models import SystemConfig
from apps.core.enums import NotificationType, NotificationChannel
from apps.accounts.models import User
from apps.notifications.models import Notification

class Command(BaseCommand):
    help = 'Thông báo cho bạn đọc có thẻ sắp hết hạn trong vòng 30 ngày (idempotent)'

    def handle(self, *args, **options):
        config = SystemConfig.get_solo()
        expiring_days = config.card_expiring_days or 30
        today = timezone.localdate()
        threshold = today + timedelta(days=expiring_days)

        users_expiring = User.objects.filter(
            is_active=True,
            deleted_at__isnull=True,
            card_expiry__gte=today,
            card_expiry__lte=threshold,
        ).exclude(role='admin')

        count = 0
        for user in users_expiring:
            dedupe_key = f"card_expiring_{user.id}_{user.card_expiry.isoformat()}"
            if Notification.objects.filter(dedupe_key=dedupe_key).exists():
                continue

            expiry_str = user.card_expiry.strftime('%d/%m/%Y')
            Notification.objects.create(
                user=user,
                type=NotificationType.CARD_EXPIRING,
                channel=NotificationChannel.IN_APP,
                content=(
                    f"Thẻ bạn đọc ({user.card_code}) của bạn sẽ hết hạn vào ngày {expiry_str}. "
                    f"Vui lòng liên hệ quầy thư viện UTH để làm thủ tục gia hạn thẻ."
                ),
                link='/patron/profile',
                dedupe_key=dedupe_key,
            )
            count += 1

        self.stdout.write(self.style.SUCCESS(f"Đã gửi {count} thông báo thẻ sắp hết hạn."))

