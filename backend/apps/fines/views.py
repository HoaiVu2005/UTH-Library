import re
from django.db import transaction
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.accounts.models import User
from apps.accounts.permissions import IsAdminUserRole
from apps.core.pagination import StandardPagination
from apps.core.enums import UserRole, FineStatus
from .models import Fine
from .serializers import (
    FineSerializer,
    CollectFineSerializer,
    WaiveFineSerializer,
    PayFineOnlineSerializer,
    PayAllFinesOnlineSerializer,
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

class PayFineOnlineView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        fine = Fine.objects.select_for_update().filter(id=pk).first()
        if not fine:
            return Response({'detail': 'Không tìm thấy khoản phạt yêu cầu.'}, status=status.HTTP_404_NOT_FOUND)

        # IDOR check: Non-admin patrons can only pay their own fine
        if request.user.role != UserRole.ADMIN and fine.user_id != request.user.id:
            return Response({'detail': 'Bạn không có quyền thanh toán khoản phạt của người khác.'}, status=status.HTTP_403_FORBIDDEN)

        if fine.status in [FineStatus.PAID, FineStatus.WAIVED]:
            return Response({'detail': 'Khoản phạt này đã được thanh toán hoặc đã được miễn giảm.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PayFineOnlineSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        amount = serializer.validated_data.get('amount') or fine.remaining_amount
        transaction_code = serializer.validated_data.get('transaction_code', '')
        ref_note = f" (Mã GD: {transaction_code.strip()})" if transaction_code and transaction_code.strip() else ""
        note = f"Nộp phạt trực tuyến tại nhà qua VietQR{ref_note}"

        updated_fine = collect_fine(
            fine_id=pk,
            amount=amount,
            collected_by=request.user,
            note=note,
            request=request
        )

        return Response({
            'detail': f'Nộp phạt trực tuyến thành công {amount:,}đ.',
            'data': FineSerializer(updated_fine).data
        }, status=status.HTTP_200_OK)

class PayAllFinesOnlineView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PayAllFinesOnlineSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        transaction_code = serializer.validated_data.get('transaction_code', '')
        ref_note = f" (Mã GD: {transaction_code.strip()})" if transaction_code and transaction_code.strip() else ""

        with transaction.atomic():
            unpaid_fines = list(Fine.objects.select_for_update().filter(
                user=request.user,
                status__in=[FineStatus.UNPAID, FineStatus.PARTIAL]
            ).order_by('created_at'))

            if not unpaid_fines:
                return Response({'detail': 'Bạn không có khoản phạt nào cần thanh toán.'}, status=status.HTTP_400_BAD_REQUEST)

            total_paid = 0
            for fine in unpaid_fines:
                remaining = fine.remaining_amount
                if remaining > 0:
                    collect_fine(
                        fine_id=fine.id,
                        amount=remaining,
                        collected_by=request.user,
                        note=f"Nộp phạt trực tuyến tại nhà toàn bộ qua VietQR{ref_note}",
                        request=request
                    )
                    total_paid += remaining

            return Response({
                'detail': f'Nộp phạt trực tuyến thành công cho {len(unpaid_fines)} khoản phạt. Tổng tiền: {total_paid:,}đ.',
                'total_paid': total_paid,
                'count': len(unpaid_fines)
            }, status=status.HTTP_200_OK)

class CheckFineStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        fine = Fine.objects.filter(id=pk).first()
        if not fine:
            return Response({'detail': 'Không tìm thấy khoản phạt.'}, status=status.HTTP_404_NOT_FOUND)
        if request.user.role != UserRole.ADMIN and fine.user_id != request.user.id:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        return Response({
            'id': fine.id,
            'status': fine.status,
            'is_paid': fine.status in [FineStatus.PAID, FineStatus.WAIVED],
            'paid_amount': fine.paid_amount,
            'remaining_amount': fine.remaining_amount
        }, status=status.HTTP_200_OK)

class CheckAllFinesStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        has_unpaid = Fine.objects.filter(
            user=request.user,
            status__in=[FineStatus.UNPAID, FineStatus.PARTIAL]
        ).exists()
        return Response({
            'has_unpaid': has_unpaid,
            'is_all_paid': not has_unpaid
        }, status=status.HTTP_200_OK)

class SimulateBankTransferView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        fine_id = request.data.get('fine_id')
        is_pay_all = request.data.get('is_pay_all', False)
        tx_code = f"STB.{request.data.get('transaction_code') or str(int(timezone.now().timestamp()))}"

        with transaction.atomic():
            if is_pay_all:
                unpaid_fines = list(Fine.objects.select_for_update().filter(
                    user=request.user,
                    status__in=[FineStatus.UNPAID, FineStatus.PARTIAL]
                ).order_by('created_at'))
                if not unpaid_fines:
                    return Response({'detail': 'Bạn không có khoản phạt nào cần thanh toán.'}, status=status.HTTP_400_BAD_REQUEST)
                total_paid = 0
                for f in unpaid_fines:
                    rem = f.remaining_amount
                    if rem > 0:
                        collect_fine(
                            fine_id=f.id,
                            amount=rem,
                            collected_by=request.user,
                            note=f"Tự động khớp lệnh Sacombank qua VietQR (Biến động số dư STB: {tx_code})",
                            request=request
                        )
                        total_paid += rem
                return Response({
                    'detail': f'Sacombank xác nhận nhận {total_paid:,}đ thành công! Giao dịch đã khớp lệnh.',
                    'total_paid': total_paid,
                    'transaction_code': tx_code
                }, status=status.HTTP_200_OK)
            else:
                fine = Fine.objects.select_for_update().filter(id=fine_id).first()
                if not fine:
                    return Response({'detail': 'Không tìm thấy khoản phạt.'}, status=status.HTTP_404_NOT_FOUND)
                if fine.status in [FineStatus.PAID, FineStatus.WAIVED]:
                    return Response({'detail': 'Khoản phạt này đã được thanh toán hoàn tất.'}, status=status.HTTP_400_BAD_REQUEST)

                amount = int(request.data.get('amount') or fine.remaining_amount)
                collect_fine(
                    fine_id=fine.id,
                    amount=amount,
                    collected_by=request.user,
                    note=f"Tự động khớp lệnh Sacombank qua VietQR (Biến động số dư STB: {tx_code})",
                    request=request
                )
                return Response({
                    'detail': f'Sacombank xác nhận nhận {amount:,}đ thành công! Giao dịch đã khớp lệnh.',
                    'amount': amount,
                    'transaction_code': tx_code
                }, status=status.HTTP_200_OK)

class BankWebhookView(APIView):
    permission_classes = []  # Public endpoint for banking gateway

    def post(self, request):
        data = request.data
        desc = (data.get('description') or data.get('content') or data.get('orderInfo') or '').upper()
        amount = int(data.get('amount') or data.get('transferAmount') or 0)
        tx_code = data.get('transaction_code') or data.get('reference') or data.get('id') or 'STB-AUTO'

        # Parse pattern: UTH <card_code> NOP PHAT or UTH <card_code> PHAT <id>
        match_fine = re.search(r'UTH\s+([A-Z0-9]+)\s+PHAT\s+(\d+)', desc)
        match_all = re.search(r'UTH\s+([A-Z0-9]+)\s+NOP\s+PHAT', desc)

        if match_fine:
            card_code = match_fine.group(1)
            fine_id = int(match_fine.group(2))
            fine = Fine.objects.filter(id=fine_id, user__card_code__iexact=card_code).first()
            if fine and fine.status in [FineStatus.UNPAID, FineStatus.PARTIAL]:
                pay_amt = min(amount if amount > 0 else fine.remaining_amount, fine.remaining_amount)
                collect_fine(
                    fine_id=fine.id,
                    amount=pay_amt,
                    collected_by=fine.user,
                    note=f"Khớp lệnh Webhook Sacombank (Mã GD: {tx_code})",
                    request=request
                )
                return Response({'status': 'SUCCESS', 'detail': 'Khớp lệnh thành công'}, status=status.HTTP_200_OK)

        elif match_all:
            card_code = match_all.group(1)
            user = User.objects.filter(card_code__iexact=card_code).first()
            if user:
                unpaid_fines = list(Fine.objects.filter(user=user, status__in=[FineStatus.UNPAID, FineStatus.PARTIAL]).order_by('created_at'))
                for f in unpaid_fines:
                    rem = f.remaining_amount
                    if rem > 0:
                        collect_fine(
                            fine_id=f.id,
                            amount=rem,
                            collected_by=user,
                            note=f"Khớp lệnh Webhook Sacombank toàn bộ (Mã GD: {tx_code})",
                            request=request
                        )
                return Response({'status': 'SUCCESS', 'detail': f'Khớp lệnh nộp phạt toàn bộ cho {user.card_code}'}, status=status.HTTP_200_OK)

        return Response({'status': 'IGNORED', 'detail': 'Không tìm thấy khoản phạt tương ứng nội dung chuyển khoản.'}, status=status.HTTP_200_OK)



