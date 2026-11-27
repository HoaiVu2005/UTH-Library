# Phân loại ý định để ưu tiên câu hỏi thư viện và giữ chat thường tự nhiên.

from .language import contains_any_phrase, normalize_vietnamese_text

CASUAL_CHAT_INDICATORS = [
    "alo", "chào", "hi", "hello", "hê lô", "hey", "ê", "ơi", "có đó không", "có đó hem",
    "có đó ko", "còn đó không", "còn đó ko", "bạn ơi", "uthie ơi", "ad ơi", "admin ơi",
    "khỏe không", "khỏe ko", "thế nào rồi", "hôm nay thế nào", "ăn gì", "ăn cơm chưa",
    "cảm ơn", "cam on", "thanks", "cám ơn", "tks", "ok", "oke", "oki", "dạ", "vâng",
    "tạm biệt", "bye", "goodbye", "hẹn gặp lại", "bạn là ai", "bạn tên gì", "mấy tuổi",
    "thời tiết", "kể chuyện", "buồn quá", "chán quá", "vui quá", "mệt quá", "giúp mình với",
    "cho mình hỏi xíu", "cho hỏi xíu", "hỏi tí", "hỏi xíu"
]

BORROWING_GUIDANCE_INDICATORS = (
    'cách mượn',
    'hướng dẫn mượn',
    'thủ tục mượn',
    'mượn như thế nào',
    'mượn sách như thế nào',
    'mượn sách thế nào',
    'quy trình mượn',
    'mượn sách làm sao',
    'làm sao mượn sách',
)


def is_borrowing_guidance_query(user_message: str) -> bool:
    """Nhận diện câu hỏi xin hướng dẫn, không phải yêu cầu đặt một cuốn cụ thể."""
    return contains_any_phrase(user_message, BORROWING_GUIDANCE_INDICATORS)

def is_pure_casual_message(user_message: str) -> bool:
    """Kiểm tra xem tin nhắn có phải là câu chào hỏi, cảm ơn, xã giao thuần túy hay không."""
    msg_lower = normalize_vietnamese_text(user_message)
    book_keywords = [
        "sách", "giáo trình", "tài liệu", "đầu sách", "cuốn", "mượn", "đọc", "mượn sách",
        "chờ nhận sách", "tìm", "đề xuất", "gợi ý", "khoa học", "kỹ thuật", "lập trình", "chuyên ngành"
    ]
    if contains_any_phrase(msg_lower, book_keywords):
        return False
    return contains_any_phrase(msg_lower, CASUAL_CHAT_INDICATORS)

NON_BOOK_QUERY_INDICATORS = [
    # 1. Tình trạng mượn trả cá nhân / Hạn nộp / Hạn trả / Quá hạn cá nhân
    "tới hạn", "đến hạn", "hạn nộp", "hạn trả", "sắp hết hạn", "hết hạn", "quá hạn", "trễ hạn", "trễ ngày",
    "đang mượn", "đang giữ", "sách của tôi", "sách mình mượn", "tôi đang mượn", "mình đang mượn",
    "mình có đang có", "tôi có đang có", "đang có sách nào", "tôi có sách nào", "mình có sách nào",
    "cuốn nào chưa trả", "đã mượn những", "mượn bao nhiêu cuốn", "kiểm tra sách", "danh sách mượn",
    "gia hạn", "thời hạn trả", "bao lâu thì trả", "khi nào phải trả", "ngày phải trả", "ngày trả",
    # 2. Phí phạt / Nợ phạt / Trách nhiệm tài chính
    "tiền phạt", "phí phạt", "bị phạt", "nợ phạt", "phạt nợ", "nộp phạt", "đóng phạt", "thu phạt",
    "thanh toán phạt", "khoản phạt", "phiếu phạt", "nợ phí", "chưa nộp phạt", "chưa đóng phạt",
    # 3. Thẻ thư viện & Tài khoản bạn đọc
    "thẻ thư viện", "mã thẻ", "thẻ bạn đọc", "khóa thẻ", "mở thẻ", "hạn thẻ", "thẻ sinh viên",
    # 4. Giờ giấc hoạt động & Địa chỉ cơ sở UTH
    "giờ mở", "giờ đóng", "giờ làm", "mở cửa", "đóng cửa", "lịch mở cửa", "mấy giờ mở", "mấy giờ đóng",
    "cơ sở 1", "cơ sở 2", "cơ sở 3", "cs1", "cs2", "cs3", "ở đâu", "địa chỉ", "tầng mấy", "phòng mấy", "liên hệ",
    # 5. Quy chế, chính sách mượn trả chung
    "quy định", "quy chế", "nội quy", "chính sách", "mượn tối đa", "được mượn mấy", "được mượn bao nhiêu",
    "mấy cuốn", "bao nhiêu ngày", "hạn mức", "làm thẻ", "thủ tục", "mất sách", "hư sách", "đền bù",
    # 6. Nghiệp vụ quản trị thủ thư
    "sinh viên quá hạn", "sinh viên trễ hạn", "danh sách quá hạn", "giảng viên mượn", "thầy cô mượn", "báo cáo", "thống kê", "tồn kho"
]

def is_non_book_query(user_message: str) -> bool:
    """Xác định các câu hỏi về thông tin cá nhân, quy chế, giờ giấc, nợ phạt KHÔNG PHẢI là tìm kiếm tài liệu."""
    return contains_any_phrase(user_message, NON_BOOK_QUERY_INDICATORS)

EXPLICIT_BOOK_SEARCH_INDICATORS = [
    "đề xuất sách", "gợi ý sách", "tìm sách", "tra cứu sách", "giới thiệu sách",
    "đề xuất giáo trình", "gợi ý giáo trình", "tìm giáo trình", "tra cứu giáo trình",
    "đề xuất tài liệu", "gợi ý tài liệu", "tìm tài liệu", "tra cứu tài liệu",
    "sách hay về", "sách nào hay về", "có sách gì về", "có tài liệu gì về", "có giáo trình gì về",
    "sách về", "giáo trình về", "tài liệu về", "sách môn", "giáo trình môn", "tài liệu môn",
    "sách học", "sách chuyên ngành", "sách tham khảo", "tài liệu tham khảo",
    "sách it", "sách cntt", "sách kinh tế", "sách giao thông", "sách xây dựng",
    "sách logistic", "sách logistics", "sách cơ khí", "sách điện", "sách ngoại ngữ",
    "sách lập trình", "sách toán", "sách ai", "sách marketing", "sách tiếng anh",
    "tôi muốn mượn sách", "muốn mượn sách", "muốn tìm sách", "cần tìm sách", "cần mượn sách",
    "tôi cần sách", "tìm giúp tôi cuốn", "thư viện có cuốn", "thư viện có sách",
    "đặt mượn sách", "mượn sách", "chờ nhận sách"
]

ADMIN_STATS_KEYWORDS = [
    "chưa trả", "chưa được trả", "đang mượn", "thống kê", "bao nhiêu sách", "quá hạn",
    "tiền phạt", "mượn sách", "tồn kho", "bản sao", "báo cáo", "hư hỏng", "mất",
    "tổng số", "admin", "thủ thư", "sinh viên", "danh sách", "gần hết", "sắp hết",
    "hết bản sao", "mượn nhiều", "sách hot", "khóa thẻ", "đề xuất", "chuyên ngành",
    "giảng viên", "thầy cô", "giáo viên", "ai mượn", "ai đang mượn", "mượn sách"
]

def is_admin_query(user_role: str, user_message: str) -> bool:
    if user_role != 'admin':
        return False
    return contains_any_phrase(user_message, ADMIN_STATS_KEYWORDS)

def is_book_query_intent(user_message: str, history: list = None) -> bool:
    msg_lower = normalize_vietnamese_text(user_message)

    # 1. Các câu chào hỏi, cảm ơn, nói chuyện xã giao thuần túy TUYỆT ĐỐI KHÔNG phải là tìm sách
    if is_pure_casual_message(user_message):
        return False

    # Câu hỏi về cách/thủ tục mượn cần trả quy trình, không được tự chọn một
    # kết quả catalog rồi biến thành yêu cầu đặt sách.
    if is_borrowing_guidance_query(user_message):
        return False

    # 2. Các câu hỏi về tình trạng cá nhân (hạn nộp, đang mượn, nợ phạt), giờ giấc, cơ sở, quy định TUYỆT ĐỐI KHÔNG phải là tìm sách
    if is_non_book_query(user_message):
        return False

    # 3. Các câu có ý định đề xuất / tìm kiếm / giới thiệu tài liệu rõ ràng
    if contains_any_phrase(msg_lower, EXPLICIT_BOOK_SEARCH_INDICATORS):
        return True

    # 4. Hỗ trợ câu hỏi nối tiếp trong ngữ cảnh đang tìm sách
    if history and not is_pure_casual_message(user_message) and not is_non_book_query(user_message):
        for h in reversed(history[-2:]):
            prev_text = (h.get('text') or h.get('content') or '').lower()
            if contains_any_phrase(prev_text, EXPLICIT_BOOK_SEARCH_INDICATORS):
                return True

    return False

def classify_chat_mode(user_message: str, is_admin: bool = False) -> str:
    """Route messages without letting library context hijack ordinary conversation."""
    msg_lower = normalize_vietnamese_text(user_message)
    if is_admin and is_admin_query('admin', user_message):
        return 'operations'

    # Nếu là tin nhắn chào hỏi, xã giao, cảm ơn thuần túy -> Chế độ hội thoại tự nhiên (conversation)
    if is_pure_casual_message(user_message):
        return 'conversation'

    nearby_place_keywords = [
        'quán', 'ăn gì', 'uống gì', 'cà phê', 'cafe', 'trà sữa', 'nhà hàng',
        'tiệm', 'gần cơ sở', 'gần trường', 'xung quanh trường', 'đường đi',
    ]
    campus_anchor_keywords = ['cơ sở', 'uth', 'trường', 'võ oanh', 'tô ký', 'thủ đức']
    if (
        contains_any_phrase(msg_lower, nearby_place_keywords)
        and contains_any_phrase(msg_lower, campus_anchor_keywords)
    ):
        return 'campus_life'

    library_context_keywords = [
        'thư viện', 'giáo trình', 'tài liệu', 'đầu sách', 'isbn', 'mượn sách', 'trả sách', 'hoàn trả', 'trả hộ',
        'sách của tôi', 'tôi đang mượn', 'hạn trả', 'hạn nộp', 'tới hạn', 'đến hạn', 'gia hạn', 'quá hạn',
        'tiền phạt', 'phí phạt', 'phiếu phạt', 'khoản phạt', 'công nợ', 'nợ phạt', 'phạt nợ',
        'bị phạt', 'thanh toán phạt', 'nộp phạt', 'thu phạt', 'mượn sách', 'mã thẻ', 'giờ mở cửa',
        'cơ sở uth', 'kho sách', 'vị trí kệ', 'mấy cơ sở', 'các cơ sở', 'quy trình mượn', 'quy trình trả', 'cách mượn', 'cách trả',
    ]
    has_campus_query = (
        contains_any_phrase(msg_lower, ['cơ sở', 'chi nhánh', 'trụ sở', 'địa chỉ', 'ở đâu'])
        and contains_any_phrase(msg_lower, ['uth', 'trường', 'đại học', 'thư viện', 'mấy cơ sở', 'các cơ sở', 'cs1', 'cs2', 'cs3'])
    )
    if is_book_query_intent(user_message) or is_non_book_query(user_message) or contains_any_phrase(msg_lower, library_context_keywords) or has_campus_query:
        return 'library'
    return 'conversation'
