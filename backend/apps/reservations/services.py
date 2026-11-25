from datetime import timedelta
from django.db import transaction
from django.db.models import Max
from django.utils import timezone

from apps.core.exceptions import BusinessLogicError
from apps.core.enums import (
    CopyStatus,
    ReservationStatus,
    ReservationType,
    LoanStatus,
    FineStatus,
    NotificationType,
)
from apps.core.models import SystemConfig, Policy
from apps.accounts.models import User
from apps.catalog.models import Book, Copy
from apps.circulation.models import Loan
from apps.fines.models import Fine
from apps.notifications.models import Notification
from apps.audit.services import log_action
from apps.circulation.services import get_current_policy_for_user, process_reservation_queue_for_copy
from .models import Reservation

def create_reservation(user: User, book_id: int, request=None) -> Reservation:
    with transaction.atomic():
        book = Book.objects.filter(id=book_id, deleted_at__isnull=True).first()
        if not book:
            raise BusinessLogicError('NOT_FOUND', detail='Không tìm thấy đầu sách yêu cầu.')

        # BR01 & BR20: Check card validity & lock
        if not user.is_active or user.deleted_at is not None:
            raise BusinessLogicError('USER_LOCKED', detail='Tài khoản không hoạt động hoặc đã bị xóa.')
        if not user.is_card_valid:
            raise BusinessLogicError('USER_EXPIRED', detail='Thẻ bạn đọc đã hết hạn sử dụng. Không thể mượn sách / chờ nhận sách.')
        if user.is_currently_locked:
            raise BusinessLogicError('USER_LOCKED', detail='Tài khoản bạn đọc đang bị tạm khóa.')

        # BR03: Check overdue loans
        has_overdue = Loan.objects.filter(
            user=user,
            status=LoanStatus.ACTIVE,
            due_at__lt=timezone.now()
        ).exists()
        if has_overdue:
            raise BusinessLogicError('RESERVATION_HAS_OVERDUE', detail='Bạn đang có sách mượn quá hạn chưa trả. Không thể mượn sách.')

        # BR03: Check unpaid fines
        has_unpaid_fines = Fine.objects.filter(
            user=user,
            status__in=[FineStatus.UNPAID, FineStatus.PARTIAL]
        ).exists()
        if has_unpaid_fines:
            raise BusinessLogicError('LOAN_HAS_UNPAID_FINE', detail='Bạn đang có khoản tiền phạt chưa thanh toán.')

        # BR04: Check if user already borrows or has ready/pending reservation for this book
        has_active_loan = Loan.objects.filter(
            user=user,
            book=book,
            status=LoanStatus.ACTIVE
        ).exists()
        if has_active_loan:
            raise BusinessLogicError('LOAN_DUPLICATE_BOOK', detail='Bạn đang mượn một bản của đầu sách này rồi.')

        # BR17: Check duplicate reservation on same book
        existing_res = Reservation.objects.filter(
            user=user,
            book=book,
            status__in=[ReservationStatus.PENDING, ReservationStatus.READY]
        ).exists()
        if existing_res:
            raise BusinessLogicError('RESERVATION_DUPLICATE', detail='Bạn đã có một yêu cầu mượn sách hoặc chờ nhận sách cho đầu sách này.')

        # Check all copies: if ONLY reading room copies exist -> reject (BR08)
        all_copies = Copy.objects.filter(book=book, deleted_at__isnull=True)
        if not all_copies.exists():
            raise BusinessLogicError('NOT_FOUND', detail='Đầu sách này hiện chưa có bản sao nào trong thư viện.')

        home_copies = all_copies.filter(reading_room_only=False)
        if not home_copies.exists():
            raise BusinessLogicError('COPY_READING_ROOM_ONLY', detail='Đầu sách này chỉ phục vụ đọc tại chỗ, không cho phép mượn về nhà hoặc mượn sách.')

        policy = get_current_policy_for_user(user)

        # Look for available copy for "CHỜ NHẬN SÁCH" (ready immediately)
        available_copy = home_copies.filter(
            status=CopyStatus.AVAILABLE
        ).select_for_update().first()

        now = timezone.now()

        if available_copy:
            # Check loan quota for READY reservation (BR02: Loan active + Reservation ready < max_loans)
            active_loans_count = Loan.objects.filter(user=user, status=LoanStatus.ACTIVE).count()
            ready_res_count = Reservation.objects.filter(user=user, status=ReservationStatus.READY).count()
            if (active_loans_count + ready_res_count) >= policy.max_loans:
                raise BusinessLogicError(
                    'LOAN_LIMIT_REACHED',
                    detail=f'Bạn đã đạt giới hạn mượn và chờ nhận sách tối đa ({policy.max_loans} cuốn).'
                )

            # Create Reservation READY
            hold_days = policy.hold_days or 3
            hold_date = timezone.localdate() + timedelta(days=hold_days)
            hold_expires_at = timezone.make_aware(
                timezone.datetime.combine(hold_date, timezone.datetime.max.time()),
                timezone.get_current_timezone()
            )

            reservation = Reservation.objects.create(
                user=user,
                book=book,
                copy=available_copy,
                status=ReservationStatus.READY,
                ready_at=now,
                hold_expires_at=hold_expires_at,
                queue_position=1,
            )

            # Hold copy
            available_copy.status = CopyStatus.RESERVED_HOLD
            available_copy.held_for_user = user
            available_copy.hold_expires_at = hold_expires_at
            available_copy.save(update_fields=['status', 'held_for_user', 'hold_expires_at'])

            # Send Notification
            Notification.objects.create(
                user=user,
                type=NotificationType.RESERVATION_READY,
                content=f'Mượn sách thành công! Sách "{book.title}" đã được chuẩn bị sẵn sàng cho bạn tại Quầy lưu thông. Vui lòng đến nhận trước 23:59 ngày {hold_date.strftime("%d/%m/%Y")}.',
                link='/reservations'
            )

            log_action(
                user=user,
                action='HOLD_RESERVATION_READY',
                entity_type='Reservation',
                entity_id=reservation.id,
                detail={'book': book.title, 'barcode': available_copy.barcode, 'hold_expires_at': hold_expires_at.isoformat()},
                request=request
            )

            return reservation

        else:
            # No available copy -> "MƯỢN SÁCH" (pending into queue)
            # BR16: Max pending reservations limit
            current_pending = Reservation.objects.filter(
                user=user,
                status=ReservationStatus.PENDING
            ).count()
            if current_pending >= policy.max_reservations_pending:
                raise BusinessLogicError(
                    'RESERVATION_LIMIT_REACHED',
                    detail=f'Bạn đã đạt số lượng mượn sách tối đa đang chờ ({policy.max_reservations_pending} cuốn).'
                )

            max_pos = Reservation.objects.filter(
                book=book,
                status=ReservationStatus.PENDING
            ).aggregate(Max('queue_position'))['queue_position__max'] or 0

            reservation = Reservation.objects.create(
                user=user,
                book=book,
                copy=None,
                status=ReservationStatus.PENDING,
                queue_position=max_pos + 1,
            )

            log_action(
                user=user,
                action='CREATE_RESERVATION_PENDING',
                entity_type='Reservation',
                entity_id=reservation.id,
                detail={'book': book.title, 'queue_position': reservation.queue_position},
                request=request
            )

            return reservation

def record_no_show_and_check_lockout(user: User):
    """
    BR19: No-show = (a) ready quá hạn, hoặc (b) chủ động hủy ready.
    Đạt noshow_limit (3) lần trong noshow_window_days (90) thì khóa toàn bộ
    quyền mượn trong noshow_lock_days. Hệ thống chỉ có một trạng thái khóa mượn.
    """
    config = SystemConfig.get_solo()
    now = timezone.now()
    window_start = now - timedelta(days=config.noshow_window_days)

    no_show_count = Reservation.objects.filter(
        user=user,
        no_show_counted=True,
        updated_at__gte=window_start
    ).count()

    if no_show_count >= config.noshow_limit:
        user.is_locked = True
        user.lock_reason = 'no_show_threshold'
        user.locked_until = now + timedelta(days=config.noshow_lock_days)
        user.save(update_fields=['is_locked', 'lock_reason', 'locked_until'])

        Notification.objects.create(
            user=user,
            type=NotificationType.OVERDUE,
            content=f'Quyền mượn sách của bạn đã bị khóa {config.noshow_lock_days} ngày do có {no_show_count} lần không đến nhận sách đã đăng ký đúng hẹn.',
            link='/reservations'
        )

def cancel_reservation(reservation_id: int, user: User, request=None) -> Reservation:
    with transaction.atomic():
        reservation = Reservation.objects.select_for_update().filter(
            id=reservation_id
        ).first()

        if not reservation:
            raise BusinessLogicError('NOT_FOUND', detail='Yêu cầu mượn sách không tồn tại.')

        # Permission check
        if user.role != 'admin' and reservation.user_id != user.id:
            raise BusinessLogicError('FORBIDDEN', detail='Bạn chỉ có thể hủy yêu cầu mượn sách của chính mình.')

        if reservation.status not in [ReservationStatus.PENDING, ReservationStatus.READY]:
            raise BusinessLogicError('CONFLICT', detail=f'Không thể hủy yêu cầu ở trạng thái "{reservation.get_status_display()}".')

        old_status = reservation.status
        reservation.status = ReservationStatus.CANCELLED
        reservation.cancel_reason = f'Hủy bởi {user.username}'

        if old_status == ReservationStatus.READY:
            # BR19: Hủy khi đã ready tính 1 no-show
            reservation.no_show_counted = True
            reservation.save(update_fields=['status', 'cancel_reason', 'no_show_counted'])

            record_no_show_and_check_lockout(reservation.user)

            # Release copy to next in queue
            if reservation.copy:
                copy = Copy.objects.select_for_update().get(id=reservation.copy.id)
                process_reservation_queue_for_copy(copy)
        else:
            # Pending cancellation has no penalty
            reservation.save(update_fields=['status', 'cancel_reason'])

        log_action(
            user=user,
            action='CANCEL_RESERVATION',
            entity_type='Reservation',
            entity_id=reservation.id,
            detail={'old_status': old_status, 'no_show_counted': reservation.no_show_counted},
            request=request
        )

        return reservation

def advance_reservation(reservation_id: int, admin_user: User, request=None) -> Reservation:
    """Admin manually moves a pending reservation to the front of the queue"""
    with transaction.atomic():
        reservation = Reservation.objects.select_for_update().filter(
            id=reservation_id,
            status=ReservationStatus.PENDING
        ).first()

        if not reservation:
            raise BusinessLogicError('NOT_FOUND', detail='Không tìm thấy yêu cầu mượn sách đang chờ.')

        reservation.queue_position = 1
        reservation.save(update_fields=['queue_position'])

        log_action(
            user=admin_user,
            action='ADVANCE_RESERVATION',
            entity_type='Reservation',
            entity_id=reservation.id,
            request=request
        )

        return reservation

def expire_stale_reservations(admin_user: User = None, request=None) -> dict:
    """
    Tự động quét và hủy các yêu cầu mượn sách (chờ nhận sách) đã quá thời hạn 3 ngày tại quầy
    mà bạn đọc không đến nhận. Bản sao sách sẽ được chuyển tiếp tự động cho bạn đọc
    kế tiếp trong hàng chờ, hoặc chuyển về trạng thái sẵn sàng (available) nếu không còn ai.
    """
    now = timezone.now()
    hold_days = 3

    expired_count = 0
    forwarded_count = 0
    expired_ids = []

    stale_reservations = Reservation.objects.filter(
        status=ReservationStatus.READY
    ).select_related('copy', 'book', 'user')

    for res in stale_reservations:
        deadline = res.hold_expires_at or (res.ready_at + timedelta(days=hold_days) if res.ready_at else res.created_at + timedelta(days=hold_days))
        if deadline <= now:
            with transaction.atomic():
                locked_res = Reservation.objects.select_for_update().filter(id=res.id, status=ReservationStatus.READY).first()
                if not locked_res:
                    continue

                locked_res.status = ReservationStatus.EXPIRED
                locked_res.cancel_reason = f'Tự động hủy do quá hạn nhận sách ({hold_days} ngày) tại quầy.'
                record_no_show_and_check_lockout(locked_res.user)
                locked_res.save(update_fields=['status', 'cancel_reason', 'no_show_counted'])

                has_next_in_queue = False
                if locked_res.copy:
                    copy = Copy.objects.select_for_update().get(id=locked_res.copy.id)
                    next_pending = Reservation.objects.filter(
                        book_id=locked_res.book_id,
                        status=ReservationStatus.PENDING
                    ).exists()
                    if next_pending:
                        has_next_in_queue = True
                        forwarded_count += 1
                    process_reservation_queue_for_copy(copy)

                log_action(
                    user=admin_user or locked_res.user,
                    action='EXPIRE_RESERVATION',
                    entity_type='Reservation',
                    entity_id=locked_res.id,
                    detail={
                        'reason': locked_res.cancel_reason,
                        'copy_id': locked_res.copy_id,
                        'forwarded_to_next': has_next_in_queue
                    },
                    request=request
                )

                expired_count += 1
                expired_ids.append(locked_res.id)

    return {
        'expired_count': expired_count,
        'forwarded_count': forwarded_count,
        'expired_ids': expired_ids
    }

