import pytest
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.core.enums import UserRole
from apps.accounts.services import create_access_token

@pytest.fixture
def admin_client(db):
    admin = User.objects.create(
        username='admin_rep_01',
        role=UserRole.ADMIN,
        card_code='AD_REP_01',
    )
    admin.set_password('Admin123')
    admin.save()
    token = create_access_token(admin)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    return client

def test_dashboard_summary_api(admin_client):
    res = admin_client.get('/api/v1/dashboard/summary')
    assert res.status_code == 200
    data = res.json()['data']
    assert 'total_books' in data
    assert 'active_loans' in data
    assert 'total_unpaid_fines' in data
    assert 'available_copies' in data

def test_dashboard_action_items_api(admin_client):
    res = admin_client.get('/api/v1/dashboard/action-items')
    assert res.status_code == 200
    data = res.json()['data']
    assert 'pending_suggestions' in data
    assert 'expiring_holds' in data
    assert 'severe_overdue' in data

def test_top_borrowed_report_api(admin_client):
    res = admin_client.get('/api/v1/reports/top-borrowed')
    assert res.status_code == 200
    assert isinstance(res.json()['data'], list)

def test_overdue_report_api(admin_client):
    res = admin_client.get('/api/v1/reports/overdue')
    assert res.status_code == 200
    assert isinstance(res.json()['data'], list)

def test_inventory_report_api(admin_client):
    res = admin_client.get('/api/v1/reports/inventory')
    assert res.status_code == 200
    assert isinstance(res.json()['data'], list)

def test_borrow_trends_api(admin_client):
    res = admin_client.get('/api/v1/reports/borrow-trends?days=7')
    assert res.status_code == 200
    data = res.json()['data']
    assert len(data) == 7

