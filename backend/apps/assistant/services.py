import os
import json
import urllib.request
import urllib.error
from datetime import datetime
import pytz
from django.utils import timezone
from django.db.models import Q, Sum, Count
from apps.catalog.models import Book, Copy
from apps.circulation.models import Loan
from apps.fines.models import Fine
from apps.reservations.models import Reservation
from apps.notifications.models import Notification
from apps.core.enums import CopyStatus, LoanStatus, FineStatus, ReservationStatus, NotificationType, NotificationChannel

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent"

BOOK_INTENT_KEYWORDS = [
    "sách", "tìm", "kiếm", "tài liệu", "giáo trình", "đọc", "mượn", "tham khảo", "đầu sách",
    "cuốn", "tác giả", "chuyên ngành", "khoa học", "kỹ thuật", "lập trình", "toán",
    "kinh tế", "cầu đường", "logistics", "cntt", "it", "isbn", "kệ"
]

ADMIN_STATS_KEYWORDS = [
    "chưa trả", "chưa được trả", "đang mượn", "thống kê", "bao nhiêu sách", "quá hạn",
    "tiền phạt", "đặt trước", "tồn kho", "bản sao", "báo cáo", "hư hỏng", "mất",
    "tổng số", "admin", "thủ thư", "sinh viên", "danh sách", "gần hết", "sắp hết",
    "hết bản sao", "mượn nhiều", "sách hot", "khóa thẻ", "đề xuất", "chuyên ngành",
    "giảng viên", "thầy cô", "giáo viên", "ai mượn", "ai đang mượn", "mượn sách"
]

def get_current_vietnam_time_str() -> str:
    tz = pytz.timezone('Asia/Ho_Chi_Minh')
    now = datetime.now(tz)
    weekday_names = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"]
    weekday = weekday_names[now.weekday()]
    return f"{weekday}, ngày {now.day:02d}/{now.month:02d}/{now.year} (giờ hiện tại: {now.strftime('%H:%M')})"

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

        today_date = timezone.localdate()

        # Chi tiết giảng viên đang mượn sách
        lecturer_borrowers = []
        for l in lecturer_loans:
            is_overdue = l.due_at < now
            loan_due_date = l.due_at.astimezone(timezone.get_current_timezone()).date()
            diff_days = max(1, (today_date - loan_due_date).days) if is_overdue else 0
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
            loan_due_date = l.due_at.astimezone(timezone.get_current_timezone()).date()
            diff_days = max(1, (today_date - loan_due_date).days)
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
        now = timezone.now()
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

def get_patron_context(user) -> dict:
    """
    Truy vấn dữ liệu mượn trả và quyền lợi thực tế của Bạn đọc (Sinh viên / Giảng viên)
    để UTHie AI tư vấn cá nhân hóa chính xác tuyệt đối.
    """
    if not user:
        return None
    try:
        now = timezone.now()
        is_lecturer = (getattr(user, 'role', '') == 'lecturer')
        role_label = "Giảng viên" if is_lecturer else "Sinh viên"
        max_borrow_limit = 10 if is_lecturer else 5
        max_borrow_days = 30 if is_lecturer else 14

        # Sách đang mượn của chính bạn đọc này
        today_date = timezone.localdate()
        active_loans = Loan.objects.filter(user=user, status=LoanStatus.ACTIVE).select_related('book', 'copy')
        loans_info = []
        overdue_count = 0
        for l in active_loans:
            is_overdue = l.due_at < now
            loan_due_date = l.due_at.astimezone(timezone.get_current_timezone()).date()
            if is_overdue:
                overdue_count += 1
                diff_days = max(1, (today_date - loan_due_date).days)
                fine = diff_days * 2000
                status_str = f"ĐÃ QUÁ HẠN {diff_days} ngày (Phí phạt tạm tính: {fine:,} VNĐ)"
            else:
                remaining_days = max(0, (loan_due_date - today_date).days)
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

        # Sách đặt trước đang chờ
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
            "role": getattr(user, 'role', 'student'),
            "role_label": role_label,
            "department": getattr(user, 'department', '') or "Đại học Giao thông Vận tải TP.HCM",
            "is_locked": getattr(user, 'is_locked', False),
            "active_loans": loans_info,
            "active_loans_count": len(loans_info),
            "overdue_count": overdue_count,
            "max_borrow_limit": max_borrow_limit,
            "max_borrow_days": max_borrow_days,
            "unpaid_fines_count": unpaid_fines.count(),
            "unpaid_amount": unpaid_amount,
            "reservations": res_info,
        }
    except Exception as e:
        print(f"[Patron Context Error]: {e}")
        return None

def is_admin_query(user_role: str, user_message: str) -> bool:
    if user_role != 'admin':
        return False
    msg_lower = user_message.strip().lower()
    return any(k in msg_lower for k in ADMIN_STATS_KEYWORDS)

def is_book_query_intent(user_message: str) -> bool:
    msg_lower = user_message.strip().lower()
    non_book_indicators = [
        "chưa trả", "bao nhiêu sách", "thống kê", "quá hạn", "tiền phạt", "sinh viên",
        "giảng viên", "cơ sở", "ở đâu", "tầng mấy", "giờ mở", "giờ làm", "mở cửa",
        "địa chỉ", "liên hệ", "quy định", "quy chế", "chính sách", "gia hạn",
        "thời hạn", "sách của tôi", "tôi đang mượn", "tôi mượn", "hạn trả", "phí phạt"
    ]
    if any(k in msg_lower for k in non_book_indicators):
        return False
    return any(k in msg_lower for k in BOOK_INTENT_KEYWORDS)

def classify_chat_mode(user_message: str, is_admin: bool = False) -> str:
    """Route messages without letting library context hijack ordinary conversation."""
    msg_lower = user_message.strip().lower()
    if is_admin and is_admin_query('admin', user_message):
        return 'operations'

    library_context_keywords = [
        'thư viện', 'giáo trình', 'tài liệu', 'đầu sách', 'isbn', 'mượn sách',
        'sách của tôi', 'tôi đang mượn', 'hạn trả', 'gia hạn', 'quá hạn',
        'tiền phạt', 'phí phạt', 'đặt trước', 'mã thẻ', 'giờ mở cửa',
        'cơ sở uth', 'kho sách', 'vị trí kệ',
    ]
    if is_book_query_intent(user_message) or any(k in msg_lower for k in library_context_keywords):
        return 'library'
    return 'conversation'

def query_relevant_books(query_text: str, patron_dept: str = None, limit: int = 4):
    if not is_book_query_intent(query_text):
        return []

    q_lower = query_text.lower().strip()
    non_book_indicators = [
        "chưa trả", "bao nhiêu sách", "quá hạn", "tiền phạt",
        "cơ sở", "ở đâu", "tầng mấy", "giờ mở", "giờ làm", "mở cửa",
        "địa chỉ", "liên hệ", "quy định", "quy chế", "chính sách", "gia hạn",
        "sách của tôi", "tôi đang mượn", "tôi mượn", "hạn trả"
    ]
    if any(k in q_lower for k in non_book_indicators):
        return []

    CATEGORY_MAPPING = {
        # Công nghệ thông tin
        "công nghệ thông tin": "Công nghệ thông tin",
        "cntt": "Công nghệ thông tin",
        "it": "Công nghệ thông tin",
        "khoa học máy tính": "Công nghệ thông tin",
        "kỹ thuật phần mềm": "Công nghệ thông tin",
        "hệ thống thông tin": "Công nghệ thông tin",
        "lập trình": "Công nghệ thông tin",
        "phần mềm": "Công nghệ thông tin",
        "mạng máy tính": "Công nghệ thông tin",
        "dữ liệu": "Công nghệ thông tin",
        "thuật toán": "Công nghệ thông tin",
        "cấu trúc dữ liệu": "Công nghệ thông tin",
        "cơ sở dữ liệu": "Công nghệ thông tin",
        "database": "Công nghệ thông tin",
        "deep learning": "Công nghệ thông tin",
        "machine learning": "Công nghệ thông tin",
        "trí tuệ nhân tạo": "Công nghệ thông tin",
        "ai": "Công nghệ thông tin",
        "web": "Công nghệ thông tin",
        "git": "Công nghệ thông tin",
        "githup": "Công nghệ thông tin",
        # Kỹ thuật Giao thông vận tải
        "giao thông": "Kỹ thuật Giao thông vận tải",
        "cầu đường": "Kỹ thuật Giao thông vận tải",
        "đường bộ": "Kỹ thuật Giao thông vận tải",
        "đường sắt": "Kỹ thuật Giao thông vận tải",
        "đường cao tốc": "Kỹ thuật Giao thông vận tải",
        "hàng không": "Kỹ thuật Giao thông vận tải",
        "sân bay": "Kỹ thuật Giao thông vận tải",
        "xe buýt": "Kỹ thuật Giao thông vận tải",
        "its": "Kỹ thuật Giao thông vận tải",
        # Logistics & Chuỗi cung ứng
        "logistics": "Logistics & Chuỗi cung ứng",
        "chuỗi cung ứng": "Logistics & Chuỗi cung ứng",
        "kho bãi": "Logistics & Chuỗi cung ứng",
        "kho hàng": "Logistics & Chuỗi cung ứng",
        "vận tải đa phương thức": "Logistics & Chuỗi cung ứng",
        "last-mile": "Logistics & Chuỗi cung ứng",
        "giao hàng": "Logistics & Chuỗi cung ứng",
        # Kinh tế & Quản trị kinh doanh
        "kinh tế": "Kinh tế & Quản trị kinh doanh",
        "quản trị": "Kinh tế & Quản trị kinh doanh",
        "kinh doanh": "Kinh tế & Quản trị kinh doanh",
        "marketing": "Kinh tế & Quản trị kinh doanh",
        "thương mại": "Kinh tế & Quản trị kinh doanh",
        "ngoại thương": "Kinh tế & Quản trị kinh doanh",
        "nhân lực": "Kinh tế & Quản trị kinh doanh",
        # Kỹ thuật Xây dựng công trình
        "xây dựng": "Kỹ thuật Xây dựng công trình",
        "kết cấu": "Kỹ thuật Xây dựng công trình",
        "bê tông": "Kỹ thuật Xây dựng công trình",
        "địa kỹ thuật": "Kỹ thuật Xây dựng công trình",
        "sức bền": "Kỹ thuật Xây dựng công trình",
        # Kỹ thuật Cơ khí & Động lực
        "cơ khí": "Kỹ thuật Cơ khí & Động lực",
        "động cơ": "Kỹ thuật Cơ khí & Động lực",
        "động lực": "Kỹ thuật Cơ khí & Động lực",
        "ô tô": "Kỹ thuật Cơ khí & Động lực",
        "chế tạo máy": "Kỹ thuật Cơ khí & Động lực",
        "cnc": "Kỹ thuật Cơ khí & Động lực",
        "thủy lực": "Kỹ thuật Cơ khí & Động lực",
        "khí nén": "Kỹ thuật Cơ khí & Động lực",
        # Kỹ thuật Điện - Điện tử
        "điện": "Kỹ thuật Điện - Điện tử",
        "điện tử": "Kỹ thuật Điện - Điện tử",
        "cảm biến": "Kỹ thuật Điện - Điện tử",
        "sensor": "Kỹ thuật Điện - Điện tử",
        "iot": "Kỹ thuật Điện - Điện tử",
        "biến tần": "Kỹ thuật Điện - Điện tử",
        # Ngoại ngữ & Kỹ năng mềm
        "ngoại ngữ": "Ngoại ngữ & Kỹ năng mềm",
        "tiếng anh": "Ngoại ngữ & Kỹ năng mềm",
        "kỹ năng": "Ngoại ngữ & Kỹ năng mềm",
        "thuyết trình": "Ngoại ngữ & Kỹ năng mềm",
        "đàm phán": "Ngoại ngữ & Kỹ năng mềm",
    }

    matched_cat = None
    for kw, cat_name in CATEGORY_MAPPING.items():
        if kw in q_lower:
            matched_cat = cat_name
            break

    # Nếu hỏi chung chung về "ngành tôi", "môn tôi" và chưa bắt được ngành trong text, dùng ngành của bạn đọc
    if not matched_cat and patron_dept and any(k in q_lower for k in ["ngành tôi", "môn tôi", "chuyên ngành", "khoa tôi", "ngành của tôi", "tôi nên đọc", "môn học"]):
        dept_lower = patron_dept.lower()
        for kw, cat_name in CATEGORY_MAPPING.items():
            if kw in dept_lower:
                matched_cat = cat_name
                break

    try:
        qs = Book.objects.filter(deleted_at__isnull=True)
        if matched_cat:
            qs_cat = qs.filter(category__name__icontains=matched_cat)
            if qs_cat.exists():
                qs = qs_cat
            else:
                qs = qs.filter(Q(title__icontains=q_lower) | Q(category__name__icontains=q_lower))
        else:
            words = [w.strip() for w in q_lower.split() if len(w.strip()) > 1]
            stop_words = {"tìm", "cho", "mình", "với", "cuốn", "những", "sách", "tài", "liệu", "về", "các", "có"}
            search_words = [w for w in words if w not in stop_words] or words
            q_obj = Q()
            for w in search_words:
                q_obj |= Q(title__icontains=w) | Q(keywords__icontains=w) | Q(category__name__icontains=w) | Q(authors__name__icontains=w)
            qs = qs.filter(q_obj)

        books = qs.annotate(
            avail_cnt=Count('copies', filter=Q(copies__status=CopyStatus.AVAILABLE)),
            total_cnt=Count('copies')
        ).order_by('-avail_cnt', 'title').prefetch_related('authors', 'category', 'copies')[:limit]

        results = []
        for b in books:
            authors_str = ", ".join([a.name for a in b.authors.all()])
            results.append({
                "id": b.id,
                "title": b.title,
                "authors": authors_str or "Nhiều tác giả",
                "category": b.category.name if b.category else "Tổng hợp",
                "available_copies": b.avail_cnt,
                "total_copies": b.total_cnt,
                "cover_image": b.cover_image or "",
                "year": b.year or "",
                "description": (b.description[:150] + "...") if b.description and len(b.description) > 150 else (b.description or "")
            })
        return results
    except Exception as e:
        print(f"[DB Query Error]: {e}")
        return []

def call_gemini_api(user_message: str, history: list, relevant_books: list, admin_stats: dict = None, patron_context: dict = None, is_admin: bool = False) -> str:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None

    now_str = get_current_vietnam_time_str()
    role_desc = "Quản trị viên / Thủ thư Thư viện UTH" if is_admin else ("Giảng viên UTH" if (patron_context and patron_context.get('role') == 'lecturer') else "Sinh viên UTH")
    chat_mode = classify_chat_mode(user_message, is_admin=is_admin)

    # 1. Ngữ cảnh Quản trị viên (CHỈ CÓ KHI LÀ ADMIN/THỦ THƯ)
    admin_context = ""
    if is_admin and admin_stats:
        lecturer_loans_text = ""
        for i, lb in enumerate(admin_stats.get('lecturer_borrowers', []), 1):
            tag = " [ĐÃ QUÁ HẠN]" if lb.get('is_overdue') else " [Còn hạn]"
            lecturer_loans_text += f"  {i}. Giảng viên: {lb['name']} (Mã GV/Thẻ: {lb['card_code']}) - Khoa: {lb['department']} - Đang mượn cuốn: '{lb['book_title']}' (Mã vạch: {lb['barcode']}) - Hạn trả: {lb['due_at']}{tag}.\n"

        overdue_list_text = ""
        for i, s in enumerate(admin_stats.get('overdue_students', []), 1):
            overdue_list_text += f"  {i}. Sinh viên: {s['student_name']} (MSSV/Mã thẻ: {s['card_code']}) - Đang mượn cuốn '{s['book_title']}' (Mã vạch: {s['barcode']}) - Hạn trả: {s['due_at']} - Quá hạn: {s['overdue_days']} ngày (Ước tính phí phạt: {s['est_fine']:,} VNĐ).\n"

        low_stock_text = ""
        for i, b in enumerate(admin_stats.get('low_stock_books', []), 1):
            low_stock_text += f"  {i}. {b['title']} (Chuyên ngành: {b['category']}) - Còn sẵn {b['available_copies']}/{b['total_copies']} bản.\n"

        top_books_text = ""
        for i, tb in enumerate(admin_stats.get('top_borrowed_books', []), 1):
            top_books_text += f"  {i}. {tb['title']} ({tb['category']}) - {tb['total_loans']} lượt mượn.\n"

        admin_context = f"""
[SỐ LIỆU LƯU THÔNG THỰC TẾ TRONG DATABASE THƯ VIỆN UTH (REAL-TIME CHO ADMIN/THỦ THƯ)]:
- Tổng số cuốn sách đang mượn CHƯA TRẢ lại thư viện: {admin_stats['active_loans_count']} cuốn.
  + Giảng viên mượn: {admin_stats.get('lecturer_active_loans_count', 0)} cuốn.
{lecturer_loans_text or '    Hiện không có giảng viên nào đang mượn sách.'}
  + Sinh viên mượn: {admin_stats.get('student_active_loans_count', 0)} cuốn.
- Số cuốn ĐÃ QUÁ HẠN: {admin_stats['overdue_loans_count']} cuốn.
- DANH SÁCH CHI TIẾT BẠN ĐỌC ĐANG MƯỢN QUÁ HẠN:
{overdue_list_text or '  Hiện không có bạn đọc nào quá hạn.'}

- Tổng số bản sao trong kho: {admin_stats['total_copies']} bản (Sẵn sàng: {admin_stats['available_copies']}, Đang mượn: {admin_stats['borrowed_copies']}, Giữ chỗ: {admin_stats['reserved_copies']}, Hỏng: {admin_stats['damaged_copies']}, Mất: {admin_stats['lost_copies']}).
- Phiếu phạt chưa thu: {admin_stats['unpaid_fines_count']} phiếu ({admin_stats['total_unpaid_amount']:,} VNĐ).
- Sách gần hết bản sao (khả dụng <= 1):
{low_stock_text or '  Không có sách nào sắp hết bản sao.'}
- Top sách được mượn nhiều nhất:
{top_books_text or '  Chưa có dữ liệu mượn sách.'}
- Tài khoản bạn đọc bị khóa thẻ: {admin_stats.get('locked_users_count', 0)} tài khoản.
- Đề xuất mua sách mới đang chờ duyệt: {admin_stats.get('pending_suggestions_count', 0)} đề xuất.
"""

    # 2. Ngữ cảnh Bạn đọc cá nhân (DÀNH CHO GIẢNG VIÊN VÀ SINH VIÊN)
    user_context = ""
    if not is_admin and patron_context:
        loans_list_str = ""
        for idx, l in enumerate(patron_context.get('active_loans', []), 1):
            renew_str = " (Đã gia hạn 1/1 lần)" if l.get('renew_count', 0) >= 1 else " (Chưa gia hạn, có thể gia hạn trực tuyến +7d)"
            loans_list_str += f"  {idx}. Cuốn: '{l['book_title']}' (Mã vạch: {l['barcode']}) - Mượn ngày: {l['borrowed_at']} - Hạn trả: {l['due_at']} - Trạng thái: {l['status_str']}{renew_str}\n"

        user_context = f"""
[THÔNG TIN TÀI KHOẢN BẠN ĐỌC HIỆN TẠI]:
- Họ và tên: {patron_context['name']}
- Phân loại bạn đọc: {patron_context['role_label']} (Mã thẻ: {patron_context['card_code']})
- Đơn vị/Khoa: {patron_context['department']}
- Trạng thái thẻ: {'ĐANG BỊ KHÓA' if patron_context['is_locked'] else 'Hoạt động bình thường'}
- Hạn mức mượn tài liệu: Tối đa {patron_context['max_borrow_limit']} cuốn, thời hạn {patron_context['max_borrow_days']} ngày/lượt (Gia hạn trực tuyến 1 lần +7 ngày).
- Tình trạng mượn sách hiện tại: Đang mượn {patron_context['active_loans_count']}/{patron_context['max_borrow_limit']} cuốn (Có {patron_context['overdue_count']} cuốn trễ hạn).
{loans_list_str or '  Hiện tại bạn đọc chưa mượn cuốn sách nào.'}
- Nợ phí phạt: {patron_context['unpaid_fines_count']} phiếu ({patron_context['unpaid_amount']:,} VNĐ).
- Đặt trước tài liệu: Đang có {len(patron_context['reservations'])} yêu cầu đặt trước.
"""

    # 3. Ngữ cảnh Sách liên quan trong kho (NẾU CÓ TRUY VẤN SÁCH/CHUYÊN NGÀNH)
    books_context = ""
    if relevant_books:
        books_context = "\n[DANH SÁCH TÀI LIỆU CÓ SẴN TRONG KHO THƯ VIỆN UTH PHÙ HỢP VỚI YÊU CẦU]:\n"
        for i, b in enumerate(relevant_books, 1):
            books_context += f"  {i}. Tiêu đề: \"{b['title']}\" | Tác giả: {b['authors']} | Chuyên ngành: {b['category']} | Khả dụng: Còn sẵn {b['available_copies']}/{b['total_copies']} bản.\n"

    uth_library_knowledge = """
[DỮ LIỆU CHUẨN XÁC VỀ HỆ THỐNG THƯ VIỆN TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI TP.HCM (UTH)]:
1. Hệ thống 3 cơ sở đào tạo và không gian Thư viện UTH:
   - Cơ sở 1 (Trụ sở chính & Thư viện Trung tâm có quy mô lớn nhất):
     + Địa chỉ: Số 2, đường Võ Oanh (đường D3 cũ), Phường 25, Quận Bình Thạnh, TP.HCM.
     + Không gian: Tòa nhà trung tâm (Khu C Thư viện UTH).
     + Giờ mở cửa: Thứ Hai đến Thứ Sáu: 07h30 – 20h30 (mở thông tầm buổi trưa); Thứ Bảy: 07h30 – 17h30.
   - Cơ sở 2 (Cơ sở Thủ Đức):
     + Địa chỉ: Số 10, Đường số 12, Phường An Khánh (Khu vực TP. Thủ Đức cũ / Quận 2), TP.HCM.
     + Giờ mở cửa: Thứ Hai đến Thứ Sáu: Sáng từ 07h30 – 12h00; Chiều từ 13h00 – 16h30.
   - Cơ sở 3 (Cơ sở Quận 12):
     + Địa chỉ: Số 70, đường Tô Ký, Phường Trung Mỹ Tây, Quận 12, TP.HCM.
     + Giờ mở cửa: Thứ Hai đến Thứ Bảy: 07h30 – 16h30 (mở thông tầm buổi trưa).
   - Chủ Nhật và các ngày nghỉ lễ/Tết: Toàn hệ thống thư viện nghỉ.
   - Nền tảng tra cứu và mượn trả: Cổng thông tin Thư viện số UTH hiện tại (Mục "Tra cứu sách" /search, Mục "Sách của tôi" /loans).

2. Quy định và chính sách lưu thông tài liệu Thư viện UTH:
   - Đối với Giảng viên: Mượn tối đa 10 cuốn, thời gian 30 ngày/lượt, gia hạn trực tuyến 1 lần (+7 ngày).
   - Đối với Sinh viên: Mượn tối đa 5 cuốn, thời gian 14 ngày/lượt, gia hạn trực tuyến 1 lần (+7 ngày).
   - Phí phạt quá hạn: 2.000 VNĐ/cuốn/ngày trễ.
   - Gia hạn trực tuyến 1-click: Bạn đọc đăng nhập vào cổng thư viện, mở trang "Sách của tôi" (/loans) và bấm "Gia hạn +7d" trước ngày đáo hạn (sách quá hạn không được gia hạn online).
   - Đặt trước tài liệu (Reservation): Giữ chỗ trong vòng 48 giờ kể từ khi sách sẵn sàng tại quầy lưu thông.
"""

    if chat_mode == 'conversation':
        grounded_context = ""
        mode_instruction = """
[CHẾ ĐỘ HIỆN TẠI: TRÒ CHUYỆN TỰ NHIÊN / KIẾN THỨC CHUNG]
- Trả lời trực tiếp đúng điều người dùng vừa nói hoặc hỏi; ưu tiên mạch hội thoại hiện tại.
- Có thể trò chuyện đời thường, ăn uống, sở thích, tâm sự, đùa nhẹ và hỏi tiếp tự nhiên như một người bạn thông minh.
- Tuyệt đối không tự lái câu chuyện sang thư viện, sách, giáo trình hay UTH nếu người dùng không chủ động hỏi.
- Không suy diễn một câu xã giao thành yêu cầu tra cứu. Không chèn danh sách tính năng hoặc lời quảng cáo.
- Khớp độ dài và sắc thái của người dùng: câu ngắn thì đáp gọn; câu nghiêm túc thì đáp rõ và có chiều sâu.
"""
    else:
        grounded_context = f"{uth_library_knowledge}\n{admin_context}\n{user_context}\n{books_context}"
        mode_instruction = """
[CHẾ ĐỘ HIỆN TẠI: HỖ TRỢ THƯ VIỆN CÓ DỮ LIỆU]
- Trả lời dựa trên dữ liệu thư viện và tài khoản được cung cấp; không bịa số liệu.
- Chỉ giới thiệu thẻ sách khi yêu cầu thực sự là tìm, đọc hoặc đề xuất tài liệu.
"""

    system_instruction = f"""
Bạn là UTHie, trợ lý AI thông minh, hiểu biết sâu rộng và thân thiện của Thư viện Trường ĐH Giao thông Vận tải TP.HCM (UTH).
Bạn vừa là chuyên gia điều phối & hỗ trợ tra cứu tài liệu Thư viện UTH, vừa sở hữu kho tri thức bách khoa toàn thư toàn diện của mô hình ngôn ngữ lớn Google Gemini (bao gồm khoa học kỹ thuật, công nghệ thông tin, kinh tế, đời sống, văn hóa, học thuật và thông tin hệ thống các trường đại học tại Việt Nam và trên thế giới).
Thời gian hệ thống hiện tại: {now_str}.
Người dùng đang trò chuyện: {role_desc}.

{mode_instruction}

{grounded_context}

[QUY TẮC PHẢN HỒI QUAN TRỌNG]:
1. KIẾN THỨC BÁCH KHOA TOÀN THƯ & CÁC TRƯỜNG ĐẠI HỌC (PHỔ CẬP KIẾN THỨC RỘNG KHÔNG GIỚI HẠN):
   - Khi người dùng hỏi bất kỳ câu hỏi nào về kiến thức tổng quát, khoa học, lập trình, công nghệ, xã hội, đời sống, hướng nghiệp, học tập, hoặc thông tin các trường đại học khác (ví dụ: Trường ĐH HUTECH, ĐH Bách Khoa, Kinh Tế TP.HCM, Sư Phạm Kỹ Thuật, UEH, Ngoại Thương, Công nghệ Thông tin UIT, v.v.):
     + Bạn PHẢI trả lời đầy đủ, chi tiết, chính xác, mạch lạc và nhiệt tình nhất bằng tri thức phong phú của mình.
     + Nêu rõ ràng các cơ sở, địa chỉ, ngành học, đặc điểm... khi được hỏi về trường khác.
     + TUYỆT ĐỐI KHÔNG được từ chối trả lời hoặc nói những câu rập khuôn như "mình chỉ hỗ trợ thư viện UTH", "mình không có dữ liệu về trường này/lĩnh vực này".
     + Khi người dùng trò chuyện thông thường, chào hỏi, tâm sự, hỏi bí quyết học tập, kỹ năng mềm, hoặc nhờ giải thích kiến thức bài vở: Hãy phản hồi tự nhiên, gần gũi, ấm áp, đóng vai trò như một người bạn đồng hành tri thức thông minh của sinh viên và giảng viên.
     + Bạn là một AI thông minh toàn diện, luôn mang lại giá trị cao nhất cho người dùng.

2. KHI SINH VIÊN HỎI VỀ NGÀNH HỌC, MÔN HỌC HOẶC TƯ VẤN SÁCH NÊN ĐỌC (VD: "Tôi học Công nghệ thông tin nên đọc sách gì?", "Ngành tôi và môn tôi học thì nên tìm đọc sách gì?"):
   - Bạn PHẢI đóng vai trò như một Cố vấn Học tập & Thủ thư chuyên môn tận tâm:
     a) Xác định rõ chuyên ngành của bạn đọc (CNTT, Logistics, Kỹ thuật Giao thông, Kinh tế, Cơ khí, Điện tử, Xây dựng...). Nếu bạn đọc hỏi "ngành tôi/môn tôi", hãy tham chiếu thông tin Khoa/Ngành trong tài khoản của bạn đọc.
     b) Phân tích định hướng môn học và lộ trình đọc sách: nêu rõ môn học cốt lõi (ví dụ CNTT: Cấu trúc dữ liệu & Giải thuật, Lập trình Web/Hệ thống, Cơ sở dữ liệu, Mạng máy tính, Trí tuệ nhân tạo AI) và lý do vì sao môn học/cuốn sách đó quan trọng cho tương lai nghề nghiệp.
     c) Giới thiệu các cuốn sách/giáo trình CỤ THỂ ĐANG CÓ TRONG KHO THƯ VIỆN UTH (lấy từ mục [DANH SÁCH TÀI LIỆU CÓ SẴN TRONG KHO THƯ VIỆN UTH PHÙ HỢP VỚI YÊU CẦU]), nêu rõ tên sách, tác giả và số bản sẵn sàng phục vụ.
     d) Chỉ dẫn rõ ràng: Hướng dẫn bạn đọc nhấp trực tiếp vào các thẻ xem nhanh ở bên dưới tin nhắn để xem vị trí kệ sách tại thư viện UTH và đặt giữ chỗ/mượn ngay trên cổng trực tuyến.
   - TUYỆT ĐỐI KHÔNG xuất bất kỳ đường link website bên ngoài nào như "opacthuvien.ut.edu.vn" hay link cũ của trường. Toàn bộ tính năng tra cứu và mượn trả đã được tích hợp trực tiếp trên Cổng Thư viện số UTH này.

3. NẾU LÀ QUẢN TRỊ VIÊN / THỦ THƯ (ADMIN):
   - Khi hỏi về "giảng viên mượn", "thầy cô mượn": Nêu chính xác số lượng cuốn và chi tiết từng cuốn giảng viên đang mượn dựa trên [SỐ LIỆU LƯU THÔNG THỰC TẾ]. Tuyệt đối KHÔNG được nói rằng "chỉ có sinh viên mượn".
   - Khi hỏi về "sinh viên mượn quá hạn", "sách trễ hạn": Tóm tắt ngắn gọn số lượng người và số cuốn trễ hạn, hướng dẫn thủ thư xem danh sách thẻ bên dưới để bấm gửi thông báo 1-click. TUYỆT ĐỐI KHÔNG vẽ bảng Markdown thô (| STT |...) và KHÔNG giả lập nút dạng text [Gửi thông báo...].
   - Mọi số liệu thống kê phải lấy chính xác từ dữ liệu thực tế ở trên.

4. NẾU LÀ BẠN ĐỌC (SINH VIÊN HOẶC GIẢNG VIÊN):
   - Cách xưng hô: Gọi Giảng viên là "Thầy/Cô", xưng "em" hoặc "UTHie". Gọi Sinh viên là "bạn", xưng "mình" hoặc "UTHie".
   - Tuyệt đối KHÔNG hiển thị số liệu quản trị nội bộ của thủ thư (như tổng kho bao nhiêu bản, hỏng mất, tổng tiền phạt toàn trường...).
   - Khi bạn đọc hỏi về "sách của tôi", "tôi đang mượn gì", "khi nào tôi phải trả", "tôi có bị phạt không": Đọc chính xác từ mục [THÔNG TIN TÀI KHOẢN BẠN ĐỌC HIỆN TẠI] để giải đáp rõ ràng tên cuốn sách, ngày hết hạn và số ngày còn lại.
   - Khi hỏi về cơ sở, địa chỉ, thư viện UTH ở đâu, giờ mở cửa: Trả lời chuẩn xác theo [DỮ LIỆU CHUẨN XÁC VỀ HỆ THỐNG THƯ VIỆN UTH] (Cơ sở 1: Số 2 Võ Oanh Bình Thạnh; Cơ sở 2: Số 10 Đường số 12 Thủ Đức; Cơ sở 3: Số 70 Tô Ký Quận 12).
   - Trả lời tự nhiên, thân thiện, súc tích, đi thẳng vào câu trả lời, hữu ích và truyền cảm hứng.
"""

    # Chế độ trò chuyện dùng prompt riêng, ngắn và không mang theo các neo ngữ cảnh thư viện.
    if chat_mode == 'conversation':
        system_instruction = f"""
Bạn là UTHie, một AI đồng hành thông minh, tự nhiên và thân thiện của cộng đồng UTH.
Thời gian hiện tại: {now_str}. Người đang trò chuyện: {role_desc}.

{mode_instruction}

Quy tắc hội thoại:
- Luôn trả lời đúng trọng tâm câu gần nhất và duy trì ngữ cảnh từ các lượt trước.
- Có kiến thức tổng quát rộng; có thể giải thích, tư vấn, sáng tạo nội dung hoặc trò chuyện đời thường.
- Không giả vờ biết dữ kiện thời gian thực nếu chưa được cung cấp.
- Không mở đầu bằng giới thiệu tính năng. Không kết thúc mọi câu bằng lời mời tra cứu sách.
- Dùng tiếng Việt tự nhiên, tôn trọng; có thể bắt nhịp cách nói thân mật của người dùng nhưng không thô tục hay xúc phạm.
"""

    contents = []
    for h in history[-10:]:
        role = "user" if h.get("sender") == "user" else "model"
        text = h.get("text", "")
        if text:
            contents.append({"role": role, "parts": [{"text": text}]})

    contents.append({"role": "user", "parts": [{"text": user_message}]})

    payload = {
        "system_instruction": {
            "parts": [{"text": system_instruction}]
        },
        "contents": contents,
        "generationConfig": {
            "temperature": 0.75 if chat_mode == 'conversation' else 0.25,
            "maxOutputTokens": 1000,
        }
    }

    url = f"{GEMINI_API_URL}?key={api_key}"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            candidates = data.get('candidates', [])
            if candidates:
                text_part = candidates[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                return text_part.strip()
    except Exception as e:
        print(f"[Gemini API Call Failed]: {e}")
        return None

def generate_smart_fallback(user_message: str, relevant_books: list, admin_stats: dict = None, patron_context: dict = None, is_admin: bool = False) -> str:
    msg = user_message.strip().lower()
    chat_mode = classify_chat_mode(user_message, is_admin=is_admin)

    # Chào hỏi thông thường
    if any(k == msg or msg.startswith(k + " ") for k in ["alo", "chào", "chao", "hi", "hello", "xin chào", "hey", "halo"]):
        return "Alo 😄 UTHie đây! Bạn muốn hỏi gì hay tám chuyện một chút?"

    if chat_mode == 'conversation' and any(k in msg for k in ['ăn', 'đói', 'cơm', 'món gì']):
        if 'cơm tấm' in msg:
            return "Cơm tấm là lựa chọn quá ổn 😄 Sườn nướng, bì chả hay sườn bì trứng đây? Nếu đang đói thì làm phần sườn bì trứng cho đã nhé."
        return "Nghe là biết đang đói rồi 😄 Bạn đang thèm món gì? Nói khu vực hoặc khẩu vị, mình gợi ý cùng bạn."

    # Trường hợp hỏi trường khác (HUTECH, Bách Khoa, v.v.)
    if "hutech" in msg:
        return """Trường Đại học Công nghệ TP.HCM (HUTECH) hiện có các cơ sở chính tại TP.HCM:
1. **Cơ sở chính (Trụ sở):** Số 475A Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP.HCM.
2. **Cơ sở Ung Văn Khiêm:** Số 31/36 Ung Văn Khiêm, Phường 25, Quận Bình Thạnh, TP.HCM.
3. **Cơ sở Khu Công nghệ cao (SHTP):** Đường D1 & D2, Khu Công nghệ cao, TP. Thủ Đức, TP.HCM.

Nếu bạn đang tìm kiếm tài liệu nghiên cứu, giáo trình học tập các khối ngành Kỹ thuật, Công nghệ, Kinh tế..., Thư viện UTH luôn sẵn sàng hỗ trợ bạn tra cứu nhé!"""

    if "bách khoa" in msg or "bach khoa" in msg:
        return """Trường Đại học Bách Khoa - ĐHQG TP.HCM có 2 cơ sở đào tạo chính:
1. **Cơ sở 1 (Trụ sở Lý Thường Kiệt):** 268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM.
2. **Cơ sở 2 (Cơ sở Dĩ An):** Khu đô thị Đại học Quốc gia TP.HCM, Phường Đông Hòa, TP. Dĩ An, Tỉnh Bình Dương.

Bạn có thể tham khảo thêm nhiều giáo trình kỹ thuật và cơ khí công trình tại Thư viện UTH nhé!"""

    if "kinh tế" in msg and ("ueh" in msg or "cơ sở" in msg or "địa chỉ" in msg):
        return """Đại học Kinh tế TP.HCM (UEH) có cơ sở chính (Cơ sở A) tại 59C Nguyễn Đình Chiểu, Phường Võ Thị Sáu, Quận 3, TP.HCM, cùng cơ sở Nam Sông Sài Gòn (Cơ sở N) tại Nguyễn Văn Linh, Huyện Bình Chánh."""

    # Trường hợp hỏi cơ sở UTH
    if "cơ sở 3" in msg or "cs3" in msg:
        return "Cơ sở 3 của UTH tọa lạc tại số 70 đường Tô Ký, Phường Trung Mỹ Tây, Quận 12, TP.HCM. Không gian Thư viện tại Cơ sở 3 mở cửa phục vụ từ Thứ Hai đến Thứ Bảy: 07h30 – 16h30 (thông trưa)."
    if "cơ sở 1" in msg or "cs1" in msg or "trụ sở" in msg or "võ oanh" in msg:
        return "Cơ sở 1 (Trụ sở chính) của UTH tọa lạc tại số 2 đường Võ Oanh, Phường 25, Quận Bình Thạnh, TP.HCM. Thư viện Trung tâm nằm tại Tòa nhà Khu C, mở cửa Thứ 2 – Thứ 6 từ 07h30 – 20h30 và Thứ 7 từ 07h30 – 17h30."
    if "cơ sở 2" in msg or "cs2" in msg or "thủ đức" in msg:
        return "Cơ sở 2 của UTH tọa lạc tại số 10, Đường số 12, Phường An Khánh, TP. Thủ Đức, TP.HCM. Thư viện tại cơ sở 2 mở cửa Thứ 2 – Thứ 6: Sáng 07h30 – 12h00, Chiều 13h00 – 16h30."
    if any(k in msg for k in ["ở đâu", "địa chỉ", "các cơ sở"]):
        return "Trường Đại học Giao thông Vận tải TP.HCM (UTH) có 3 cơ sở có thư viện:\n- Cơ sở 1: Số 2 Võ Oanh, P. 25, Q. Bình Thạnh\n- Cơ sở 2: Số 10, Đường số 12, P. An Khánh, TP. Thủ Đức\n- Cơ sở 3: Số 70 Tô Ký, P. Trung Mỹ Tây, Q. 12."

    # Quản trị viên
    if is_admin and admin_stats:
        if any(k in msg for k in ["giảng viên", "thầy cô", "giáo viên"]):
            lecturers = admin_stats.get('lecturer_borrowers', [])
            if not lecturers:
                return "Hiện tại hệ thống ghi nhận không có giảng viên nào đang mượn sách tại Thư viện UTH."
            lines = [f"Hiện có {len(lecturers)} lượt mượn của Giảng viên tại thư viện:"]
            for i, lb in enumerate(lecturers, 1):
                lines.append(f"{i}. **{lb['name']}** ({lb['card_code']}) - Đang mượn: *{lb['book_title']}* (Mã vạch: `{lb['barcode']}` - Hạn trả: {lb['due_at']})")
            return "\n".join(lines)

        if any(k in msg for k in ["quá hạn", "chưa trả", "sinh viên"]):
            overdue_list = admin_stats.get('overdue_students', [])
            if not overdue_list:
                return "Hiện tại thư viện không có bạn đọc nào mượn sách quá hạn."
            lines = [f"Danh sách {len(overdue_list)} bạn đọc mượn sách quá hạn hiện tại:"]
            for i, s in enumerate(overdue_list, 1):
                lines.append(f"{i}. **{s['student_name']}** ({s['card_code']}) - Sách: *{s['book_title']}* (Quá hạn {s['overdue_days']} ngày, phạt: {s['est_fine']:,}đ)")
            return "\n".join(lines)

    # Bạn đọc cá nhân (Sinh viên / Giảng viên)
    if not is_admin and patron_context:
        if any(k in msg for k in ["sách của tôi", "tôi đang mượn", "sách mượn", "hạn trả", "khi nào trả"]):
            loans = patron_context.get('active_loans', [])
            if not loans:
                return f"Chào {patron_context['name']}, hiện tại bạn chưa mượn cuốn sách nào tại Thư viện UTH. Bạn có thể tra cứu và đến quầy để mượn tài liệu nhé!"
            lines = [f"Chào {patron_context['name']}, bạn đang mượn {len(loans)} cuốn sách tại thư viện:"]
            for i, l in enumerate(loans, 1):
                lines.append(f"{i}. **{l['book_title']}** - Hạn trả: {l['due_at']} ({l['status_str']})")
            return "\n".join(lines)

        if any(k in msg for k in ["phạt", "tiền phạt", "nợ"]):
            fines_count = patron_context.get('unpaid_fines_count', 0)
            if fines_count == 0:
                return f"Chào {patron_context['name']}, tài khoản của bạn không có khoản phạt nào tồn đọng tại thư viện."
            return f"Chào {patron_context['name']}, bạn đang có {fines_count} phiếu phạt chưa thanh toán với tổng số tiền là {patron_context['unpaid_amount']:,} VNĐ. Vui lòng thanh toán trực tuyến qua VietQR hoặc tại Quầy lưu thông."

        if any(k in msg for k in ["quy định", "chính sách", "mượn được bao nhiêu", "thời hạn"]):
            is_lec = (patron_context.get('role') == 'lecturer')
            if is_lec:
                return "Chính sách mượn sách dành cho Giảng viên UTH: Mượn tối đa 10 cuốn sách, thời hạn 30 ngày/lượt mượn. Mỗi cuốn được gia hạn trực tuyến 1 lần (+7 ngày) tại mục 'Sách của tôi'."
            return "Chính sách mượn sách dành cho Sinh viên UTH: Mượn tối đa 5 cuốn sách, thời hạn 14 ngày/lượt mượn. Mỗi cuốn được gia hạn trực tuyến 1 lần (+7 ngày) tại mục 'Sách của tôi'. Phí phạt trễ hạn là 2.000 VNĐ/cuốn/ngày."

    if relevant_books:
        lines = [f"Thư viện UTH hiện có {len(relevant_books)} tài liệu phù hợp với chủ đề bạn đang quan tâm:"]
        for i, b in enumerate(relevant_books, 1):
            lines.append(f"{i}. **{b['title']}** - Tác giả: {b['authors']} (Còn sẵn: {b['available_copies']}/{b['total_copies']} bản)")
        lines.append("\n👉 Bạn có thể nhấp trực tiếp vào các thẻ sách bên dưới để xem vị trí giá sách và đặt mượn trên hệ thống nhé!")
        return "\n".join(lines)

    if chat_mode == 'conversation':
        return f"Mình đang nghe đây. Bạn nói thêm một chút về “{user_message}” nhé — bạn muốn mình góp ý, giải thích hay chỉ ngồi tám cùng bạn?"

    return f"UTHie đã nhận câu hỏi: \"{user_message}\". Bạn mô tả thêm chi tiết để mình tra cứu chính xác nhé."
