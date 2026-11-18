from django.core.management.base import BaseCommand
from apps.reservations.services import expire_stale_reservations

class Command(BaseCommand):
    help = 'Tự động quét và hủy các yêu cầu đặt trước quá hạn 3 ngày tại quầy, chuyển tiếp hàng chờ'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Đang quét các yêu cầu giữ chỗ quá hạn 3 ngày...'))
        result = expire_stale_reservations()
        self.stdout.write(self.style.SUCCESS(
            f"Hoàn tất: Đã hủy {result['expired_count']} yêu cầu quá hạn, "
            f"chuyển tiếp cho {result['forwarded_count']} bạn đọc kế tiếp."
        ))

