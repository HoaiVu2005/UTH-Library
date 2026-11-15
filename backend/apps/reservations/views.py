from django.db import models
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
)

class CreateReservationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateReservationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        book_id = serializer.validated_data['book_id']
        reservation = create_reservation(user=request.user, book_id=book_id, request=request)

        msg = (
            'Giữ chỗ sách thành công! Sách đang được giữ cho bạn tại quầy A trong 3 ngày.'
            if reservation.status == 'ready'
            else f'Đặt trước thành công! Bạn đã được thêm vào hàng chờ (Vị trí #{reservation.queue_position}).'
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

        paginator = StandardPagination()
        page_records = paginator.paginate_queryset(queryset, request)
        serializer = ReservationSerializer(page_records, many=True)
        return paginator.get_paginated_response(serializer.data)

class CancelReservationView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        cancelled = cancel_reservation(reservation_id=pk, user=request.user, request=request)
        msg = 'Hủy yêu cầu đặt trước thành công.'
        if cancelled.no_show_counted:
          msg += ' Chú ý: Việc hủy sách khi đã sẵn sàng nhận tính là 1 lần no-show.'

        return Response({
            'detail': msg,
            'data': ReservationSerializer(cancelled).data
        }, status=status.HTTP_200_OK)

class ReservationListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        queryset = Reservation.objects.select_related('user', 'book', 'book__category', 'copy').order_by('status', 'queue_position', '-created_at')

        status_q = request.query_params.get('status')
        if status_q:
            queryset = queryset.filter(status=status_q)

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
            'detail': 'Đã đưa yêu cầu đặt trước lên đầu hàng chờ.',
            'data': ReservationSerializer(advanced).data
        }, status=status.HTTP_200_OK)

