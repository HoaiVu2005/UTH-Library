import re
from django.db.models import Count, Q

from apps.catalog.models import Book
from apps.core.enums import CopyStatus
from .routing import is_book_query_intent


def _match_keyword(kw: str, text: str) -> bool:
    """Khớp từ khóa thông minh, hỗ trợ ranh giới từ cho các từ viết tắt ngắn (IT, AI, CNTT...)."""
    if len(kw) <= 3:
        pattern = r'(?<![a-zA-Z0-9_À-ỹ])' + re.escape(kw) + r'(?![a-zA-Z0-9_À-ỹ])'
        return bool(re.search(pattern, text, re.IGNORECASE))
    return kw.lower() in text.lower()


def query_relevant_books(query_text: str, patron_dept: str = None, limit: int = 4, history: list = None):
    """
    Truy vấn sách phù hợp nhất từ kho Thư viện UTH theo chuyên ngành và từ khóa.
    Đảm bảo sinh viên ngành nào hoặc hỏi ngành nào thì đề xuất chuẩn xác 100% sách ngành đó.
    """
    if not is_book_query_intent(query_text, history=history):
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
        # Logistics & Chuỗi cung ứng
        "logistics": "Logistics & Chuỗi cung ứng",
        "logistic": "Logistics & Chuỗi cung ứng",
        "logictic": "Logistics & Chuỗi cung ứng",
        "logictics": "Logistics & Chuỗi cung ứng",
        "logicstic": "Logistics & Chuỗi cung ứng",
        "logicstics": "Logistics & Chuỗi cung ứng",
        "chuỗi cung ứng": "Logistics & Chuỗi cung ứng",
        "supply chain": "Logistics & Chuỗi cung ứng",
        "kho bãi": "Logistics & Chuỗi cung ứng",
        "kho hàng": "Logistics & Chuỗi cung ứng",
        "kho vận": "Logistics & Chuỗi cung ứng",
        "hậu cần": "Logistics & Chuỗi cung ứng",
        "vận tải đa phương thức": "Logistics & Chuỗi cung ứng",
        "last-mile": "Logistics & Chuỗi cung ứng",
        "giao hàng": "Logistics & Chuỗi cung ứng",
        "giao nhận": "Logistics & Chuỗi cung ứng",
        "xuất nhập khẩu": "Logistics & Chuỗi cung ứng",
        "xnk": "Logistics & Chuỗi cung ứng",
        "hải quan": "Logistics & Chuỗi cung ứng",
        "incoterms": "Logistics & Chuỗi cung ứng",
        "chuỗi lạnh": "Logistics & Chuỗi cung ứng",
        "cold chain": "Logistics & Chuỗi cung ứng",
        "mua hàng": "Logistics & Chuỗi cung ứng",
        "procurement": "Logistics & Chuỗi cung ứng",
        "freight": "Logistics & Chuỗi cung ứng",
        "forwarding": "Logistics & Chuỗi cung ứng",

        # Công nghệ thông tin
        "công nghệ thông tin": "Công nghệ thông tin",
        "cntt": "Công nghệ thông tin",
        "it": "Công nghệ thông tin",
        "tin học": "Công nghệ thông tin",
        "khoa học máy tính": "Công nghệ thông tin",
        "khmt": "Công nghệ thông tin",
        "kỹ thuật phần mềm": "Công nghệ thông tin",
        "ktpm": "Công nghệ thông tin",
        "hệ thống thông tin": "Công nghệ thông tin",
        "httt": "Công nghệ thông tin",
        "an toàn thông tin": "Công nghệ thông tin",
        "attt": "Công nghệ thông tin",
        "lập trình": "Công nghệ thông tin",
        "phần mềm": "Công nghệ thông tin",
        "code": "Công nghệ thông tin",
        "coding": "Công nghệ thông tin",
        "developer": "Công nghệ thông tin",
        "mạng máy tính": "Công nghệ thông tin",
        "dữ liệu": "Công nghệ thông tin",
        "data": "Công nghệ thông tin",
        "thuật toán": "Công nghệ thông tin",
        "cấu trúc dữ liệu": "Công nghệ thông tin",
        "cơ sở dữ liệu": "Công nghệ thông tin",
        "database": "Công nghệ thông tin",
        "sql": "Công nghệ thông tin",
        "deep learning": "Công nghệ thông tin",
        "machine learning": "Công nghệ thông tin",
        "trí tuệ nhân tạo": "Công nghệ thông tin",
        "ai": "Công nghệ thông tin",
        "web": "Công nghệ thông tin",
        "frontend": "Công nghệ thông tin",
        "backend": "Công nghệ thông tin",
        "fullstack": "Công nghệ thông tin",
        "react": "Công nghệ thông tin",
        "django": "Công nghệ thông tin",
        "python": "Công nghệ thông tin",
        "java": "Công nghệ thông tin",
        "c++": "Công nghệ thông tin",
        "c/c++": "Công nghệ thông tin",
        "c#": "Công nghệ thông tin",
        "git": "Công nghệ thông tin",
        "github": "Công nghệ thông tin",
        "githup": "Công nghệ thông tin",
        "an ninh mạng": "Công nghệ thông tin",
        "hacker": "Công nghệ thông tin",

        # Kỹ thuật Giao thông vận tải
        "giao thông": "Kỹ thuật Giao thông vận tải",
        "gtvt": "Kỹ thuật Giao thông vận tải",
        "cầu đường": "Kỹ thuật Giao thông vận tải",
        "đường bộ": "Kỹ thuật Giao thông vận tải",
        "đường sắt": "Kỹ thuật Giao thông vận tải",
        "đường cao tốc": "Kỹ thuật Giao thông vận tải",
        "hàng không": "Kỹ thuật Giao thông vận tải",
        "sân bay": "Kỹ thuật Giao thông vận tải",
        "xe buýt": "Kỹ thuật Giao thông vận tải",
        "its": "Kỹ thuật Giao thông vận tải",
        "đường thủy": "Kỹ thuật Giao thông vận tải",
        "cảng": "Kỹ thuật Giao thông vận tải",
        "hàng hải": "Kỹ thuật Giao thông vận tải",
        "tàu thủy": "Kỹ thuật Giao thông vận tải",
        "hoa tiêu": "Kỹ thuật Giao thông vận tải",
        "vận tải": "Kỹ thuật Giao thông vận tải",

        # Kinh tế & Quản trị kinh doanh
        "kinh tế": "Kinh tế & Quản trị kinh doanh",
        "quản trị": "Kinh tế & Quản trị kinh doanh",
        "kinh doanh": "Kinh tế & Quản trị kinh doanh",
        "marketing": "Kinh tế & Quản trị kinh doanh",
        "thương mại": "Kinh tế & Quản trị kinh doanh",
        "ngoại thương": "Kinh tế & Quản trị kinh doanh",
        "nhân lực": "Kinh tế & Quản trị kinh doanh",
        "tài chính": "Kinh tế & Quản trị kinh doanh",
        "kế toán": "Kinh tế & Quản trị kinh doanh",
        "doanh nghiệp": "Kinh tế & Quản trị kinh doanh",
        "qtkd": "Kinh tế & Quản trị kinh doanh",

        # Kỹ thuật Xây dựng công trình
        "xây dựng": "Kỹ thuật Xây dựng công trình",
        "xddd": "Kỹ thuật Xây dựng công trình",
        "kết cấu": "Kỹ thuật Xây dựng công trình",
        "bê tông": "Kỹ thuật Xây dựng công trình",
        "địa kỹ thuật": "Kỹ thuật Xây dựng công trình",
        "sức bền": "Kỹ thuật Xây dựng công trình",
        "nền móng": "Kỹ thuật Xây dựng công trình",
        "công trình": "Kỹ thuật Xây dựng công trình",
        "bim": "Kỹ thuật Xây dựng công trình",

        # Kỹ thuật Cơ khí & Động lực
        "cơ khí": "Kỹ thuật Cơ khí & Động lực",
        "động cơ": "Kỹ thuật Cơ khí & Động lực",
        "động lực": "Kỹ thuật Cơ khí & Động lực",
        "ô tô": "Kỹ thuật Cơ khí & Động lực",
        "oto": "Kỹ thuật Cơ khí & Động lực",
        "chế tạo máy": "Kỹ thuật Cơ khí & Động lực",
        "cnc": "Kỹ thuật Cơ khí & Động lực",
        "thủy lực": "Kỹ thuật Cơ khí & Động lực",
        "khí nén": "Kỹ thuật Cơ khí & Động lực",
        "cơ điện tử": "Kỹ thuật Cơ khí & Động lực",

        # Kỹ thuật Điện - Điện tử
        "điện": "Kỹ thuật Điện - Điện tử",
        "điện tử": "Kỹ thuật Điện - Điện tử",
        "cảm biến": "Kỹ thuật Điện - Điện tử",
        "sensor": "Kỹ thuật Điện - Điện tử",
        "iot": "Kỹ thuật Điện - Điện tử",
        "biến tần": "Kỹ thuật Điện - Điện tử",
        "tự động hóa": "Kỹ thuật Điện - Điện tử",
        "vi điều khiển": "Kỹ thuật Điện - Điện tử",
        "viễn thông": "Kỹ thuật Điện - Điện tử",

        # Ngoại ngữ & Kỹ năng mềm
        "ngoại ngữ": "Ngoại ngữ & Kỹ năng mềm",
        "tiếng anh": "Ngoại ngữ & Kỹ năng mềm",
        "toeic": "Ngoại ngữ & Kỹ năng mềm",
        "ielts": "Ngoại ngữ & Kỹ năng mềm",
        "kỹ năng": "Ngoại ngữ & Kỹ năng mềm",
        "kỹ năng mềm": "Ngoại ngữ & Kỹ năng mềm",
        "thuyết trình": "Ngoại ngữ & Kỹ năng mềm",
        "đàm phán": "Ngoại ngữ & Kỹ năng mềm",
        "làm việc nhóm": "Ngoại ngữ & Kỹ năng mềm",
        "viết báo cáo": "Ngoại ngữ & Kỹ năng mềm",
    }

    # 1. Tìm chuyên ngành khớp trực tiếp từ câu hỏi hiện tại (ƯU TIÊN TUYỆT ĐỐI)
    matched_cat = None
    for kw, cat_name in CATEGORY_MAPPING.items():
        if _match_keyword(kw, q_lower):
            matched_cat = cat_name
            break

    # 2. Nếu câu hỏi hiện tại là câu nối tiếp ngắn (vd: "logistic cơ mà", "sách", "cho tôi xin sách", "đề xuất thêm"),
    # tìm chuyên ngành từ các lượt hỏi gần nhất trong lịch sử hội thoại
    if not matched_cat and history:
        for h in reversed(history[-4:]):
            sender = h.get('sender') or h.get('role')
            if sender == 'user':
                prev_text = (h.get('text') or h.get('content') or '').lower()
                for kw, cat_name in CATEGORY_MAPPING.items():
                    if _match_keyword(kw, prev_text):
                        matched_cat = cat_name
                        break
                if matched_cat:
                    break

    # 3. Nếu cả câu hỏi và lịch sử đều không nhắc chuyên ngành cụ thể (vd: sinh viên mới vào chat lần đầu hỏi chung "sách thư viện"),
    # tự động tham chiếu chuyên ngành thực tế của tài khoản bạn đọc!
    if not matched_cat and patron_dept:
        dept_lower = patron_dept.lower()
        for kw, cat_name in CATEGORY_MAPPING.items():
            if _match_keyword(kw, dept_lower):
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
            stop_words = {
                "tìm", "cho", "mình", "tôi", "em", "bạn", "với", "cuốn", "những", "sách", "tài", "liệu", "về", "các", "có",
                "đặt", "trước", "giữ", "chỗ", "mượn", "giúp", "muốn", "cần", "xin", "hỏi", "đề", "xuất",
                "gợi", "ý", "giới", "thiệu", "đọc", "nào", "hay", "tốt", "nhất", "chuẩn", "của", "và",
                "là", "sinh", "viên", "giảng", "năm", "kỳ", "học", "thư", "viện"
            }
            search_words = [w for w in words if w not in stop_words]
            if search_words:
                q_obj = Q()
                for w in search_words:
                    q_obj |= Q(title__icontains=w) | Q(keywords__icontains=w) | Q(category__name__icontains=w) | Q(authors__name__icontains=w)
                qs = qs.filter(q_obj)
            else:
                # Nếu chỉ là các từ hỏi chung chung, không lọc bừa theo "thư" để tránh dính "Thương mại"
                pass

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
