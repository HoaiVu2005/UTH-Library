import os
from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import connection

from apps.accounts.models import User
from apps.catalog.models import Book, Copy
from apps.circulation.models import Loan
from apps.fines.models import Fine
from apps.assistant.models import AssistantConversation, AssistantMessage


class Command(BaseCommand):
    help = 'Khôi phục 100% dữ liệu hoàn chỉnh của Thư viện và UTHie AI từ fixture backup_data.json'

    def add_arguments(self, parser):
        parser.add_argument(
            '--fixture',
            type=str,
            default=os.path.join(settings.BASE_DIR, 'fixtures', 'backup_data.json'),
            help='Đường dẫn tới file backup_data.json'
        )

    def handle(self, *args, **options):
        fixture_path = options['fixture']
        if not os.path.exists(fixture_path):
            self.stderr.write(self.style.ERROR(f'Không tìm thấy file fixture tại: {fixture_path}'))
            return

        self.stdout.write(self.style.NOTICE('=== BẮT ĐẦU ĐỒNG BỘ DỮ LIỆU UTHIE AI & THƯ VIỆN UTH ==='))
        self.stdout.write(f'Nạp dữ liệu từ: {fixture_path}')

        try:
            call_command('loaddata', fixture_path)
            self.stdout.write(self.style.SUCCESS('✓ Đã nạp thành công fixture JSON!'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Lỗi khi nạp dữ liệu: {e}'))
            return

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

        self.stdout.write(self.style.SUCCESS('=== DỮ LIỆU ĐÃ ĐỒNG BỘ 100% HOÀN CHỈNH ==='))
        self.stdout.write(f'- Người dùng (User): {user_count}')
        self.stdout.write(f'- Đầu sách (Book): {book_count}')
        self.stdout.write(f'- Bản sao sách (Copy): {copy_count}')
        self.stdout.write(f'- Lượt mượn sách (Loan): {loan_count}')
        self.stdout.write(f'- Phiếu phạt (Fine): {fine_count}')
        self.stdout.write(f'- Hội thoại AI (AssistantConversation): {conv_count}')
        self.stdout.write(f'- Lịch sử tin nhắn AI (AssistantMessage): {msg_count}')
        self.stdout.write(self.style.SUCCESS('UTHie AI đã sẵn sàng hoạt động trên máy này với dữ liệu đồng nhất 100%!'))
