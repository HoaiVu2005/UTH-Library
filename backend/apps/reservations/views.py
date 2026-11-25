from django.db import models
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.accounts.permissions import IsAdminUserRole
from apps.core.pagination import StandardPagination
from .models import Reservation
from .serializers import (
    ReservationSerializer,
    CreateReservationSerializer,
)
from .services import (
    create_reservation,
    cancel_reservation,
    advance_reservation,
    expire_stale_reservations,
)

class CreateReservationView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAdminUserRole()]
        return [IsAuthenticated()]

    def get(self, request):
        return ReservationListView().get(request)

    def post(self, request):
        serializer = CreateReservationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        book_id = serializer.validated_data['book_id']
        reservation = create_reservation(user=request.user, book_id=book_id, request=request)

        msg = (
            'Mượn sách thành công! Sách đang được giữ cho bạn tại Quầy lưu thông trong 3 ngày.'
            if reservation.status == 'ready'
            else f'Mượn sách thành công! Bạn đã được thêm vào hàng chờ (Vị trí #{reservation.queue_position}).'
        )

        return Response({
            'detail': msg,
            'data': ReservationSerializer(reservation).data
        }, status=status.HTTP_201_CREATED)

class MyReservationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Reservation.objects.select_related('book', 'book__category', 'copy').filter(
            user=request.user
        ).order_by('status', 'queue_position', '-created_at')

        status_q = request.query_params.get('status')
        if status_q:
            queryset = queryset.filter(status=status_q)

        today_q = request.query_params.get('today')
        date_preset = request.query_params.get('date_preset')
        date_exact = request.query_params.get('date')
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')

        now = timezone.now()
        today = now.date()
        if today_q in ('true', '1', 'True') or date_preset == 'today':
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            queryset = queryset.filter(created_at__gte=today_start)
        elif date_preset == 'week':
            week_ago = now - timezone.timedelta(days=7)
            queryset = queryset.filter(created_at__gte=week_ago)
        elif date_preset == 'month':
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            queryset = queryset.filter(created_at__gte=month_start)
        elif date_exact:
            queryset = queryset.filter(created_at__date=date_exact)
        else:
            if from_date:
                queryset = queryset.filter(created_at__date__gte=from_date)
            if to_date:
                queryset = queryset.filter(created_at__date__lte=to_date)

        paginator = StandardPagination()
        page_records = paginator.paginate_queryset(queryset, request)
        serializer = ReservationSerializer(page_records, many=True)
        return paginator.get_paginated_response(serializer.data)

class CancelReservationView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        cancelled = cancel_reservation(reservation_id=pk, user=request.user, request=request)
        msg = 'Hủy yêu cầu mượn sách thành công.'
        if cancelled.no_show_counted:
          msg += ' Chú ý: Việc hủy sách khi đã sẵn sàng nhận tính là 1 lần no-show.'

        return Response({
            'detail': msg,
            'data': ReservationSerializer(cancelled).data
        }, status=status.HTTP_200_OK)

class ReservationListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        try:
            expire_stale_reservations(admin_user=request.user, request=request)
        except Exception:
            pass

        queryset = Reservation.objects.select_related('user', 'book', 'book__category', 'copy').order_by('status', 'queue_position', '-created_at')

        status_q = request.query_params.get('status')
        if status_q:
            queryset = queryset.filter(status=status_q)

        today_q = request.query_params.get('today')
        date_preset = request.query_params.get('date_preset')
        date_exact = request.query_params.get('date')
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')

        now = timezone.now()
        today = now.date()
        if today_q in ('true', '1', 'True') or date_preset == 'today':
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            queryset = queryset.filter(created_at__gte=today_start)
        elif date_preset == 'week':
            week_ago = now - timezone.timedelta(days=7)
            queryset = queryset.filter(created_at__gte=week_ago)
        elif date_preset == 'month':
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            queryset = queryset.filter(created_at__gte=month_start)
        elif date_exact:
            queryset = queryset.filter(created_at__date=date_exact)
        else:
            if from_date:
                queryset = queryset.filter(created_at__date__gte=from_date)
            if to_date:
                queryset = queryset.filter(created_at__date__lte=to_date)

        book_id = request.query_params.get('book_id')
        if book_id:
            queryset = queryset.filter(book_id=book_id)

        card_code = request.query_params.get('card_code')
        if card_code:
            queryset = queryset.filter(user__card_code__iexact=card_code.strip())

        search_q = request.query_params.get('search')
        if search_q:
            q = search_q.strip()
            queryset = queryset.filter(
                models.Q(user__card_code__icontains=q) |
                models.Q(user__full_name__icontains=q) |
                models.Q(book__title__icontains=q) |
                models.Q(copy__barcode__icontains=q)
            )

        paginator = StandardPagination()
        page_records = paginator.paginate_queryset(queryset, request)
        serializer = ReservationSerializer(page_records, many=True)
        return paginator.get_paginated_response(serializer.data)

class AdvanceReservationView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        advanced = advance_reservation(reservation_id=pk, admin_user=request.user, request=request)
        return Response({
            'detail': 'Đã đưa yêu cầu mượn sách lên đầu hàng chờ.',
            'data': ReservationSerializer(advanced).data
        }, status=status.HTTP_200_OK)

class ExpireStaleReservationsView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        result = expire_stale_reservations(admin_user=request.user, request=request)
        return Response({
            'detail': f"Đã quét và xử lý thành công: Hủy {result['expired_count']} yêu cầu chờ nhận sách quá hạn 3 ngày; Chuyển tiếp thành công cho {result['forwarded_count']} bạn đọc kế tiếp trong hàng chờ.",
            'data': result
        }, status=status.HTTP_200_OK)


