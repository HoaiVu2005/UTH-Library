import io
import json
import tempfile
from pathlib import Path

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase

from apps.assistant.management.commands.restore_ai_database import Command
from apps.catalog.models import Book, Category


SAFE_SEED_MODELS = {
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


class UthieBootstrapTests(TestCase):
    def test_if_empty_mode_preserves_an_initialized_library(self):
        category = Category.objects.create(code='EXISTING', name='Dữ liệu hiện có')
        Book.objects.create(title='Không được ghi đè', category=category)

        Command().handle(fixture='missing-file.json', if_empty=True)

        self.assertEqual(Book.objects.count(), 1)
        self.assertTrue(Book.objects.filter(title='Không được ghi đè').exists())

    def test_if_empty_mode_can_report_through_a_legacy_windows_console(self):
        category = Category.objects.create(code='WINDOWS', name='Windows console')
        Book.objects.create(title='Dữ liệu hiện có', category=category)
        output = io.TextIOWrapper(io.BytesIO(), encoding='cp1258', errors='strict')

        Command(stdout=output).handle(fixture='missing-file.json', if_empty=True)

        output.flush()

    def test_public_seed_contains_grounding_data_without_runtime_secrets_or_chat_history(self):
        fixture_path = Path(settings.BASE_DIR) / 'fixtures' / 'uthie_seed_data.json'

        self.assertTrue(fixture_path.exists(), 'Thiếu fixture bootstrap UTHie')
        payload = json.loads(fixture_path.read_text(encoding='utf-8'))
        models = {item['model'] for item in payload}

        self.assertEqual(models, SAFE_SEED_MODELS)
        self.assertGreater(sum(item['model'] == 'catalog.book' for item in payload), 50)
        self.assertGreater(sum(item['model'] == 'catalog.copy' for item in payload), 100)

        users = [item for item in payload if item['model'] == 'accounts.user']
        usernames = {item['fields']['username'] for item in users}
        expected_usernames = {
            'admin',
            *(f'sv{index:03d}' for index in range(1, 21)),
            *(f'gv{index:02d}' for index in range(1, 6)),
        }
        self.assertEqual(usernames, expected_usernames)

    def test_restore_command_rejects_private_runtime_models_before_loading(self):
        payload = [
            {
                'model': 'accounts.refreshtoken',
                'pk': 1,
                'fields': {'token_hash': 'must-not-ship'},
            },
        ]
        with tempfile.TemporaryDirectory() as temp_dir:
            fixture_path = Path(temp_dir) / 'unsafe.json'
            fixture_path.write_text(json.dumps(payload), encoding='utf-8')

            with self.assertRaisesMessage(CommandError, 'dữ liệu runtime không được phép phát hành'):
                call_command('restore_ai_database', fixture=str(fixture_path))
