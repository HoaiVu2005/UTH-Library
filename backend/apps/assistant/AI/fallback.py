import re

from .presentation import get_conversation_tone
from .routing import classify_chat_mode

# Phản hồi dự phòng khi dịch vụ mô hình không khả dụng.


def _contains_whole_term(text: str, terms: list[str]) -> bool:
    return any(
        re.search(rf'(?<!\w){re.escape(term)}(?!\w)', text, flags=re.IGNORECASE)
        for term in terms
    )

def generate_smart_fallback(user_message: str, relevant_books: list, admin_stats: dict = None, patron_context: dict = None, is_admin: bool = False, history: list = None) -> str:
    msg = user_message.strip().lower()
    chat_mode = classify_chat_mode(user_message, is_admin=is_admin)
    recent_user_history = ' '.join(
        str(item.get('text', '')) for item in (history or [])[-4:]
        if isinstance(item, dict) and item.get('sender') == 'user'
    ).lower()
    conversation_context = f'{recent_user_history} {msg}'.strip()
    conversation_tone = get_conversation_tone(history or [], user_message)

    tone_change_markers = [
        'tao mày', 'mày tao', 'xưng tao', 'xưng mày', 'cứ tao', 'cứ mày',
        'nói chuyện thoải mái với tao',
    ]
    if any(marker in msg for marker in tone_change_markers):
        return "Ừ, được. Từ giờ tao nói với mày tự nhiên, gọn và thẳng ý."

    # Chào hỏi thông thường
    if any(k == msg or msg.startswith(k + " ") for k in ["alo", "chào", "chao", "hi", "hello", "xin chào", "hey", "halo"]):
        return "Alo 😄 UTHie đây! Bạn muốn hỏi gì hay tám chuyện một chút?"

    university_stereotype_markers = ['vựa rau', 'nữ sinh', 'đại gia', 'cặp đại gia', 'gái đẹp', 'bao nuôi']
    misunderstanding_markers = [
        'hỏi 1 đằng', 'hỏi một đằng', 'trả lời 1 nẻo', 'trả lời một nẻo',
        'lạc đề', 'trả lời lạc', 'nói gì vậy', 'nói gì đấy', 'không liên quan',
        'trả lời bậy', 'trả lời sai', 'chả liên quan', 'hiểu sai', 'bị ngáo'
    ]

    # Xử lý khi người dùng phản hồi bot trả lời lệch hướng
    if any(marker in msg for marker in misunderstanding_markers):
        if (
            any(school in conversation_context for school in ['hutech', 'văn lang', 'van lang'])
            and any(marker in conversation_context for marker in university_stereotype_markers)
        ):
            if conversation_tone == 'peer':
                return (
                    'Xin lỗi mày nhé, nãy tao hiểu nhầm ý nên nói chệch hướng 😅 '
                    'Về chuyện HUTECH với Văn Lang thì mấy cái danh xưng “vựa rau” hay cặp đại gia chỉ là định kiến đồn thổi thôi. '
                    'Đa số sinh viên đều học tập nghiêm túc cả, không nên quy chụp cả trường bằng mấy tin đồn đó.'
                )
            return (
                'Xin lỗi bạn nhé, vừa rồi mình hiểu nhầm ý nên trả lời chưa đúng trọng tâm 😅 '
                'Về câu hỏi của bạn: những danh xưng như “vựa rau” chỉ là lời đùa mang tính định kiến và tin đồn thất thiệt. '
                'Phần lớn sinh viên đều học tập chăm chỉ, không nên đánh giá cả một trường qua những đồn đoán thiếu căn cứ.'
            )
        if conversation_tone == 'peer':
            return 'Xin lỗi mày nhé, nãy tao hiểu nhầm ý nên nói chệch hướng 😅 Mày nhắc lại hoặc nói rõ hơn xíu, tao trả lời thẳng vào ý mày liền!'
        return 'Xin lỗi bạn nhé, vừa rồi mình hiểu nhầm ý nên phản hồi chưa đúng trọng tâm 😅 Bạn chia sẻ rõ hơn chút nhé, mình sẽ trả lời thẳng thắn và đúng ý bạn ngay!'

    if (
        any(school in conversation_context for school in ['hutech', 'văn lang', 'van lang'])
        and any(marker in conversation_context for marker in university_stereotype_markers)
    ):
        if conversation_tone == 'peer':
            return (
                'Không mày ơi. Mấy cái danh xưng như “vựa rau” hay đồn đại nữ sinh cặp “đại gia” '
                'chỉ là định kiến phiến diện và tin đồn vô căn cứ trên mạng thôi. '
                'Đa số sinh viên trường nào cũng cày cuốc học tập nghiêm túc cả, không nên quy chụp cho cả trường.'
            )
        return (
            'Không. Gọi HUTECH hay Văn Lang là “vựa rau” và gắn nữ sinh với “đại gia” '
            'là lời đùa mang tính định kiến, không phải thông tin có căn cứ. '
            'Không nên đánh giá sinh viên của cả một trường bằng tin đồn như vậy.'
        )

    # Trường hợp hỏi cơ sở UTH (ưu tiên xử lý trước chat ăn uống/đời thường)
    has_uth_campus_intent = (
        any(k in msg for k in ["cơ sở", "cs1", "cs2", "cs3", "ở đâu", "địa chỉ", "trụ sở"])
        and any(k in msg for k in ["uth", "trường", "đại học", "thư viện", "mấy cơ sở", "các cơ sở", "cơ sở 1", "cơ sở 2", "cơ sở 3", "cs1", "cs2", "cs3", "tô ký", "võ oanh", "thủ đức"])
    ) or any(k in msg for k in ["ở đâu", "địa chỉ", "các cơ sở", "mấy cơ sở"])
    if has_uth_campus_intent and chat_mode != 'campus_life' and not any(other in msg for other in ['hutech', 'bách khoa', 'ueh', 'kinh tế']):
        if any(k in msg for k in ["cơ sở 3", "cs3", "tô ký"]):
            return "Cơ sở 3 của UTH tọa lạc tại số 70 đường Tô Ký, Phường Trung Mỹ Tây, Quận 12, TP.HCM. Không gian Thư viện tại Cơ sở 3 mở cửa phục vụ từ Thứ Hai đến Thứ Bảy: 07h30 – 16h30 (thông trưa)."
        if any(k in msg for k in ["cơ sở 1", "cs1", "võ oanh", "trụ sở"]):
            return "Cơ sở 1 (Trụ sở chính) của UTH tọa lạc tại số 2 đường Võ Oanh, Phường 25, Quận Bình Thạnh, TP.HCM. Thư viện Trung tâm nằm tại Tòa nhà Khu C, mở cửa Thứ 2 – Thứ 6 từ 07h30 – 20h30 và Thứ 7 từ 07h30 – 17h30."
        if any(k in msg for k in ["cơ sở 2", "cs2", "thủ đức"]):
            return "Cơ sở 2 của UTH tọa lạc tại số 10, Đường số 12, Phường An Khánh, TP. Thủ Đức, TP.HCM. Thư viện tại cơ sở 2 mở cửa Thứ 2 – Thứ 6: Sáng 07h30 – 12h00, Chiều 13h00 – 16h30."
        return (
            "Trường Đại học Giao thông Vận tải TP.HCM (UTH) có 3 cơ sở có thư viện:\n"
            "- Cơ sở 1: Số 2 Võ Oanh, P. 25, Q. Bình Thạnh\n"
            "- Cơ sở 2: Số 10, Đường số 12, P. An Khánh, TP. Thủ Đức\n"
            "- Cơ sở 3: Số 70 Tô Ký, P. Trung Mỹ Tây, Q. 12."
        )

    is_current_msg_food = _contains_whole_term(msg, ['ăn', 'đói', 'cơm', 'bún', 'món gì', 'ăn gì', 'quán ăn', 'uống gì'])
    has_school_or_stereotype = (
        any(s in msg for s in ['hutech', 'văn lang', 'van lang', 'đại học', 'trường', 'khoa', 'cơ sở', 'uth', 'cs1', 'cs2', 'cs3'])
        or any(m in msg for m in university_stereotype_markers)
    )
    is_continuation_food = (
        not has_school_or_stereotype
        and ('cơm tấm' in recent_user_history or 'bún bò' in recent_user_history or _contains_whole_term(recent_user_history, ['ăn', 'đói', 'cơm', 'bún', 'món gì']))
        and any(k in msg for k in ['chọn', 'món', 'nào', 'sao', 'sườn', 'bò', 'phân vân', 'chưa biết', 'suy nghĩ', 'cái nào', 'thế nào'])
    )
    if chat_mode == 'conversation' and (is_current_msg_food or is_continuation_food):
        if 'cơm tấm' in conversation_context and 'bún bò' in conversation_context:
            if conversation_tone == 'peer':
                return "Chốt cơm tấm đi mày: no lâu, dễ ăn và khỏi phải phân vân nữa."
            return "Nếu vẫn phân vân thì chọn cơm tấm: no lâu, dễ ăn và hợp lúc cần quyết nhanh."
        if 'cơm tấm' in conversation_context:
            return "Cơm tấm là lựa chọn quá ổn 😄 Sườn nướng, bì chả hay sườn bì trứng đây? Nếu đang đói thì làm phần sườn bì trứng cho đã nhé."
        return "Nghe là biết đang đói rồi 😄 Bạn đang thèm món gì? Nói khu vực hoặc khẩu vị, mình gợi ý cùng bạn."

    if chat_mode == 'campus_life':
        campus_area = "khu Võ Oanh – Nguyễn Gia Trí" if any(k in msg for k in ['cơ sở 1', 'cs1', 'võ oanh']) else "khu vực quanh cơ sở UTH bạn đang nhắc tới"
        venue = "trà sữa" if 'trà sữa' in msg else ("cà phê" if any(k in msg for k in ['cà phê', 'cafe']) else "địa điểm ăn uống")
        return (
            f"Có nhé — bạn nên tìm {venue} quanh **{campus_area}**. "
            f"Vì danh sách cửa hàng và giờ mở cửa thay đổi khá nhanh, mình không muốn bịa tên quán. "
            f"Bạn mở bản đồ và tìm **“{venue} gần UTH cơ sở 1”**, rồi lọc *Đang mở* và đánh giá từ 4 sao; "
            "nếu cho mình bán kính đi bộ (5, 10 hay 15 phút) và mức giá, mình sẽ giúp bạn chọn tiêu chí phù hợp hơn."
        )

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

    if any(k in msg for k in ["phạt", "tiền phạt", "nợ phạt", "thanh toán phạt", "khoản phạt"]):
        return (
            "Để tra cứu chính xác bạn có khoản phạt nào tại Thư viện UTH hay không, "
            "bạn vui lòng đăng nhập vào tài khoản trên hệ thống nhé. "
            "Nếu có khoản phạt quá hạn (2.000 VNĐ/cuốn/ngày trễ), bạn có thể thanh toán trực tuyến "
            "qua mã VietQR tại mục 'Tiền phạt' (/fines) hoặc nộp tại Quầy lưu thông."
        )

    if any(k in msg for k in ["cách mượn", "hướng dẫn mượn", "thủ tục mượn", "mượn như thế nào", "mượn sách thế nào", "quy trình mượn", "mượn sách làm sao"]):
        return (
            "Quy trình mượn sách tại Thư viện UTH gồm 3 bước đơn giản:\n"
            "1. **Tra cứu tài liệu:** Truy cập mục 'Tra cứu sách' (/search) trên cổng thư viện hoặc hỏi UTHie để tìm sách và xem vị trí ký hiệu xếp giá.\n"
            "2. **Lấy sách trên kệ:** Đến Thư viện UTH (Cơ sở 1: Tòa C Thư viện Trung tâm; Cơ sở 2 hoặc Cơ sở 3) và tìm sách tại kệ theo mã xếp giá.\n"
            "3. **Làm thủ tục tại Quầy lưu thông:** Mang sách và Thẻ sinh viên/học viên đến Quầy lưu thông để thủ thư quét mã vạch Code128 hoàn tất mượn sách.\n\n"
            "📌 **Quy định lưu thông:**\n"
            "- Sinh viên: Mượn tối đa 5 cuốn, thời hạn 14 ngày/lượt (gia hạn online 1 lần +7 ngày tại trang 'Sách của tôi').\n"
            "- Giảng viên: Mượn tối đa 10 cuốn, thời hạn 30 ngày/lượt.\n"
            "- Phí phạt trễ hạn: 2.000 VNĐ/cuốn/ngày."
        )

    if msg in ["hả", "ha", "ủa", "ua", "gì cơ", "sao vậy", "sao the", "sao thế", "sao cơ"]:
        if conversation_tone == 'peer':
            return "Nãy tao nói chưa rõ ý hả? Mày cần tao giải thích lại phần nào cứ bảo nhé!"
        return "Vừa rồi mình phản hồi chưa rõ ý bạn đúng không? Bạn cần mình hướng dẫn lại hoặc giải thích thêm phần nào cứ chia sẻ nhé!"

    if relevant_books:
        lines = [f"Thư viện UTH hiện có {len(relevant_books)} tài liệu phù hợp với chủ đề bạn đang quan tâm:"]
        for i, b in enumerate(relevant_books, 1):
            lines.append(f"{i}. **{b['title']}** - Tác giả: {b['authors']} (Còn sẵn: {b['available_copies']}/{b['total_copies']} bản)")
        lines.append("\n👉 Bạn có thể nhấp trực tiếp vào các thẻ sách bên dưới để xem vị trí giá sách và đặt mượn trên hệ thống nhé!")
        return "\n".join(lines)

    if chat_mode == 'conversation':
        return f"Mình đang nghe đây. Bạn nói thêm một chút về “{user_message}” nhé — bạn muốn mình góp ý, giải thích hay chỉ ngồi tám cùng bạn?"

    return f"UTHie đã nhận câu hỏi: \"{user_message}\". Bạn mô tả thêm chi tiết để mình tra cứu chính xác nhé."
