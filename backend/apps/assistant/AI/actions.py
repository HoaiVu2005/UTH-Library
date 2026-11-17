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
        'phạt của tôi',
        'tiền phạt của tôi',
        'công nợ của tôi',
        'tôi nợ bao nhiêu',
        'tôi có nợ',
    )
    is_collection_request = any(marker in message for marker in fine_collection_markers)
    is_patron_inquiry = bool(
        patron_context
        and any(marker in message for marker in patron_fine_inquiry_markers)
    )
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
        return None

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
