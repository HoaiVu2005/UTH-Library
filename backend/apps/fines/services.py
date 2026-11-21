from django.db import transaction
from apps.core.exceptions import BusinessLogicError
from apps.core.enums import FineStatus, LockReason
from apps.accounts.models import User
from apps.audit.services import log_action
from .models import Fine, FinePayment

def check_auto_unlock_user(user: User):
    # BR24: Tự mở khóa khi mọi Fine liên quan paid/waived
    if user.lock_reason == LockReason.UNPAID_LOST_FINE:
        has_remaining_fines = Fine.objects.filter(
            user=user,
            status__in=[FineStatus.UNPAID, FineStatus.PARTIAL]
        ).exists()
        if not has_remaining_fines:
            user.is_locked = False
            user.locked_until = None
            user.lock_reason = None
            user.save(update_fields=['is_locked', 'locked_until', 'lock_reason'])

def collect_fine(fine_id: int, amount: int, collected_by: User, note: str | None = None, request=None) -> Fine:
    with transaction.atomic():
        fine = Fine.objects.select_for_update().select_related('user').filter(id=fine_id).first()
        if not fine:
            raise BusinessLogicError('NOT_FOUND', detail='Không tìm thấy khoản phạt yêu cầu.')

        if fine.status in [FineStatus.PAID, FineStatus.WAIVED]:
            raise BusinessLogicError('FINE_ALREADY_PAID', detail='Khoản phạt này đã được thanh toán hoặc đã được miễn giảm.')

        if amount <= 0:
            raise BusinessLogicError('FINE_AMOUNT_INVALID', detail='Số tiền nộp phải lớn hơn 0.')

        remaining = fine.remaining_amount
        if amount > remaining:
            raise BusinessLogicError(
                'FINE_AMOUNT_INVALID',
                detail=f'Số tiền thu ({amount:,}đ) vượt quá số nợ còn lại ({remaining:,}đ).'
            )

        fine.paid_amount += amount
        if fine.paid_amount >= fine.amount:
            fine.status = FineStatus.PAID
        else:
            fine.status = FineStatus.PARTIAL
        fine.save(update_fields=['paid_amount', 'status'])

        payment = FinePayment.objects.create(
            fine=fine,
            amount=amount,
            collected_by=collected_by,
            note=note,
        )

        check_auto_unlock_user(fine.user)

        log_action(
            user=collected_by,
            action='COLLECT_FINE',
            entity_type='Fine',
            entity_id=fine.id,
            detail={'amount_collected': amount, 'paid_amount': fine.paid_amount, 'status': fine.status},
            request=request
        )

        return fine

def waive_fine(fine_id: int, reason: str, waived_by: User, request=None) -> Fine:
    with transaction.atomic():
        if not reason or not reason.strip():
            raise BusinessLogicError('WAIVE_REASON_REQUIRED', detail='Bắt buộc phải nhập lý do miễn giảm khoản phạt.')

        fine = Fine.objects.select_for_update().select_related('user').filter(id=fine_id).first()
        if not fine:
            raise BusinessLogicError('NOT_FOUND', detail='Không tìm thấy khoản phạt yêu cầu.')

        if fine.status in [FineStatus.PAID, FineStatus.WAIVED]:
            raise BusinessLogicError('FINE_ALREADY_PAID', detail='Khoản phạt này đã được hoàn tất trước đó.')

        fine.status = FineStatus.WAIVED
        fine.waive_reason = reason.strip()
        fine.waived_by = waived_by
        fine.save(update_fields=['status', 'waive_reason', 'waived_by'])

        check_auto_unlock_user(fine.user)

        log_action(
            user=waived_by,
            action='WAIVE_FINE',
            entity_type='Fine',
            entity_id=fine.id,
            detail={'reason': reason},
            request=request
        )

        return fine

