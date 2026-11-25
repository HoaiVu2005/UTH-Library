import json
import os
from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError
from django.db import connection

from apps.accounts.models import User
from apps.catalog.models import Book, Copy
from apps.circulation.models import Loan
from apps.fines.models import Fine
from apps.assistant.models import AssistantConversation, AssistantMessage


PUBLIC_SEED_MODELS = {
    'accounts.user',
    'catalog.author',
    'catalog.barcodesequence',
    'catalog.book',
    'catalog.category',
    'catalog.copy',
    'circulation.loan',
    'core.policy',
    'core.systemconfig',
    'fines.fine',
    'fines.finepayment',
    'reservations.reservation',
    'suggestions.suggestion',
}


def validate_public_seed(fixture_path: str) -> None:
    try:
        with open(fixture_path, encoding='utf-8') as fixture_file:
            payload = json.load(fixture_file)
    except (OSError, json.JSONDecodeError) as exc:
        raise CommandError(f'Không thể đọc fixture UTHie: {exc}') from exc

    models = {item.get('model') for item in payload if isinstance(item, dict)}
    forbidden_models = sorted(model for model in models if model not in PUBLIC_SEED_MODELS)
    if forbidden_models:
        raise CommandError(
            'Fixture chứa dữ liệu runtime không được phép phát hành: '
            + ', '.join(forbidden_models)
        )

    missing_models = sorted(PUBLIC_SEED_MODELS - models)
    if missing_models:
        raise CommandError(
            'Fixture UTHie thiếu dữ liệu grounding bắt buộc: '
            + ', '.join(missing_models)
        )


class Command(BaseCommand):
    help = 'Nạp dữ liệu grounding công khai để UTHie sẵn sàng sau khi clone repository'

    def add_arguments(self, parser):
        parser.add_argument(
            '--fixture',
            type=str,
            default=os.path.join(settings.BASE_DIR, 'fixtures', 'uthie_seed_data.json'),
            help='Đường dẫn tới fixture grounding công khai của UTHie'
        )
        parser.add_argument(
            '--if-empty',
            action='store_true',
            help='Chỉ nạp fixture khi database chưa có đầu sách nào',
        )

    def handle(self, *args, **options):
        output_stream = getattr(self.stdout, '_out', None)
        if hasattr(output_stream, 'reconfigure'):
            output_stream.reconfigure(errors='replace')

        if options.get('if_empty') and Book.objects.exists():
            self.stdout.write(self.style.SUCCESS(
                'Database đã có dữ liệu thư viện; bỏ qua bước nạp seed UTHie.'
            ))
            return

        fixture_path = options['fixture']
        if not os.path.exists(fixture_path):
            raise CommandError(f'Không tìm thấy file fixture tại: {fixture_path}')

        validate_public_seed(fixture_path)

        self.stdout.write(self.style.NOTICE('=== BẮT ĐẦU NẠP DỮ LIỆU GROUNDING CÔNG KHAI CHO UTHIE ==='))
        self.stdout.write(f'Nạp dữ liệu từ: {fixture_path}')

        try:
            call_command('loaddata', fixture_path)
            self.stdout.write(self.style.SUCCESS('✓ Đã nạp thành công fixture JSON!'))
        except Exception as e:
            raise CommandError(f'Lỗi khi nạp dữ liệu: {e}') from e

        # Cập nhật Postgres sequence nếu dùng postgresql
        if 'postgresql' in settings.DATABASES['default']['ENGINE']:
            try:
                self.stdout.write('Đang cập nhật sequence id cho PostgreSQL...')
                with connection.cursor() as cursor:
                    cursor.execute("""
                        SELECT 'SELECT setval(''' || c.relname || ''', coalesce(max(' || a.attname || '), 1)) FROM ' || t.relname || ';'
                        FROM pg_class c
                        JOIN pg_depend d ON d.objid = c.oid
                        JOIN pg_class t ON t.oid = d.refobjid
                        JOIN pg_attribute a ON (a.attrelid, a.attnum) = (d.refobjid, d.refobjsubid)
                        WHERE c.relkind = 'S' and d.deptype = 'a';
                    """)
                    commands = cursor.fetchall()
                    for cmd in commands:
                        try:
                            cursor.execute(cmd[0])
                        except Exception:
                            pass
                self.stdout.write(self.style.SUCCESS('✓ Đã cập nhật xong Postgres sequence!'))
            except Exception as seq_err:
                self.stdout.write(self.style.WARNING(f'Lưu ý về sequence: {seq_err}'))

        # Thống kê kiểm chứng
        user_count = User.objects.count()
        book_count = Book.objects.count()
        copy_count = Copy.objects.count()
        loan_count = Loan.objects.count()
        fine_count = Fine.objects.count()
        conv_count = AssistantConversation.objects.count()
        msg_count = AssistantMessage.objects.count()

        self.stdout.write(self.style.SUCCESS('=== DỮ LIỆU GROUNDING UTHIE ĐÃ SẴN SÀNG ==='))
        self.stdout.write(f'- Người dùng (User): {user_count}')
        self.stdout.write(f'- Đầu sách (Book): {book_count}')
        self.stdout.write(f'- Bản sao sách (Copy): {copy_count}')
        self.stdout.write(f'- Lượt mượn sách (Loan): {loan_count}')
        self.stdout.write(f'- Phiếu phạt (Fine): {fine_count}')
        self.stdout.write(f'- Hội thoại AI (AssistantConversation): {conv_count}')
        self.stdout.write(f'- Lịch sử tin nhắn AI (AssistantMessage): {msg_count}')
        if not os.getenv('GEMINI_API_KEY', '').strip():
            self.stdout.write(self.style.WARNING(
                '- GEMINI_API_KEY chưa được cấu hình; UTHie sẽ chạy bằng fallback nội bộ.'
            ))
        self.stdout.write(self.style.SUCCESS(
            'UTHie đã có dữ liệu nghiệp vụ. Cấu hình GEMINI_API_KEY riêng để bật mô hình Gemini.'
        ))
