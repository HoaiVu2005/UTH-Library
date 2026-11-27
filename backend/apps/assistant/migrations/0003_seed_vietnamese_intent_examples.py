import re
import unicodedata

from django.db import migrations


INTENT_EXAMPLES = {
    'borrow_guide': [
        'cho tui hỏi thủ tục lấy sách về đọc',
        'em muốn biết các bước lấy sách về',
        'lần đầu đi mượn sách phải làm gì',
        'muốn đem sách thư viện về học thì làm sao',
        'chỉ mình quy trình lấy sách với',
    ],
    'borrow_policy': [
        'một lần được cầm về tối đa mấy quyển',
        'sinh viên giữ sách được mấy ngày',
        'hạn mức sách của em là bao nhiêu',
        'thầy cô được lấy bao nhiêu tài liệu',
    ],
    'loan_status': [
        'mấy cuốn đang giữ của tui là gì',
        'tài khoản em đang cầm những sách nào',
        'coi giúp em danh sách sách chưa trả',
        'hiện giờ tôi đang giữ tài liệu nào',
    ],
    'renew_guide': [
        'có cách nào nối thêm hạn đọc không',
        'em muốn giữ sách thêm vài ngày',
        'xin thêm thời gian đọc sách làm sao',
        'kéo dài ngày trả ở đâu vậy',
    ],
    'return_guide': [
        'đem sách trả ở đâu và cần làm gì',
        'em muốn gửi sách lại thư viện',
        'thủ tục hoàn lại tài liệu thế nào',
        'trả quyển đang giữ bằng cách nào',
    ],
    'overdue_policy': [
        'lỡ giữ sách quá ngày thì bị gì',
        'nộp trễ sách có sao không',
        'quên đem sách lại đúng hạn thì thế nào',
        'để sách quá ngày có mất tiền không',
    ],
    'reservation_status': [
        'phiếu chờ của tui tới đâu rồi',
        'coi giúp yêu cầu giữ sách của em',
        'bao giờ em được nhận cuốn đã đăng ký',
        'tài liệu em chờ đã có chưa',
    ],
    'fine_status': [
        'tài khoản em còn thiếu phí gì không',
        'coi giúp em đang nợ thư viện bao nhiêu',
        'em có khoản nào phải đóng không',
        'kiểm tra công nợ thư viện của tui',
    ],
}


def normalize(value):
    text = unicodedata.normalize('NFD', value.lower())
    text = ''.join(char for char in text if unicodedata.category(char) != 'Mn')
    text = text.replace('đ', 'd')
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9\s]', ' ', text)).strip()


def seed_examples(apps, schema_editor):
    IntentExample = apps.get_model('assistant', 'AssistantIntentExample')
    for intent, utterances in INTENT_EXAMPLES.items():
        for utterance in utterances:
            IntentExample.objects.get_or_create(
                role='any',
                normalized_text=normalize(utterance),
                defaults={
                    'intent': intent,
                    'utterance': utterance,
                    'source': 'seed',
                    'is_active': True,
                },
            )


def remove_seed_examples(apps, schema_editor):
    apps.get_model('assistant', 'AssistantIntentExample').objects.filter(source='seed').delete()


class Migration(migrations.Migration):
    dependencies = [('assistant', '0002_assistantintentexample')]

    operations = [migrations.RunPython(seed_examples, remove_seed_examples)]
