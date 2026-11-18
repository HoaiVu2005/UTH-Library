from django.db.models import Count, Q, Sum
from django.utils import timezone

from apps.catalog.models import Book, Copy
from apps.circulation.models import Loan
from apps.core.enums import (
    CopyStatus,
    FineStatus,
    LoanStatus,
    NotificationChannel,
    NotificationType,
    ReservationStatus,
)
from apps.fines.models import Fine
from apps.notifications.models import Notification
from apps.reservations.models import Reservation


def get_admin_library_statistics():
    """
    Truy vấn trực tiếp số liệu lưu thông thực tế từ Database UTH cho Quản trị viên/Thủ thư.
    """
    try:
        now = timezone.now()
        # 1. Sách đang mượn & quá hạn
        active_loans = Loan.objects.filter(status=LoanStatus.ACTIVE).select_related('book', 'user', 'copy')
        active_loans_count = active_loans.count()
        overdue_loans_qs = active_loans.filter(due_at__lt=now)
        overdue_loans_count = overdue_loans_qs.count()

        # Phân loại theo đối tượng mượn: Giảng viên vs Sinh viên
        lecturer_loans = active_loans.filter(user__role='lecturer')
        student_loans = active_loans.filter(user__role='student')

        # Chi tiết giảng viên đang mượn sách
        lecturer_borrowers = []
        for l in lecturer_loans:
            is_overdue = l.due_at < now
            diff_days = (now - l.due_at).days if is_overdue else 0
            lecturer_borrowers.append({
                "loan_id": l.id,
                "user_id": l.user.id,
                "name": l.user.full_name or l.user.username,
                "card_code": l.user.card_code or "",
                "department": getattr(l.user, 'department', '') or "Khoa / Bộ môn UTH",
                "book_title": l.book.title,
                "barcode": l.copy.barcode,
                "borrowed_at": l.borrowed_at.strftime("%d/%m/%Y") if l.borrowed_at else "",
                "due_at": l.due_at.strftime("%d/%m/%Y"),
                "is_overdue": is_overdue,
                "overdue_days": diff_days,
                "renew_count": getattr(l, 'renewal_count', 0),
            })

        # Chi tiết danh sách bạn đọc mượn quá hạn
        overdue_students = []
        for l in overdue_loans_qs:
            diff_days = max(1, (now - l.due_at).days)
            est_fine = diff_days * 2000
            overdue_students.append({
                "loan_id": l.id,
                "user_id": l.user.id,
                "student_name": l.user.full_name or l.user.username,
                "card_code": l.user.card_code or "",
                "department": getattr(l.user, 'department', '') or "Sinh viên UTH",
                "book_title": l.book.title,
                "barcode": l.copy.barcode,
                "due_at": l.due_at.strftime("%d/%m/%Y"),
                "overdue_days": diff_days,
                "est_fine": est_fine,
            })

        # 2. Tổng kho bản sao sách
        total_copies = Copy.objects.count()
        available_copies = Copy.objects.filter(status=CopyStatus.AVAILABLE).count()
        borrowed_copies = Copy.objects.filter(status=CopyStatus.BORROWED).count()
        reserved_copies = Copy.objects.filter(status=CopyStatus.RESERVED_HOLD).count()
        damaged_copies = Copy.objects.filter(status=CopyStatus.DAMAGED).count()
        lost_copies = Copy.objects.filter(status=CopyStatus.LOST).count()

        # 3. Tiền phạt
        unpaid_fines = Fine.objects.filter(status=FineStatus.UNPAID)
        unpaid_fines_count = unpaid_fines.count()
        total_unpaid_amount = unpaid_fines.aggregate(s=Sum('amount'))['s'] or 0

        # Danh sách chi tiết các phiếu phạt chưa nộp
        unpaid_fines_list = []
        for f in unpaid_fines.select_related('user', 'loan', 'loan__book').order_by('-created_at')[:15]:
            unpaid_fines_list.append({
                "id": f.id,
                "student_name": f.user.full_name or f.user.username,
                "card_code": f.user.card_code or "",
                "amount": f.amount,
                "paid_amount": f.paid_amount,
                "remaining_amount": f.amount - f.paid_amount,
                "type": f.type,
                "book_title": f.loan.book.title if f.loan and f.loan.book else "Vi phạm quy chế mượn trả",
                "created_at": f.created_at.strftime("%d/%m/%Y") if hasattr(f, 'created_at') and f.created_at else "",
            })

        # 4. Đặt trước đang chờ
        pending_reservations = Reservation.objects.filter(status__in=[ReservationStatus.PENDING, ReservationStatus.READY]).count()

        # 5. Sách gần hết bản sao (available <= 1)
        low_stock_books = []
        for b in Book.objects.annotate(
            avail_cnt=Count('copies', filter=Q(copies__status=CopyStatus.AVAILABLE)),
            total_cnt=Count('copies')
        ).filter(total_cnt__gt=0, avail_cnt__lte=1).order_by('avail_cnt')[:8]:
            low_stock_books.append({
                "id": b.id,
                "title": b.title,
                "available_copies": b.avail_cnt,
                "total_copies": b.total_cnt,
                "category": b.category.name if b.category else "Tổng hợp",
            })

        # 6. Top sách được mượn nhiều nhất
        top_borrowed_books = []
        for tb in Loan.objects.values('book__id', 'book__title', 'book__category__name').annotate(
            total_loans=Count('id')
        ).order_by('-total_loans')[:6]:
            top_borrowed_books.append({
                "id": tb['book__id'],
                "title": tb['book__title'],
                "category": tb['book__category__name'] or "Chung",
                "total_loans": tb['total_loans'],
            })

        # 7. Bản sao bị hư hỏng & báo mất
        issue_copies_list = []
        for c in Copy.objects.filter(status__in=[CopyStatus.DAMAGED, CopyStatus.LOST]).select_related('book').order_by('-updated_at')[:8]:
            issue_copies_list.append({
                "id": c.id,
                "barcode": c.barcode,
                "book_title": c.book.title,
                "status": "Hư hỏng" if c.status == CopyStatus.DAMAGED else "Báo mất",
                "status_code": c.status,
            })

        # 8. Người dùng bị khóa thẻ & Đề xuất mua sách
        from apps.accounts.models import User
        from apps.suggestions.models import Suggestion
        locked_users_count = User.objects.filter(is_locked=True).count()
        pending_suggestions_count = Suggestion.objects.filter(status='pending').count()

        return {
            "active_loans_count": active_loans_count,
            "overdue_loans_count": overdue_loans_count,
            "lecturer_active_loans_count": lecturer_loans.count(),
            "student_active_loans_count": student_loans.count(),
            "lecturer_borrowers": lecturer_borrowers,
            "total_copies": total_copies,
            "available_copies": available_copies,
            "borrowed_copies": borrowed_copies,
            "reserved_copies": reserved_copies,
            "damaged_copies": damaged_copies,
            "lost_copies": lost_copies,
            "unpaid_fines_count": unpaid_fines_count,
            "total_unpaid_amount": total_unpaid_amount,
            "pending_reservations": pending_reservations,
            "overdue_students": overdue_students,
            "unpaid_fines_list": unpaid_fines_list,
            "low_stock_books": low_stock_books,
            "top_borrowed_books": top_borrowed_books,
            "issue_copies_list": issue_copies_list,
            "locked_users_count": locked_users_count,
            "pending_suggestions_count": pending_suggestions_count,
        }
    except Exception as e:
        print(f"[Admin Stats Error]: {e}")
        return None

def send_overdue_notice_to_student(loan_id: int):
    """
    Tạo thông báo trực tiếp vào tài khoản sinh viên mượn sách quá hạn.
    """
    try:
        loan = Loan.objects.select_related('book', 'user', 'copy').get(id=loan_id)
    except Loan.DoesNotExist:
        return {
            "success": False,
            "error": "Không tìm thấy lượt mượn.",
            "status_code": 404,
        }

    now = timezone.now()
    if loan.status != LoanStatus.ACTIVE:
        return {
            "success": False,
            "error": "Chỉ có thể nhắc các lượt mượn đang hoạt động.",
            "status_code": 400,
        }
    if loan.due_at >= now:
        return {
            "success": False,
            "error": "Lượt mượn này chưa quá hạn.",
            "status_code": 400,
        }

    try:
        diff_days = max(1, (now - loan.due_at).days)
        today_str = timezone.localdate().strftime('%Y%m%d_%H%M%S')
        dedupe_key = f"manual_ai_overdue_{loan.id}_{today_str}"
        content = f'⚠️ [Nhắc nhở từ Thư viện UTH]: Bạn đang mượn cuốn "{loan.book.title}" (Mã vạch: {loan.copy.barcode}) đã quá hạn {diff_days} ngày. Vui lòng đến Quầy lưu thông hoàn trả tài liệu để tránh phát sinh thêm phí phạt trễ hạn (2.000đ/ngày).'

        notif = Notification.objects.create(
            user=loan.user,
            type=NotificationType.OVERDUE,
            channel=NotificationChannel.IN_APP,
            content=content,
            link='/loans',
            is_read=False,
            dedupe_key=dedupe_key
        )
        return {
            "success": True,
            "student_name": loan.user.full_name,
            "card_code": loan.user.card_code,
            "book_title": loan.book.title,
            "message": f"Đã gửi thông báo nhắc nhở thành công đến tài khoản của sinh viên {loan.user.full_name} ({loan.user.card_code})!"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
