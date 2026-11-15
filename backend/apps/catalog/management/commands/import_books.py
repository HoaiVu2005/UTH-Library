import os
from django.core.management.base import BaseCommand, CommandError
from apps.catalog.services import import_books_from_csv

class Command(BaseCommand):
    help = 'Nhập danh mục sách Thư viện UTH từ tập tin CSV'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Đường dẫn đến tập tin CSV')

    def handle(self, *args, **options):
        file_path = options['file_path']
        if not os.path.exists(file_path):
            raise CommandError(f'Tập tin không tồn tại: {file_path}')

        self.stdout.write(self.style.NOTICE(f'Đang đọc và nhập sách từ {file_path}...'))
        try:
            with open(file_path, 'r', encoding='utf-8-sig', errors='replace') as f:
                csv_text = f.read()
        except Exception as e:
            raise CommandError(f'Không thể đọc tập tin: {str(e)}')

        result = import_books_from_csv(csv_text)
        imported = result.get('imported_books', 0)
        copies = result.get('created_copies', 0)
        errors = result.get('errors', [])

        self.stdout.write(self.style.SUCCESS(f'✓ Đã nhập thành công {imported} đầu sách mới và sinh {copies} bản sao có mã vạch Code128!'))
        if errors:
            self.stdout.write(self.style.WARNING(f'Lưu ý có {len(errors)} cảnh báo/lỗi:'))
            for err in errors[:10]:
                self.stdout.write(f'  - {err}')

