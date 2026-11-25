from django.db.models import Sum
from django.utils import timezone

from apps.circulation.models import Loan
from apps.core.enums import FineStatus, LoanStatus, ReservationStatus
from apps.fines.models import Fine
from apps.reservations.models import Reservation

from .roles import get_ai_role_profile


def get_patron_context(user) -> dict:
    """
    Truy vấn dữ liệu mượn trả và quyền lợi thực tế của Bạn đọc (Sinh viên / Giảng viên)
    để UTHie AI tư vấn cá nhân hóa chính xác tuyệt đối.
    """
    if not user:
        return None
    try:
        now = timezone.now()
        role_profile = get_ai_role_profile(getattr(user, 'role', 'student'))
        role_label = "Giảng viên" if role_profile.key == 'lecturer' else "Sinh viên"

        # Sách đang mượn của chính bạn đọc này
        active_loans = Loan.objects.filter(user=user, status=LoanStatus.ACTIVE).select_related('book', 'copy')
        loans_info = []
        overdue_count = 0
        for l in active_loans:
            is_overdue = l.due_at < now
            if is_overdue:
                overdue_count += 1
                diff_days = max(1, (now - l.due_at).days)
                fine = diff_days * 2000
                status_str = f"ĐÃ QUÁ HẠN {diff_days} ngày (Phí phạt tạm tính: {fine:,} VNĐ)"
            else:
                remaining_days = max(0, (l.due_at - now).days)
                status_str = f"Còn {remaining_days} ngày (Hạn trả: {l.due_at.strftime('%d/%m/%Y')})"

            loans_info.append({
                "book_title": l.book.title,
                "barcode": l.copy.barcode,
                "borrowed_at": l.borrowed_at.strftime("%d/%m/%Y") if l.borrowed_at else "",
                "due_at": l.due_at.strftime("%d/%m/%Y"),
                "status_str": status_str,
                "is_overdue": is_overdue,
                "renew_count": getattr(l, 'renewal_count', 0),
                "can_renew": getattr(l, 'renewal_count', 0) < 1 and not is_overdue,
            })

        # Phiếu phạt chưa thanh toán
        unpaid_fines = Fine.objects.filter(user=user, status=FineStatus.UNPAID)
        unpaid_amount = unpaid_fines.aggregate(s=Sum('amount'))['s'] or 0

        # Sách mượn sách đang chờ
        reservations = Reservation.objects.filter(
            user=user,
            status__in=[ReservationStatus.PENDING, ReservationStatus.READY]
        ).select_related('book')
        res_info = []
        for r in reservations:
            status_desc = "Đã có sẵn tại Quầy lưu thông (nhận trong 48h)" if r.status == ReservationStatus.READY else "Đang chờ độc giả khác trả sách"
            res_info.append({
                "book_title": r.book.title,
                "status_desc": status_desc
            })

        return {
            "name": user.full_name or user.username,
            "card_code": user.card_code or "",
            "role": role_profile.key,
            "role_label": role_label,
            "department": getattr(user, 'department', '') or "Đại học Giao thông Vận tải TP.HCM",
            "is_locked": getattr(user, 'is_locked', False),
            "active_loans": loans_info,
            "active_loans_count": len(loans_info),
            "overdue_count": overdue_count,
            "max_borrow_limit": role_profile.borrow_limit,
            "max_borrow_days": role_profile.borrow_days,
            "unpaid_fines_count": unpaid_fines.count(),
            "unpaid_amount": unpaid_amount,
            "reservations": res_info,
        }
    except Exception as e:
        print(f"[Patron Context Error]: {e}")
        return None
