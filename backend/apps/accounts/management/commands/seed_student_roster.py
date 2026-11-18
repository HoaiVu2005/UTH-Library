from django.core.management.base import BaseCommand
from apps.accounts.models import StudentRoster, StudentStatus, User

class Command(BaseCommand):
    help = 'Nạp danh sách sinh viên trường ĐH Giao thông Vận tải TP.HCM (UTH Roster)'

    def handle(self, *args, **options):
        students_data = [
            {
                'student_code': '22510001',
                'full_name': 'Nguyễn Văn An',
                'department': 'Khoa Công nghệ thông tin',
                'major': 'Kỹ thuật Phần mềm',
                'email': '22510001@sv.ut.edu.vn',
                'phone': '0903112233',
                'academic_year': 'K22 (2022 - 2026)',
                'status': StudentStatus.ENROLLED,
            },
            {
                'student_code': '22510002',
                'full_name': 'Trần Thị Mai',
                'department': 'Khoa Kinh tế vận tải',
                'major': 'Logistics và Quản trị chuỗi cung ứng',
                'email': '22510002@sv.ut.edu.vn',
                'phone': '0918223344',
                'academic_year': 'K22 (2022 - 2026)',
                'status': StudentStatus.ENROLLED,
            },
            {
                'student_code': '22510003',
                'full_name': 'Lê Hoàng Nam',
                'department': 'Khoa Hàng hải',
                'major': 'Điều khiển tàu biển',
                'email': '22510003@sv.ut.edu.vn',
                'phone': '0977334455',
                'academic_year': 'K22 (2022 - 2026)',
                'status': StudentStatus.ENROLLED,
            },
            {
                'student_code': '22510004',
                'full_name': 'Phạm Quốc Bảo',
                'department': 'Khoa Cơ khí',
                'major': 'Kỹ thuật Cơ điện tử',
                'email': '22510004@sv.ut.edu.vn',
                'phone': '0933445566',
                'academic_year': 'K22 (2022 - 2026)',
                'status': StudentStatus.ENROLLED,
            },
            {
                'student_code': '22510005',
                'full_name': 'Võ Thị Bích Trâm',
                'department': 'Khoa Công nghệ thông tin',
                'major': 'Hệ thống thông tin',
                'email': '22510005@sv.ut.edu.vn',
                'phone': '0988556677',
                'academic_year': 'K22 (2022 - 2026)',
                'status': StudentStatus.ENROLLED,
            },
            {
                'student_code': '23510010',
                'full_name': 'Hoàng Minh Khôi',
                'department': 'Khoa Điện - Điện tử viễn thông',
                'major': 'Kỹ thuật Viễn thông',
                'email': '23510010@sv.ut.edu.vn',
                'phone': '0909667788',
                'academic_year': 'K23 (2023 - 2027)',
                'status': StudentStatus.ENROLLED,
            },
            {
                'student_code': '23510012',
                'full_name': 'Đỗ Phương Thảo',
                'department': 'Khoa Kinh tế vận tải',
                'major': 'Quản trị kinh doanh vận tải',
                'email': '23510012@sv.ut.edu.vn',
                'phone': '0912778899',
                'academic_year': 'K23 (2023 - 2027)',
                'status': StudentStatus.ENROLLED,
            },
            {
                'student_code': '2251172153',
                'full_name': 'Lê Hoàng Hải',
                'department': 'Khoa Công nghệ thông tin',
                'major': 'Khoa học máy tính',
                'email': '2251172153@sv.ut.edu.vn',
                'phone': '0938889900',
                'academic_year': 'K22 (2022 - 2026)',
                'status': StudentStatus.ENROLLED,
            },
            {
                'student_code': '20510099',
                'full_name': 'Đặng Văn Khang',
                'department': 'Khoa Xây dựng',
                'major': 'Kỹ thuật Công trình giao thông',
                'email': '20510099@sv.ut.edu.vn',
                'phone': '0944112233',
                'academic_year': 'K20 (2020 - 2024)',
                'status': StudentStatus.GRADUATED,
            },
            {
                'student_code': '21510088',
                'full_name': 'Bùi Thanh Tùng',
                'department': 'Khoa Cơ khí',
                'major': 'Kỹ thuật Ô tô',
                'email': '21510088@sv.ut.edu.vn',
                'phone': '0966223344',
                'academic_year': 'K21 (2021 - 2025)',
                'status': StudentStatus.SUSPENDED,
            },
        ]

        created_count = 0
        updated_count = 0

        for item in students_data:
            code = item['student_code']
            # Check if this student already has an active User account in library
            existing_user = User.objects.filter(card_code=code).first() or User.objects.filter(username=code).first()

            roster, created = StudentRoster.objects.update_or_create(
                student_code=code,
                defaults={
                    **item,
                    'is_card_issued': bool(existing_user),
                    'user': existing_user,
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Nạp thành công: {created_count} sinh viên mới, cập nhật {updated_count} sinh viên vào Danh sách sinh viên UTH.'
        ))

