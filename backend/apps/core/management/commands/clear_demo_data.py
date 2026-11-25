import sys
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction

from apps.core.models import SystemConfig, Policy
from apps.core.enums import UserRole
from apps.accounts.models import (
    User,
    StudentRoster,
    RefreshToken,
    PasswordResetToken,
    PaymentTransaction,
)
from apps.catalog.models import (
    Category,
    Author,
    Book,
    Copy,
    BarcodeSequence,
    DeaccessionBatch,
    DigitalResource,
    ReadingSession as CatalogReadingSession,
)
from apps.circulation.models import Loan
from apps.reservations.models import Reservation
from apps.fines.models import Fine, FinePayment
from apps.suggestions.models import Suggestion
from apps.notifications.models import Notification
from apps.audit.models import AuditLog
from apps.assistant.models import (
    AssistantConversation,
    AssistantMessage,
    AssistantMemoryEntry,
)
from apps.digital_library.models import (
    DigitalDocument,
    DigitalDocumentVersion,
    DigitalReadingSession,
)


class Command(BaseCommand):
    help = 'Xóa toàn bộ dữ liệu mẫu / demo (Sách, Bản sao, Mượn trả, Phạt, Sinh viên, Học liệu số), chỉ giữ lại tài khoản Quản trị, Thủ thư, Cấu hình và Chuyên ngành UTH để sẵn sàng cho việc Import CSV thực tế.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--yes',
            action='store_true',
            help='Bỏ qua bước xác nhận tương tác và tiến hành xóa ngay lập tức.',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('====================================================='))
        self.stdout.write(self.style.WARNING('    CẢNH BÁO: DỌN DẸP TOÀN BỘ DỮ LIỆU DEMO HỆ THỐNG   '))
        self.stdout.write(self.style.WARNING('====================================================='))
        self.stdout.write('Lệnh này sẽ xóa toàn bộ:')
        self.stdout.write('  - Toàn bộ Sách, Tác giả, Bản sao barcode, Biên bản thanh lý')
        self.stdout.write('  - Toàn bộ Phiếu mượn, Mượn sách, Tiền phạt và Lịch sử thu phí')
        self.stdout.write('  - Toàn bộ Danh sách sinh viên Roster & Bạn đọc mẫu (SV, GV)')
        self.stdout.write('  - Toàn bộ Học liệu số, Giáo trình điện tử và Phiên đọc')
        self.stdout.write('  - Toàn bộ Thông báo, Đề xuất mua sách, Lịch sử Chatbot & Audit Logs')
        self.stdout.write('Giữ lại:')
        self.stdout.write('  - Tài khoản Admin: admin / AdminPassword123')
        self.stdout.write('  - Tài khoản Thủ thư: thuthu / Password123')
        self.stdout.write('  - Danh mục 8 Chuyên ngành / Khoa UTH')
        self.stdout.write('  - Cấu hình Thư viện & Chính sách mượn trả (Policy)')
        self.stdout.write('-----------------------------------------------------')

        if not options['yes']:
            confirm = input('Bạn có chắc chắn muốn xóa TOÀN BỘ dữ liệu demo? Gõ "YES" để tiếp tục: ')
            if confirm.strip() != 'YES':
                self.stdout.write(self.style.ERROR('Hủy thao tác dọn dẹp dữ liệu.'))
                return

        with transaction.atomic():
            self.stdout.write(self.style.NOTICE('Đang tiến hành dọn dẹp theo thứ tự an toàn ràng buộc khóa ngoại...'))

            # 1. Tiền phạt & Thanh toán phạt
            fine_payments_count = FinePayment.objects.count()
            FinePayment.objects.all().delete()
            fines_count = Fine.objects.count()
            Fine.objects.all().delete()
            self.stdout.write(f'  ✓ Đã xóa {fine_payments_count} lượt thanh toán phạt & {fines_count} khoản phạt.')

            # 2. Mượn trả & Mượn sách
            reservations_count = Reservation.objects.count()
            Reservation.objects.all().delete()
            loans_count = Loan.objects.count()
            Loan.objects.all().delete()
            self.stdout.write(f'  ✓ Đã xóa {reservations_count} yêu cầu mượn sách & {loans_count} lượt mượn sách.')

            # 3. Đề xuất & Thông báo
            suggestions_count = Suggestion.objects.count()
            Suggestion.objects.all().delete()
            notifs_count = Notification.objects.count()
            Notification.objects.all().delete()
            self.stdout.write(f'  ✓ Đã xóa {suggestions_count} đề xuất mua sách & {notifs_count} thông báo.')

            # 4. Học liệu số & Phiên bản & Phiên đọc
            digital_sessions_count = DigitalReadingSession.objects.count()
            DigitalReadingSession.objects.all().delete()
            doc_versions_count = DigitalDocumentVersion.objects.count()
            DigitalDocumentVersion.objects.all().delete()
            docs_count = DigitalDocument.objects.count()
            DigitalDocument.objects.all().delete()

            cat_sessions_count = CatalogReadingSession.objects.count()
            CatalogReadingSession.objects.all().delete()
            cat_resources_count = DigitalResource.objects.count()
            DigitalResource.objects.all().delete()
            self.stdout.write(f'  ✓ Đã xóa {docs_count + cat_resources_count} tài liệu số & {digital_sessions_count + cat_sessions_count} phiên đọc.')

            # 5. Bản sao sách, Biên bản thanh lý, Đầu sách, Tác giả, Barcode Sequence
            copies_count = Copy.objects.count()
            Copy.objects.all().delete()
            batches_count = DeaccessionBatch.objects.count()
            DeaccessionBatch.objects.all().delete()
            books_count = Book.objects.count()
            Book.objects.all().delete()
            authors_count = Author.objects.count()
            Author.objects.all().delete()
            BarcodeSequence.objects.all().delete()
            self.stdout.write(f'  ✓ Đã xóa {books_count} đầu sách, {copies_count} bản sao & {authors_count} tác giả.')

            # 6. Giao dịch thanh toán tài khoản & Tokens
            PaymentTransaction.objects.all().delete()
            RefreshToken.objects.all().delete()
            PasswordResetToken.objects.all().delete()

            # 7. Trợ lý ảo & Audit Log
            AssistantMessage.objects.all().delete()
            AssistantMemoryEntry.objects.all().delete()
            AssistantConversation.objects.all().delete()
            AuditLog.objects.all().delete()
            self.stdout.write('  ✓ Đã dọn sạch tokens, trợ lý ảo & nhật ký kiểm toán (audit logs).')

            # 8. Danh sách sinh viên Roster
            roster_count = StudentRoster.objects.count()
            StudentRoster.objects.all().delete()
            self.stdout.write(f'  ✓ Đã xóa {roster_count} hồ sơ sinh viên trong Student Roster.')

            # 9. Người dùng bạn đọc (Xóa SV, GV; Giữ lại Admin và Thủ thư)
            deleted_users_count = User.objects.exclude(role__in=[UserRole.ADMIN, UserRole.LIBRARIAN]).delete()[0]
            self.stdout.write(f'  ✓ Đã xóa {deleted_users_count} tài khoản bạn đọc mẫu.')

            # 10. Đảm bảo tài khoản Admin và Thủ thư luôn sẵn sàng
            today = timezone.localdate()
            admin, _ = User.objects.get_or_create(
                username='admin',
                defaults={
                    'full_name': 'Nguyễn Văn Quản Trị (Thủ Thư Trưởng)',
                    'email': 'admin@uth.edu.vn',
                    'role': UserRole.ADMIN,
                    'card_code': 'ADMIN001',
                    'department': 'Trung tâm Thông tin - Thư viện UTH',
                    'is_staff': True,
                    'is_superuser': True,
                    'card_expiry': today + timedelta(days=3650),
                }
            )
            admin.role = UserRole.ADMIN
            admin.is_staff = True
            admin.is_superuser = True
            admin.is_active = True
            admin.is_locked = False
            admin.set_password('AdminPassword123')
            admin.save()

            librarian, _ = User.objects.get_or_create(
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
            librarian.is_active = True
            librarian.is_locked = False
            librarian.set_password('Password123')
            librarian.save()
            self.stdout.write('  ✓ Đã bảo toàn và làm mới mật khẩu cho tài khoản Quản trị & Thủ thư.')

            # 11. Đảm bảo 8 Chuyên ngành chuẩn của Trường ĐH Giao thông Vận tải TP.HCM
            categories_data = [
                ('CNTT', 'Viện Công nghệ Thông tin', 'Trí tuệ nhân tạo, Kỹ thuật phần mềm, Hệ thống thông tin, An toàn thông tin, Mạng máy tính', 1),
                ('GTVT', 'Khoa Kinh tế Vận tải & Logistics', 'Logistics và Chuỗi cung ứng, Kinh tế vận tải biển, Khai thác vận tải đa phương thức', 2),
                ('KTVT', 'Khoa Kỹ thuật Giao thông', 'Kỹ thuật ô tô, Cơ khí động lực, Quản lý giao thông thông minh (ITS)', 3),
                ('CTGT', 'Khoa Công trình Giao thông', 'Kỹ thuật xây dựng cầu đường, Đường sắt đô thị, Công trình thủy, Cảng đường thủy nội địa', 4),
                ('DTT', 'Khoa Điện - Điện tử Viễn thông', 'Tự động hóa, Điện tử viễn thông, Hệ thống nhúng viễn thám', 5),
                ('CK', 'Khoa Cơ khí', 'Cơ khí chế tạo máy, Cơ điện tử, Thiết kế máy công trình biển', 6),
                ('HH', 'Khoa Hàng hải', 'Điều khiển tàu biển, Quản trị hàng hải, Khai thác máy tàu thủy', 7),
                ('KCB', 'Khoa Khoa học Cơ bản & Ngoại ngữ', 'Toán ứng dụng, Vật lý đại cương, Tiếng Anh chuyên ngành kỹ thuật', 8),
            ]
            for code, name, desc, order in categories_data:
                Category.objects.update_or_create(
                    code=code,
                    defaults={'name': name, 'description': desc, 'display_order': order}
                )
            self.stdout.write('  ✓ Đã đồng bộ 8 Chuyên ngành chuẩn UTH để phục vụ Import Sách CSV.')

            # 12. Đảm bảo SystemConfig và Policy
            config = SystemConfig.get_solo()
            config.library_name = 'Thư viện Trường Đại học Giao thông vận tải TP.HCM'
            config.address = 'Số 2, Đường Võ Oanh, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh'
            config.hotline = '(028) 3899 1373 - (028) 3899 2862'
            config.email = 'library@uth.edu.vn'
            config.opening_hours = {
                'mon_fri': '07:30 - 20:30',
                'saturday': '07:30 - 16:30',
                'sunday': 'Đóng cửa',
            }
            config.save()

            Policy.objects.update_or_create(
                role=UserRole.STUDENT,
                defaults={
                    'is_current': True,
                    'max_loans': 5,
                    'loan_days': 14,
                    'renewal_limit': 1,
                    'renewal_days': 7,
                    'fine_per_day': 2000,
                    'hold_days': 3,
                    'max_reservations_pending': 3,
                    'max_ready_reservations': 3,
                    'damage_light_pct': 20,
                    'damage_medium_pct': 50,
                    'damage_heavy_pct': 80,
                }
            )
            Policy.objects.update_or_create(
                role=UserRole.LECTURER,
                defaults={
                    'is_current': True,
                    'max_loans': 10,
                    'loan_days': 30,
                    'renewal_limit': 1,
                    'renewal_days': 7,
                    'fine_per_day': 2000,
                    'hold_days': 3,
                    'max_reservations_pending': 5,
                    'max_ready_reservations': 5,
                    'damage_light_pct': 20,
                    'damage_medium_pct': 50,
                    'damage_heavy_pct': 80,
                }
            )
            self.stdout.write('  ✓ Cấu hình Thư viện và Chính sách Lưu thông UTH đã sẵn sàng.')

        self.stdout.write(self.style.SUCCESS('\n=== HOÀN TẤT DỌN DẸP DỮ LIỆU DEMO THÀNH CÔNG ==='))
        self.stdout.write(self.style.SUCCESS('Hệ thống hiện tại sạch sẽ 100%, sẵn sàng để bạn Import CSV!'))
        self.stdout.write(self.style.NOTICE('Thông tin tài khoản Quản trị:'))
        self.stdout.write('  - Tài khoản Admin: admin / Mật khẩu: AdminPassword123')
        self.stdout.write('  - Tài khoản Thủ thư: thuthu / Mật khẩu: Password123\n')

