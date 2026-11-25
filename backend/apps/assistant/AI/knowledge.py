"""
Hệ thống Tri thức Chuẩn hóa (Knowledge Base) của Thư viện Trường ĐH Giao thông Vận tải TP.HCM (UTH).
File data hoàn chỉnh giúp UTHie AI phân loại ý định chính xác, trả lời thông minh, đúng trọng tâm
và không bao giờ gợi ý sách thừa thãi khi người dùng chỉ trò chuyện xã giao hoặc hỏi thủ tục.
"""

# ─── 1. THÔNG TIN HỆ THỐNG VÀ 3 CƠ SỞ UTH ───────────────────────────────────────
UTH_CAMPUSES_DATA = {
    "cs1": {
        "name": "Cơ sở 1 (Trụ sở chính & Thư viện Trung tâm)",
        "address": "Số 2, đường Võ Oanh (đường D3 cũ), Phường 25, Quận Bình Thạnh, TP.HCM",
        "library_space": "Tòa C (Tòa nhà Trung tâm Thư viện UTH) gồm các phòng đọc mở, phòng đa phương tiện, không gian tự học có máy lạnh và wifi tốc độ cao.",
        "opening_hours": {
            "weekday": "Thứ Hai đến Thứ Sáu: 07h30 – 20h30 (mở thông tầm buổi trưa)",
            "saturday": "Thứ Bảy: 07h30 – 17h30",
            "sunday": "Chủ Nhật và các ngày nghỉ Lễ/Tết: Nghỉ",
        },
        "description": "Cơ sở có quy mô lưu trữ và diện tích phục vụ lớn nhất toàn trường, đầy đủ tài liệu tất cả các chuyên ngành.",
    },
    "cs2": {
        "name": "Cơ sở 2 (Cơ sở TP. Thủ Đức)",
        "address": "Số 10, Đường số 12, Phường An Khánh, TP. Thủ Đức (Khu vực Quận 2 cũ), TP.HCM",
        "library_space": "Phòng đọc Thư viện Cơ sở 2 phục vụ tài liệu chuyên ngành Hàng hải, Logistics, Cơ khí tàu thủy và các môn đại cương.",
        "opening_hours": {
            "weekday": "Thứ Hai đến Thứ Sáu: Sáng từ 07h30 – 12h00; Chiều từ 13h00 – 16h30",
            "saturday": "Thứ Bảy: Nghỉ",
            "sunday": "Chủ Nhật và ngày Lễ/Tết: Nghỉ",
        },
        "description": "Phục vụ sinh viên học tập tại cơ sở Thủ Đức.",
    },
    "cs3": {
        "name": "Cơ sở 3 (Cơ sở Quận 12)",
        "address": "Số 70, đường Tô Ký, Phường Trung Mỹ Tây, Quận 12, TP.HCM",
        "library_space": "Thư viện Cơ sở 3 phục vụ sinh viên khối Kỹ thuật Công trình, Cơ khí và Giao thông.",
        "opening_hours": {
            "weekday": "Thứ Hai đến Thứ Bảy: 07h30 – 16h30 (mở thông tầm buổi trưa)",
            "sunday": "Chủ Nhật và ngày Lễ/Tết: Nghỉ",
        },
        "description": "Phục vụ sinh viên học tập tại cơ sở Quận 12.",
    },
}

# ─── 2. QUY CHẾ VÀ CHÍNH SÁCH LƯU THÔNG TÀI LIỆU ──────────────────────────────
CIRCULATION_POLICIES_DATA = {
    "student": {
        "max_borrow_limit": 5,
        "max_borrow_days": 14,
        "renewal_times": 1,
        "renewal_days_added": 7,
        "policy_note": "Sinh viên được mượn tối đa 5 cuốn trong 14 ngày. Có thể gia hạn trực tuyến 1 lần (+7 ngày) tại mục 'Sách của tôi' (/loans) trước khi sách đáo hạn.",
    },
    "lecturer": {
        "max_borrow_limit": 10,
        "max_borrow_days": 30,
        "renewal_times": 1,
        "renewal_days_added": 7,
        "policy_note": "Giảng viên/Thầy cô được mượn tối đa 10 cuốn trong 30 ngày. Gia hạn trực tuyến 1 lần (+7 ngày).",
    },
    "fine_rate_vnd_per_day": 2000,
    "fine_rule": "2.000 VNĐ / cuốn / ngày trễ hạn. Bạn đọc nợ phạt có thể xem chi tiết và nộp phạt trực tuyến tại mục 'Tiền phạt' (/fines) hoặc quầy lưu thông.",
    "reservation_hold_hours": 48,
    "reservation_rule": "Sách đặt trước khi sẵn sàng tại quầy sẽ được giữ chỗ riêng trong 48 giờ (hoặc 3 ngày làm việc). Sau thời gian này nếu bạn đọc không đến nhận, hệ thống sẽ tự động chuyển lượt giữ chỗ cho người tiếp theo trong hàng chờ.",
}

# ─── 3. QUY TRÌNH MƯỢN TRẢ SÁCH TẠI THƯ VIỆN UTH ──────────────────────────────
CIRCULATION_PROCEDURES_DATA = {
    "borrow": [
        "Bước 1: Tra cứu sách trên Cổng Thư viện số UTH (/search) hoặc hỏi UTHie AI để biết tên sách, vị trí kệ và cơ sở còn sách.",
        "Bước 2: Đến Thư viện UTH (Cơ sở 1 Tòa C, Cơ sở 2 hoặc 3), tìm sách theo mã xếp giá trên giá sách.",
        "Bước 3: Mang sách cùng Thẻ sinh viên/học viên đến Quầy lưu thông để thủ thư quét mã vạch Code128 ghi mượn vào hệ thống.",
        "Bước 4: Kiểm tra thông tin hạn trả trên cổng thư viện (/loans). Sinh viên: 14 ngày; Giảng viên: 30 ngày.",
    ],
    "return": [
        "Bước 1: Trực tiếp mang sách cùng Thẻ sinh viên/học viên (hoặc mã thẻ bạn đọc) đến Quầy lưu thông tại Thư viện UTH (Cơ sở 1 Tòa C, Cơ sở 2 hoặc 3).",
        "Bước 2: Thủ thư quét mã thẻ của chính sinh viên và quét mã vạch Code128 trên sách để đối soát và ghi nhận trả sách vào hệ thống.",
        "Bước 3: Thủ thư kiểm tra tình trạng tài liệu (độ hao hại, nguyên vẹn) và tất toán phiếu mượn.",
        "Bước 4: Nếu có phát sinh phí trễ hạn (2.000 VNĐ/ngày), sinh viên nộp trực tiếp tại quầy hoặc nộp trực tuyến qua mục 'Tiền phạt' (/fines).",
        "QUY TẮC BẮT BUỘC KHI TRẢ SÁCH TẠI THƯ VIỆN UTH:",
        "- KHÔNG THỂ NHỜ BẠN BÈ TRẢ HỘ: Quy chế Thư viện UTH bắt buộc sinh viên phải trực tiếp đến quầy vì thủ thư cần quét mã thẻ sinh viên/bạn đọc chính chủ và đối soát tài liệu.",
        "- KHÔNG CÓ TỦ TRẢ SÁCH TỰ ĐỘNG: Toàn bộ quy trình hoàn trả tài liệu phải được thủ thư trực tiếp kiểm tra và quét mã tại Quầy lưu thông.",
    ],
    "renew": [
        "Đăng nhập cổng Thư viện UTH, vào mục 'Sách của tôi' (/loans).",
        "Tại cuốn sách còn hạn mượn, bấm nút 'Gia hạn +7d'. Sách sẽ được cộng thêm 7 ngày vào hạn trả.",
        "Lưu ý: Sách đã quá hạn hoặc sách đang có người khác đặt trước trong hàng chờ sẽ không thể gia hạn online.",
    ],
    "reserve": [
        "Khi sách hết bản sẵn hoặc muốn giữ sách trước, bấm nút 'Đặt trước' / 'Giữ chỗ' trên thẻ sách hoặc trang chi tiết.",
        "Nếu còn bản sẵn: Sách chuyển trạng thái sẵn sàng giữ chỗ tại quầy trong 48 giờ.",
        "Nếu hết bản sẵn: Bạn đọc được xếp số thứ tự trong hàng chờ và nhận thông báo ngay khi có sách trả lại.",
    ],
}

# ─── 4. DANH MỤC 8 CHUYÊN NGÀNH VÀ ĐỊNH HƯỚNG TÀI LIỆU KHO UTH ──────────────────
ACADEMIC_FACULTIES_DATA = {
    "it": {
        "name": "Công nghệ thông tin",
        "faculty": "Viện Công nghệ Thông tin",
        "keywords": [
            "it", "cntt", "công nghệ thông tin", "khoa học máy tính", "kỹ thuật phần mềm",
            "hệ thống thông tin", "an toàn thông tin", "an ninh mạng", "lập trình", "phần mềm",
            "web", "react", "django", "python", "java", "c++", "c#", "database", "sql",
            "mạng máy tính", "deep learning", "machine learning", "ai", "trí tuệ nhân tạo", "git"
        ],
        "core_subjects": "Cấu trúc dữ liệu & Giải thuật, Lập trình Web/Hệ thống, Cơ sở dữ liệu, Mạng máy tính, Trí tuệ nhân tạo (AI), Kỹ nghệ phần mềm.",
    },
    "logistics": {
        "name": "Logistics & Chuỗi cung ứng",
        "faculty": "Viện Hàng hải & Logistics",
        "keywords": [
            "logistics", "logistic", "logicstic", "chuỗi cung ứng", "supply chain", "kho bãi",
            "kho hàng", "kho vận", "hậu cần", "vận tải đa phương thức", "last-mile", "giao hàng",
            "giao nhận", "xuất nhập khẩu", "xnk", "hải quan", "incoterms", "cảng biển", "chuỗi lạnh"
        ],
        "core_subjects": "Quản trị chuỗi cung ứng, Quản trị kho bãi & vận chuyển, Khai thác cảng container, Nghiệp vụ ngoại thương & Incoterms, Logistics chuỗi lạnh.",
    },
    "transport": {
        "name": "Kỹ thuật Giao thông vận tải",
        "faculty": "Khoa Công trình Giao thông / Khoa Vận tải",
        "keywords": [
            "giao thông", "gtvt", "cầu đường", "đường bộ", "đường sắt", "đường cao tốc",
            "hàng không", "sân bay", "xe buýt", "its", "giao thông thông minh", "đường thủy",
            "hàng hải", "tàu thủy", "hoa tiêu", "vận tải"
        ],
        "core_subjects": "Thiết kế hình học đường ô tô & nút giao, Kỹ thuật đường cao tốc, Quy hoạch mạng lưới giao thông, Giao thông thông minh ITS, Khai thác vận tải.",
    },
    "economics": {
        "name": "Kinh tế & Quản trị kinh doanh",
        "faculty": "Khoa Kinh tế Vận tải",
        "keywords": [
            "kinh tế", "quản trị", "kinh doanh", "marketing", "thương mại", "ngoại thương",
            "tài chính", "kế toán", "doanh nghiệp", "qtkd", "hợp đồng ppp", "quản trị dự án"
        ],
        "core_subjects": "Quản trị dự án đầu tư giao thông (PMBOK), Đàm phán thương mại quốc tế, Hợp đồng PPP, Quản trị rủi ro & tài chính doanh nghiệp.",
    },
    "construction": {
        "name": "Kỹ thuật Xây dựng công trình",
        "faculty": "Khoa Xây dựng",
        "keywords": [
            "xây dựng", "xddd", "kết cấu", "bê tông", "địa kỹ thuật", "sức bền",
            "nền móng", "công trình", "bim", "vật liệu xây dựng", "công trình ngầm"
        ],
        "core_subjects": "Cơ học đất & Nền móng công trình, Địa kỹ thuật & xử lý nền đất yếu, Mô hình thông tin công trình (BIM), Sức bền vật liệu & Kết cấu bê tông cốt thép.",
    },
    "mechanical": {
        "name": "Kỹ thuật Cơ khí & Động lực",
        "faculty": "Khoa Cơ khí",
        "keywords": [
            "cơ khí", "động cơ", "động lực", "ô tô", "oto", "chế tạo máy", "cnc",
            "thủy lực", "khí nén", "cơ điện tử", "chẩn đoán ô tô"
        ],
        "core_subjects": "Nguyên lý máy & Chi tiết máy, Động cơ đốt trong & Khung gầm ô tô, Hệ thống điều khiển điện tử ô tô hiện đại, Gia công CNC & Thủy khí.",
    },
    "electrical": {
        "name": "Kỹ thuật Điện - Điện tử",
        "faculty": "Khoa Điện - Điện tử Viễn thông",
        "keywords": [
            "điện", "điện tử", "cảm biến", "sensor", "iot", "biến tần", "tự động hóa",
            "vi điều khiển", "viễn thông", "điện công nghiệp", "plc"
        ],
        "core_subjects": "Mạch điện & Điện tử công suất, Kỹ thuật vi điều khiển & Hệ thống nhúng, Hệ thống điều khiển tự động hóa PLC/Biến tần, Internet vạn vật (IoT).",
    },
    "languages": {
        "name": "Ngoại ngữ & Kỹ năng mềm",
        "faculty": "Khoa Ngoại ngữ / Bộ môn Kỹ năng",
        "keywords": [
            "ngoại ngữ", "tiếng anh", "toeic", "ielts", "kỹ năng", "kỹ năng mềm",
            "thuyết trình", "đàm phán", "làm việc nhóm", "viết báo cáo"
        ],
        "core_subjects": "Tiếng Anh chuyên ngành Kỹ thuật - Giao thông - Logistics, Luyện thi TOEIC/IELTS, Kỹ năng thuyết trình & Đàm phán thuyết phục, Viết báo cáo kỹ thuật.",
    },
}

# ─── 5. QUY TẮC NHẬN DIỆN VÀ PHẢN HỒI THÔNG MINH ──────────────────────────────
def build_uth_knowledge_prompt() -> str:
    """Tạo chuỗi dữ liệu tri thức đầy đủ để nạp trực tiếp vào prompt của Gemini."""
    campuses_text = ""
    for k, v in UTH_CAMPUSES_DATA.items():
        campuses_text += f"   - {v['name']}:\n"
        campuses_text += f"     + Địa chỉ: {v['address']}\n"
        campuses_text += f"     + Không gian: {v['library_space']}\n"
        campuses_text += f"     + Giờ mở cửa: {v['opening_hours']['weekday']}; {v['opening_hours'].get('saturday', '')}\n"

    faculties_text = ""
    for k, v in ACADEMIC_FACULTIES_DATA.items():
        faculties_text += f"   - Ngành {v['name']} ({v['faculty']}): Môn học cốt lõi gồm {v['core_subjects']}\n"

    return f"""
[DỮ LIỆU CHUẨN XÁC VỀ HỆ THỐNG THƯ VIỆN ĐẠI HỌC GIAO THÔNG VẬN TẢI TP.HCM (UTH)]:
1. Hệ thống 3 cơ sở và giờ mở cửa:
{campuses_text}
   - Toàn hệ thống thư viện nghỉ vào Chủ Nhật và các ngày nghỉ Lễ/Tết theo quy định nhà nước.

2. Quy định lưu thông:
   - Sinh viên: {CIRCULATION_POLICIES_DATA['student']['policy_note']}
   - Giảng viên: {CIRCULATION_POLICIES_DATA['lecturer']['policy_note']}
   - Phí phạt quá hạn: {CIRCULATION_POLICIES_DATA['fine_rule']}
   - Giữ chỗ đặt trước: {CIRCULATION_POLICIES_DATA['reservation_rule']}

3. Quy trình lưu thông:
   - Mượn sách: Tìm mã kệ trên cổng (/search) -> Đến kho lấy sách -> Quét mã thẻ sinh viên và mã sách tại Quầy lưu thông.
   - Trả sách: Sinh viên PHẢI TRỰC TIẾP mang sách cùng Thẻ sinh viên đến Quầy lưu thông. Thủ thư sẽ quét mã thẻ của chính sinh viên và mã vạch Code128 trên sách để ghi nhận trả sách. TUYỆT ĐỐI KHÔNG ĐƯỢC NHỜ BẠN BÈ TRẢ HỘ (vì bắt buộc phải quét mã thẻ của sinh viên chính chủ tại quầy) và Thư viện UTH KHÔNG DÙNG tủ trả sách tự động.
   - Gia hạn: Bạn đọc vào 'Sách của tôi' (/loans) bấm 'Gia hạn +7d' (sách quá hạn hoặc bị người khác đặt trước thì không gia hạn được).
   - Đặt trước: Bấm giữ chỗ trực tiếp trên hệ thống; giữ chỗ trong 48 giờ khi sách có sẵn tại quầy.

4. Cơ cấu đào tạo và chuyên ngành tại UTH:
{faculties_text}
"""
