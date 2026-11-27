"""Role-aware library workflows that must not rely on LLM wording."""

from .routing import is_borrowing_guidance_query
from .language import contains_any_phrase, normalize_vietnamese_text


def get_patron_support_workflow_action(
    user_message: str,
    *,
    patron_context: dict | None = None,
) -> dict | None:
    """Handle common patron questions that must use policy or account data."""
    message = normalize_vietnamese_text(user_message)

    if contains_any_phrase(message, ('gia hạn', 'kéo dài hạn mượn')):
        action = {'label': 'Mở sách đang mượn', 'path': '/loans'} if patron_context else {
            'label': 'Đăng nhập để gia hạn', 'path': '/login',
        }
        return {
            'reply': (
                'Để gia hạn sách, bạn vào **Sách của tôi**, chọn cuốn còn hạn và bấm **Gia hạn +7 ngày**. '
                'Mỗi cuốn được gia hạn trực tuyến 1 lần. Sách đã quá hạn hoặc đang có người chờ nhận sẽ không thể gia hạn.'
            ),
            'action': action,
            'suggested_tab': None,
        }

    return_guidance_markers = (
        'cách trả sách', 'hướng dẫn trả sách', 'thủ tục trả sách',
        'quy trình trả sách', 'làm sao trả sách', 'làm sao để trả sách',
        'trả sách như thế nào',
    )
    if contains_any_phrase(message, return_guidance_markers):
        return {
            'reply': (
                'Quy trình trả sách tại Thư viện UTH gồm **3 bước**:\n\n'
                '1. Mang sách và Thẻ bạn đọc UTH đến **Quầy lưu thông**.\n'
                '2. Thủ thư quét mã thẻ, mã vạch bản sao và kiểm tra tình trạng tài liệu.\n'
                '3. Hệ thống xác nhận hoàn trả; nếu phát sinh phí quá hạn, bạn có thể thanh toán tại quầy hoặc trên trang Tiền phạt.\n\n'
                'Bạn nên kiểm tra lại trạng thái tại mục **Sách của tôi** sau khi hoàn tất.'
            ),
            'action': {'label': 'Kiểm tra sách đang mượn', 'path': '/loans'} if patron_context else None,
            'suggested_tab': None,
        }

    reservation_status_markers = (
        'sách tôi đặt trước', 'sách mình đặt trước', 'đặt trước đến đâu',
        'yêu cầu đặt trước của tôi', 'hàng chờ của tôi', 'tôi đang chờ sách',
    )
    if contains_any_phrase(message, reservation_status_markers):
        if not patron_context:
            return {
                'reply': 'Bạn vui lòng đăng nhập để UTHie kiểm tra các yêu cầu đặt trước của tài khoản.',
                'action': {'label': 'Đăng nhập ngay', 'path': '/login'},
                'suggested_tab': None,
            }
        reservations = patron_context.get('reservations', [])
        if not reservations:
            reply = f"{patron_context.get('name', 'Bạn')} hiện không có yêu cầu đặt trước nào đang chờ."
        else:
            lines = [f"{patron_context.get('name', 'Bạn')} đang có **{len(reservations)} yêu cầu đặt trước**:"]
            for index, reservation in enumerate(reservations, 1):
                lines.append(
                    f"{index}. **{reservation.get('book_title', 'Tài liệu')}** — "
                    f"{reservation.get('status_desc', 'đang xử lý')}"
                )
            reply = '\n'.join(lines)
        return {
            'reply': reply,
            'action': {'label': 'Xem yêu cầu đặt trước', 'path': '/reservations'},
            'suggested_tab': None,
        }

    personal_loan_markers = (
        'tôi đang mượn', 'mình đang mượn', 'sách của tôi', 'sách mình mượn',
        'kiểm tra sách đang mượn',
    )
    if contains_any_phrase(message, personal_loan_markers):
        if not patron_context:
            return {
                'reply': 'Bạn vui lòng đăng nhập để UTHie kiểm tra chính xác các sách đang mượn của tài khoản.',
                'action': {'label': 'Đăng nhập ngay', 'path': '/login'},
                'suggested_tab': None,
            }
        loans = patron_context.get('active_loans', [])
        if not loans:
            reply = f"{patron_context.get('name', 'Bạn')} hiện không có sách đang mượn."
        else:
            lines = [f"{patron_context.get('name', 'Bạn')} đang mượn **{len(loans)} cuốn**:"]
            for index, loan in enumerate(loans, 1):
                lines.append(
                    f"{index}. **{loan.get('book_title', 'Tài liệu')}** — hạn trả {loan.get('due_at', 'chưa xác định')} "
                    f"({loan.get('status_str', 'đang mượn')})"
                )
            reply = '\n'.join(lines)
        return {
            'reply': reply,
            'action': {'label': 'Mở sách đang mượn', 'path': '/loans'},
            'suggested_tab': None,
        }

    borrowing_policy_markers = (
        'mượn mấy cuốn', 'mượn được bao nhiêu', 'mượn bao lâu',
        'thời hạn mượn', 'chính sách mượn', 'quy định mượn',
    )
    if contains_any_phrase(message, borrowing_policy_markers):
        role = (patron_context or {}).get('role', 'student')
        is_lecturer = role == 'lecturer'
        limit = int((patron_context or {}).get('max_borrow_limit') or (10 if is_lecturer else 5))
        days = int((patron_context or {}).get('max_borrow_days') or (30 if is_lecturer else 14))
        audience = 'Giảng viên' if is_lecturer else 'Sinh viên'
        return {
            'reply': (
                f'Chính sách dành cho **{audience} UTH**: được mượn tối đa **{limit} cuốn** trong '
                f'**{days} ngày/lượt** và được gia hạn trực tuyến 1 lần thêm 7 ngày nếu sách đủ điều kiện.'
            ),
            'action': {'label': 'Xem sách đang mượn', 'path': '/loans'} if patron_context else None,
            'suggested_tab': None,
        }

    return None


def get_overdue_policy_workflow_action(
    user_message: str,
    *,
    is_admin: bool = False,
) -> dict | None:
    """Trả chính sách quá hạn cho câu hỏi giả định, không đọc chệch sang hồ sơ cá nhân."""
    message = normalize_vietnamese_text(user_message)
    policy_markers = (
        'nếu quá hạn',
        'quá hạn trả sách thì sao',
        'trả sách quá hạn thì sao',
        'quá hạn thì sao',
        'trả trễ thì sao',
        'trễ hạn thì sao',
        'quên trả sách',
        'hậu quả quá hạn',
        'quá hạn bị gì',
    )
    if not contains_any_phrase(message, policy_markers):
        return None

    action = {
        'label': 'Xem danh sách quá hạn',
        'path': '/admin/loans?status=overdue',
    } if is_admin else {
        'label': 'Kiểm tra sách đang mượn',
        'path': '/loans',
    }
    return {
        'reply': (
            'Nếu trả sách quá hạn, Thư viện UTH áp dụng các quy định sau:\n\n'
            '- Phí phạt trễ hạn là **2.000 VNĐ/cuốn/ngày**.\n'
            '- Sách đã quá hạn **không thể gia hạn** trực tuyến.\n'
            '- Bạn cần mang sách và Thẻ bạn đọc đến Quầy lưu thông để hoàn trả; phí phạt có thể thanh toán tại quầy hoặc trên trang Tiền phạt.\n'
            '- Tài khoản có thể bị hạn chế mượn thêm nếu còn sách quá hạn hoặc công nợ chưa xử lý.\n\n'
            'Bạn nên trả sách sớm nhất có thể để tránh phí tiếp tục tăng.'
        ),
        'action': action,
        'suggested_tab': 'overdue' if is_admin else None,
    }


def get_fine_workflow_action(
    user_message: str,
    *,
    is_admin: bool = False,
    patron_context: dict | None = None,
) -> dict | None:
    message = normalize_vietnamese_text(user_message)
    fine_collection_markers = (
        'nộp phạt',
        'thu phạt',
        'thu tiền phạt',
        'thanh toán phạt',
        'xử lý phiếu phạt',
    )
    patron_fine_inquiry_markers = (
        'tôi có bị phạt',
        'tôi bị phạt',
        'mình có bị phạt',
        'mình bị phạt',
        'mình đang có phạt',
        'có bị phạt',
        'bị phạt',
        'phạt nợ',
        'nợ phạt',
        'phạt nào không',
        'có phạt không',
        'có phạt nào',
        'kiểm tra phạt',
        'xem phạt',
        'tra cứu phạt',
        'tiền phạt',
        'khoản phạt',
        'phiếu phạt',
        'phí phạt',
        'công nợ',
        'nợ bao nhiêu',
        'có nợ',
        'nợ tiền',
        'phạt của tôi',
        'tiền phạt của tôi',
        'công nợ của tôi',
        'em có bị phạt',
        'phạt của em',
    )
    is_collection_request = contains_any_phrase(message, fine_collection_markers)
    is_patron_inquiry = contains_any_phrase(message, patron_fine_inquiry_markers)
    if not is_collection_request and not is_patron_inquiry:
        return None

    if is_admin:
        return {
            'reply': (
                'Mở **Quầy thu phạt**, quét/nhập mã thẻ sinh viên hoặc giảng viên để lọc công nợ. '
                'Sau đó chọn đúng phiếu, thu tiền tại quầy hoặc tạo VietQR và xác nhận biên lai.'
            ),
            'action': {
                'label': 'Mở quầy thu phạt',
                'path': '/admin/fines?mode=collect',
            },
            'suggested_tab': 'fines',
        }

    if not patron_context:
        return {
            'reply': (
                'Vui lòng đăng nhập vào tài khoản bạn đọc để tra cứu và thanh toán các khoản phạt cá nhân của bạn.'
            ),
            'action': {
                'label': 'Đăng nhập ngay',
                'path': '/login',
            },
            'suggested_tab': None,
        }

    fine_count = int(patron_context.get('unpaid_fines_count') or 0)
    unpaid_amount = int(patron_context.get('unpaid_amount') or 0)
    role = patron_context.get('role')
    subject = 'Thầy/Cô' if role == 'lecturer' else 'Bạn'
    if fine_count == 0:
        reply = f'{subject} hiện không có khoản phạt nào chưa thanh toán.'
        label = 'Xem lịch sử tiền phạt'
    else:
        formatted_amount = f'{unpaid_amount:,}'.replace(',', '.')
        reply = (
            f'{subject} đang có **{fine_count} phiếu phạt**, tổng còn nợ **{formatted_amount} VNĐ**. '
            'Mở trang Tiền phạt để xem chi tiết và thanh toán VietQR; cũng có thể nộp tại quầy thư viện.'
        )
        label = 'Xem và nộp phạt'

    return {
        'reply': reply,
        'action': {
            'label': label,
            'path': '/fines',
        },
        'suggested_tab': None,
    }


def get_reservation_workflow_action(
    user_message: str,
    *,
    is_admin: bool = False,
    patron_context: dict | None = None,
    relevant_books: list | None = None,
) -> dict | None:
    """Xử lý quy trình mượn sách / chờ nhận sách thông minh qua UTHie AI."""
    message = normalize_vietnamese_text(user_message)
    reservation_markers = (
        'mượn sách', 'dat truoc',
        'chờ nhận sách', 'giu cho',
        'đặt mượn', 'dat muon',
        'mượn trước', 'muon truoc',
        'đặt sách', 'dat sach',
        'mượn sách', 'dang ky muon',
        'đăng ký giữ', 'dang ky giu',
        'giữ sách', 'giu sach',
    )
    if not contains_any_phrase(message, reservation_markers):
        return None

    if is_admin:
        # A staff sentence that merely contains "mượn sách" is usually a data
        # question (locked patrons, overdue loans, borrower lists, statistics).
        # Only open the management workflow when the librarian explicitly asks
        # to operate that workflow.
        admin_management_markers = (
            'quản lý mượn', 'mở quản lý', 'xử lý yêu cầu',
            'duyệt yêu cầu', 'phân phối sách', 'điều phối hàng chờ',
        )
        if not contains_any_phrase(message, admin_management_markers):
            return None
        return {
            'reply': (
                'Thủ thư có thể quản lý, duyệt và phân phối yêu cầu mượn tại màn hình **Quản lý Mượn sách** '
                'hoặc trực tiếp tại **Quầy lưu thông**.'
            ),
            'action': {
                'label': 'Mở quản lý mượn sách',
                'path': '/admin/reservations',
            },
            'suggested_tab': 'overview',
        }

    if is_borrowing_guidance_query(user_message):
        return {
            'reply': (
                'Quy trình mượn sách tại Thư viện UTH gồm **3 bước**:\n\n'
                '1. **Tra cứu và chọn sách:** Mở Kho sách, tìm theo tên sách, tác giả hoặc môn học rồi kiểm tra tình trạng bản sao.\n'
                '2. **Đặt sách:** Nếu còn bản khả dụng, mở đúng đầu sách và chọn mượn/đặt trước. Thư viện sẽ thông báo khi sách sẵn sàng nhận.\n'
                '3. **Nhận sách tại quầy:** Mang Thẻ bạn đọc UTH đến Quầy lưu thông để thủ thư quét mã thẻ và mã vạch bản sao, hoàn tất lượt mượn.\n\n'
                'UTHie sẽ chỉ tạo nút xác nhận mượn khi bạn chọn hoặc nêu rõ một đầu sách cụ thể.'
            ),
            'action': {
                'label': 'Mở kho sách tra cứu',
                'path': '/books',
            },
            'suggested_tab': None,
        }

    if not patron_context:
        return {
            'reply': (
                'Để thực hiện mượn sách hoặc chờ nhận sách, bạn vui lòng đăng nhập vào tài khoản bạn đọc UTH trước nhé.'
            ),
            'action': {
                'label': 'Đăng nhập ngay',
                'path': '/login',
            },
            'suggested_tab': None,
        }

    # 1. Kiểm tra các điều kiện chặn theo quy chế thư viện
    if patron_context.get('is_locked'):
        return {
            'reply': (
                'Tài khoản bạn đọc của bạn đang bị tạm khóa. '
                'Vui lòng liên hệ thủ thư tại Quầy lưu thông để được kiểm tra và hỗ trợ mở khóa thẻ trước khi đặt sách nhé.'
            ),
            'action': None,
            'suggested_tab': None,
        }

    overdue_count = int(patron_context.get('overdue_count') or 0)
    if overdue_count > 0:
        return {
            'reply': (
                f'Bạn đang có **{overdue_count} cuốn sách quá hạn** chưa trả. '
                'Theo quy chế Thư viện UTH, bạn cần hoàn trả sách quá hạn trước khi có thể mượn sách hoặc chờ nhận sách mới.'
            ),
            'action': {
                'label': 'Xem sách đang mượn',
                'path': '/loans',
            },
            'suggested_tab': None,
        }

    unpaid_count = int(patron_context.get('unpaid_fines_count') or 0)
    unpaid_amount = int(patron_context.get('unpaid_amount') or 0)
    if unpaid_count > 0:
        formatted_amount = f'{unpaid_amount:,}'.replace(',', '.')
        return {
            'reply': (
                f'Bạn đang có **{unpaid_count} khoản phạt** chưa thanh toán (tổng nợ: **{formatted_amount} VNĐ**). '
                'Vui lòng thanh toán phí phạt trước khi mượn hoặc đặt trước sách mới.'
            ),
            'action': {
                'label': 'Xem và nộp phạt',
                'path': '/fines',
            },
            'suggested_tab': None,
        }

    # 2. Tìm sách phù hợp nhất để mượn sách
    target_book = None
    if relevant_books and len(relevant_books) > 0:
        target_book = relevant_books[0]

    if target_book:
        book_id = target_book.get('id')
        book_title = target_book.get('title')
        available = int(target_book.get('available_copies') or 0)

        if available > 0:
            return {
                'reply': (
                    f'Thư viện đang có sẵn **{available} bản** cho đầu sách **"{book_title}"**.\n\n'
                    'Bạn chỉ cần nhấn nút xác nhận bên dưới. UTHie sẽ **giữ sách trong 3 ngày** '
                    'để bạn đến Quầy lưu thông hoàn tất thủ tục mượn.'
                ),
                'action': {
                    'type': 'reservation',
                    'label': '⚡ Xác nhận mượn sách ngay',
                    'path': f'/books/{book_id}',
                    'book_id': book_id,
                    'book_title': book_title,
                    'is_ready': True,
                },
                'suggested_tab': None,
            }
        else:
            return {
                'reply': (
                    f'Đầu sách **"{book_title}"** hiện đang hết bản sẵn sàng (toàn bộ đang được mượn).\n\n'
                    'Bạn có muốn **đăng ký vào hàng chờ** không? Nhấn nút xác nhận bên dưới; '
                    'hệ thống sẽ ghi nhận thứ tự chờ và thông báo ngay khi có sách được hoàn trả.'
                ),
                'action': {
                    'type': 'reservation',
                    'label': '⏳ Đăng ký vào hàng chờ',
                    'path': f'/books/{book_id}',
                    'book_id': book_id,
                    'book_title': book_title,
                    'is_ready': False,
                },
                'suggested_tab': None,
            }

    # 3. Nếu người dùng muốn đặt sách nhưng chưa rõ cuốn nào
    return {
        'reply': (
            'Để UTHie giúp bạn mượn sách, bạn hãy cho mình biết tên đầu sách bạn muốn mượn nhé '
            '(ví dụ: *"Mượn sách Giải tích 1"* hoặc *"Chờ nhận sách Lập trình Python"*), '
            'hoặc mở kho sách để chọn cuốn ưng ý.'
        ),
        'action': {
            'label': 'Mở kho sách tra cứu',
            'path': '/books',
        },
        'suggested_tab': None,
    }
