from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from apps.assistant.services import (
    query_relevant_books,
    call_gemini_api,
    generate_smart_fallback,
    get_admin_library_statistics,
    get_patron_context,
    send_overdue_notice_to_student,
    is_admin_query
)
from apps.accounts.models import User

class AIChatView(APIView):
    """
    API tiếp nhận tin nhắn từ UTHie Chat Widget.
    Tự động phân định đối tượng:
    - Quản trị viên / Thủ thư: Cung cấp số liệu lưu thông DB, phân loại Giảng viên & Sinh viên, bảng điều phối đa năng.
    - Bạn đọc (Giảng viên / Sinh viên): Phục vụ cá nhân hóa (sách đang mượn, hạn trả, phạt, quy chế, địa chỉ cơ sở),
      tuyệt đối không hiển thị số liệu quản trị hay thẻ đề xuất không liên quan.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        message = request.data.get('message', '').strip()
        history = request.data.get('history', [])
        user_role = request.data.get('user_role', 'student')
        user_id = request.data.get('user_id')
        card_code = request.data.get('card_code')

        # Xác định đối tượng người dùng thực tế
        current_user = None
        if request.user and request.user.is_authenticated:
            current_user = request.user
        elif user_id:
            current_user = User.objects.filter(id=user_id).first()
        elif card_code:
            current_user = User.objects.filter(card_code=card_code).first()

        is_admin = False
        if current_user:
            is_admin = (current_user.role == 'admin') or current_user.is_staff
        elif user_role == 'admin':
            is_admin = True

        if not message:
            return Response({'error': 'Vui lòng nhập nội dung tin nhắn.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Thu thập dữ liệu theo đối tượng
        admin_stats = None
        overdue_students = []
        patron_context = None
        active_tab = None

        if is_admin or is_admin_query('admin', message):
            admin_stats = get_admin_library_statistics()
            if admin_stats and any(k in message.lower() for k in ["quá hạn", "sinh viên", "danh sách", "chưa trả"]):
                overdue_students = admin_stats.get('overdue_students', [])

            # Xác định tab thống kê tương ứng cho Thủ thư
            msg_l = message.lower()
            if any(k in msg_l for k in ["giảng viên", "thầy cô", "giáo viên"]):
                active_tab = "lecturers"
            elif any(k in msg_l for k in ["hết bản sao", "sắp hết", "gần hết", "còn ít", "bản sao ít"]):
                active_tab = "low_stock"
            elif any(k in msg_l for k in ["mượn nhiều", "sách hot", "phổ biến", "top sách"]):
                active_tab = "top_books"
            elif any(k in msg_l for k in ["hư hỏng", "hỏng", "báo mất", "mất sách"]):
                active_tab = "damaged"
            elif any(k in msg_l for k in ["tồn kho", "bản sao", "kho sách", "sách có sẵn"]):
                active_tab = "inventory"
            elif any(k in msg_l for k in ["phạt", "tiền phạt", "phiếu phạt"]):
                active_tab = "fines"
            elif any(k in msg_l for k in ["quá hạn", "chưa trả", "sinh viên", "đôn đốc"]):
                active_tab = "overdue"
            elif any(k in msg_l for k in ["thống kê", "lưu thông", "báo cáo", "tổng quan"]):
                active_tab = "overview"
        else:
            # Bạn đọc (Sinh viên / Giảng viên): Lấy dữ liệu cá nhân hóa thực tế
            patron_context = get_patron_context(current_user)

        # 2. Tìm sách liên quan trong kho Thư viện UTH
        relevant_books = query_relevant_books(message, limit=4)

        # 3. Gọi Gemini LLM với ngữ cảnh chuẩn xác
        reply_text = call_gemini_api(
            message,
            history,
            relevant_books,
            admin_stats=admin_stats,
            patron_context=patron_context,
            is_admin=is_admin
        )

        # 4. Fallback thông minh nếu LLM gặp sự cố mạng
        if not reply_text:
            reply_text = generate_smart_fallback(
                message,
                relevant_books,
                admin_stats=admin_stats,
                patron_context=patron_context,
                is_admin=is_admin
            )

        return Response({
            'reply': reply_text,
            'suggested_books': relevant_books,
            'overdue_students': overdue_students if is_admin else [],
            'admin_stats': admin_stats if is_admin else None,
            'suggested_tab': active_tab if is_admin else None,
            'patron_info': {
                'name': patron_context['name'],
                'role': patron_context['role'],
                'card_code': patron_context['card_code'],
                'active_loans_count': patron_context['active_loans_count'],
            } if patron_context else None,
        })


class SendOverdueNotificationView(APIView):
    """
    API 1-click: Thủ thư bấm nút từ khung chat AI để gửi thông báo trực tiếp
    vào tài khoản sinh viên mượn quá hạn.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        loan_id = request.data.get('loan_id')
        if not loan_id:
            return Response({'error': 'Thiếu mã lượt mượn (loan_id).'}, status=status.HTTP_400_BAD_REQUEST)

        result = send_overdue_notice_to_student(int(loan_id))
        if result.get('success'):
            return Response(result, status=status.HTTP_200_OK)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
