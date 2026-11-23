from django.db.models import Count, Q

from apps.catalog.models import Book
from apps.core.enums import CopyStatus

from .routing import is_book_query_intent


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
            stop_words = {"tìm", "cho", "mình", "với", "cuốn", "những", "sách", "tài", "liệu", "về", "các", "có", "đặt", "trước", "giữ", "chỗ", "mượn", "giúp", "muốn"}
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
