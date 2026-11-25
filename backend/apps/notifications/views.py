from datetime import timedelta
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.core.pagination import StandardPagination
from apps.circulation.models import Loan
from apps.core.enums import LoanStatus, NotificationType, NotificationChannel
from .models import Notification
from .serializers import NotificationSerializer

def check_and_create_due_notifications_for_user(user):
    """
    Checks all active loans for this user.
    If any loan is due within 2 days or overdue, create idempotent notifications.
    Returns list of due alerts.
    """
    now = timezone.now()
    two_days_later = now + timedelta(days=2)

    active_loans = Loan.objects.filter(
        user=user,
        status=LoanStatus.ACTIVE
    ).select_related('book', 'copy')

    alerts = []

    for loan in active_loans:
        if loan.due_at < now:
            today_str = timezone.localdate().strftime('%Y%m%d')
            dedupe_key = f"overdue_{loan.id}_{today_str}"
            content = f'Sách "{loan.book.title}" (Mã vạch: {loan.copy.barcode}) đã quá hạn trả! Vui lòng hoàn trả tại Quầy lưu thông để tránh phát sinh phí phạt.'
            notif, created = Notification.objects.get_or_create(
                dedupe_key=dedupe_key,
                defaults={
                    'user': user,
                    'type': NotificationType.OVERDUE,
                    'channel': NotificationChannel.IN_APP,
                    'content': content,
                    'link': '/loans',
                    'is_read': False,
                }
            )
            alerts.append({
                'loan_id': loan.id,
                'book_title': loan.book.title,
                'barcode': loan.copy.barcode,
                'due_at': loan.due_at.isoformat(),
                'is_overdue': True,
                'days_left': 0,
                'message': content,
                'is_new': created,
            })
        elif loan.due_at <= two_days_later:
            due_date_str = loan.due_at.strftime('%Y%m%d')
            dedupe_key = f"due_soon_{loan.id}_{due_date_str}"
            diff_hours = (loan.due_at - now).total_seconds() / 3600
            diff_days = max(1, int(diff_hours // 24) + 1)
            time_text = "ngày mai" if diff_days == 1 else f"{diff_days} ngày tới"
            content = f'Sách "{loan.book.title}" của bạn sẽ đến hạn trả trong {time_text} ({loan.due_at.strftime("%d/%m/%Y")}). Vui lòng gia hạn hoặc chuẩn bị trả sách.'

            notif, created = Notification.objects.get_or_create(
                dedupe_key=dedupe_key,
                defaults={
                    'user': user,
                    'type': NotificationType.DUE_SOON,
                    'channel': NotificationChannel.IN_APP,
                    'content': content,
                    'link': '/loans',
                    'is_read': False,
                }
            )
            if created and not loan.due_soon_notified:
                loan.due_soon_notified = True
                loan.save(update_fields=['due_soon_notified'])

            alerts.append({
                'loan_id': loan.id,
                'book_title': loan.book.title,
                'barcode': loan.copy.barcode,
                'due_at': loan.due_at.isoformat(),
                'is_overdue': False,
                'days_left': diff_days,
                'message': content,
                'is_new': created,
            })

    return alerts

def check_and_create_admin_notifications(user):
    """
    For staff/admin users, inspects system state:
    1. Pending student book suggestions awaiting review
    2. Ready reservations waiting for patron pickup at circulation desk
    3. Overdue loans across the whole library system
    Creates idempotent notifications for this administrator.
    """
    if getattr(user, 'role', '') != 'admin' and not user.is_staff:
        return []

    from apps.suggestions.models import Suggestion
    from apps.reservations.models import Reservation
    from apps.core.enums import SuggestionStatus, ReservationStatus

    today_str = timezone.localdate().strftime('%Y%m%d')
    admin_alerts = []

    # 1. Pending suggestions submitted by patrons
    pending_suggestions = Suggestion.objects.filter(status=SuggestionStatus.PENDING).select_related('user')
    for sugg in pending_suggestions:
        dedupe_key = f"sugg_new_{sugg.id}_{user.id}"
        patron_name = sugg.user.full_name or sugg.user.username if sugg.user else "Bạn đọc"
        patron_card = f" ({sugg.user.card_code})" if sugg.user and sugg.user.card_code else ""
        content = f"Bạn đọc {patron_name}{patron_card} vừa gửi đề xuất mua sách mới: '{sugg.book_title}'."
        notif, created = Notification.objects.get_or_create(
            dedupe_key=dedupe_key,
            defaults={
                'user': user,
                'type': NotificationType.SUGGESTION_RESULT,
                'channel': NotificationChannel.IN_APP,
                'content': content,
                'link': '/admin/suggestions',
                'is_read': False,
            }
        )
        if created:
            admin_alerts.append({
                'type': 'suggestion',
                'message': content,
                'link': '/admin/suggestions',
                'is_new': True,
            })

    # 2. Ready reservations waiting for patron pickup at circulation desk
    ready_res_count = Reservation.objects.filter(status=ReservationStatus.READY).count()
    if ready_res_count > 0:
        dedupe_key = f"admin_ready_res_{user.id}_{today_str}_{ready_res_count}"
        content = f"Hiện có {ready_res_count} sách chờ nhận sách sẵn sàng tại quầy lưu thông đang chờ bạn đọc đến nhận."
        notif, created = Notification.objects.get_or_create(
            dedupe_key=dedupe_key,
            defaults={
                'user': user,
                'type': NotificationType.RESERVATION_READY,
                'channel': NotificationChannel.IN_APP,
                'content': content,
                'link': '/admin/reservations',
                'is_read': False,
            }
        )
        admin_alerts.append({
            'type': 'reservation',
            'message': content,
            'link': '/admin/reservations',
            'is_new': created,
        })

    # 3. System-wide overdue loans
    overdue_loans_count = Loan.objects.filter(
        status=LoanStatus.ACTIVE,
        due_at__lt=timezone.now()
    ).count()
    if overdue_loans_count > 0:
        dedupe_key = f"admin_overdue_loans_{user.id}_{today_str}_{overdue_loans_count}"
        content = f"Hệ thống ghi nhận {overdue_loans_count} lượt mượn sách quá hạn cần đôn đốc bạn đọc hoàn trả."
        notif, created = Notification.objects.get_or_create(
            dedupe_key=dedupe_key,
            defaults={
                'user': user,
                'type': NotificationType.OVERDUE,
                'channel': NotificationChannel.IN_APP,
                'content': content,
                'link': '/admin/loans',
                'is_read': False,
            }
        )
        admin_alerts.append({
            'type': 'overdue',
            'message': content,
            'link': '/admin/loans',
            'is_new': created,
        })

    return admin_alerts

class RealtimeCheckView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        alerts = check_and_create_due_notifications_for_user(request.user)
        admin_alerts = check_and_create_admin_notifications(request.user)

        unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
        latest_unreads = Notification.objects.filter(user=request.user, is_read=False).order_by('-created_at')[:5]

        return Response({
            'data': {
                'unread_count': unread_count,
                'due_alerts': alerts,
                'admin_alerts': admin_alerts,
                'has_overdue': any(a.get('is_overdue', False) for a in alerts),
                'has_due_soon': any(not a.get('is_overdue', False) for a in alerts),
                'latest_notifications': NotificationSerializer(latest_unreads, many=True).data,
            }
        }, status=status.HTTP_200_OK)

class MyNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        check_and_create_due_notifications_for_user(request.user)
        check_and_create_admin_notifications(request.user)

        queryset = Notification.objects.filter(user=request.user).order_by('-created_at')

        unread_only = request.query_params.get('unread')
        if unread_only and unread_only.lower() == 'true':
            queryset = queryset.filter(is_read=False)

        paginator = StandardPagination()
        page_records = paginator.paginate_queryset(queryset, request)
        serializer = NotificationSerializer(page_records, many=True)
        return paginator.get_paginated_response(serializer.data)

class MarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        notif = Notification.objects.filter(id=pk, user=request.user).first()
        if not notif:
            return Response({'detail': 'Thông báo không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        notif.is_read = True
        notif.save(update_fields=['is_read'])
        return Response({'detail': 'Đã đánh dấu thông báo là đã đọc.'}, status=status.HTTP_200_OK)

class BulkMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'detail': 'Đã đánh dấu tất cả thông báo là đã đọc.'}, status=status.HTTP_200_OK)
