from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction

from apps.core.models import SystemConfig, Policy, Holiday
from apps.core.enums import (
    UserRole,
    LockReason,
    CopyStatus,
    LoanStatus,
    ReturnCondition,
    ReservationStatus,
    ReservationType,
    FineType,
    FineStatus,
    SuggestionStatus,
    NotificationType,
)
from apps.accounts.models import User
from apps.catalog.models import Category, Author, Book, Copy, BarcodeSequence
from apps.circulation.models import Loan
from apps.reservations.models import Reservation
from apps.fines.models import Fine
from apps.suggestions.models import Suggestion
from apps.notifications.models import Notification

class Command(BaseCommand):
    help = 'Tạo dữ liệu mẫu Thư viện UTH chuẩn P0 (1 admin, 20 SV, 5 GV, 8 chuyên ngành, 20 tác giả, 100 sách)'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true', help='Xóa toàn bộ dữ liệu trước khi nạp')

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('=== BẮT ĐẦU NẠP DỮ LIỆU SEED DEMO UTH ==='))

        with transaction.atomic():
            if options['reset']:
                self.stdout.write('Đang xóa dữ liệu cũ...')
                Notification.objects.all().delete()
                Suggestion.objects.all().delete()
                Fine.objects.all().delete()
                Reservation.objects.all().delete()
                Loan.objects.all().delete()
                Copy.objects.all().delete()
                Book.objects.all().delete()
                Author.objects.all().delete()
                BarcodeSequence.objects.all().delete()
                Category.objects.all().delete()
                User.objects.all().delete()
                Policy.objects.all().delete()
                Holiday.objects.all().delete()

            now = timezone.now()
            today = timezone.localdate()

            # 1. SystemConfig
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
            self.stdout.write('✓ SystemConfig đã sẵn sàng.')

            # 2. Policies
            Policy.objects.filter(role=UserRole.STUDENT).update(is_current=False)
            Policy.objects.filter(role=UserRole.LECTURER).update(is_current=False)

            p_student = Policy.objects.create(
                role=UserRole.STUDENT,
                is_current=True,
                max_loans=5,
                loan_days=14,
                renewal_limit=1,
                renewal_days=7,
                fine_per_day=2000,
                hold_days=3,
                max_reservations_pending=3,
                max_ready_reservations=3,
                damage_light_pct=20,
                damage_medium_pct=50,
                damage_heavy_pct=80,
            )

            p_lecturer = Policy.objects.create(
                role=UserRole.LECTURER,
                is_current=True,
                max_loans=10,
                loan_days=30,
                renewal_limit=1,
                renewal_days=7,
                fine_per_day=2000,
                hold_days=3,
                max_reservations_pending=5,
                max_ready_reservations=5,
                damage_light_pct=20,
                damage_medium_pct=50,
                damage_heavy_pct=80,
            )
            self.stdout.write('✓ Chính sách (Policies) đã được cấu hình.')

            # 3. Users: 1 Admin, 20 SV, 5 GV
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
            admin.set_password('AdminPassword123')
            admin.save()

            students = []
            for i in range(1, 21):
                code = f"SV2026{i:04d}"
                username = f"sv{i:03d}"
                email = f"{username}@uth.edu.vn"
                name = f"Sinh Viên UTH {i:02d}"
                dept = 'Viện Công nghệ Thông tin' if i % 2 == 0 else 'Khoa Kinh tế Vận tải'
                expiry = today + timedelta(days=365)
                is_locked = False
                lock_reason = None

                # SV018: Thẻ hết hạn (BR20 test)
                if i == 18:
                    expiry = today - timedelta(days=10)
                # SV019: Bị khóa tài khoản (BR01 test)
                elif i == 19:
                    is_locked = True
                    lock_reason = LockReason.MANUAL
                # SV020: Bị khóa quyền mượn do no-show (BR19 test)
                elif i == 20:
                    is_locked = True
                    lock_reason = LockReason.NO_SHOW_THRESHOLD

                stu, _ = User.objects.get_or_create(
                    username=username,
                    defaults={
                        'full_name': name,
                        'email': email,
                        'role': UserRole.STUDENT,
                        'card_code': code,
                        'department': dept,
                        'card_expiry': expiry,
                        'is_locked': is_locked,
                        'lock_reason': lock_reason,
                    }
                )
                stu.set_password('Password123')
                stu.save()
                students.append(stu)

            lecturers = []
            for i in range(1, 6):
                code = f"GV2026{i:03d}"
                username = f"gv{i:02d}"
                email = f"{username}@uth.edu.vn"
                name = f"ThS. Giảng Viên UTH {i:02d}"
                dept = 'Khoa Kỹ thuật Giao thông' if i % 2 == 0 else 'Khoa Logistics & Quản lý Chuỗi cung ứng'

                gv, _ = User.objects.get_or_create(
                    username=username,
                    defaults={
                        'full_name': name,
                        'email': email,
                        'role': UserRole.LECTURER,
                        'card_code': code,
                        'department': dept,
                        'card_expiry': today + timedelta(days=1825),
                    }
                )
                gv.set_password('Password123')
                gv.save()
                lecturers.append(gv)

            self.stdout.write(f'✓ Người dùng đã tạo: 1 Admin, {len(students)} SV, {len(lecturers)} GV.')

            # 4. Categories: 8 chuyên ngành UTH
            category_data = [
                ('CNTT', 'Công nghệ thông tin', 'Khoa học máy tính, kỹ thuật phần mềm, an toàn thông tin, mạng máy tính', 1),
                ('GTVT', 'Kỹ thuật Giao thông vận tải', 'Quy hoạch giao thông, kỹ thuật hạ tầng đường sắt, đường bộ, hàng hải', 2),
                ('LOG', 'Logistics & Chuỗi cung ứng', 'Quản trị chuỗi cung ứng, vận tải đa phương thức, kho bãi và giao nhận', 3),
                ('KT', 'Kinh tế & Quản trị kinh doanh', 'Kinh tế vận tải, quản trị tài chính, thương mại quốc tế', 4),
                ('XD', 'Kỹ thuật Xây dựng công trình', 'Xây dựng cầu đường, cảng, hầm và công trình ngầm', 5),
                ('CK', 'Kỹ thuật Cơ khí & Động lực', 'Cơ khí ôtô, máy xây dựng, kỹ thuật đầu máy toa xe', 6),
                ('DIEN', 'Kỹ thuật Điện - Điện tử', 'Hệ thống điện tử viễn thông, tự động hóa, điều khiển tín hiệu đường sắt', 7),
                ('NN', 'Ngoại ngữ & Kỹ năng mềm', 'Tiếng Anh chuyên ngành hàng hải - logistics, kỹ năng thuyết trình, lãnh đạo', 8),
            ]

            categories = {}
            for code, name, desc, order in category_data:
                cat, _ = Category.objects.get_or_create(
                    code=code,
                    defaults={'name': name, 'description': desc, 'display_order': order}
                )
                categories[code] = cat
                BarcodeSequence.objects.get_or_create(category=cat, defaults={'last_value': 0})

            self.stdout.write(f'✓ 8 Chuyên ngành UTH đã tạo.')

            # 5. Authors: 24 tác giả tiêu biểu ngành GTVT, Logistics, CNTT, Cơ khí, Xây dựng
            author_names = [
                ('GS.TS. Nguyễn Xuân Trục', 'Chủ biên bộ giáo trình Thiết kế hình học đường ô tô và cao tốc kinh điển, NXB Giao thông Vận tải.'),
                ('PGS.TS. Khuất Việt Hùng', 'Tiến sĩ Quy hoạch Giao thông vận tải, Viện trưởng Viện Chiến lược và Phát triển GTVT.'),
                ('TS. Lê Hoàng Vận', 'Tiến sĩ Quản trị Logistics và Vận tải biển quốc tế, chuyên gia chuỗi cung ứng.'),
                ('Robert C. Martin', 'Tác giả nổi tiếng thế giới của Clean Code, Clean Architecture và các nguyên lý Agile.'),
                ('Andrew Ng', 'Giáo sư Stanford, Nhà sáng lập Coursera và DeepLearning.AI, chuyên gia Trí tuệ Nhân tạo.'),
                ('Martin Fowler', 'Chuyên gia kiến trúc phần mềm hàng đầu thế giới, tác giả cuốn sách kinh điển Refactoring.'),
                ('GS.TS. Vũ Công Ngữ', 'Chủ biên giáo trình Cơ học đất và Nền móng công trình giao thông, NXB Giáo Dục.'),
                ('GS.TS. Đặng Đình Đào', 'Viện trưởng Viện Nghiên cứu Kinh tế & Phát triển, tác giả bộ sách Quản trị Logistics và Chuỗi cung ứng.'),
                ('PGS.TS. Nguyễn Viết Trung', 'Chuyên gia đầu ngành về Kỹ thuật Cầu bê tông cốt thép dự ứng lực, NXB Xây Dựng.'),
                ('PGS.TS. Nguyễn Hữu Dũng', 'Chủ nhiệm bộ môn Khai thác Cảng biển & Logistics Hàng hải, NXB Giao thông Vận tải.'),
                ('Thomas H. Cormen', 'Giáo sư Khoa học Máy tính Dartmouth, đồng tác giả Introduction to Algorithms.'),
                ('Eric Evans', 'Chuyên gia thiết kế phần mềm, người đặt nền móng phương pháp Domain-Driven Design (DDD).'),
                ('Donald E. Knuth', 'Giáo sư Danh dự Stanford, tác giả huyền thoại của bộ sách The Art of Computer Programming.'),
                ('Philip Kotler', 'Giáo sư Marketing danh tiếng tại Kellogg School of Management, huyền thoại Quản trị Marketing.'),
                ('GS.TS. Nguyễn Tất Tiến', 'Chủ biên giáo trình Nguyên lý Động cơ đốt trong và Công nghệ Ô tô, NXB Giáo Dục.'),
                ('GS.TS. Lều Thọ Trình', 'Tác giả bộ sách Cơ học Kết cấu và Sức bền Vật liệu, NXB Khoa học & Kỹ thuật.'),
                ('ThS. Đỗ Kỹ Năng', 'Giảng viên huấn luyện kỹ năng lãnh đạo và giao tiếp trong môi trường kỹ thuật.'),
                ('Stuart Russell', 'Giáo sư Khoa học Máy tính UC Berkeley, tác giả Artificial Intelligence: A Modern Approach.'),
                ('PGS.TS. Đinh Mạnh Tường', 'Tác giả giáo trình Cấu trúc Dữ liệu và Giải thuật kinh điển tại các trường đại học kỹ thuật.'),
                ('PGS.TS. Nguyễn Văn Vị', 'Chủ biên giáo trình Kinh tế Vận tải và Phân tích Dự án Đầu tư Giao thông, NXB GTVT.'),
                ('PGS.TS. Hoàng Hà', 'Chuyên gia Vật liệu Mặt đường Ô tô và Bê tông nhựa rải nóng, NXB Giao thông Vận tải.'),
                ('TS. Trần Văn Toản', 'Chuyên gia Điện - Điện tử Ô tô và Hệ thống Điều khiển Thông minh trên Xe hơi.'),
                ('Andrew S. Tanenbaum', 'Giáo sư Khoa học Máy tính, tác giả kinh điển Computer Networks và Modern Operating Systems.'),
                ('PGS.TS. Bùi Xuân Nam', 'Chuyên gia Địa kỹ thuật, Nền móng công trình và Công trình ngầm giao thông.'),
            ]

            authors = []
            for name, bio in author_names:
                auth, _ = Author.objects.get_or_create(name=name, defaults={'bio': bio, 'nationality': 'Việt Nam' if 'GS' in name or 'TS' in name or 'ThS' in name or 'PGS' in name else 'Quốc tế'})
                authors.append(auth)

            self.stdout.write(f'✓ {len(authors)} Tác giả tiêu biểu đã tạo.')

            # 6. Books: Danh mục 80 đầu sách giáo trình chuẩn UTH 100% thật
            book_templates = [
                # GTVT & Cầu đường (12 sách)
                ('GTVT', 'Thiết kế Hình học Đường ô tô và Nút giao thông Hiện đại', '978-604-0-10001-1', 180000, 2023, [0, 1]),
                ('GTVT', 'Kỹ thuật Thiết kế Đường cao tốc và Nút giao Khác mức', '978-604-0-10002-8', 195000, 2022, [1, 8]),
                ('GTVT', 'Hệ thống Giao thông Thông minh (ITS) trong Đô thị Hiện đại', '978-604-0-10003-5', 240000, 2024, [0, 18]),
                ('GTVT', 'Khảo sát và Thiết kế Tuyến Đường sắt Đô thị Metro', '978-604-0-10004-2', 220000, 2023, [1, 14]),
                ('GTVT', 'An toàn Giao thông Đường bộ và Phương pháp Xử lý Điểm đen Tai nạn', '978-604-0-10005-9', 150000, 2021, [0, 8]),
                ('GTVT', 'Kỹ thuật Cầu Bê tông Cốt thép Dự ứng lực Nhịp lớn', '978-604-0-10006-6', 260000, 2022, [1, 6]),
                ('GTVT', 'Mặt đường Ô tô: Kết cấu và Công nghệ Bê tông Nhựa Rải nóng', '978-604-0-10007-3', 210000, 2024, [20, 0]),
                ('GTVT', 'Bảo trì, Kiểm định và Thử tải Công trình Cầu đường Bộ', '978-604-0-10008-0', 175000, 2020, [8, 20]),
                ('GTVT', 'Tổ chức Vận tải Hành khách Công cộng và Tuyến Xe buýt Nhanh BRT', '978-604-0-10009-7', 145000, 2021, [0, 19]),
                ('GTVT', 'Thiết kế Tuyến Đường ô tô Vùng núi và Địa hình Hiểm trở', '978-604-0-10010-3', 185000, 2022, [8, 6]),
                ('GTVT', 'Động lực học Đoàn tàu và Khí động học Hầm Đường sắt Cao tốc', '978-604-0-10011-0', 290000, 2023, [14, 0]),
                ('GTVT', 'Quy hoạch và Khai thác Cảng Hàng không - Sân bay Dân dụng', '978-604-0-10012-7', 310000, 2024, [15, 0]),
                
                # Logistics & Chuỗi cung ứng (12 sách)
                ('LOG', 'Quản trị Chuỗi Cung ứng Toàn cầu: Chiến lược và Thực thi', '978-604-0-20001-0', 250000, 2023, [2, 7]),
                ('LOG', 'Vận tải Đa phương thức và Nghiệp vụ Giao nhận Freight Forwarding', '978-604-0-20002-7', 220000, 2022, [2, 7]),
                ('LOG', 'Quản trị Kho bãi Hiện đại và Trung tâm Phân phối Logistics DC', '978-604-0-20003-4', 190000, 2024, [7, 2]),
                ('LOG', 'Kỹ thuật Khai thác và Điều độ Hoạt động Cảng Container Thông minh', '978-604-0-20004-1', 280000, 2023, [7, 9]),
                ('LOG', 'Logistics Hàng hải: Quản lý Đội tàu và Nghiệp vụ Thuê tàu Chuyến', '978-604-0-20005-8', 265000, 2022, [2, 9]),
                ('LOG', 'Tối ưu hóa Chi phí Logistics và Bài toán Định tuyến Đội xe VRP', '978-604-0-20006-5', 215000, 2024, [2, 10]),
                ('LOG', 'Hóa đơn Điện tử, Thủ tục Hải quan Một cửa và Incoterms 2020', '978-604-0-20007-2', 170000, 2021, [7, 19]),
                ('LOG', 'Logistics Chuỗi lạnh (Cold Chain) cho Nông sản và Dược phẩm Xuất khẩu', '978-604-0-20008-9', 230000, 2023, [2, 7]),
                ('LOG', 'Logistics Đô thị và Bài toán Giao hàng Chặng cuối (Last-Mile)', '978-604-0-20009-6', 205000, 2024, [2, 0]),
                ('LOG', 'Chuyển đổi số Chuỗi Cung ứng: Ứng dụng IoT, RFID và Blockchain', '978-604-0-20010-2', 295000, 2024, [2, 4]),
                ('LOG', 'Quản lý Rủi ro và Chiến lược Chuỗi Cung ứng Xanh Bền vững', '978-604-0-20011-9', 210000, 2023, [2, 19]),
                ('LOG', 'Nghiệp vụ Mua hàng Quốc tế và Đàm phán Hợp đồng Cung ứng', '978-604-0-20012-6', 180000, 2022, [7, 13]),

                # CNTT & Khoa học máy tính (13 sách)
                ('CNTT', 'Clean Code: Mã sạch và Nghệ thuật Viết phần mềm Chuyên nghiệp', '978-013-2-35088-4', 320000, 2021, [3]),
                ('CNTT', 'Clean Architecture: Hướng dẫn của Nghệ nhân Phần mềm', '978-013-4-49416-6', 350000, 2022, [3]),
                ('CNTT', 'Design Patterns: Các mẫu Thiết kế Hướng đối tượng Tái sử dụng', '978-020-1-63361-0', 290000, 2020, [5, 3]),
                ('CNTT', 'Refactoring: Cải tiến và Tối ưu hóa Thiết kế Mã nguồn Hiện có', '978-013-4-75759-9', 310000, 2022, [5]),
                ('CNTT', 'Giáo trình Cấu trúc Dữ liệu và Giải thuật Cơ bản đến Nâng cao', '978-604-0-30001-9', 185000, 2023, [10, 18]),
                ('CNTT', 'Machine Learning Yearning: Chiến lược Xây dựng Hệ thống Trí tuệ Nhân tạo', '978-099-9-99990-1', 270000, 2022, [4]),
                ('CNTT', 'Deep Learning và Thị giác Máy tính trong Giao thông Thông minh', '978-604-0-30002-6', 310000, 2024, [4, 18]),
                ('CNTT', 'Lập trình Ứng dụng Web Toàn diện với React, TypeScript và Django REST', '978-604-0-30003-3', 240000, 2024, [3, 5]),
                ('CNTT', 'Hệ Quản trị Cơ sở Dữ liệu PostgreSQL: Thiết kế và Tối ưu Hiệu năng', '978-604-0-30004-0', 230000, 2023, [10, 18]),
                ('CNTT', 'An toàn Thông tin và Phòng thủ Hệ thống Mạng Doanh nghiệp', '978-604-0-30005-7', 225000, 2023, [18]),
                ('CNTT', 'Kiến trúc Microservices và Điện toán Đám mây AWS/GCP', '978-604-0-30006-4', 330000, 2024, [5, 3]),
                ('CNTT', 'Mạng Máy tính và Các Giao thức Truyền thông Hiện đại', '978-604-0-30007-1', 280000, 2023, [22, 18]),
                ('CNTT', 'Domain-Driven Design: Xử lý Độ phức tạp nơi Trọng tâm Phần mềm', '978-032-1-12521-7', 340000, 2022, [11]),

                # Kinh tế & Quản trị kinh doanh (10 sách)
                ('KT', 'Nguyên lý Kinh tế học Vận tải và Phân tích Đầu tư Hạ tầng', '978-604-0-40001-8', 195000, 2023, [19, 0]),
                ('KT', 'Marketing Căn bản: Quản trị Tiếp thị trong Kỷ nguyên Số 5.0', '978-604-0-40002-5', 210000, 2022, [13]),
                ('KT', 'Quản trị Dự án Đầu tư Công trình Giao thông (PMBOK)', '978-604-0-40003-2', 260000, 2023, [1, 19]),
                ('KT', 'Kinh tế Vĩ mô và Dự báo Xu thế Thương mại Quốc tế', '978-604-0-40004-9', 180000, 2021, [19]),
                ('KT', 'Tài chính Doanh nghiệp và Định giá Tài sản Ngành Vận tải', '978-604-0-40005-6', 220000, 2022, [19]),
                ('KT', 'Hợp đồng Hợp tác Công - Tư (PPP) trong Phát triển Cơ sở Hạ tầng', '978-604-0-40006-3', 275000, 2024, [0, 19]),
                ('KT', 'Quản trị Rủi ro Tín dụng và Bảo hiểm Vận tải Biển Quốc tế', '978-604-0-40007-0', 205000, 2023, [2, 19]),
                ('KT', 'Khởi nghiệp Đổi mới Sáng tạo và Xây dựng Mô hình Kinh doanh Tinh gọn', '978-604-0-40008-7', 165000, 2022, [13, 16]),
                ('KT', 'Quản trị Nguồn Nhân lực trong Doanh nghiệp Vận tải và Logistics', '978-604-0-40009-4', 190000, 2023, [19, 16]),
                ('KT', 'Đàm phán Thương mại Quốc tế và Hợp đồng Ngoại thương', '978-604-0-40010-0', 215000, 2024, [13, 2]),

                # Xây dựng & Kết cấu (10 sách)
                ('XD', 'Cơ học Đất và Nền móng Công trình Cầu đường Đô thị', '978-604-0-50001-7', 230000, 2022, [6, 1]),
                ('XD', 'Thi công Hầm đường bộ và Công trình Ngầm Giao thông Hiện đại', '978-604-0-50002-4', 310000, 2023, [6, 23]),
                ('XD', 'Kết cấu Thép và Cầu Thép Nhịp Lớn theo Tiêu chuẩn AASHTO', '978-604-0-50003-1', 250000, 2021, [1, 6]),
                ('XD', 'Vật liệu Xây dựng Tiên tiến và Bê tông Tính năng Siêu cao UHPC', '978-604-0-50004-8', 280000, 2024, [6, 20]),
                ('XD', 'Mô hình Thông tin Công trình (BIM) trong Quản lý Dự án Giao thông', '978-604-0-50005-5', 340000, 2024, [1, 18]),
                ('XD', 'Thủy lực và Thủy văn Cầu cống: Tính toán Tiêu thoát nước Đô thị', '978-604-0-50006-2', 190000, 2022, [6, 8]),
                ('XD', 'Kiểm toán Năng lượng và Thiết kế Công trình Xanh theo Chuẩn LEED', '978-604-0-50007-9', 215000, 2023, [6, 19]),
                ('XD', 'Sức bền Vật liệu và Động lực học Công trình Xây dựng Cầu đường', '978-604-0-50008-6', 225000, 2022, [15, 6]),
                ('XD', 'Địa kỹ thuật Công trình và Xử lý Nền Đất yếu Vùng Đồng bằng Ven biển', '978-604-0-50009-3', 270000, 2023, [23, 6]),
                ('XD', 'Thiết kế Kết cấu Bê tông Cốt thép theo Tiêu chuẩn Eurocode & TCVN', '978-604-0-50010-9', 295000, 2024, [8, 6]),

                # Cơ khí & Động lực (10 sách)
                ('CK', 'Nguyên lý Động cơ Đốt trong và Hệ thống Truyền lực Ô tô', '978-604-0-60001-6', 220000, 2022, [14]),
                ('CK', 'Công nghệ Xe điện (EV), Hệ thống Pin Lithium-Ion và Trạm Sạc', '978-604-0-60002-3', 290000, 2024, [14, 21]),
                ('CK', 'Đầu máy Toa xe và Hệ thống Phanh Hãm Đoàn tàu Đường sắt Đô thị', '978-604-0-60003-0', 270000, 2023, [14]),
                ('CK', 'Chẩn đoán và Bảo dưỡng Kỹ thuật Ô tô Đời mới Điều khiển Điện tử', '978-604-0-60004-7', 195000, 2021, [14, 21]),
                ('CK', 'Khí nén và Thủy lực Ứng dụng trong Thiết bị Cơ giới Xây dựng Nặng', '978-604-0-60005-4', 210000, 2022, [14, 6]),
                ('CK', 'Dao động Kỹ thuật và Giảm chấn Kết cấu Cơ khí Động lực', '978-604-0-60006-1', 235000, 2023, [15, 14]),
                ('CK', 'Công nghệ Chế tạo Máy và Gia công Cơ khí Chính xác CNC', '978-604-0-60007-8', 250000, 2023, [14]),
                ('CK', 'Hệ thống Điện - Điện tử Điều khiển Thông minh trên Ô tô Hiện đại', '978-604-0-60008-5', 265000, 2024, [21, 14]),
                ('CK', 'Độ tin cậy và Kỹ thuật An toàn Phương tiện Giao thông Cơ giới', '978-604-0-60009-2', 210000, 2022, [14, 0]),
                ('CK', 'Vật liệu Cơ khí Tiên tiến và Công nghệ Nhiệt luyện Xử lý Bề mặt', '978-604-0-60010-8', 230000, 2023, [14, 6]),

                # Điện - Điện tử & Tự động hóa (8 sách)
                ('DIEN', 'Kỹ thuật Điều khiển Tự động và Hệ thống SCADA trong Giao thông', '978-604-0-70001-5', 260000, 2023, [18, 14]),
                ('DIEN', 'Hệ thống Cung cấp Điện và Lưới điện Thông minh Smart Grid', '978-604-0-70002-2', 240000, 2022, [18]),
                ('DIEN', 'Điện tử Công suất và Biến tần trong Động cơ Kéo Đoàn tàu Metro', '978-604-0-70003-9', 285000, 2024, [14, 18]),
                ('DIEN', 'Xử lý Tín hiệu Số (DSP) và Mạng Cảm biến Thông minh IoT', '978-604-0-70004-6', 225000, 2023, [18, 21]),
                ('DIEN', 'Tín hiệu và Hệ thống Điều khiển Giám sát Giao thông Đường sắt ETCS', '978-604-0-70005-3', 320000, 2024, [14, 18]),
                ('DIEN', 'Vi điều khiển và Hệ thống Nhúng Ứng dụng trong Giao thông và Ô tô', '978-604-0-70006-0', 245000, 2023, [21, 18]),
                ('DIEN', 'Mạng Cảm biến Không dây và Điện toán Biên IoT Công nghiệp', '978-604-0-70007-7', 260000, 2024, [18, 4]),
                ('DIEN', 'Kỹ thuật Đo lường Điện tử và Cảm biến Thông minh Công nghiệp', '978-604-0-70008-4', 215000, 2022, [18]),

                # Ngoại ngữ & Kỹ năng mềm (7 sách)
                ('NN', 'English for Maritime and Shipping Logistics (Tiếng Anh Hàng hải Quốc tế)', '978-604-0-80001-4', 160000, 2022, [2, 16]),
                ('NN', 'Kỹ năng Thuyết trình Chuyên nghiệp và Hùng biện trước Công chúng', '978-604-0-80002-1', 120000, 2021, [16]),
                ('NN', 'English for Civil and Bridge Engineering (Tiếng Anh Kỹ thuật Cầu đường)', '978-604-0-80003-8', 150000, 2023, [1, 16]),
                ('NN', 'Nghệ thuật Đàm phán và Giải quyết Xung đột trong Môi trường Đa văn hóa', '978-604-0-80004-5', 140000, 2022, [16, 13]),
                ('NN', 'Viết Báo cáo Kỹ thuật và Đồ án Tốt nghiệp Chuẩn Khoa học', '978-604-0-80005-2', 110000, 2023, [16, 0]),
                ('NN', 'English for Information Technology and Computer Science (Tiếng Anh CNTT)', '978-604-0-80006-9', 170000, 2023, [3, 16]),
                ('NN', 'Kỹ năng Quản trị Thời gian và Làm việc Nhóm trong Dự án Kỹ thuật', '978-604-0-80007-6', 135000, 2022, [16]),
            ]

            created_books = []

            # Curated High-Resolution Book Covers by Category
            category_covers = {
                'GTVT': [
                    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80',
                    'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&q=80',
                    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&q=80',
                    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&q=80',
                    'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=600&q=80',
                ],
                'LOG': [
                    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80',
                    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&q=80',
                    'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&q=80',
                    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&q=80',
                    'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80',
                ],
                'CNTT': [
                    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
                    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80',
                    'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&q=80',
                    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80',
                    'https://images.unsplash.com/photo-1550439062-609e15737780?w=600&q=80',
                ],
                'KT': [
                    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
                    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80',
                    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
                    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
                ],
                'XD': [
                    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80',
                    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80',
                    'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=600&q=80',
                    'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600&q=80',
                ],
                'CK': [
                    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&q=80',
                    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80',
                    'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&q=80',
                    'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&q=80',
                ],
                'DIEN': [
                    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
                    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&q=80',
                    'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80',
                    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
                ],
                'NN': [
                    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80',
                    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80',
                    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80',
                    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80',
                ],
            }

            for i, item in enumerate(book_templates):
                cat_code, title, isbn, price, year, author_indices = item
                cat = categories[cat_code]
                covers_pool = category_covers.get(cat_code, category_covers['CNTT'])
                cover_url = covers_pool[i % len(covers_pool)]

                publisher = 'NXB Giao thông Vận tải'
                if cat_code == 'LOG':
                    publisher = 'NXB Giao thông Vận tải'
                elif cat_code == 'CNTT':
                    publisher = 'NXB Thông tin & Truyền thông' if i % 2 == 0 else 'Prentice Hall'
                elif cat_code == 'KT':
                    publisher = 'NXB Bách Khoa - Hà Nội' if i % 2 == 0 else 'NXB Đại học Quốc gia TP.HCM'
                elif cat_code == 'XD':
                    publisher = 'NXB Xây Dựng'
                elif cat_code == 'CK':
                    publisher = 'NXB Giáo Dục Việt Nam'
                elif cat_code == 'DIEN':
                    publisher = 'NXB Khoa học & Kỹ thuật'
                elif cat_code == 'NN':
                    publisher = 'NXB Tổng hợp TP.HCM'

                book, _ = Book.objects.get_or_create(
                    isbn=isbn,
                    defaults={
                        'title': title,
                        'publisher': publisher,
                        'year': year,
                        'category': cat,
                        'price': price,
                        'processing_fee': 20000,
                        'language': 'Tiếng Anh' if 'English' in title or 'Clean' in title or 'Machine' in title or 'Domain' in title else 'Tiếng Việt',
                        'page_count': 220 + (i * 11) % 280,
                        'edition': 'Tái bản lần 3' if i % 4 == 0 else ('Tái bản lần 2' if i % 2 == 0 else 'Xuất bản lần đầu'),
                        'keywords': f"{cat.name}, UTH, Giáo trình, {title.split()[0]}",
                        'cover_image': cover_url,
                        'description': f"Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về {title}.",
                    }
                )
                assigned_authors = [authors[idx] for idx in author_indices if idx < len(authors)]
                book.authors.set(assigned_authors)
                created_books.append(book)

            self.stdout.write(f'✓ Tổng cộng {len(created_books)} đầu sách chuẩn thật 100% đã được tạo thành công.')

            # 7. Create Copies for Books (1-5 copies per book)
            all_copies = []
            for b_idx, book in enumerate(created_books):
                # Number of copies: 1 to 5
                qty = 2 + (b_idx % 4) # 2, 3, 4, 5 copies
                barcodes = []
                # Use BarcodeSequence
                seq = BarcodeSequence.objects.get(category=book.category)
                start_val = seq.last_value
                seq.last_value += qty
                seq.save(update_fields=['last_value'])

                for val in range(start_val + 1, start_val + qty + 1):
                    barcodes.append(f"UTH-{book.category.code}-{val:06d}")

                for c_idx, bc in enumerate(barcodes):
                    # Set some copies reading_room_only
                    is_reading_room = (c_idx == 0 and b_idx % 7 == 0)
                    # Set some copies damaged
                    status = CopyStatus.AVAILABLE
                    if c_idx == 1 and b_idx % 19 == 0:
                        status = CopyStatus.DAMAGED

                    shelf = f"Cơ sở 1 (Bình Thạnh) - Kệ {book.category.code}-{((b_idx % 4) + 1):02d} - Tầng {((b_idx % 3) + 1)}"
                    copy, _ = Copy.objects.get_or_create(
                        barcode=bc,
                        defaults={
                            'book': book,
                            'shelf_location': shelf,
                            'status': status,
                            'reading_room_only': is_reading_room,
                            'purchase_price': book.price,
                            'source': 'Ngân sách Nhà nước',
                            'supplier': 'Công ty Phát hành sách FAHASA TP.HCM',
                        }
                    )
                    all_copies.append(copy)

            self.stdout.write(f'✓ Tổng cộng {len(all_copies)} bản sao với mã vạch chuẩn UTH đã tạo.')

            # 8. Create Realistic Demo Loans, Overdue, Fines, Reservations, Suggestions
            # Loan 1: Sinh viên 01 mượn đúng hạn (còn 5 ngày)
            c1 = all_copies[0]
            c1.status = CopyStatus.BORROWED
            c1.save()
            l1, _ = Loan.objects.get_or_create(
                user=students[0],
                copy=c1,
                book=c1.book,
                defaults={
                    'borrowed_at': now - timedelta(days=9),
                    'due_at': (now + timedelta(days=5)).replace(hour=23, minute=59, second=59),
                    'status': LoanStatus.ACTIVE,
                    'created_by': admin,
                    'fine_per_day_snapshot': p_student.fine_per_day,
                    'loan_days_snapshot': p_student.loan_days,
                    'renewal_limit_snapshot': p_student.renewal_limit,
                    'book_price_snapshot': c1.book.price,
                    'processing_fee_snapshot': c1.book.processing_fee,
                    'policy_id_snapshot': p_student.id,
                }
            )

            # Loan 2: Sinh viên 02 mượn sắp đến hạn (còn 1 ngày)
            c2 = all_copies[1]
            c2.status = CopyStatus.BORROWED
            c2.save()
            l2, _ = Loan.objects.get_or_create(
                user=students[1],
                copy=c2,
                book=c2.book,
                defaults={
                    'borrowed_at': now - timedelta(days=13),
                    'due_at': (now + timedelta(days=1)).replace(hour=23, minute=59, second=59),
                    'status': LoanStatus.ACTIVE,
                    'created_by': admin,
                    'fine_per_day_snapshot': p_student.fine_per_day,
                    'loan_days_snapshot': p_student.loan_days,
                    'renewal_limit_snapshot': p_student.renewal_limit,
                    'book_price_snapshot': c2.book.price,
                    'processing_fee_snapshot': c2.book.processing_fee,
                    'policy_id_snapshot': p_student.id,
                }
            )

            # Loan 3: Sinh viên 03 quá hạn 1 ngày
            c3 = all_copies[2]
            c3.status = CopyStatus.BORROWED
            c3.save()
            l3, _ = Loan.objects.get_or_create(
                user=students[2],
                copy=c3,
                book=c3.book,
                defaults={
                    'borrowed_at': now - timedelta(days=15),
                    'due_at': (now - timedelta(days=1)).replace(hour=23, minute=59, second=59),
                    'status': LoanStatus.ACTIVE,
                    'created_by': admin,
                    'fine_per_day_snapshot': p_student.fine_per_day,
                    'loan_days_snapshot': p_student.loan_days,
                    'renewal_limit_snapshot': p_student.renewal_limit,
                    'book_price_snapshot': c3.book.price,
                    'processing_fee_snapshot': c3.book.processing_fee,
                    'policy_id_snapshot': p_student.id,
                }
            )

            # Loan 4: Sinh viên 04 quá hạn 7 ngày
            c4 = all_copies[3]
            c4.status = CopyStatus.BORROWED
            c4.save()
            l4, _ = Loan.objects.get_or_create(
                user=students[3],
                copy=c4,
                book=c4.book,
                defaults={
                    'borrowed_at': now - timedelta(days=21),
                    'due_at': (now - timedelta(days=7)).replace(hour=23, minute=59, second=59),
                    'status': LoanStatus.ACTIVE,
                    'created_by': admin,
                    'fine_per_day_snapshot': p_student.fine_per_day,
                    'loan_days_snapshot': p_student.loan_days,
                    'renewal_limit_snapshot': p_student.renewal_limit,
                    'book_price_snapshot': c4.book.price,
                    'processing_fee_snapshot': c4.book.processing_fee,
                    'policy_id_snapshot': p_student.id,
                }
            )

            # Loan 5: Sinh viên 05 quá hạn 31 ngày (sẽ xử lý auto_lost bởi cron)
            c5 = all_copies[4]
            c5.status = CopyStatus.BORROWED
            c5.save()
            l5, _ = Loan.objects.get_or_create(
                user=students[4],
                copy=c5,
                book=c5.book,
                defaults={
                    'borrowed_at': now - timedelta(days=45),
                    'due_at': (now - timedelta(days=31)).replace(hour=23, minute=59, second=59),
                    'status': LoanStatus.ACTIVE,
                    'created_by': admin,
                    'fine_per_day_snapshot': p_student.fine_per_day,
                    'loan_days_snapshot': p_student.loan_days,
                    'renewal_limit_snapshot': p_student.renewal_limit,
                    'book_price_snapshot': c5.book.price,
                    'processing_fee_snapshot': c5.book.processing_fee,
                    'policy_id_snapshot': p_student.id,
                }
            )

            # Loan 6: Giảng viên 01 mượn sách 30 ngày (còn 20 ngày)
            c6 = all_copies[5]
            c6.status = CopyStatus.BORROWED
            c6.save()
            l6, _ = Loan.objects.get_or_create(
                user=lecturers[0],
                copy=c6,
                book=c6.book,
                defaults={
                    'borrowed_at': now - timedelta(days=10),
                    'due_at': (now + timedelta(days=20)).replace(hour=23, minute=59, second=59),
                    'status': LoanStatus.ACTIVE,
                    'created_by': admin,
                    'fine_per_day_snapshot': p_lecturer.fine_per_day,
                    'loan_days_snapshot': p_lecturer.loan_days,
                    'renewal_limit_snapshot': p_lecturer.renewal_limit,
                    'book_price_snapshot': c6.book.price,
                    'processing_fee_snapshot': c6.book.processing_fee,
                    'policy_id_snapshot': p_lecturer.id,
                }
            )

            # Fines: Sinh viên 06 có khoản phạt quá hạn (unpaid), Sinh viên 07 có phạt partial
            f1, _ = Fine.objects.get_or_create(
                user=students[5],
                amount=14000,
                type=FineType.OVERDUE,
                defaults={
                    'paid_amount': 0,
                    'status': FineStatus.UNPAID,
                    'note': 'Phạt trễ hạn 7 ngày sách Kỹ thuật Thiết kế Đường cao tốc',
                }
            )
            f2, _ = Fine.objects.get_or_create(
                user=students[6],
                amount=20000,
                type=FineType.OVERDUE,
                defaults={
                    'paid_amount': 10000,
                    'status': FineStatus.PARTIAL,
                    'note': 'Phạt trễ 10 ngày sách Quản trị Chuỗi Cung ứng (đã nộp 10.000đ)',
                }
            )

            # Reservations: 1 ready, 2 pending
            c_ready = all_copies[6]
            c_ready.status = CopyStatus.RESERVED_HOLD
            c_ready.held_for_user = students[7]
            c_ready.hold_expires_at = (now + timedelta(days=3)).replace(hour=23, minute=59, second=59)
            c_ready.save()

            r_ready, _ = Reservation.objects.get_or_create(
                user=students[7],
                book=c_ready.book,
                defaults={
                    'copy': c_ready,
                    'status': ReservationStatus.READY,
                    'ready_at': now,
                    'hold_expires_at': c_ready.hold_expires_at,
                    'queue_position': 1,
                }
            )

            # Ready reservation for Sinh viên 01
            c_sv01_ready = all_copies[12]
            c_sv01_ready.status = CopyStatus.RESERVED_HOLD
            c_sv01_ready.held_for_user = students[0]
            c_sv01_ready.hold_expires_at = (now + timedelta(days=3)).replace(hour=23, minute=59, second=59)
            c_sv01_ready.save()

            r_sv01_ready, _ = Reservation.objects.get_or_create(
                user=students[0],
                book=c_sv01_ready.book,
                defaults={
                    'copy': c_sv01_ready,
                    'status': ReservationStatus.READY,
                    'ready_at': now,
                    'hold_expires_at': c_sv01_ready.hold_expires_at,
                    'queue_position': 1,
                }
            )

            r_pending1, _ = Reservation.objects.get_or_create(
                user=students[8],
                book=c1.book,
                defaults={
                    'status': ReservationStatus.PENDING,
                    'queue_position': 1,
                }
            )

            r_pending2, _ = Reservation.objects.get_or_create(
                user=students[9],
                book=c1.book,
                defaults={
                    'status': ReservationStatus.PENDING,
                    'queue_position': 2,
                }
            )

            # Suggestions
            Suggestion.objects.get_or_create(
                user=students[0],
                book_title='Kỹ thuật Xây dựng Cầu dây văng Khẩu độ Lớn trên thế giới',
                author='Dr. Michel Virlogeux',
                defaults={
                    'reason': 'Tài liệu cần thiết phục vụ làm đồ án tốt nghiệp ngành Cầu đường.',
                    'status': SuggestionStatus.PENDING,
                }
            )
            Suggestion.objects.get_or_create(
                user=students[1],
                book_title='Thiết kế Hệ thống Phân tán (Designing Data-Intensive Applications)',
                author='Martin Kleppmann',
                defaults={
                    'reason': 'Sách kinh điển về cơ sở dữ liệu và xử lý dữ liệu lớn trong CNTT.',
                    'status': SuggestionStatus.APPROVED,
                    'review_note': 'Đã duyệt mua trong đợt nhập sách quý 4/2026.',
                    'reviewed_by': admin,
                    'reviewed_at': now - timedelta(days=2),
                }
            )

            # Notifications
            Notification.objects.get_or_create(
                user=students[0],
                type=NotificationType.DUE_SOON,
                dedupe_key=f"due_soon_demo_{students[0].id}",
                defaults={
                    'content': 'Sách "Quy hoạch và Quản lý Giao thông Đô thị Hiện đại" của bạn sẽ đến hạn trả vào ngày 19/11/2026. Vui lòng trả sách hoặc gia hạn đúng hạn.',
                    'link': '/loans',
                }
            )
            Notification.objects.get_or_create(
                user=students[7],
                type=NotificationType.RESERVATION_READY,
                dedupe_key=f"res_ready_demo_{students[7].id}",
                defaults={
                    'content': f'Sách "{c_ready.book.title}" bạn mượn sách đã sẵn sàng tại quầy A. Vui lòng đến nhận trước 23:59 ngày {(today + timedelta(days=3)).strftime("%d/%m/%Y")}.',
                    'link': '/reservations',
                }
            )

            self.stdout.write(self.style.SUCCESS('=== NẠP DỮ LIỆU SEED DEMO THÀNH CÔNG RỰC RỠ! ==='))
            self.stdout.write('Tài khoản mẫu:')
            self.stdout.write('  - Quản trị (Admin/Thủ thư): admin / AdminPassword123')
            self.stdout.write('  - Sinh viên bình thường:   sv001 -> sv017 / Password123')
            self.stdout.write('  - Sinh viên thẻ hết hạn:   sv018 / Password123 (BR20)')
            self.stdout.write('  - Sinh viên bị khóa tài khoản: sv019 / Password123 (BR01)')
            self.stdout.write('  - Sinh viên bị khóa mượn sách: sv020 / Password123 (BR19)')
            self.stdout.write('  - Giảng viên:              gv01 -> gv05 / Password123')

