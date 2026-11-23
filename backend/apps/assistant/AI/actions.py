"""Role-aware library workflows that must not rely on LLM wording."""


def get_fine_workflow_action(
    user_message: str,
    *,
    is_admin: bool = False,
    patron_context: dict | None = None,
) -> dict | None:
    message = user_message.strip().lower()
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
    is_collection_request = any(marker in message for marker in fine_collection_markers)
    is_patron_inquiry = any(marker in message for marker in patron_fine_inquiry_markers)
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
    """Xử lý quy trình đặt trước / giữ chỗ sách thông minh qua UTHie AI."""
    message = user_message.strip().lower()
    reservation_markers = (
        'đặt trước', 'dat truoc',
        'giữ chỗ', 'giu cho',
        'đặt mượn', 'dat muon',
        'mượn trước', 'muon truoc',
        'đặt sách', 'dat sach',
        'đăng ký mượn', 'dang ky muon',
        'đăng ký giữ', 'dang ky giu',
        'giữ sách', 'giu sach',
    )
    if not any(marker in message for marker in reservation_markers):
        return None

    if is_admin:
        return {
            'reply': (
                'Thủ thư có thể quản lý, duyệt và phân phối sách đặt trước tại màn hình **Quản lý Đặt trước** '
                'hoặc trực tiếp tại **Quầy lưu thông**.'
            ),
            'action': {
                'label': 'Mở quản lý đặt trước',
                'path': '/admin/reservations',
            },
            'suggested_tab': 'overview',
        }

    if not patron_context:
        return {
            'reply': (
                'Để thực hiện đặt trước hoặc giữ chỗ sách, bạn vui lòng đăng nhập vào tài khoản bạn đọc UTH trước nhé.'
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
                'Theo quy chế Thư viện UTH, bạn cần hoàn trả sách quá hạn trước khi có thể đặt trước hoặc giữ chỗ sách mới.'
            ),
            'action': {
                'label': 'Xem sách đang mượn',
                'path': '/profile',
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
                'Vui lòng thanh toán phí phạt trước khi thực hiện đặt trước hoặc mượn sách nhé.'
            ),
            'action': {
                'label': 'Xem và nộp phạt',
                'path': '/fines',
            },
            'suggested_tab': None,
        }

    # 2. Tìm sách phù hợp nhất để đặt trước
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
                    f'Bạn chỉ cần nhấn nút xác nhận bên dưới, UTHie sẽ **giữ chỗ ngay** tại quầy cho bạn trong 3 ngày!'
                ),
                'action': {
                    'type': 'reservation',
                    'label': '⚡ Xác nhận giữ chỗ ngay',
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
                    f'Bạn có muốn **đặt trước vào hàng chờ** không? Nhấn nút xác nhận bên dưới, hệ thống sẽ xếp số ưu tiên và gửi thông báo ngay khi có sách hoàn trả!'
                ),
                'action': {
                    'type': 'reservation',
                    'label': '⏳ Xác nhận đặt trước vào hàng chờ',
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
            'Để UTHie giúp bạn đặt trước, bạn hãy cho mình biết tên đầu sách bạn muốn mượn nhé '
            '(ví dụ: *"Đặt trước sách Giải tích 1"* hoặc *"Giữ chỗ sách Lập trình Python"*), '
            'hoặc mở kho sách để chọn cuốn ưng ý.'
        ),
        'action': {
            'label': 'Mở kho sách tra cứu',
            'path': '/books',
        },
        'suggested_tab': None,
    }
