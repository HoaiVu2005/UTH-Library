from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.accounts.permissions import IsAdminUserRole
from apps.core.pagination import StandardPagination
from .models import Fine
from .serializers import (
    FineSerializer,
    CollectFineSerializer,
    WaiveFineSerializer,
)
from .services import collect_fine, waive_fine

class MyFinesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Fine.objects.select_related('loan__book', 'loan__copy').prefetch_related('payments').filter(
            user=request.user
        ).order_by('-created_at')

        status_q = request.query_params.get('status')
        if status_q:
            queryset = queryset.filter(status=status_q)

        paginator = StandardPagination()
        page_records = paginator.paginate_queryset(queryset, request)
        serializer = FineSerializer(page_records, many=True)
        return paginator.get_paginated_response(serializer.data)

class FineListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        queryset = Fine.objects.select_related('user', 'loan__book', 'loan__copy').prefetch_related('payments').order_by('-created_at')

        status_q = request.query_params.get('status')
        if status_q:
            queryset = queryset.filter(status=status_q)

        type_q = request.query_params.get('type')
        if type_q:
            queryset = queryset.filter(type=type_q)

        card_code = request.query_params.get('card_code')
        if card_code:
            queryset = queryset.filter(user__card_code__iexact=card_code.strip())

        paginator = StandardPagination()
        page_records = paginator.paginate_queryset(queryset, request)
        serializer = FineSerializer(page_records, many=True)
        return paginator.get_paginated_response(serializer.data)

class CollectFineView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        serializer = CollectFineSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        amount = serializer.validated_data['amount']
        note = serializer.validated_data.get('note')

        fine = collect_fine(
            fine_id=pk,
            amount=amount,
            collected_by=request.user,
            note=note,
            request=request
        )

        return Response({
            'detail': f'Thu tiền phạt thành công {amount:,}đ.',
            'data': FineSerializer(fine).data
        }, status=status.HTTP_200_OK)

class WaiveFineView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        serializer = WaiveFineSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reason = serializer.validated_data['reason']

        fine = waive_fine(
            fine_id=pk,
            reason=reason,
            waived_by=request.user,
            request=request
        )

        return Response({
            'detail': 'Miễn giảm khoản phạt thành công.',
            'data': FineSerializer(fine).data
        }, status=status.HTTP_200_OK)

