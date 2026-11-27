from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from apps.accounts.permissions import IsAdminUserRole
from apps.assistant.AI import (
    query_relevant_books,
    call_gemini_api,
    generate_smart_fallback,
    get_admin_library_statistics,
    get_patron_context,
    send_overdue_notice_to_student,
    is_admin_query,
    is_book_query_intent,
    classify_chat_mode,
    normalize_assistant_voice,
    compact_simple_reply,
    build_long_term_memory_context,
    record_conversation_turn,
    remember_explicit_user_facts,
    resolve_intent_message,
    get_fine_workflow_action,
    get_overdue_policy_workflow_action,
    get_patron_support_workflow_action,
    get_reservation_workflow_action,
)
from apps.assistant.models import AssistantConversation, AssistantMemoryEntry

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
        session_id = str(request.data.get('session_id', 'default'))

        # Chỉ tin danh tính đã được JWT xác thực. Không dùng user_id/card_code từ
        # payload để tránh đọc dữ liệu hoặc bộ nhớ của tài khoản khác.
        current_user = request.user if request.user and request.user.is_authenticated else None

        is_admin = bool(current_user and (current_user.role in ('admin', 'librarian') or current_user.is_staff))

        if not message:
            return Response({'error': 'Vui lòng nhập nội dung tin nhắn.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Thu thập dữ liệu theo đối tượng
        admin_stats = None
        overdue_students = []
        patron_context = None
        active_tab = None

        if is_admin:
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
            elif any(k in msg_l for k in ["khóa mượn", "bị khóa", "mở khóa", "khóa thẻ"]):
                active_tab = "locked_users"
            elif any(k in msg_l for k in ["quá hạn", "chưa trả", "sinh viên", "đôn đốc"]):
                active_tab = "overdue"
            elif any(k in msg_l for k in ["thống kê", "lưu thông", "báo cáo", "tổng quan"]):
                active_tab = "overview"
        else:
            # Bạn đọc (Sinh viên / Giảng viên): Lấy dữ liệu cá nhân hóa thực tế
            patron_context = get_patron_context(current_user)

        trusted_role = current_user.role if current_user else user_role
        routed_message = resolve_intent_message(message, role=trusted_role)

        workflow = get_fine_workflow_action(
            routed_message,
            is_admin=is_admin,
            patron_context=patron_context,
        )
        if not workflow:
            workflow = get_overdue_policy_workflow_action(
                routed_message,
                is_admin=is_admin,
            )
        if not workflow and not is_admin:
            workflow = get_patron_support_workflow_action(
                routed_message,
                patron_context=patron_context,
            )

        # 2. Tìm sách liên quan trong kho Thư viện UTH
        # Chỉ đề xuất sách khi người dùng thực sự có nhu cầu tra cứu, mượn sách hoặc hỏi tài liệu học tập
        chat_mode = classify_chat_mode(routed_message, is_admin=is_admin)
        patron_dept = patron_context.get('department', '') if patron_context else ''
        relevant_books = (
            query_relevant_books(message, patron_dept=patron_dept, limit=4, history=history)
            if is_book_query_intent(routed_message, history=history) and not workflow and chat_mode not in ('conversation', 'campus_life')
            else []
        )

        # Nếu không phải quy trình tiền phạt, kiểm tra quy trình mượn sách / chờ nhận sách
        if not workflow:
            workflow = get_reservation_workflow_action(
                routed_message,
                is_admin=is_admin,
                patron_context=patron_context,
                relevant_books=relevant_books,
            )

        memory_context = build_long_term_memory_context(current_user, message)

        # 3. Nghiệp vụ có đích thao tác rõ ràng dùng phản hồi tất định; các câu hỏi
        # còn lại mới chuyển cho Gemini để tránh mô hình chỉ dẫn sai màn hình.
        reply_text = workflow['reply'] if workflow else call_gemini_api(
            message,
            history,
            relevant_books,
            admin_stats=admin_stats,
            patron_context=patron_context,
            is_admin=is_admin,
            memory_context=memory_context,
        )

        # 4. Fallback thông minh nếu LLM gặp sự cố mạng
        if not reply_text:
            reply_text = generate_smart_fallback(
                message,
                relevant_books,
                admin_stats=admin_stats,
                patron_context=patron_context,
                is_admin=is_admin,
                history=history,
            )

        reply_text = normalize_assistant_voice(reply_text, has_history=bool(history))
        reply_text = compact_simple_reply(reply_text, message, is_admin=is_admin)

        # Lưu sau khi đã có câu trả lời hoàn chỉnh. Người chưa đăng nhập không
        # được ghi bộ nhớ dài hạn và dữ liệu luôn gắn với tài khoản hiện tại.
        remember_explicit_user_facts(current_user, message)
        record_conversation_turn(current_user, session_id, message, reply_text)

        return Response({
            'reply': reply_text,
            'action': workflow['action'] if workflow else None,
            'suggested_books': relevant_books,
            'overdue_students': overdue_students if is_admin else [],
            'admin_stats': admin_stats if is_admin else None,
            'suggested_tab': workflow['suggested_tab'] if workflow else (active_tab if is_admin else None),
            'patron_info': {
                'name': patron_context['name'],
                'role': patron_context['role'],
                'card_code': patron_context['card_code'],
                'active_loans_count': patron_context['active_loans_count'],
            } if patron_context else None,
        })


class AIMemoryView(APIView):
    """Cho người dùng xem và xóa các dữ kiện họ đã yêu cầu AI ghi nhớ."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        memories = AssistantMemoryEntry.objects.filter(
            user=request.user,
            is_active=True,
        ).order_by('-updated_at')
        return Response({
            'data': [
                {
                    'id': memory.id,
                    'kind': memory.kind,
                    'content': memory.content,
                    'updated_at': memory.updated_at,
                }
                for memory in memories
            ],
        })

    def delete(self, request):
        AssistantMemoryEntry.objects.filter(user=request.user).delete()
        AssistantConversation.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SendOverdueNotificationView(APIView):
    """
    API 1-click: Thủ thư bấm nút từ khung chat AI để gửi thông báo trực tiếp
    vào tài khoản sinh viên mượn quá hạn.
    """
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        raw_loan_id = request.data.get('loan_id')
        if raw_loan_id in (None, ''):
            return Response({'error': 'Thiếu mã lượt mượn (loan_id).'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            loan_id = int(raw_loan_id)
        except (TypeError, ValueError):
            return Response({'error': 'Mã lượt mượn không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)
        if loan_id <= 0:
            return Response({'error': 'Mã lượt mượn không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)

        result = send_overdue_notice_to_student(loan_id)
        if result.get('success'):
            return Response(result, status=status.HTTP_200_OK)
        return Response(result, status=result.pop('status_code', status.HTTP_400_BAD_REQUEST))
