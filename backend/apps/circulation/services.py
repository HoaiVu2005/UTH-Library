from datetime import timedelta
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.core.exceptions import BusinessLogicError
from apps.core.enums import (
    CopyStatus,
    LoanStatus,
    ReturnCondition,
    ReservationStatus,
    DamageLevel,
    FineType,
    FineStatus,
    LockReason,
)
from apps.core.models import Policy, SystemConfig
from apps.accounts.models import User
from apps.catalog.models import Copy, Book
from apps.circulation.models import Loan
from apps.reservations.models import Reservation
from apps.fines.models import Fine
from apps.notifications.models import Notification
from apps.audit.services import log_action

def get_current_policy_for_user(user: User) -> Policy:
    policy = Policy.objects.filter(role=user.role, is_current=True).first()
    if not policy:
        # Fallback defaults if no policy created yet
        policy, _ = Policy.objects.get_or_create(
            role=user.role,
            is_current=True,
            defaults={
                'max_loans': 10 if user.role == 'lecturer' else 5,
                'loan_days': 30 if user.role == 'lecturer' else 14,
                'renewal_limit': 1,
                'renewal_days': 7,
                'fine_per_day': 2000,
                'hold_days': 3,
                'max_reservations_pending': 5 if user.role == 'lecturer' else 3,
            }
        )
    return policy

def validate_user_can_borrow(user: User, book: Book = None):
    # BR01 & BR20: User active, card valid, not locked
    if not user.is_active or user.deleted_at is not None:
        raise BusinessLogicError('USER_LOCKED', detail='Tài khoản bạn đọc không hoạt động hoặc đã bị xóa.')

    if not user.is_card_valid:
        raise BusinessLogicError('USER_EXPIRED', detail='Thẻ bạn đọc đã hết hạn sử dụng. Vui lòng gia hạn thẻ tại quầy.')

    if user.is_currently_locked:
        extra = {'locked_until': user.locked_until.isoformat()} if user.locked_until else {}
        raise BusinessLogicError('USER_LOCKED', detail='Tài khoản bạn đọc đang bị tạm khóa.', extra=extra)

    # BR03: Check overdue books
    has_overdue = Loan.objects.filter(
        user=user,
        status=LoanStatus.ACTIVE,
        due_at__lt=timezone.now()
    ).exists()
    if has_overdue:
        raise BusinessLogicError('LOAN_HAS_OVERDUE', detail='Bạn đọc có sách đang mượn quá hạn chưa trả.')

    # BR03: Check unpaid fines
    has_unpaid_fines = Fine.objects.filter(
        user=user,
        status__in=[FineStatus.UNPAID, FineStatus.PARTIAL]
    ).exists()
    if has_unpaid_fines:
        raise BusinessLogicError('LOAN_HAS_UNPAID_FINE', detail='Bạn đọc có khoản tiền phạt chưa hoàn tất nộp tại quầy.')

    # BR02: Loan limit = active loans + ready reservations
    policy = get_current_policy_for_user(user)
    active_loans_count = Loan.objects.filter(user=user, status=LoanStatus.ACTIVE).count()
    ready_reservations_qs = Reservation.objects.filter(user=user, status=ReservationStatus.READY)
    if book:
        # If user has a ready reservation for this exact book, it will be fulfilled right now
        ready_reservations_qs = ready_reservations_qs.exclude(book=book)
    ready_reservations_count = ready_reservations_qs.count()
    if (active_loans_count + ready_reservations_count) >= policy.max_loans:
        raise BusinessLogicError(
            'LOAN_LIMIT_REACHED',
            detail=f'Bạn đọc đã đạt giới hạn tối đa {policy.max_loans} cuốn (đang mượn: {active_loans_count}, đang giữ: {ready_reservations_count}).'
        )

    # BR04: Only 1 copy of the same book at a time
    if book:
        has_active_loan = Loan.objects.filter(
            user=user,
            book=book,
            status=LoanStatus.ACTIVE
        ).exists()
        if has_active_loan:
            raise BusinessLogicError('LOAN_DUPLICATE_BOOK', detail=f'Bạn đọc đang mượn một bản của đầu sách "{book.title}".')

def borrow_direct(patron_card_code: str, barcode: str, admin_user: User, request=None) -> Loan:
    with transaction.atomic():
        # Find patron
        patron = User.objects.filter(card_code=patron_card_code.strip(), deleted_at__isnull=True).first()
        if not patron:
            raise BusinessLogicError('USER_NOT_FOUND', detail=f'Không tìm thấy bạn đọc với mã thẻ {patron_card_code}.')

        # SELECT FOR UPDATE on Copy (BR12)
        copy = Copy.objects.select_for_update().select_related('book').filter(
            barcode=barcode.strip().upper(),
            deleted_at__isnull=True
        ).first()

        if not copy:
            raise BusinessLogicError('NOT_FOUND', detail=f'Không tìm thấy bản sao với mã vạch {barcode}.')

        # BR08: Reading room only cannot be borrowed home
        if copy.reading_room_only:
            raise BusinessLogicError('COPY_READING_ROOM_ONLY', detail='Bản sao này chỉ dành để đọc tại chỗ, không được mượn về nhà.')

        # Check availability or held for this exact patron
        if copy.status == CopyStatus.BORROWED:
            raise BusinessLogicError('COPY_ALREADY_BORROWED', detail='Bản sao này hiện đang được người khác mượn.')

        if copy.status == CopyStatus.RESERVED_HOLD:
            if copy.held_for_user_id != patron.id:
                raise BusinessLogicError('COPY_HELD_FOR_OTHER', detail='Bản sao này đang được giữ chỗ cho một bạn đọc khác.')
        elif copy.status != CopyStatus.AVAILABLE:
            raise BusinessLogicError('COPY_NOT_AVAILABLE', detail=f'Bản sao hiện đang ở trạng thái {copy.get_status_display()}, không thể mượn.')

        # Validate patron borrowing conditions
        validate_user_can_borrow(patron, book=copy.book)

        # Snapshot patron policy (BR22: apply patron's policy, created_by=admin)
        policy = get_current_policy_for_user(patron)
        now = timezone.now()
        # Due at 23:59:59 of (today + loan_days)
        due_date = timezone.localdate() + timedelta(days=policy.loan_days)
        due_at = timezone.make_aware(
            timezone.datetime.combine(due_date, timezone.datetime.max.time()),
            timezone.get_current_timezone()
        )

        loan = Loan.objects.create(
            user=patron,
            copy=copy,
            book=copy.book,
            borrowed_at=now,
            due_at=due_at,
            created_by=admin_user,
            status=LoanStatus.ACTIVE,
            fine_per_day_snapshot=policy.fine_per_day,
            loan_days_snapshot=policy.loan_days,
            renewal_limit_snapshot=policy.renewal_limit,
            book_price_snapshot=copy.book.price,
            processing_fee_snapshot=copy.book.processing_fee,
            policy_id_snapshot=policy.id,
        )

        # Update Copy status
        copy.status = CopyStatus.BORROWED
        copy.held_for_user = None
        copy.hold_expires_at = None
        copy.save(update_fields=['status', 'held_for_user', 'hold_expires_at'])

        # If patron had an active reservation for this book, fulfill it
        patron_res = Reservation.objects.filter(
            user=patron,
            book=copy.book,
            status__in=[ReservationStatus.READY, ReservationStatus.PENDING]
        )
        for r in patron_res:
            if r.copy and r.copy != copy and r.copy.status == CopyStatus.RESERVED_HOLD:
                r.copy.status = CopyStatus.AVAILABLE
                r.copy.held_for_user = None
                r.copy.hold_expires_at = None
                r.copy.save(update_fields=['status', 'held_for_user', 'hold_expires_at'])
            r.status = ReservationStatus.FULFILLED
            r.save(update_fields=['status'])

        log_action(
            user=admin_user,
            action='BORROW_DIRECT',
            entity_type='Loan',
            entity_id=loan.id,
            detail={'patron': patron.card_code, 'barcode': copy.barcode, 'due_at': due_at.isoformat()},
            request=request
        )

        return loan

def borrow_from_reservation(reservation_id: int, barcode: str, admin_user: User, request=None) -> Loan:
    with transaction.atomic():
        reservation = Reservation.objects.select_for_update().filter(
            id=reservation_id,
            status=ReservationStatus.READY
        ).first()

        if not reservation:
            raise BusinessLogicError('NOT_FOUND', detail='Không tìm thấy yêu cầu giữ chỗ đã sẵn sàng tương ứng.')

        if not reservation.copy_id:
            raise BusinessLogicError('CONFLICT', detail='Yêu cầu giữ chỗ chưa được gán bản sao.')

        copy = Copy.objects.select_for_update().select_related('book').get(id=reservation.copy_id)

        normalized_bc = barcode.strip().upper()
        if copy.barcode != normalized_bc:
            raise BusinessLogicError('CONFLICT', detail=f'Mã vạch quét ({normalized_bc}) không khớp với bản sao đã giữ ({copy.barcode}).')

        patron = reservation.user
        validate_user_can_borrow(patron, reservation.book)

        policy = get_current_policy_for_user(patron)
        now = timezone.now()
        due_date = timezone.localdate() + timedelta(days=policy.loan_days)
        due_at = timezone.make_aware(
            timezone.datetime.combine(due_date, timezone.datetime.max.time()),
            timezone.get_current_timezone()
        )

        loan = Loan.objects.create(
            user=patron,
            copy=copy,
            book=copy.book,
            borrowed_at=now,
            due_at=due_at,
            created_by=admin_user,
            status=LoanStatus.ACTIVE,
            fine_per_day_snapshot=policy.fine_per_day,
            loan_days_snapshot=policy.loan_days,
            renewal_limit_snapshot=policy.renewal_limit,
            book_price_snapshot=copy.book.price,
            processing_fee_snapshot=copy.book.processing_fee,
            policy_id_snapshot=policy.id,
        )

        copy.status = CopyStatus.BORROWED
        copy.held_for_user = None
        copy.hold_expires_at = None
        copy.save(update_fields=['status', 'held_for_user', 'hold_expires_at'])

        reservation.status = ReservationStatus.FULFILLED
        reservation.save(update_fields=['status'])

        log_action(
            user=admin_user,
            action='BORROW_FROM_RESERVATION',
            entity_type='Loan',
            entity_id=loan.id,
            detail={'patron': patron.card_code, 'barcode': copy.barcode},
            request=request
        )

        return loan

def return_loan(
    loan_id: int,
    condition: str = 'normal',
    damage_level: str = None,
    amount_override: int = None,
    note: str = None,
    admin_user: User = None,
    request=None
):
    with transaction.atomic():
        loan = Loan.objects.select_for_update().select_related('user', 'copy', 'book').filter(
            id=loan_id,
            status=LoanStatus.ACTIVE
        ).first()

        if not loan:
            raise BusinessLogicError('LOAN_ALREADY_RETURNED', detail='Phiếu mượn không tồn tại hoặc sách đã được trả/báo mất trước đó.')

        now = timezone.now()
        config = SystemConfig.get_solo()
        copy = Copy.objects.select_for_update().get(id=loan.copy.id)

        # Calculate overdue fine (BR13)
        # days_late = max(0, (ngày_trả − ngày_của_due_at) − overdue_grace_days)
        now_date = timezone.localdate()
        due_date = loan.due_at.astimezone(timezone.get_current_timezone()).date()
        raw_days_late = max(0, (now_date - due_date).days)
        days_late = max(0, raw_days_late - config.overdue_grace_days)

        overdue_fine_amount = days_late * loan.fine_per_day_snapshot
        created_fines = []

        if condition == ReturnCondition.NORMAL:
            loan.status = LoanStatus.RETURNED
            loan.returned_at = now
            loan.return_condition = ReturnCondition.NORMAL
            loan.handled_by = admin_user
            loan.note = note
            loan.save()

            # Create Overdue Fine if days_late > 0
            if overdue_fine_amount > 0:
                fine = Fine.objects.create(
                    loan=loan,
                    user=loan.user,
                    type=FineType.OVERDUE,
                    amount=overdue_fine_amount,
                    status=FineStatus.UNPAID,
                    note=f'Phạt trễ hạn {days_late} ngày ({loan.fine_per_day_snapshot:,}đ/ngày)',
                )
                created_fines.append(fine)

            # Check waiting queue for pending reservations (6.4 step 3)
            process_reservation_queue_for_copy(copy, admin_user)

        elif condition == ReturnCondition.DAMAGED:
            loan.status = LoanStatus.RETURNED
            loan.returned_at = now
            loan.return_condition = ReturnCondition.DAMAGED
            loan.handled_by = admin_user
            loan.note = note
            loan.save()

            if overdue_fine_amount > 0:
                fine = Fine.objects.create(
                    loan=loan,
                    user=loan.user,
                    type=FineType.OVERDUE,
                    amount=overdue_fine_amount,
                    status=FineStatus.UNPAID,
                    note=f'Phạt trễ hạn {days_late} ngày',
                )
                created_fines.append(fine)

            # BR15: Damage fine
            policy = Policy.objects.filter(id=loan.policy_id_snapshot).first() or get_current_policy_for_user(loan.user)
            pct_map = {
                DamageLevel.LIGHT: policy.damage_light_pct,
                DamageLevel.MEDIUM: policy.damage_medium_pct,
                DamageLevel.HEAVY: policy.damage_heavy_pct,
            }
            default_pct = pct_map.get(damage_level, 20)
            default_damage_amount = int((default_pct / 100) * loan.book_price_snapshot)

            damage_amount = default_damage_amount
            if amount_override is not None:
                if not note or not note.strip():
                    raise BusinessLogicError('DAMAGE_NOTE_REQUIRED', detail='Bắt buộc phải nhập ghi chú giải thích khi thay đổi số tiền phạt hư hỏng.')
                max_allowed = loan.book_price_snapshot + loan.processing_fee_snapshot
                if amount_override < 0 or amount_override > max_allowed:
                    raise BusinessLogicError('FINE_AMOUNT_INVALID', detail=f'Số tiền phạt hỏng phải từ 0 đến {max_allowed:,}đ (giá sách + phí xử lý).')
                damage_amount = amount_override

            dmg_fine = Fine.objects.create(
                loan=loan,
                user=loan.user,
                type=FineType.DAMAGE,
                amount=damage_amount,
                status=FineStatus.UNPAID,
                damage_level=damage_level or DamageLevel.LIGHT,
                note=note or f'Bồi thường hỏng sách mức {damage_level} ({default_pct}%)',
            )
            created_fines.append(dmg_fine)

            # Copy becomes DAMAGED
            copy.status = CopyStatus.DAMAGED
            copy.held_for_user = None
            copy.hold_expires_at = None
            copy.save(update_fields=['status', 'held_for_user', 'hold_expires_at'])

        elif condition == ReturnCondition.LOST:
            # BR07 & BR14: Loan lost, lost_at = now
            loan.status = LoanStatus.LOST
            loan.lost_at = now
            loan.return_condition = ReturnCondition.LOST
            loan.handled_by = admin_user
            loan.note = note
            loan.save()

            # Fine 1: Overdue until lost_at
            if overdue_fine_amount > 0:
                fine = Fine.objects.create(
                    loan=loan,
                    user=loan.user,
                    type=FineType.OVERDUE,
                    amount=overdue_fine_amount,
                    status=FineStatus.UNPAID,
                    note=f'Phạt trễ hạn {days_late} ngày tính đến thời điểm báo mất',
                )
                created_fines.append(fine)

            # Fine 2: Lost book compensation
            lost_fine_amount = loan.book_price_snapshot + loan.processing_fee_snapshot
            lost_fine = Fine.objects.create(
                loan=loan,
                user=loan.user,
                type=FineType.LOST,
                amount=lost_fine_amount,
                status=FineStatus.UNPAID,
                note=f'Đền bù mất sách ({loan.book_price_snapshot:,}đ) + Phí xử lý ({loan.processing_fee_snapshot:,}đ)',
            )
            created_fines.append(lost_fine)

            # Copy becomes LOST
            copy.status = CopyStatus.LOST
            copy.held_for_user = None
            copy.hold_expires_at = None
            copy.save(update_fields=['status', 'held_for_user', 'hold_expires_at'])

        log_action(
            user=admin_user,
            action='RETURN_LOAN',
            entity_type='Loan',
            entity_id=loan.id,
            detail={
                'condition': condition,
                'days_late': days_late,
                'fines_created': [f.id for f in created_fines]
            },
            request=request
        )

        return loan, created_fines

def renew_loan(loan_id: int, user: User, request=None) -> Loan:
    with transaction.atomic():
        loan = Loan.objects.select_for_update().select_related('user', 'copy', 'book').filter(
            id=loan_id,
            status=LoanStatus.ACTIVE
        ).first()

        if not loan:
            raise BusinessLogicError('NOT_FOUND', detail='Phiếu mượn không tồn tại hoặc sách đã được trả.')

        # If student/lecturer, they can only renew their own loan
        if user.role != 'admin' and loan.user_id != user.id:
            raise BusinessLogicError('FORBIDDEN', detail='Bạn chỉ có thể gia hạn phiếu mượn của chính mình.')

        # BR20: Card expired or user locked
        if not loan.user.is_card_valid:
            raise BusinessLogicError('USER_EXPIRED', detail='Thẻ bạn đọc đã hết hạn sử dụng. Không thể gia hạn sách.')
        if loan.user.is_currently_locked:
            raise BusinessLogicError('USER_LOCKED', detail='Tài khoản bạn đọc đang bị tạm khóa. Không thể gia hạn sách.')

        # BR05: Check already overdue
        if loan.is_overdue:
            raise BusinessLogicError('RENEWAL_OVERDUE', detail='Sách đã quá hạn trả. Vui lòng đến thư viện trả sách và nộp phạt trễ hạn.')

        # BR05: Check renewal limit snapshot
        if loan.renewal_count >= loan.renewal_limit_snapshot:
            raise BusinessLogicError('RENEWAL_LIMIT_REACHED', detail=f'Sách này đã đạt số lần gia hạn tối đa ({loan.renewal_limit_snapshot} lần).')

        # BR05: Check if book is reserved by others
        has_pending_reservation = Reservation.objects.filter(
            book=loan.book,
            status__in=[ReservationStatus.PENDING, ReservationStatus.READY]
        ).exclude(user=loan.user).exists()
        if has_pending_reservation:
            raise BusinessLogicError('RENEWAL_HAS_RESERVATION', detail='Không thể gia hạn vì đầu sách này đang có bạn đọc khác đặt trước trong hàng chờ.')

        # BR05 assumption: check unpaid fines
        has_unpaid_fines = Fine.objects.filter(
            user=loan.user,
            status__in=[FineStatus.UNPAID, FineStatus.PARTIAL]
        ).exists()
        if has_unpaid_fines:
            raise BusinessLogicError('LOAN_HAS_UNPAID_FINE', detail='Bạn đọc có khoản tiền phạt chưa thanh toán. Vui lòng nộp phạt trước khi gia hạn.')

        # Apply renewal days from policy snapshot
        policy = Policy.objects.filter(id=loan.policy_id_snapshot).first() or get_current_policy_for_user(loan.user)
        renewal_days = policy.renewal_days if policy else 7

        old_due = loan.due_at
        new_due_date = old_due.astimezone(timezone.get_current_timezone()).date() + timedelta(days=renewal_days)
        new_due_at = timezone.make_aware(
            timezone.datetime.combine(new_due_date, timezone.datetime.max.time()),
            timezone.get_current_timezone()
        )

        loan.due_at = new_due_at
        loan.renewal_count += 1
        loan.save(update_fields=['due_at', 'renewal_count'])

        log_action(
            user=user,
            action='RENEW_LOAN',
            entity_type='Loan',
            entity_id=loan.id,
            detail={'old_due_at': old_due.isoformat(), 'new_due_at': new_due_at.isoformat(), 'count': loan.renewal_count},
            request=request
        )

        return loan

def process_reservation_queue_for_copy(copy: Copy, admin_user: User = None):
    """
    Section 6.4 step 3:
    Khi trả sách bình thường mà có pending cùng đầu sách:
    Lần lượt xét từ người đầu hàng:
    - Nếu không đủ điều kiện (thẻ hết hạn / bị khóa / đang bị khóa đặt trước) -> Reservation -> cancelled (cancel_reason, thông báo, không tính no-show) và xét người kế tiếp;
    - Người đủ điều kiện -> ready, gán copy, reserved_hold, đặt hold_expires_at, thông báo.
    - Không còn ai -> copy available.
    """
    config = SystemConfig.get_solo()
    now = timezone.now()

    pending_reservations = Reservation.objects.select_for_update().filter(
        book=copy.book,
        status=ReservationStatus.PENDING
    ).order_by('queue_position', 'created_at')

    assigned = False
    for res in pending_reservations:
        patron = res.user
        # Check eligibility:
        ineligible_reason = None
        if not patron.is_active or patron.deleted_at is not None:
            ineligible_reason = 'Tài khoản bạn đọc không hoạt động'
        elif not patron.is_card_valid:
            ineligible_reason = 'Thẻ bạn đọc đã hết hạn sử dụng'
        elif patron.is_currently_locked:
            ineligible_reason = 'Tài khoản bạn đọc đang bị tạm khóa'
        elif patron.is_reservation_locked:
            ineligible_reason = 'Tài khoản bạn đọc đang bị khóa chức năng đặt trước do quá số lần no-show'

        if ineligible_reason:
            res.status = ReservationStatus.CANCELLED
            res.cancel_reason = f'Tự động hủy do bạn đọc không đủ điều kiện khi sách về ({ineligible_reason})'
            res.save(update_fields=['status', 'cancel_reason'])
            continue

        # Patron is eligible! Assign copy and set status to READY
        policy = get_current_policy_for_user(patron)
        hold_days = policy.hold_days or 3
        hold_date = timezone.localdate() + timedelta(days=hold_days)
        hold_expires_at = timezone.make_aware(
            timezone.datetime.combine(hold_date, timezone.datetime.max.time()),
            timezone.get_current_timezone()
        )

        res.status = ReservationStatus.READY
        res.copy = copy
        res.ready_at = now
        res.hold_expires_at = hold_expires_at
        res.save(update_fields=['status', 'copy', 'ready_at', 'hold_expires_at'])

        copy.status = CopyStatus.RESERVED_HOLD
        copy.held_for_user = patron
        copy.hold_expires_at = hold_expires_at
        copy.save(update_fields=['status', 'held_for_user', 'hold_expires_at'])

        # Create ready notification
        Notification.objects.create(
            user=patron,
            type='reservation_ready',
            content=f'Sách "{copy.book.title}" bạn đặt trước đã có sẵn tại quầy thư viện. Vui lòng đến nhận trước 23:59 ngày {hold_date.strftime("%d/%m/%Y")}.',
            link='/reservations'
        )

        assigned = True
        break

    if not assigned:
        copy.status = CopyStatus.AVAILABLE
        copy.held_for_user = None
        copy.hold_expires_at = None
        copy.save(update_fields=['status', 'held_for_user', 'hold_expires_at'])

