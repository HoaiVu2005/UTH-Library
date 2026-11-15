import concurrent.futures
from datetime import timedelta
import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.core.models import Policy, SystemConfig
from apps.core.enums import (
    UserRole,
    CopyStatus,
    LoanStatus,
    ReturnCondition,
    ReservationStatus,
    DamageLevel,
    FineType,
    FineStatus,
    LockReason,
)
from apps.core.exceptions import BusinessLogicError
from apps.catalog.models import Category, Book, Copy
from apps.circulation.models import Loan
from apps.reservations.models import Reservation
from apps.fines.models import Fine
from apps.circulation.services import (
    borrow_direct,
    return_loan,
    renew_loan,
)
from apps.fines.services import collect_fine, waive_fine

@pytest.fixture
def admin_user(db):
    user, _ = User.objects.get_or_create(
        username='admin_circ',
        defaults={'role': UserRole.ADMIN, 'card_code': 'ADMIN_C01'}
    )
    user.set_password('Admin123')
    user.save()
    return user

@pytest.fixture
def student_user(db):
    user, _ = User.objects.get_or_create(
        username='stu_circ',
        defaults={
            'role': UserRole.STUDENT,
            'card_code': 'SV_CIRC_01',
            'card_expiry': timezone.localdate() + timedelta(days=365)
        }
    )
    user.set_password('Pass123')
    user.save()
    return user

@pytest.fixture
def lecturer_user(db):
    user, _ = User.objects.get_or_create(
        username='lec_circ',
        defaults={
            'role': UserRole.LECTURER,
            'card_code': 'GV_CIRC_01',
            'card_expiry': timezone.localdate() + timedelta(days=365)
        }
    )
    user.set_password('Pass123')
    user.save()
    return user

@pytest.fixture
def sample_book_and_copy(db):
    cat, _ = Category.objects.get_or_create(code='CIRC', defaults={'name': 'Lưu thông'})
    book = Book.objects.create(
        title='Giáo trình Kỹ thuật Lưu thông',
        category=cat,
        price=150000,
        processing_fee=30000
    )
    copy = Copy.objects.create(
        book=book,
        barcode='UTH-CIRC-000001',
        status=CopyStatus.AVAILABLE
    )
    return book, copy

@pytest.mark.django_db
def test_borrow_direct_success(admin_user, student_user, sample_book_and_copy):
    book, copy = sample_book_and_copy
    loan = borrow_direct(
        patron_card_code=student_user.card_code,
        barcode=copy.barcode,
        admin_user=admin_user
    )

    assert loan.status == LoanStatus.ACTIVE
    assert loan.user == student_user
    assert loan.copy == copy
    assert loan.book_price_snapshot == 150000
    assert loan.processing_fee_snapshot == 30000
    assert loan.fine_per_day_snapshot == 2000
    assert loan.loan_days_snapshot == 14

    # Copy status must be BORROWED
    copy.refresh_from_db()
    assert copy.status == CopyStatus.BORROWED

@pytest.mark.django_db
def test_borrow_br01_expired_card_rejected(admin_user, student_user, sample_book_and_copy):
    _, copy = sample_book_and_copy
    student_user.card_expiry = timezone.localdate() - timedelta(days=1)
    student_user.save()

    with pytest.raises(BusinessLogicError) as exc:
        borrow_direct(student_user.card_code, copy.barcode, admin_user)
    assert exc.value.code == 'USER_EXPIRED'

@pytest.mark.django_db
def test_borrow_br01_locked_user_rejected(admin_user, student_user, sample_book_and_copy):
    _, copy = sample_book_and_copy
    student_user.is_locked = True
    student_user.save()

    with pytest.raises(BusinessLogicError) as exc:
        borrow_direct(student_user.card_code, copy.barcode, admin_user)
    assert exc.value.code == 'USER_LOCKED'

@pytest.mark.django_db
def test_borrow_br02_limit_reached(admin_user, student_user, sample_book_and_copy):
    book, copy = sample_book_and_copy
    cat = book.category

    # Create 5 active loans to hit student max limit (5)
    for i in range(5):
        b = Book.objects.create(title=f'Book {i}', category=cat)
        c = Copy.objects.create(book=b, barcode=f'UTH-CIRC-10000{i}', status=CopyStatus.BORROWED)
        Loan.objects.create(
            user=student_user,
            copy=c,
            book=b,
            due_at=timezone.now() + timedelta(days=10),
            status=LoanStatus.ACTIVE
        )

    # 6th borrow attempt must be rejected
    with pytest.raises(BusinessLogicError) as exc:
        borrow_direct(student_user.card_code, copy.barcode, admin_user)
    assert exc.value.code == 'LOAN_LIMIT_REACHED'

@pytest.mark.django_db
def test_borrow_br03_has_overdue_rejected(admin_user, student_user, sample_book_and_copy):
    book, copy = sample_book_and_copy
    cat = book.category

    # Create 1 overdue loan
    b_old = Book.objects.create(title='Sách Quá Hạn', category=cat)
    c_old = Copy.objects.create(book=b_old, barcode='UTH-CIRC-200001', status=CopyStatus.BORROWED)
    Loan.objects.create(
        user=student_user,
        copy=c_old,
        book=b_old,
        due_at=timezone.now() - timedelta(days=2),
        status=LoanStatus.ACTIVE
    )

    with pytest.raises(BusinessLogicError) as exc:
        borrow_direct(student_user.card_code, copy.barcode, admin_user)
    assert exc.value.code == 'LOAN_HAS_OVERDUE'

@pytest.mark.django_db
def test_borrow_br03_has_unpaid_fine_rejected(admin_user, student_user, sample_book_and_copy):
    _, copy = sample_book_and_copy

    Fine.objects.create(
        user=student_user,
        type=FineType.OVERDUE,
        amount=10000,
        paid_amount=0,
        status=FineStatus.UNPAID
    )

    with pytest.raises(BusinessLogicError) as exc:
        borrow_direct(student_user.card_code, copy.barcode, admin_user)
    assert exc.value.code == 'LOAN_HAS_UNPAID_FINE'

@pytest.mark.django_db
def test_borrow_br04_duplicate_book_rejected(admin_user, student_user, sample_book_and_copy):
    book, copy1 = sample_book_and_copy
    # Second copy of the SAME book
    copy2 = Copy.objects.create(book=book, barcode='UTH-CIRC-000002', status=CopyStatus.AVAILABLE)

    # Borrow first copy
    borrow_direct(student_user.card_code, copy1.barcode, admin_user)

    # Borrow second copy of same book -> rejected
    with pytest.raises(BusinessLogicError) as exc:
        borrow_direct(student_user.card_code, copy2.barcode, admin_user)
    assert exc.value.code == 'LOAN_DUPLICATE_BOOK'

@pytest.mark.django_db
def test_borrow_br08_reading_room_only_rejected(admin_user, student_user, sample_book_and_copy):
    book, _ = sample_book_and_copy
    rr_copy = Copy.objects.create(
        book=book,
        barcode='UTH-CIRC-RR0001',
        status=CopyStatus.AVAILABLE,
        reading_room_only=True
    )

    with pytest.raises(BusinessLogicError) as exc:
        borrow_direct(student_user.card_code, rr_copy.barcode, admin_user)
    assert exc.value.code == 'COPY_READING_ROOM_ONLY'

@pytest.mark.django_db
def test_borrow_br22_admin_applies_patron_policy(admin_user, lecturer_user, sample_book_and_copy):
    _, copy = sample_book_and_copy
    loan = borrow_direct(lecturer_user.card_code, copy.barcode, admin_user)
    # Lecturer has 30 days loan period (not admin default)
    assert loan.loan_days_snapshot == 30
    assert loan.created_by == admin_user

@pytest.mark.django_db(transaction=True)
def test_borrow_br12_concurrency_race_condition(db):
    cat, _ = Category.objects.get_or_create(code='RACE', defaults={'name': 'Tranh chấp'})
    book = Book.objects.create(title='Sách Đồng Thời', category=cat)
    copy = Copy.objects.create(book=book, barcode='UTH-RACE-000001', status=CopyStatus.AVAILABLE)

    admin, _ = User.objects.get_or_create(username='admin_race', defaults={'role': UserRole.ADMIN, 'card_code': 'AD_RACE'})
    u1, _ = User.objects.get_or_create(username='u1_race', defaults={'role': UserRole.STUDENT, 'card_code': 'SV_RACE_1', 'card_expiry': timezone.localdate() + timedelta(days=100)})
    u2, _ = User.objects.get_or_create(username='u2_race', defaults={'role': UserRole.STUDENT, 'card_code': 'SV_RACE_2', 'card_expiry': timezone.localdate() + timedelta(days=100)})

    results = []

    def attempt_borrow(patron):
        from django.db import connection
        connection.close()
        try:
            loan = borrow_direct(patron.card_code, copy.barcode, admin)
            results.append(('SUCCESS', patron.card_code, loan.id))
        except Exception as e:
            results.append(('FAIL', patron.card_code, str(e)))

    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        f1 = executor.submit(attempt_borrow, u1)
        f2 = executor.submit(attempt_borrow, u2)
        f1.result()
        f2.result()

    successes = [r for r in results if r[0] == 'SUCCESS']
    failures = [r for r in results if r[0] == 'FAIL']

    # Exactly 1 request succeeds, 1 fails
    assert len(successes) == 1
    assert len(failures) == 1
    # Active loans in DB for this copy must be exactly 1
    assert Loan.objects.filter(copy=copy, status=LoanStatus.ACTIVE).count() == 1

@pytest.mark.django_db
def test_return_br06_br13_on_time_no_fine(admin_user, student_user, sample_book_and_copy):
    _, copy = sample_book_and_copy
    loan = borrow_direct(student_user.card_code, copy.barcode, admin_user)

    returned_loan, fines = return_loan(loan.id, condition=ReturnCondition.NORMAL, admin_user=admin_user)
    assert returned_loan.status == LoanStatus.RETURNED
    assert len(fines) == 0

    copy.refresh_from_db()
    assert copy.status == CopyStatus.AVAILABLE

@pytest.mark.django_db
def test_return_br06_br13_overdue_fine_calculated(admin_user, student_user, sample_book_and_copy):
    _, copy = sample_book_and_copy
    loan = borrow_direct(student_user.card_code, copy.barcode, admin_user)

    # Simulate 3 days overdue
    loan.due_at = timezone.now() - timedelta(days=3)
    loan.save()

    returned_loan, fines = return_loan(loan.id, condition=ReturnCondition.NORMAL, admin_user=admin_user)
    assert returned_loan.status == LoanStatus.RETURNED
    assert len(fines) == 1
    fine = fines[0]
    assert fine.type == FineType.OVERDUE
    # 3 days * 2.000 = 6.000 VND
    assert fine.amount == 6000
    assert fine.status == FineStatus.UNPAID

@pytest.mark.django_db
def test_return_br15_damaged(admin_user, student_user, sample_book_and_copy):
    book, copy = sample_book_and_copy
    loan = borrow_direct(student_user.card_code, copy.barcode, admin_user)

    returned_loan, fines = return_loan(
        loan.id,
        condition=ReturnCondition.DAMAGED,
        damage_level=DamageLevel.LIGHT,
        admin_user=admin_user
    )
    assert returned_loan.status == LoanStatus.RETURNED
    assert len(fines) == 1
    dmg_fine = fines[0]
    assert dmg_fine.type == FineType.DAMAGE
    # Light damage = 20% of 150.000 = 30.000 VND
    assert dmg_fine.amount == 30000

    copy.refresh_from_db()
    assert copy.status == CopyStatus.DAMAGED

@pytest.mark.django_db
def test_return_br07_br14_mark_lost(admin_user, student_user, sample_book_and_copy):
    book, copy = sample_book_and_copy
    loan = borrow_direct(student_user.card_code, copy.barcode, admin_user)

    lost_loan, fines = return_loan(
        loan.id,
        condition=ReturnCondition.LOST,
        admin_user=admin_user
    )
    assert lost_loan.status == LoanStatus.LOST
    assert lost_loan.lost_at is not None

    lost_fine = [f for f in fines if f.type == FineType.LOST][0]
    # Price 150.000 + fee 30.000 = 180.000 VND
    assert lost_fine.amount == 180000

    copy.refresh_from_db()
    assert copy.status == CopyStatus.LOST

@pytest.mark.django_db
def test_renew_br05_success_and_limits(admin_user, student_user, sample_book_and_copy):
    _, copy = sample_book_and_copy
    loan = borrow_direct(student_user.card_code, copy.barcode, admin_user)
    initial_due = loan.due_at

    # 1st renewal - succeeds and adds 7 days
    renewed = renew_loan(loan.id, student_user)
    assert renewed.renewal_count == 1
    assert renewed.due_at.date() == initial_due.date() + timedelta(days=7)

    # 2nd renewal - rejected (RENEWAL_LIMIT_REACHED)
    with pytest.raises(BusinessLogicError) as exc:
        renew_loan(loan.id, student_user)
    assert exc.value.code == 'RENEWAL_LIMIT_REACHED'

@pytest.mark.django_db
def test_fine_partial_and_full_payment(admin_user, student_user):
    fine = Fine.objects.create(
        user=student_user,
        type=FineType.OVERDUE,
        amount=20000,
        paid_amount=0,
        status=FineStatus.UNPAID
    )

    # 1. Partial payment: 5.000đ
    collect_fine(fine.id, 5000, admin_user)
    fine.refresh_from_db()
    assert fine.paid_amount == 5000
    assert fine.status == FineStatus.PARTIAL
    assert fine.remaining_amount == 15000

    # 2. Overpayment attempt: 20.000đ (> remaining 15.000đ) -> rejected
    with pytest.raises(BusinessLogicError) as exc:
        collect_fine(fine.id, 20000, admin_user)
    assert exc.value.code == 'FINE_AMOUNT_INVALID'

    # 3. Pay remaining 15.000đ -> fully paid
    collect_fine(fine.id, 15000, admin_user)
    fine.refresh_from_db()
    assert fine.paid_amount == 20000
    assert fine.status == FineStatus.PAID
    assert fine.remaining_amount == 0

@pytest.mark.django_db
def test_fine_waive_requires_reason(admin_user, student_user):
    fine = Fine.objects.create(
        user=student_user,
        type=FineType.OVERDUE,
        amount=10000,
        status=FineStatus.UNPAID
    )

    # Without reason -> rejected
    with pytest.raises(BusinessLogicError) as exc:
        waive_fine(fine.id, '', admin_user)
    assert exc.value.code == 'WAIVE_REASON_REQUIRED'

    # With reason -> waived
    waived = waive_fine(fine.id, 'Miễn phạt do có giấy chứng nhận y tế', admin_user)
    assert waived.status == FineStatus.WAIVED
    assert waived.waive_reason == 'Miễn phạt do có giấy chứng nhận y tế'
    assert waived.waived_by == admin_user

@pytest.mark.django_db
def test_fine_pay_online_success(student_user, lecturer_user):
    from rest_framework.test import APIClient
    from apps.core.enums import LockReason

    fine = Fine.objects.create(
        user=student_user,
        type=FineType.OVERDUE,
        amount=15000,
        status=FineStatus.UNPAID
    )
    student_user.is_locked = True
    student_user.lock_reason = LockReason.UNPAID_LOST_FINE
    student_user.save()

    client = APIClient()
    client.force_authenticate(user=student_user)

    res = client.post(f'/api/v1/fines/{fine.id}/pay-online', {'transaction_code': 'FT123456'})
    assert res.status_code == 200
    fine.refresh_from_db()
    assert fine.status == FineStatus.PAID
    assert fine.paid_amount == 15000

    student_user.refresh_from_db()
    assert student_user.is_locked is False

    # IDOR test: another patron cannot pay someone else's fine
    fine2 = Fine.objects.create(user=student_user, type=FineType.OVERDUE, amount=5000)
    client.force_authenticate(user=lecturer_user)
    res2 = client.post(f'/api/v1/fines/{fine2.id}/pay-online')
    assert res2.status_code == 403

@pytest.mark.django_db
def test_fine_pay_all_online_success(student_user):
    from rest_framework.test import APIClient

    Fine.objects.create(user=student_user, type=FineType.OVERDUE, amount=10000, status=FineStatus.UNPAID)
    Fine.objects.create(user=student_user, type=FineType.OVERDUE, amount=5000, status=FineStatus.UNPAID)

    client = APIClient()
    client.force_authenticate(user=student_user)

    res = client.post('/api/v1/fines/pay-all-online', {'transaction_code': 'ALL_VCB_999'})
    assert res.status_code == 200
    assert res.data['total_paid'] == 15000
    assert res.data['count'] == 2

    assert Fine.objects.filter(user=student_user, status=FineStatus.UNPAID).count() == 0


