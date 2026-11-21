from datetime import timedelta
import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.core.enums import UserRole, SuggestionStatus, CampaignStatus, NotificationType
from apps.suggestions.models import Suggestion, SuggestionCampaign, SuggestionVote
from apps.notifications.models import Notification

@pytest.fixture
def active_campaign(db):
    today = timezone.localdate()
    return SuggestionCampaign.objects.create(
        title='Đợt khảo sát học liệu HK1',
        start_date=today - timedelta(days=1),
        end_date=today + timedelta(days=30),
        status=CampaignStatus.OPEN,
        target_audience='Toàn trường UTH'
    )

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
def patron_client_2(db):
    user = User.objects.create(
        username='sv_sug_02',
        role=UserRole.STUDENT,
        card_code='SV_SUG_02',
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

def test_patron_create_suggestion(patron_client, admin_client, active_campaign):
    client, user = patron_client
    _, admin = admin_client
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

    # Verify admin received notification
    admin_notif = Notification.objects.filter(user=admin, type=NotificationType.SUGGESTION_RESULT).first()
    assert admin_notif is not None
    assert 'Thiết kế Vi mạch số với VHDL' in admin_notif.content
    assert admin_notif.is_read is False

def test_community_suggestion_and_upvote(patron_client, patron_client_2, active_campaign):
    client1, user1 = patron_client
    client2, user2 = patron_client_2

    # User 1 proposes a book
    create_res = client1.post('/api/v1/suggestions/me', {
        'book_title': 'Giáo trình Thiết kế Cầu hầm UTH',
        'author': 'Khoa CTGT',
        'reason': 'Học phần Cầu đường HK1'
    }, format='json')
    assert create_res.status_code == 201
    suggestion_id = create_res.data['id']

    # User 2 views community list
    community_res = client2.get('/api/v1/suggestions/community')
    assert community_res.status_code == 200
    assert len(community_res.data['data']) >= 1

    # User 2 upvotes the suggestion
    vote_res = client2.post(f'/api/v1/suggestions/{suggestion_id}/vote')
    assert vote_res.status_code == 200
    assert vote_res.data['voted'] is True
    assert vote_res.data['votes_count'] == 2  # 1 from author + 1 from user 2

    # User 2 toggles unvote
    unvote_res = client2.post(f'/api/v1/suggestions/{suggestion_id}/vote')
    assert unvote_res.status_code == 200
    assert unvote_res.data['voted'] is False
    assert unvote_res.data['votes_count'] == 1

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
    assert 'đã được Thư viện phê duyệt' in notif.content

def test_community_suggestions_strictly_filtered_by_active_campaign(patron_client, active_campaign):
    client, user = patron_client
    today = timezone.localdate()

    # Suggestion in active campaign
    sug_active = Suggestion.objects.create(
        user=user,
        campaign=active_campaign,
        book_title='Sách Đợt Đang Mở',
        reason='Lý do 1',
        status=SuggestionStatus.PENDING
    )

    # Past closed campaign
    closed_campaign = SuggestionCampaign.objects.create(
        title='Đợt cũ đã đóng',
        start_date=today - timedelta(days=60),
        end_date=today - timedelta(days=30),
        status=CampaignStatus.CLOSED
    )
    sug_closed = Suggestion.objects.create(
        user=user,
        campaign=closed_campaign,
        book_title='Sách Đợt Cũ',
        reason='Lý do 2',
        status=SuggestionStatus.PENDING
    )

    # Suggestion without any campaign
    sug_no_camp = Suggestion.objects.create(
        user=user,
        book_title='Sách Ngoài Đợt',
        reason='Lý do 3',
        status=SuggestionStatus.PENDING
    )

    # Request community list (default without campaign_id)
    res = client.get('/api/v1/suggestions/community')
    assert res.status_code == 200
    book_titles = [item['book_title'] for item in res.data['data']]
    assert 'Sách Đợt Đang Mở' in book_titles
    assert 'Sách Đợt Cũ' not in book_titles
    assert 'Sách Ngoài Đợt' not in book_titles

def test_auto_close_expired_campaign(patron_client):
    client, _ = patron_client
    today = timezone.localdate()

    # Create campaign that reached end date yesterday
    expired_camp = SuggestionCampaign.objects.create(
        title='Đợt vừa hết hạn hôm qua',
        start_date=today - timedelta(days=10),
        end_date=today - timedelta(days=1),
        status=CampaignStatus.OPEN
    )

    # Query active campaign
    res = client.get('/api/v1/suggestions/campaigns/active')
    assert res.status_code == 200
    assert res.data['has_active_campaign'] is False

    # Check that campaign in DB was auto-updated to CLOSED
    expired_camp.refresh_from_db()
    assert expired_camp.status == CampaignStatus.CLOSED

