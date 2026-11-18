from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.accounts.models import User
from apps.core.enums import UserRole

class Command(BaseCommand):
    help = 'Tạo tài khoản mẫu cho Thủ thư'

    def handle(self, *args, **options):
        today = timezone.now().date()
        librarian, created = User.objects.get_or_create(
            username='thuthu',
            defaults={
                'full_name': 'Trần Thị Thu Thư (Cán bộ quầy lưu thông)',
                'email': 'thuthu@uth.edu.vn',
                'role': UserRole.LIBRARIAN,
                'card_code': 'TT2026001',
                'department': 'Tổ Lưu thông - Thư viện UTH',
                'is_staff': True,
                'is_superuser': False,
                'card_expiry': today + timedelta(days=3650),
            }
        )
        librarian.role = UserRole.LIBRARIAN
        librarian.is_staff = True
        librarian.set_password('Password123')
        librarian.save()

        self.stdout.write(self.style.SUCCESS(
            f"✓ Đã tạo/cập nhật tài khoản Thủ thư: username='{librarian.username}', role='{librarian.role}', password='Password123'"
        ))

