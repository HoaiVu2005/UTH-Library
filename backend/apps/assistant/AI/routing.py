# Phân loại ý định để ưu tiên câu hỏi thư viện và giữ chat thường tự nhiên.

BOOK_INTENT_KEYWORDS = [
    "sách", "tìm", "kiếm", "tài liệu", "giáo trình", "đọc", "mượn", "tham khảo", "đầu sách",
    "cuốn", "tác giả", "chuyên ngành", "khoa học", "kỹ thuật", "lập trình", "toán học", "môn toán",
    "kinh tế", "cầu đường", "logistics", "cntt", "it", "isbn", "kệ", "đặt trước", "giữ chỗ", "đặt mượn", "đặt sách"
]

ADMIN_STATS_KEYWORDS = [
    "chưa trả", "chưa được trả", "đang mượn", "thống kê", "bao nhiêu sách", "quá hạn",
    "tiền phạt", "đặt trước", "tồn kho", "bản sao", "báo cáo", "hư hỏng", "mất",
    "tổng số", "admin", "thủ thư", "sinh viên", "danh sách", "gần hết", "sắp hết",
    "hết bản sao", "mượn nhiều", "sách hot", "khóa thẻ", "đề xuất", "chuyên ngành",
    "giảng viên", "thầy cô", "giáo viên", "ai mượn", "ai đang mượn", "mượn sách"
]


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
        "thời hạn", "sách của tôi", "tôi đang mượn", "tôi mượn", "hạn trả", "phí phạt",
        "thanh toán", "nộp phạt", "thu phạt", "phiếu phạt", "khoản phạt", "phạt nợ", "nợ phạt", "bị phạt"
    ]
    if any(k in msg_lower for k in non_book_indicators):
        return False
    return any(k in msg_lower for k in BOOK_INTENT_KEYWORDS)

def classify_chat_mode(user_message: str, is_admin: bool = False) -> str:
    """Route messages without letting library context hijack ordinary conversation."""
    msg_lower = user_message.strip().lower()
    if is_admin and is_admin_query('admin', user_message):
        return 'operations'

    nearby_place_keywords = [
        'quán', 'ăn gì', 'uống gì', 'cà phê', 'cafe', 'trà sữa', 'nhà hàng',
        'tiệm', 'gần cơ sở', 'gần trường', 'xung quanh trường', 'đường đi',
    ]
    campus_anchor_keywords = ['cơ sở', 'uth', 'trường', 'võ oanh', 'tô ký', 'thủ đức']
    if (
        any(keyword in msg_lower for keyword in nearby_place_keywords)
        and any(keyword in msg_lower for keyword in campus_anchor_keywords)
    ):
        return 'campus_life'

    library_context_keywords = [
        'thư viện', 'giáo trình', 'tài liệu', 'đầu sách', 'isbn', 'mượn sách',
        'sách của tôi', 'tôi đang mượn', 'hạn trả', 'gia hạn', 'quá hạn',
        'tiền phạt', 'phí phạt', 'phiếu phạt', 'khoản phạt', 'công nợ', 'nợ phạt', 'phạt nợ',
        'bị phạt', 'thanh toán phạt', 'nộp phạt', 'thu phạt', 'đặt trước', 'mã thẻ', 'giờ mở cửa',
        'cơ sở uth', 'kho sách', 'vị trí kệ', 'mấy cơ sở', 'các cơ sở',
    ]
    has_campus_query = (
        any(k in msg_lower for k in ['cơ sở', 'chi nhánh', 'trụ sở', 'địa chỉ', 'ở đâu'])
        and any(k in msg_lower for k in ['uth', 'trường', 'đại học', 'thư viện', 'mấy cơ sở', 'các cơ sở', 'cs1', 'cs2', 'cs3'])
    )
    if is_book_query_intent(user_message) or any(k in msg_lower for k in library_context_keywords) or has_campus_query:
        return 'library'
    return 'conversation'
