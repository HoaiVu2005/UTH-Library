import pytest
from datetime import timedelta
from django.utils import timezone
from django.core.cache import cache
from rest_framework.test import APIClient
from apps.accounts.models import User, RefreshToken
from apps.audit.models import AuditLog
from apps.core.enums import UserRole, LockReason
from apps.accounts.services import create_access_token, create_refresh_token, hash_token

@pytest.fixture(autouse=True)
def clear_cache():
    cache.clear()
    yield
    cache.clear()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def student_user(db):
    user = User.objects.create_user(
        username='sv001',
        password='Password123',
        full_name='Nguyễn Văn Sinh Viên',
        email='sv001@uth.edu.vn',
        card_code='SV20260001',
        role=UserRole.STUDENT
    )
    return user

@pytest.fixture
def admin_user(db):
    user = User.objects.create_superuser(
        username='admin01',
        password='AdminPassword123',
        full_name='Thủ Thư Trưởng',
        email='admin@uth.edu.vn',
    )
    return user

@pytest.mark.django_db
def test_login_success(api_client, student_user):
    response = api_client.post('/api/v1/auth/login', {
        'username': 'sv001',
        'password': 'Password123'
    }, format='json')

    assert response.status_code == 200
    data = response.json()['data']
    assert 'access_token' in data
    assert data['user']['username'] == 'sv001'
    assert data['user']['role'] == UserRole.STUDENT
    assert 'refresh_token' in response.cookies

@pytest.mark.django_db
def test_login_invalid_password(api_client, student_user):
    response = api_client.post('/api/v1/auth/login', {
        'username': 'sv001',
        'password': 'WrongPassword123'
    }, format='json')

    assert response.status_code == 401
    assert response.json()['code'] == 'AUTH_INVALID_CREDENTIALS'

    student_user.refresh_from_db()
    assert student_user.failed_login_count == 1

@pytest.mark.django_db
def test_login_lockout_after_5_failures(api_client, student_user):
    for i in range(5):
        # vary IP to avoid IP rate limit triggering before user lock test
        response = api_client.post(
            '/api/v1/auth/login',
            {'username': 'sv001', 'password': 'WrongPassword123'},
            format='json',
            REMOTE_ADDR=f'10.0.0.{i+1}'
        )
        assert response.status_code == 401

    student_user.refresh_from_db()
    assert student_user.failed_login_count == 5
    assert student_user.locked_until is not None
    assert student_user.lock_reason == LockReason.LOGIN

    # 6th attempt should return 403 USER_LOCKED
    response = api_client.post(
        '/api/v1/auth/login',
        {'username': 'sv001', 'password': 'Password123'},
        format='json',
        REMOTE_ADDR='10.0.0.99'
    )
    assert response.status_code == 403
    assert response.json()['code'] == 'USER_LOCKED'
    assert 'locked_until' in response.json()

@pytest.mark.django_db
def test_login_rate_limiting(api_client, student_user):
    client_ip = '192.168.1.100'
    for _ in range(5):
        api_client.post(
            '/api/v1/auth/login',
            {'username': 'sv001', 'password': 'WrongPassword123'},
            format='json',
            REMOTE_ADDR=client_ip
        )

    # 6th attempt from the same IP hits RATE_LIMITED
    response = api_client.post(
        '/api/v1/auth/login',
        {'username': 'sv001', 'password': 'Password123'},
        format='json',
        REMOTE_ADDR=client_ip
    )
    assert response.status_code == 429
    assert response.json()['code'] == 'RATE_LIMITED'

@pytest.mark.django_db
def test_refresh_token_rotation(api_client, student_user):
    raw_token, token_inst = create_refresh_token(student_user)

    api_client.cookies['refresh_token'] = raw_token
    response = api_client.post('/api/v1/auth/refresh')

    assert response.status_code == 200
    data = response.json()['data']
    assert 'access_token' in data
    new_raw_token = response.cookies['refresh_token'].value
    assert new_raw_token != raw_token

    # Check old token is revoked
    token_inst.refresh_from_db()
    assert token_inst.revoked_at is not None

@pytest.mark.django_db
def test_refresh_token_reuse_within_grace_period_returns_current_session(api_client, student_user):
    raw_token, token_inst = create_refresh_token(student_user)

    # 1st rotation - valid
    api_client.cookies['refresh_token'] = raw_token
    res1 = api_client.post('/api/v1/auth/refresh')
    assert res1.status_code == 200
    assert res1.cookies['refresh_token'].value

    # A just-rotated token may be replayed by concurrent tabs/React StrictMode.
    # The 60-second grace period must return a valid continuation instead of
    # revoking the whole family.
    api_client.cookies['refresh_token'] = raw_token
    res2 = api_client.post('/api/v1/auth/refresh')
    assert res2.status_code == 200
    assert res2.cookies['refresh_token'].value
    assert 'access_token' in res2.json()['data']

@pytest.mark.django_db
def test_logout(api_client, student_user):
    raw_token, token_inst = create_refresh_token(student_user)
    api_client.cookies['refresh_token'] = raw_token

    response = api_client.post('/api/v1/auth/logout')
    assert response.status_code == 200

    token_inst.refresh_from_db()
    assert token_inst.revoked_at is not None

@pytest.mark.django_db
def test_change_password_and_revoke_all_sessions(api_client, student_user):
    raw_token1, t1 = create_refresh_token(student_user)
    raw_token2, t2 = create_refresh_token(student_user)

    access_token = create_access_token(student_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

    response = api_client.post('/api/v1/profile/change-password', {
        'old_password': 'Password123',
        'new_password': 'NewPassword999'
    }, format='json')

    assert response.status_code == 200

    t1.refresh_from_db()
    t2.refresh_from_db()
    assert t1.revoked_at is not None
    assert t2.revoked_at is not None

@pytest.mark.django_db
def test_role_permission_forbidden_for_students(api_client, student_user, admin_user):
    # Student tries to access admin config endpoint
    student_token = create_access_token(student_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {student_token}')

    res = api_client.get('/api/v1/system/config')
    assert res.status_code == 403
    assert res.json()['code'] == 'FORBIDDEN'

    # Admin access is allowed
    admin_token = create_access_token(admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
    res_admin = api_client.get('/api/v1/system/config')
    assert res_admin.status_code == 200



@pytest.mark.django_db
def test_unlock_requires_a_documented_review_reason(api_client, admin_user, student_user):
    student_user.is_locked = True
    student_user.lock_reason = LockReason.MANUAL
    student_user.save(update_fields=['is_locked', 'lock_reason'])
    api_client.force_authenticate(admin_user)

    response = api_client.post(
        f'/api/v1/users/{student_user.id}/unlock',
        {'review_reason': '  '},
        format='json',
    )

    assert response.status_code == 400
    student_user.refresh_from_db()
    assert student_user.is_locked is True


@pytest.mark.django_db
def test_unlock_records_the_review_and_clears_the_single_borrowing_lock(
    api_client,
    admin_user,
    student_user,
):
    student_user.is_locked = True
    student_user.lock_reason = LockReason.OVERDUE_THRESHOLD
    student_user.locked_until = timezone.now() + timedelta(days=20)
    student_user.save(update_fields=['is_locked', 'lock_reason', 'locked_until'])
    api_client.force_authenticate(admin_user)

    response = api_client.post(
        f'/api/v1/users/{student_user.id}/unlock',
        {'review_reason': 'Sinh viên có xác nhận điều trị dài ngày từ phòng công tác sinh viên.'},
        format='json',
    )

    assert response.status_code == 200
    student_user.refresh_from_db()
    assert student_user.is_locked is False
    assert student_user.locked_until is None
    assert student_user.borrow_override_until > timezone.now() + timedelta(days=29)
    assert student_user.borrow_override_reason == 'Sinh viên có xác nhận điều trị dài ngày từ phòng công tác sinh viên.'
    audit = AuditLog.objects.get(action='ADMIN_UNLOCK_USER', entity_id=str(student_user.id))
    assert audit.detail['review_reason'] == 'Sinh viên có xác nhận điều trị dài ngày từ phòng công tác sinh viên.'
    assert audit.detail['previous_lock_reason'] == LockReason.OVERDUE_THRESHOLD
    assert audit.detail['borrow_override_until'] == student_user.borrow_override_until.isoformat()


@pytest.mark.django_db
def test_admin_user_crud_and_br28_delete_protection(api_client, admin_user):
    admin_token = create_access_token(admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')

    # Create user
    res = api_client.post('/api/v1/users', {
        'username': 'new_stu_br28',
        'password': 'PassWord123',
        'full_name': 'Sinh Viên Thử Nghiệm',
        'email': 'new_stu@uth.edu.vn',
        'role': 'student',
        'card_code': 'SV_BR28_01',
        'card_expiry': (timezone.localdate() + timedelta(days=365)).isoformat(),
    }, format='json')
    assert res.status_code == 201
    user_id = res.json()['id']

    # Lock user
    lock_res = api_client.post(f'/api/v1/users/{user_id}/lock', {
        'is_locked': True,
        'lock_reason': 'Thử nghiệm khóa',
    }, format='json')
    assert lock_res.status_code == 200
    assert lock_res.json()['data']['is_locked'] is True

    # Unlock user
    unlock_res = api_client.post(f'/api/v1/users/{user_id}/lock', {
        'is_locked': False,
        'review_reason': 'Đã xác minh yêu cầu mở khóa trong kiểm thử quản trị.',
    }, format='json')
    assert unlock_res.status_code == 200
    assert unlock_res.json()['data']['is_locked'] is False

    # Delete user (BR28 check passes because no active loans/fines)
    del_res = api_client.delete(f'/api/v1/users/{user_id}')
    assert del_res.status_code == 200
    del_user = User.objects.get(id=user_id)
    assert del_user.deleted_at is not None
    assert del_user.is_active is False
