import pytest
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.fines.models import Fine, FinePayment
from apps.core.enums import FineType, FineStatus

@pytest.mark.django_db
def test_sepay_webhook_single_fine_payment():
    client = APIClient()
    
    # 1. Create a student with a 20,000 VND fine
    user = User.objects.create_user(
        username='052205006506',
        password='Password123',
        card_code='052205006506',
        full_name='Lê Hoài Vũ',
        role='student'
    )
    
    fine = Fine.objects.create(
        user=user,
        type=FineType.OVERDUE,
        amount=20000,
        paid_amount=0,
        status=FineStatus.UNPAID
    )
    
    # 2. SePay sends webhook payload
    payload = {
        'id': 92704,
        'gateway': 'Sacombank',
        'accountNumber': '040117536833',
        'transferType': 'in',
        'transferAmount': 20000,
        'content': f'UTH 052205006506 PHAT {fine.id}',
        'referenceCode': 'STB.2026.92704'
    }
    
    response = client.post('/api/v1/fines/bank-webhook/', payload, format='json')
    assert response.status_code == 200
    assert response.data.get('success') is True
    
    # 3. Verify fine is marked as PAID
    fine.refresh_from_db()
    assert fine.status == FineStatus.PAID
    assert fine.paid_amount == 20000
    assert fine.payments.count() == 1
    
    # 4. Test idempotency: Resend identical transaction
    dup_response = client.post('/api/v1/fines/bank-webhook/', payload, format='json')
    assert dup_response.status_code == 200
    assert dup_response.data.get('success') is True
    assert 'đã được xử lý trước đó' in dup_response.data.get('message', '')
    assert fine.payments.count() == 1

@pytest.mark.django_db
def test_sepay_webhook_pay_all_fines():
    client = APIClient()
    
    user = User.objects.create_user(
        username='052205006507',
        password='Password123',
        card_code='052205006507',
        full_name='Nguyễn Văn B',
        role='student'
    )
    
    fine1 = Fine.objects.create(user=user, type=FineType.OVERDUE, amount=10000, status=FineStatus.UNPAID)
    fine2 = Fine.objects.create(user=user, type=FineType.OVERDUE, amount=15000, status=FineStatus.UNPAID)
    
    payload = {
        'id': 92705,
        'gateway': 'Sacombank',
        'accountNumber': '040117536833',
        'transferType': 'in',
        'transferAmount': 25000,
        'content': 'UTH 052205006507 NOP PHAT',
        'referenceCode': 'STB.2026.92705'
    }
    
    response = client.post('/api/v1/fines/bank-webhook/', payload, format='json')
    assert response.status_code == 200
    assert response.data.get('success') is True
    
    fine1.refresh_from_db()
    fine2.refresh_from_db()
    assert fine1.status == FineStatus.PAID
    assert fine2.status == FineStatus.PAID
