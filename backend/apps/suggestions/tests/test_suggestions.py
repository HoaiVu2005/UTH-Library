from datetime import timedelta
import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.core.enums import UserRole, SuggestionStatus, NotificationType
from apps.suggestions.models import Suggestion
from apps.notifications.models import Notification

@pytest.fixture
def patron_client(db):
    user = User.objects.create(
        username='sv_sug_01',
        role=UserRole.STUDENT,
        card_code='SV_SUG_01',
        card_expiry=timezone.localdate() + timedelta(days=365)
    )
    user.set_password('Pass123')
    user.save()
    client = APIClient()
    client.force_authenticate(user=user)
    return client, user

@pytest.fixture
def admin_client(db):
    admin = User.objects.create(
        username='admin_sug',
        role=UserRole.ADMIN,
        card_code='AD_SUG_01'
    )
    admin.set_password('Admin123')
    admin.save()
    client = APIClient()
    client.force_authenticate(user=admin)
    return client, admin

def test_patron_create_suggestion(patron_client):
    client, user = patron_client
    payload = {
        'book_title': 'Thiết kế Vi mạch số với VHDL',
        'author': 'GS. Trần Văn B',
        'reason': 'Phục vụ đề tài nghiên cứu tốt nghiệp ngành Điện tử Viễn thông UTH'
    }
    response = client.post('/api/v1/suggestions/me', payload, format='json')
    assert response.status_code == 201
    assert response.data['book_title'] == payload['book_title']
    assert response.data['status'] == SuggestionStatus.PENDING

    # Test listing own suggestions
    list_res = client.get('/api/v1/suggestions/me')
    assert list_res.status_code == 200
    assert list_res.data['meta']['total'] == 1

def test_admin_approve_suggestion(patron_client, admin_client):
    p_client, patron = patron_client
    a_client, admin = admin_client

    suggestion = Suggestion.objects.create(
        user=patron,
        book_title='Giải thuật và Cấu trúc dữ liệu',
        reason='Cần đọc cho môn học',
        status=SuggestionStatus.PENDING
    )

    response = a_client.post(
        f'/api/v1/suggestions/{suggestion.id}/approve',
        {'review_note': 'Đã duyệt mua 5 cuốn'},
        format='json'
    )
    assert response.status_code == 200
    suggestion.refresh_from_db()
    assert suggestion.status == SuggestionStatus.APPROVED
    assert suggestion.review_note == 'Đã duyệt mua 5 cuốn'

    # Check notification sent to patron
    notif = Notification.objects.filter(user=patron, type=NotificationType.SUGGESTION_RESULT).first()
    assert notif is not None
    assert 'đã được duyệt' in notif.content
