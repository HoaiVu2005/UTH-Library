import re
from datetime import timedelta
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from django.conf import settings
from apps.accounts.models import (
    User, StudentRoster, PaymentTransaction, PaymentMethod, TransactionStatus, TransactionType
)
from apps.accounts.permissions import IsAdminUserRole
from apps.core.pagination import StandardPagination
from apps.core.enums import UserRole, FineStatus, NotificationType
from apps.notifications.models import Notification
from .models import Fine, FinePayment
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

        # Date filtering (actions: fine created or paid)
        date_preset = request.query_params.get('date_preset')
        date_exact = request.query_params.get('date')
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')

        now = timezone.now()
        today = now.date()
        from django.db.models import Q
        if date_preset == 'today' or request.query_params.get('today') in ('true', '1', 'True'):
            queryset = queryset.filter(Q(created_at__date=today) | Q(payments__payment_date__date=today)).distinct()
        elif date_preset == 'week':
            week_ago = today - timezone.timedelta(days=7)
            queryset = queryset.filter(Q(created_at__date__gte=week_ago) | Q(payments__payment_date__date__gte=week_ago)).distinct()
        elif date_preset == 'month':
            month_start = today.replace(day=1)
            queryset = queryset.filter(Q(created_at__date__gte=month_start) | Q(payments__payment_date__date__gte=month_start)).distinct()
        elif date_exact:
            queryset = queryset.filter(Q(created_at__date=date_exact) | Q(payments__payment_date__date=date_exact)).distinct()
        else:
            if from_date:
                queryset = queryset.filter(Q(created_at__date__gte=from_date) | Q(payments__payment_date__date__gte=from_date)).distinct()
            if to_date:
                queryset = queryset.filter(Q(created_at__date__lte=to_date) | Q(payments__payment_date__date__lte=to_date)).distinct()

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
    """
    Webhook tiếp nhận biến động số dư tự động từ SePay / Cổng thanh toán Ngân hàng Sacombank.
    URL: /api/v1/fines/bank-webhook/
    Hỗ trợ đối soát tự động:
      - Xác thực SePay API Key (nếu cấu hình)
      - Kiểm tra tiền vào (transferType == 'in')
      - Kiểm tra chống trùng lặp giao dịch (Idempotency qua SePay ID / Mã giao dịch)
      - Khớp lệnh khoản phạt theo mã thẻ bạn đọc & mã khoản phạt
      - Tự động gạch nợ trên PostgreSQL & kích hoạt mở khóa tài khoản (nếu bị khóa)
      - Bắn thông báo in-app đến tài khoản sinh viên
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        data = request.data

        # 1. Xác thực API Key từ SePay (nếu cấu hình)
        configured_api_key = getattr(settings, 'SEPAY_API_KEY', '')
        if configured_api_key:
            auth_header = request.headers.get('Authorization', '')
            expected = f"Apikey {configured_api_key}".strip()
            if auth_header != expected and auth_header != configured_api_key:
                return Response(
                    {'success': False, 'message': 'Xác thực API Key SePay thất bại.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

        # 2. Chỉ xử lý tiền vào tài khoản (transferType == 'in')
        transfer_type = (data.get('transferType') or 'in').lower()
        if transfer_type == 'out':
            return Response(
                {'success': True, 'message': 'Bỏ qua giao dịch chuyển tiền ra.'},
                status=status.HTTP_200_OK
            )

        # 3. Trích xuất thông tin giao dịch
        desc = (data.get('content') or data.get('description') or data.get('orderInfo') or '').upper()
        amount = int(data.get('transferAmount') or data.get('amount') or 0)
        sepay_id = str(data.get('id') or '')
        ref_code = str(data.get('referenceCode') or data.get('reference') or '')
        tx_code = f"SEPAY-{sepay_id}" if sepay_id else (ref_code or f"STB-{int(timezone.now().timestamp())}")

        # 4. Kiểm tra chống trùng lặp (Idempotent): nếu mã GD này đã nộp phạt hoặc nộp phí thẻ rồi thì không cộng dồn
        if FinePayment.objects.filter(note__icontains=tx_code).exists() or PaymentTransaction.objects.filter(note__icontains=tx_code).exists():
            return Response(
                {'success': True, 'message': f'Giao dịch {tx_code} đã được xử lý trước đó.'},
                status=status.HTTP_200_OK
            )

        # 5. Phân tích nội dung chuyển khoản bằng Regex
        # - Mẫu Cấp thẻ / Mở thẻ thư viện: UTH <MSSV> DKTHE hoặc DKTHE <MSSV> hoặc UTH <MSSV> THE
        match_card = (
            re.search(r'UTH\s*([0-9]{8,12})\s*(?:DKTHE|DK\s*THE|THE|CAP\s*THE)', desc) or
            re.search(r'(?:DKTHE|DK\s*THE|CAP\s*THE)\s*([0-9]{8,12})', desc) or
            re.search(r'UTH\s*([0-9]{8,12})\s*DK', desc)
        )
        if match_card:
            student_code = match_card.group(1).strip()
            roster = StudentRoster.objects.filter(student_code__iexact=student_code).first()
            user = User.objects.filter(Q(card_code__iexact=student_code) | Q(username__iexact=student_code)).first()

            pay_amount = amount if amount > 0 else 100000
            today = timezone.localdate()

            with transaction.atomic():
                if not user:
                    full_name = roster.full_name if roster else f"Sinh viên {student_code}"
                    department = roster.department if roster else "Khoa Công nghệ thông tin"
                    email = roster.email if roster else f"{student_code}@sv.ut.edu.vn"
                    phone = roster.phone if roster else ""
                    card_expiry = today + timedelta(days=365)

                    user = User(
                        username=student_code,
                        full_name=full_name,
                        card_code=student_code,
                        email=email,
                        phone=phone,
                        department=department,
                        role=UserRole.STUDENT,
                        card_expiry=card_expiry,
                        must_change_password=True,
                    )
                    user.set_password('Password123')
                    user.save()
                else:
                    current_exp = user.card_expiry or today
                    start_d = max(current_exp, today)
                    user.card_expiry = start_d + timedelta(days=365)
                    user.is_locked = False
                    user.locked_until = None
                    user.lock_reason = None
                    user.save(update_fields=['card_expiry', 'is_locked', 'locked_until', 'lock_reason'])

                if roster:
                    roster.is_card_issued = True
                    roster.user = user
                    roster.save(update_fields=['is_card_issued', 'user'])

                year_now = timezone.now().year
                count_year = PaymentTransaction.objects.filter(collected_at__year=year_now).count() + 1
                transaction_code = f"PAY-{year_now}-{count_year:05d}"
                receipt_code = f"RC-{year_now}-{count_year:05d}"

                admin_user = User.objects.filter(role=UserRole.ADMIN).first() or user

                tx = PaymentTransaction.objects.create(
                    transaction_code=transaction_code,
                    receipt_code=receipt_code,
                    transaction_type=TransactionType.CARD_ISSUANCE,
                    user=user,
                    student_code=student_code,
                    payer_name=user.full_name,
                    amount=pay_amount,
                    payment_method=PaymentMethod.TRANSFER,
                    status=TransactionStatus.SUCCESS,
                    collected_by=admin_user,
                    collected_at=timezone.now(),
                    note=f"Tự động khớp lệnh SePay/Sacombank (Mã GD SePay: {tx_code}, Nội dung: {desc})",
                )

                Notification.objects.create(
                    user=user,
                    type=NotificationType.CARD_EXPIRING,
                    content=f"Thẻ thư viện UTH đã được kích hoạt thành công qua cổng thanh toán SePay/Sacombank ({pay_amount:,.0f}đ). Hạn thẻ: {user.card_expiry.strftime('%d/%m/%Y')}.",
                    link="/dashboard"
                )

            return Response({
                'success': True,
                'status': 'SUCCESS',
                'detail': f'Khớp lệnh SePay/Sacombank thành công cấp thẻ cho sinh viên {student_code}',
                'transaction_code': tx.transaction_code,
                'receipt_code': tx.receipt_code,
                'card_code': user.card_code,
                'amount_paid': pay_amount,
            }, status=status.HTTP_200_OK)

        # - Mẫu 1: UTH <card_code> PHAT <id> (nộp đích danh 1 khoản)
        # - Mẫu 2: UTH <card_code> NOP PHAT (nộp toàn bộ)
        # - Mẫu 3: PHAT <id> (fallback linh hoạt)
        match_fine = re.search(r'UTH\s*([A-Z0-9]+)\s*PHAT\s*(\d+)', desc)
        match_all = re.search(r'UTH\s*([A-Z0-9]+)\s*NOP\s*PHAT', desc)
        match_single_fine = re.search(r'PHAT\s*(\d+)', desc)

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
                    note=f"Khớp lệnh SePay/Sacombank (Mã GD: {tx_code})",
                    request=request
                )
                Notification.objects.create(
                    user=fine.user,
                    type=NotificationType.FINE_PAID,
                    content=f"Khoản phạt #{fine.id} ({pay_amt:,}đ) đã được thanh toán thành công qua chuyển khoản ngân hàng (Mã GD: {tx_code}).",
                    link="/my-fines"
                )
                return Response({
                    'success': True,
                    'status': 'SUCCESS',
                    'detail': f'Khớp lệnh thành công khoản phạt #{fine.id}',
                    'amount_paid': pay_amt
                }, status=status.HTTP_200_OK)

        elif match_all:
            card_code = match_all.group(1)
            user = User.objects.filter(card_code__iexact=card_code).first()
            if user:
                unpaid_fines = list(Fine.objects.filter(
                    user=user,
                    status__in=[FineStatus.UNPAID, FineStatus.PARTIAL]
                ).order_by('created_at'))

                total_paid = 0
                collected_count = 0
                for f in unpaid_fines:
                    rem = f.remaining_amount
                    if rem > 0 and (amount == 0 or total_paid < amount):
                        cur_pay = min(rem, amount - total_paid) if amount > 0 else rem
                        collect_fine(
                            fine_id=f.id,
                            amount=cur_pay,
                            collected_by=user,
                            note=f"Khớp lệnh SePay/Sacombank toàn bộ (Mã GD: {tx_code})",
                            request=request
                        )
                        total_paid += cur_pay
                        collected_count += 1

                if collected_count > 0:
                    Notification.objects.create(
                        user=user,
                        type=NotificationType.FINE_PAID,
                        content=f"Đã thanh toán thành công {collected_count} khoản phạt ({total_paid:,}đ) qua chuyển khoản ngân hàng.",
                        link="/my-fines"
                    )

                return Response({
                    'success': True,
                    'status': 'SUCCESS',
                    'detail': f'Khớp lệnh nộp phạt thành công cho {user.card_code}',
                    'total_paid': total_paid,
                    'fines_cleared': collected_count
                }, status=status.HTTP_200_OK)

        elif match_single_fine:
            fine_id = int(match_single_fine.group(1))
            fine = Fine.objects.filter(id=fine_id).first()
            if fine and fine.status in [FineStatus.UNPAID, FineStatus.PARTIAL]:
                pay_amt = min(amount if amount > 0 else fine.remaining_amount, fine.remaining_amount)
                collect_fine(
                    fine_id=fine.id,
                    amount=pay_amt,
                    collected_by=fine.user,
                    note=f"Khớp lệnh SePay/Sacombank (Mã GD: {tx_code})",
                    request=request
                )
                Notification.objects.create(
                    user=fine.user,
                    type=NotificationType.FINE_PAID,
                    content=f"Khoản phạt #{fine.id} ({pay_amt:,}đ) đã được thanh toán thành công qua chuyển khoản ngân hàng.",
                    link="/my-fines"
                )
                return Response({
                    'success': True,
                    'status': 'SUCCESS',
                    'detail': f'Khớp lệnh thành công khoản phạt #{fine.id}',
                    'amount_paid': pay_amt
                }, status=status.HTTP_200_OK)

        return Response({
            'success': False,
            'status': 'IGNORED',
            'detail': 'Không tìm thấy khoản phạt tương ứng nội dung chuyển khoản.'
        }, status=status.HTTP_200_OK)



