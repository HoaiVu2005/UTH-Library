from django.core.management.base import BaseCommand
from apps.accounts.services import auto_suspend_violating_users

class Command(BaseCommand):
    help = 'Tự động quét và khóa/mở khóa thẻ mượn theo ngưỡng: quá hạn > 7 ngày hoặc nợ phạt > 50.000đ'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Đang quét kiểm tra điều kiện bạn đọc...'))
        result = auto_suspend_violating_users()
        self.stdout.write(self.style.SUCCESS(
            f"Hoàn tất: Đã kiểm tra {result['total_checked']} bạn đọc. "
            f"Tự động khóa: {result['total_suspended']}, Mở khóa phục hồi: {result['total_unsuspended']}."
        ))

