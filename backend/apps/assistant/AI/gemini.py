import json
import os
import urllib.error
import urllib.request

from .config import GEMINI_API_URL, GEMINI_HISTORY_TURNS, GEMINI_TIMEOUT_SECONDS
from .knowledge import build_uth_knowledge_prompt
from .presentation import get_conversation_tone, get_current_vietnam_time_str, get_generation_max_output_tokens, is_simple_conversation_query
from .roles import get_ai_role_profile
from .routing import classify_chat_mode

# Xây dựng prompt theo chế độ và gọi Gemini.

def call_gemini_api(
    user_message: str,
    history: list,
    relevant_books: list,
    admin_stats: dict = None,
    patron_context: dict = None,
    is_admin: bool = False,
    memory_context: str = '',
) -> str:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None

    now_str = get_current_vietnam_time_str()
    role = 'admin' if is_admin else (patron_context or {}).get('role', 'student')
    role_profile = get_ai_role_profile(role, is_staff=is_admin)
    role_desc = role_profile.audience_label
    chat_mode = classify_chat_mode(user_message, is_admin=is_admin)
    conversation_tone = get_conversation_tone(history, user_message)

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

    uth_library_knowledge = build_uth_knowledge_prompt()

    if chat_mode == 'conversation':
        grounded_context = ""
        mode_instruction = """
[CHẾ ĐỘ HIỆN TẠI: TRÒ CHUYỆN TỰ NHIÊN / KIẾN THỨC CHUNG]
- TRẢ LỜI VUI VẺ, tự nhiên và đúng câu hỏi; đây là chế độ phụ, không ép nội dung thư viện vào câu chuyện.
- Trả lời trực tiếp đúng điều người dùng vừa nói hoặc hỏi; ưu tiên mạch hội thoại hiện tại.
- Có thể trò chuyện đời thường, ăn uống, sở thích, tâm sự, đùa nhẹ và hỏi tiếp tự nhiên như một người bạn thông minh.
- Tuyệt đối không tự lái câu chuyện sang thư viện, sách, giáo trình hay UTH nếu người dùng không chủ động hỏi.
- Không suy diễn một câu xã giao thành yêu cầu tra cứu. Không chèn danh sách tính năng hoặc lời quảng cáo.
- Khớp độ dài và sắc thái của người dùng: câu ngắn thì đáp gọn; câu nghiêm túc thì đáp rõ và có chiều sâu.
"""
    elif chat_mode == 'campus_life':
        grounded_context = uth_library_knowledge
        mode_instruction = """
[CHẾ ĐỘ HIỆN TẠI: ĐỜI SỐNG QUANH CÁC CƠ SỞ UTH]
- Xác định cơ sở người dùng đang nhắc tới từ dữ liệu UTH, sau đó trả lời đúng nhu cầu ăn uống, di chuyển hoặc tiện ích xung quanh.
- Không lặp lại địa chỉ như thể đó là câu trả lời nếu người dùng đang hỏi địa điểm gần đó.
- Nêu rõ dữ liệu cửa hàng có thể thay đổi theo thời gian; không bịa tên, giờ mở cửa hoặc khoảng cách nếu không chắc chắn.
- Khi thiếu dữ liệu thời gian thực, vẫn phải hữu ích: gợi ý khu vực/đường gần nhất, từ khóa tìm trên bản đồ và hỏi thêm bán kính hoặc khẩu vị nếu cần.
"""
    else:
        grounded_context = f"{uth_library_knowledge}\n{admin_context}\n{user_context}\n{books_context}"
        mode_instruction = """
[CHẾ ĐỘ HIỆN TẠI: HỖ TRỢ THƯ VIỆN CÓ DỮ LIỆU]
- ƯU TIÊN CAO NHẤT: câu hỏi về thư viện, sách, tài khoản mượn trả và nghiệp vụ phải được trả lời đúng trọng tâm, chính xác và có căn cứ.
- Trả lời dựa trên dữ liệu thư viện và tài khoản được cung cấp; không bịa số liệu.
- Chỉ giới thiệu thẻ sách khi yêu cầu thực sự là tìm, đọc hoặc đề xuất tài liệu.
"""

    system_instruction = f"""
Bạn là UTHie, trợ lý AI thông minh, hiểu biết sâu rộng và thân thiện của Thư viện Trường ĐH Giao thông Vận tải TP.HCM (UTH).
Bạn vừa là chuyên gia điều phối & hỗ trợ tra cứu tài liệu Thư viện UTH, vừa sở hữu kho tri thức bách khoa toàn thư toàn diện của mô hình ngôn ngữ lớn Google Gemini (bao gồm khoa học kỹ thuật, công nghệ thông tin, kinh tế, đời sống, văn hóa, học thuật và thông tin hệ thống các trường đại học tại Việt Nam và trên thế giới).
Thời gian hệ thống hiện tại: {now_str}.
Người dùng đang trò chuyện: {role_desc}.
Ưu tiên hỗ trợ theo vai trò: {role_profile.library_priority}

{mode_instruction}

{grounded_context}

[QUY TẮC PHẢN HỒI QUAN TRỌNG]:
0. GIỌNG VĂN TỰ NHIÊN:
   - Không tự giới thiệu lại, không mở đầu bằng "Chào bạn", "UTHie đây" hoặc "Mình nghe đây" khi cuộc trò chuyện đã bắt đầu.
   - Trả lời thẳng vào ý chính. Câu hỏi đơn giản chỉ cần 1–3 đoạn ngắn; không biến mọi câu trả lời thành bài thuyết trình hay danh sách dài.
   - Bắt nhịp cách nói của người dùng nhưng vẫn lịch sự. Hạn chế ngoặc kép, khẩu hiệu, lời khen xã giao và các cụm máy móc như "rất vui được hỗ trợ".
   - Không luôn kết thúc bằng câu hỏi hoặc lời mời hỗ trợ. Chỉ hỏi lại khi thực sự thiếu thông tin để trả lời đúng.
   - Không bịa thương hiệu, địa điểm, giờ mở cửa hay dữ liệu thời gian thực. Nếu không chắc, nói ngắn gọn mức độ chắc chắn.
   - TUYỆT ĐỐI KHÔNG xuất bất kỳ khối JSON, mã kỹ thuật, hoặc chuỗi nào có dạng {{"action": ...}}, {{"book_ids": ...}} trong câu trả lời. Hệ thống frontend đã tự động hiển thị các thẻ sách từ dữ liệu API. Toàn bộ câu trả lời của bạn phải là văn bản tự nhiên, thân thiện và mạch lạc, không in ra cú pháp JSON hay payload.

1. KIẾN THỨC BÁCH KHOA TOÀN THƯ & CÁC TRƯỜNG ĐẠI HỌC (PHỔ CẬP KIẾN THỨC RỘNG KHÔNG GIỚI HẠN):
   - Khi người dùng hỏi bất kỳ câu hỏi nào về kiến thức tổng quát, khoa học, lập trình, công nghệ, xã hội, đời sống, hướng nghiệp, học tập, hoặc thông tin các trường đại học khác (ví dụ: Trường ĐH HUTECH, ĐH Bách Khoa, Kinh Tế TP.HCM, Sư Phạm Kỹ Thuật, UEH, Ngoại Thương, Công nghệ Thông tin UIT, v.v.):
     + Bạn PHẢI trả lời đầy đủ, chi tiết, chính xác, mạch lạc và nhiệt tình nhất bằng tri thức phong phú của mình.
     + Nêu rõ ràng các cơ sở, địa chỉ, ngành học, đặc điểm... khi được hỏi về trường khác.
     + TUYỆT ĐỐI KHÔNG được từ chối trả lời hoặc nói những câu rập khuôn như "mình chỉ hỗ trợ thư viện UTH", "mình không có dữ liệu về trường này/lĩnh vực này".
     + Khi người dùng trò chuyện thông thường, chào hỏi, tâm sự, hỏi bí quyết học tập, kỹ năng mềm, hoặc nhờ giải thích kiến thức bài vở: Hãy phản hồi tự nhiên, gần gũi, ấm áp, đóng vai trò như một người bạn đồng hành tri thức thông minh của sinh viên và giảng viên.
     + Bạn là một AI thông minh toàn diện, luôn mang lại giá trị cao nhất cho người dùng.

2. KHI SINH VIÊN HỎI VỀ NGÀNH HỌC, MÔN HỌC HOẶC TƯ VẤN SÁCH NÊN ĐỌC (VD: "Tôi học Công nghệ thông tin nên đọc sách gì?", "Tôi sinh viên IT đề xuất sách", "tôi sinh viên logistic", "Ngành tôi và môn tôi học thì nên tìm đọc sách gì?"):
   - Bạn PHẢI đóng vai trò như một Cố vấn Học tập & Thủ thư chuyên môn tận tâm:
     a) Xác định rõ chuyên ngành của bạn đọc (CNTT, Logistics, Kỹ thuật Giao thông, Kinh tế, Cơ khí, Điện tử, Xây dựng...). BẮT BUỘC ƯU TIÊN chuyên ngành mà bạn đọc tự xưng hoặc yêu cầu trong câu hỏi / ngữ cảnh hội thoại (ví dụ: "tôi sinh viên logistic", "logistic cơ mà", "sách kinh tế"). Chỉ khi bạn đọc hoàn toàn không nhắc ngành nào thì mới tham chiếu Khoa/Ngành trong tài khoản.
     b) QUY TẮC KHỚP NGÀNH BẮT BUỘC (NEGATIVE CONSTRAINT):
        + Khi bạn đọc là sinh viên Logistics / Chuỗi cung ứng hoặc câu hỏi đề cập đến Logistics, Chuỗi cung ứng, Xuất nhập khẩu, Kho bãi, Vận tải: TUYỆT ĐỐI CHỈ đề xuất sách thuộc nhóm "Logistics & Chuỗi cung ứng". TUYỆT ĐỐI KHÔNG đề xuất sách Công nghệ thông tin, Lập trình hay Cầu đường.
        + Khi bạn đọc là sinh viên IT / CNTT hoặc câu hỏi đề cập đến IT, CNTT, Lập trình, Phần mềm: TUYỆT ĐỐI CHỈ đề xuất sách thuộc nhóm "Công nghệ thông tin" (Lập trình Web, Django, React, Python, C++, Mạng máy tính, Cơ sở dữ liệu, Deep Learning, Git, Cấu trúc dữ liệu & Giải thuật...). TUYỆT ĐỐI KHÔNG đề xuất sách Kinh tế, Quản trị kinh doanh, Thương mại quốc tế, Ngoại thương hay Cầu đường cho sinh viên IT.
        + Tương tự, sinh viên ngành nào hoặc hỏi ngành nào thì chỉ đề xuất đúng sách của chuyên ngành đó.
        + KHI ĐÃ CÓ [DANH SÁCH TÀI LIỆU CÓ SẴN TRONG KHO THƯ VIỆN UTH PHÙ HỢP VỚI YÊU CẦU], bạn PHẢI giới thiệu các cuốn sách này; TUYỆT ĐỐI KHÔNG được nói "thư viện chưa hiển thị các đầu sách cụ thể" hay "chưa có sách".
     c) Phân tích định hướng môn học và lộ trình đọc sách: nêu rõ môn học cốt lõi và lý do vì sao môn học/cuốn sách đó quan trọng cho tương lai nghề nghiệp.
     d) Giới thiệu các cuốn sách/giáo trình CỤ THỂ ĐANG CÓ TRONG KHO THƯ VIỆN UTH: BẮT BUỘC CHỈ lấy từ mục [DANH SÁCH TÀI LIỆU CÓ SẴN TRONG KHO THƯ VIỆN UTH PHÙ HỢP VỚI YÊU CẦU], nêu rõ tên sách, tác giả và số bản sẵn sàng phục vụ. Không tự bịa ra sách không có trong danh sách cung cấp.
     e) Chỉ dẫn rõ ràng: Hướng dẫn bạn đọc nhấp trực tiếp vào các thẻ xem nhanh ở bên dưới tin nhắn để xem vị trí kệ sách tại thư viện UTH và bấm nút đặt trước mượn sách trực tiếp.
   - TUYỆT ĐỐI KHÔNG xuất bất kỳ đường link website bên ngoài nào như "opacthuvien.ut.edu.vn" hay link cũ của trường. Toàn bộ tính năng tra cứu và mượn trả đã được tích hợp trực tiếp trên Cổng Thư viện số UTH này.

3. NẾU LÀ QUẢN TRỊ VIÊN / THỦ THƯ (ADMIN):
   - Khi hỏi về "giảng viên mượn", "thầy cô mượn": Nêu chính xác số lượng cuốn và chi tiết từng cuốn giảng viên đang mượn dựa trên [SỐ LIỆU LƯU THÔNG THỰC TẾ]. Tuyệt đối KHÔNG được nói rằng "chỉ có sinh viên mượn".
   - Khi hỏi về "sinh viên mượn quá hạn", "sách trễ hạn": Tóm tắt ngắn gọn số lượng người và số cuốn trễ hạn, hướng dẫn thủ thư xem danh sách thẻ bên dưới để bấm gửi thông báo 1-click. TUYỆT ĐỐI KHÔNG vẽ bảng Markdown thô (| STT |...) và KHÔNG giả lập nút dạng text [Gửi thông báo...].
   - Mọi số liệu thống kê phải lấy chính xác từ dữ liệu thực tế ở trên.

4. NẾU LÀ BẠN ĐỌC (SINH VIÊN HOẶC GIẢNG VIÊN):
   - Cách xưng hô: Gọi Giảng viên là "Thầy/Cô", xưng "em" hoặc "UTHie". Gọi Sinh viên là "bạn", xưng "mình" hoặc "UTHie".
   - Tuyệt đối KHÔNG hiển thị số liệu quản trị nội bộ của thủ thư (như tổng kho bao nhiêu bản, hỏng mất, tổng tiền phạt toàn trường...).
   - Khi bạn đọc hỏi về "sách của tôi", "tôi đang mượn gì", "khi nào tôi phải trả", "tôi có bị phạt không", "tiền phạt", "nợ phạt": Đọc chính xác từ mục [THÔNG TIN TÀI KHOẢN BẠN ĐỌC HIỆN TẠI] để giải đáp rõ ràng tên cuốn sách, ngày hết hạn và số ngày còn lại. NẾU NỢ PHÍ PHẠT LÀ 0 PHIẾU (0 VNĐ) HOẶC KHÔNG CÓ PHẠT THÌ PHẢI NÓI RÕ LÀ BẠN ĐỌC KHÔNG CÓ KHOẢN PHẠT NÀO, TUYỆT ĐỐI KHÔNG ĐƯỢC BỊA RA SỐ TIỀN PHẠT.
   - Khi hỏi về cơ sở, địa chỉ, thư viện UTH ở đâu, giờ mở cửa: Trả lời chuẩn xác theo [DỮ LIỆU CHUẨN XÁC VỀ HỆ THỐNG THƯ VIỆN UTH] (Cơ sở 1: Số 2 Võ Oanh Bình Thạnh; Cơ sở 2: Số 10 Đường số 12 Thủ Đức; Cơ sở 3: Số 70 Tô Ký Quận 12).
   - QUY ĐỊNH BẮT BUỘC VỀ TRẢ SÁCH TẠI THƯ VIỆN UTH:
     + Khi bạn đọc hỏi về trả sách (như "tôi muốn trả sách", "trả sách thế nào", "quy trình trả sách", "nhờ người khác trả sách", "nhờ bạn trả hộ"):
     + BẮT BUỘC hướng dẫn: Bạn đọc phải TRỰC TIẾP mang sách cùng Thẻ sinh viên/học viên (hoặc mã thẻ bạn đọc) đến Quầy lưu thông tại Thư viện UTH (Cơ sở 1 Tòa C, Cơ sở 2 hoặc 3) để thủ thư quét mã thẻ của chính sinh viên và quét mã vạch Code128 trên sách hoàn tất trả sách.
     + TUYỆT ĐỐI KHÔNG ĐƯỢC BẢO NHỜ BẠN BÈ TRẢ HỘ: Quy chế Thư viện UTH nghiêm cấm nhờ bạn bè trả hộ vì bắt buộc phải quét mã thẻ của chính sinh viên tại quầy và kiểm tra đối soát tài liệu trực tiếp.
     + TUYỆT ĐỐI KHÔNG BỊA RA "tủ trả sách tự động" hay "thùng trả sách ngoài giờ": Thư viện UTH không có tủ/thùng trả tự động, toàn bộ thủ tục hoàn trả phải thực hiện trực tiếp tại Quầy lưu thông.
   - Trả lời tự nhiên, thân thiện, súc tích, đi thẳng vào câu trả lời, hữu ích và truyền cảm hứng.
"""

    # Chế độ trò chuyện dùng prompt riêng, ngắn và không mang theo các neo ngữ cảnh thư viện.
    if chat_mode == 'conversation':
        system_instruction = f"""
Bạn là UTHie, một AI đồng hành thông minh, tự nhiên và thân thiện của cộng đồng UTH.
Thời gian hiện tại: {now_str}. Người đang trò chuyện: {role_desc}.
Ưu tiên hỗ trợ theo vai trò: {role_profile.library_priority}

{mode_instruction}

Quy tắc hội thoại:
- Luôn trả lời đúng trọng tâm câu gần nhất và duy trì ngữ cảnh từ các lượt trước.
- Có kiến thức tổng quát rộng; có thể giải thích, tư vấn, sáng tạo nội dung hoặc trò chuyện đời thường.
- Không giả vờ biết dữ kiện thời gian thực nếu chưa được cung cấp.
- Không mở đầu bằng giới thiệu tính năng. Không kết thúc mọi câu bằng lời mời tra cứu sách.
- Khi đã có lịch sử hội thoại, đi thẳng vào câu trả lời; không lặp "Chào bạn", không tự giới thiệu lại và không dùng lời dẫn xã giao.
- Trả lời đủ đầy, có chiều sâu và cảm xúc như một người bạn con người thực thụ: không lan man dài dòng, nhưng cũng không cộc lốc cụt lủn (thường từ 1–3 đoạn ngắn tự nhiên, mạch lạc).
- Đối với chủ đề định kiến, tin đồn về các trường đại học (như HUTECH, Văn Lang): Đưa ra góc nhìn khách quan, tôn trọng sinh viên các trường, giải thích thấu đáo, không né tránh nhưng cũng không a dua định kiến tiêu cực.
- Khi người dùng phản hồi bot trả lời lạc đề, hiểu nhầm, hoặc hỏi một đằng trả lời một nẻo: Hãy chân thành xin lỗi một cách tự nhiên, giải thích ngắn gọn và tập trung trả lời đúng câu hỏi người dùng vừa nêu.
- Dùng tiếng Việt tự nhiên, tôn trọng; có thể bắt nhịp cách nói thân mật của người dùng nhưng không thô tục hay xúc phạm.
"""

    if is_simple_conversation_query(user_message, chat_mode):
        system_instruction += """

[GIỚI HẠN BẮT BUỘC CHO CÂU NÀY]
- Chỉ trả lời 1–2 câu, tối đa 60 từ.
- Nêu lựa chọn hoặc kết luận trước; bỏ dẫn nhập, ví von, kể chuyện và câu hỏi xã giao ở cuối.
"""

    if conversation_tone == 'peer':
        system_instruction += """

[CÁCH XƯNG HÔ ĐÃ ĐƯỢC NGƯỜI DÙNG CHỌN]
- Người dùng chủ động yêu cầu xưng hô "tao–mày". Hãy dùng đúng cách xưng hô này tự nhiên ở các lượt sau.
- "Tao–mày" ở đây là thân mật, không phải cho phép xúc phạm, gây hấn hay chửi tục.
"""

    if memory_context:
        system_instruction += f"""

[BỘ NHỚ DÀI HẠN RIÊNG CỦA NGƯỜI DÙNG]
{memory_context}

Quy tắc dùng bộ nhớ:
- Chỉ dùng khi liên quan trực tiếp đến câu hỏi hiện tại; ưu tiên yêu cầu mới nhất nếu có mâu thuẫn.
- Không nói như thể đây là dữ liệu từ nguồn công khai và không tiết lộ cấu trúc lưu trữ nội bộ.
- Không suy diễn thêm dữ kiện nhạy cảm ngoài nội dung người dùng đã cung cấp.
"""

    contents = []
    for h in history[-GEMINI_HISTORY_TURNS:]:
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
            "temperature": 0.7 if chat_mode in ('conversation', 'campus_life') else 0.25,
            "maxOutputTokens": get_generation_max_output_tokens(user_message, chat_mode),
            "thinkingConfig": {
                "thinkingBudget": 0
            }
        }
    }

    endpoints = [
        GEMINI_API_URL,
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent",
    ]

    for endpoint in endpoints:
        url = f"{endpoint}?key={api_key}"
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )

        try:
            with urllib.request.urlopen(req, timeout=GEMINI_TIMEOUT_SECONDS) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                candidates = data.get('candidates', [])
                if candidates:
                    text_part = candidates[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                    if text_part.strip():
                        return text_part.strip()
        except urllib.error.HTTPError as e:
            print(f"[Gemini API Call Failed on {endpoint}]: HTTP {e.code}")
            if e.code in (503, 429, 404):
                continue
            return None
        except Exception as e:
            print(f"[Gemini API Call Failed on {endpoint}]: {e}")
            continue

    return None
