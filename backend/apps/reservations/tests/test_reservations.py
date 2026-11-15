from datetime import timedelta
import pytest
from django.utils import timezone
from django.core.management import call_command

from apps.accounts.models import User
from apps.core.models import Policy, SystemConfig
from apps.core.enums import (
    UserRole,
    CopyStatus,
    LoanStatus,
    ReservationStatus,
    NotificationType,
)
from apps.core.exceptions import BusinessLogicError
from apps.catalog.models import Category, Book, Copy
from apps.circulation.models import Loan
from apps.reservations.models import Reservation
from apps.notifications.models import Notification
from apps.reservations.services import (
    create_reservation,
    cancel_reservation,
    record_no_show_and_check_lockout,
)

@pytest.fixture
def setup_data(db):
    SystemConfig.get_solo()
    Policy.objects.get_or_create(
        role=UserRole.STUDENT,
        defaults={
            'max_loans': 5,
            'loan_days': 14,
            'renewal_limit': 1,
            'renewal_days': 7,
            'fine_per_day': 2000,
            'hold_days': 3,
            'max_reservations_pending': 3,
            'max_ready_reservations': 3,
        }
    )

    cat, _ = Category.objects.get_or_create(code='CNTT', defaults={'name': 'Công nghệ thông tin'})
    book = Book.objects.create(
        title='Lập trình Python Nâng cao',
        category=cat,
        price=120000,
        year=2024
    )
    copy1 = Copy.objects.create(book=book, barcode='UTH-CNTT-000001', status=CopyStatus.AVAILABLE)
    copy2 = Copy.objects.create(book=book, barcode='UTH-CNTT-000002', status=CopyStatus.AVAILABLE)

    u1 = User.objects.create(
        username='sv_res_01',
        role=UserRole.STUDENT,
        card_code='SV_RES_01',
        card_expiry=timezone.localdate() + timedelta(days=365)
    )
    u1.set_password('Pass123')
    u1.save()

    u2 = User.objects.create(
        username='sv_res_02',
        role=UserRole.STUDENT,
        card_code='SV_RES_02',
        card_expiry=timezone.localdate() + timedelta(days=365)
    )
    u2.set_password('Pass123')
    u2.save()

    u3 = User.objects.create(
        username='sv_res_03',
        role=UserRole.STUDENT,
        card_code='SV_RES_03',
        card_expiry=timezone.localdate() + timedelta(days=365)
    )
    u3.set_password('Pass123')
    u3.save()

    return {
        'book': book,
        'copy1': copy1,
        'copy2': copy2,
        'u1': u1,
        'u2': u2,
        'u3': u3,
    }

def test_create_reservation_ready_when_copy_available(setup_data):
    u1 = setup_data['u1']
    book = setup_data['book']

    res = create_reservation(user=u1, book_id=book.id)
    assert res.status == ReservationStatus.READY
    assert res.copy is not None
    assert res.copy.status == CopyStatus.RESERVED_HOLD
    assert res.hold_expires_at is not None
    assert res.queue_position == 1

def test_create_reservation_pending_when_all_copies_borrowed(setup_data):
    book = setup_data['book']
    c1 = setup_data['copy1']
    c2 = setup_data['copy2']
    u1 = setup_data['u1']
    u2 = setup_data['u2']
    u3 = setup_data['u3']

    # Both copies are borrowed
    c1.status = CopyStatus.BORROWED
    c1.save()
    c2.status = CopyStatus.BORROWED
    c2.save()

    res1 = create_reservation(user=u1, book_id=book.id)
    assert res1.status == ReservationStatus.PENDING
    assert res1.queue_position == 1
    assert res1.copy is None

    res2 = create_reservation(user=u2, book_id=book.id)
    assert res2.status == ReservationStatus.PENDING
    assert res2.queue_position == 2
    assert res2.copy is None

def test_create_reservation_duplicate_rejected(setup_data):
    u1 = setup_data['u1']
    book = setup_data['book']

    create_reservation(user=u1, book_id=book.id)
    with pytest.raises(BusinessLogicError) as exc_info:
        create_reservation(user=u1, book_id=book.id)
    assert exc_info.value.code == 'RESERVATION_DUPLICATE'

def test_cancel_pending_reservation(setup_data):
    book = setup_data['book']
    c1 = setup_data['copy1']
    c2 = setup_data['copy2']
    u1 = setup_data['u1']

    c1.status = CopyStatus.BORROWED
    c1.save()
    c2.status = CopyStatus.BORROWED
    c2.save()

    res = create_reservation(user=u1, book_id=book.id)
    cancelled = cancel_reservation(res.id, u1)
    assert cancelled.status == ReservationStatus.CANCELLED
    assert cancelled.no_show_counted is False

def test_cancel_ready_reservation_counts_noshow(setup_data):
    u1 = setup_data['u1']
    book = setup_data['book']

    res = create_reservation(user=u1, book_id=book.id)
    assert res.status == ReservationStatus.READY
    cancelled = cancel_reservation(res.id, u1)
    assert cancelled.status == ReservationStatus.CANCELLED
    assert cancelled.no_show_counted is True
    # Copy was freed
    setup_data['copy1'].refresh_from_db()
    assert setup_data['copy1'].status in [CopyStatus.AVAILABLE, CopyStatus.RESERVED_HOLD]

def test_noshow_lockout_after_3_strikes(setup_data):
    u1 = setup_data['u1']
    book = setup_data['book']

    # Strike 1
    r1 = Reservation.objects.create(user=u1, book=book, status=ReservationStatus.READY, no_show_counted=True)
    record_no_show_and_check_lockout(u1)
    u1.refresh_from_db()
    assert u1.is_reservation_locked is False

    # Strike 2
    r2 = Reservation.objects.create(user=u1, book=book, status=ReservationStatus.READY, no_show_counted=True)
    record_no_show_and_check_lockout(u1)
    u1.refresh_from_db()
    assert u1.is_reservation_locked is False

    # Strike 3
    r3 = Reservation.objects.create(user=u1, book=book, status=ReservationStatus.READY, no_show_counted=True)
    record_no_show_and_check_lockout(u1)
    u1.refresh_from_db()
    assert u1.is_reservation_locked is True

    # Attempt to reserve while locked fails (BR19)
    with pytest.raises(BusinessLogicError) as exc_info:
        create_reservation(user=u1, book_id=book.id)
    assert exc_info.value.code == 'USER_NO_SHOW_LOCKED'

def test_expire_reservations_cron(setup_data):
    u1 = setup_data['u1']
    book = setup_data['book']
    c1 = setup_data['copy1']

    # Create a ready reservation that expired 1 hour ago
    c1.status = CopyStatus.RESERVED_HOLD
    c1.save()
    res = Reservation.objects.create(
        user=u1,
        book=book,
        copy=c1,
        status=ReservationStatus.READY,
        hold_expires_at=timezone.now() - timedelta(hours=1),
    )

    call_command('expire_reservations')

    res.refresh_from_db()
    assert res.status == ReservationStatus.EXPIRED
    assert res.no_show_counted is True
    c1.refresh_from_db()
    assert c1.status == CopyStatus.AVAILABLE

def test_cron_idempotency(setup_data):
    u1 = setup_data['u1']
    book = setup_data['book']
    c1 = setup_data['copy1']

    # Loan due in 1 day
    loan = Loan.objects.create(
        user=u1,
        copy=c1,
        book=book,
        due_at=timezone.now() + timedelta(days=1),
        status=LoanStatus.ACTIVE,
    )

    call_command('send_due_reminders')
    initial_notifs = Notification.objects.filter(user=u1, type=NotificationType.DUE_SOON).count()
    assert initial_notifs == 1

    # Running a second time should produce zero additional notifications
    call_command('send_due_reminders')
    second_notifs = Notification.objects.filter(user=u1, type=NotificationType.DUE_SOON).count()
    assert second_notifs == 1
