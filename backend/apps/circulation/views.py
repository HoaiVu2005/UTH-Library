from django.utils import timezone
from django.db import transaction
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.accounts.models import User
from apps.accounts.permissions import IsAdminUserRole
from apps.core.pagination import StandardPagination
from apps.core.enums import LoanStatus, ReturnCondition, FineStatus
from apps.core.models import Policy
from apps.fines.models import Fine
from apps.catalog.models import Copy
from .models import Loan
from .serializers import (
    LoanSerializer,
    DirectBorrowSerializer,
    ReservationBorrowSerializer,
    ReturnLoanSerializer,
)
from .services import (
    borrow_direct,
    borrow_from_reservation,
    return_loan,
    renew_loan,
)

class DirectBorrowView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        serializer = DirectBorrowSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        card_code = serializer.validated_data['patron_card_code']
        barcode = serializer.validated_data['barcode']

        loan = borrow_direct(
            patron_card_code=card_code,
            barcode=barcode,
            admin_user=request.user,
            request=request
        )

        return Response({
            'detail': f'Tạo phiếu mượn thành công cho bạn đọc {loan.user.card_code}.',
            'data': LoanSerializer(loan).data
        }, status=status.HTTP_201_CREATED)

class ReservationBorrowView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        serializer = ReservationBorrowSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        res_id = serializer.validated_data['reservation_id']
        barcode = serializer.validated_data['barcode']

        loan = borrow_from_reservation(
            reservation_id=res_id,
            barcode=barcode,
            admin_user=request.user,
            request=request
        )

        return Response({
            'detail': f'Nhận sách đặt trước thành công cho bạn đọc {loan.user.card_code}.',
            'data': LoanSerializer(loan).data
        }, status=status.HTTP_201_CREATED)

class LoanListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        now = timezone.now()
        queryset = Loan.objects.select_related('user', 'copy', 'book').order_by('-borrowed_at')

        status_q = request.query_params.get('status')
        overdue_q = request.query_params.get('overdue')

        if overdue_q and overdue_q.lower() == 'true':
            queryset = queryset.filter(status=LoanStatus.ACTIVE, due_at__lt=now)
        elif status_q == 'overdue':
            queryset = queryset.filter(status=LoanStatus.ACTIVE, due_at__lt=now)
        elif status_q == 'active':
            # Sách đang mượn trong hạn (chưa quá hạn)
            queryset = queryset.filter(status=LoanStatus.ACTIVE, due_at__gte=now)
        elif status_q == 'active_all':
            # Toàn bộ sách chưa trả (gồm cả trong hạn và quá hạn)
            queryset = queryset.filter(status=LoanStatus.ACTIVE)
        elif status_q:
            queryset = queryset.filter(status=status_q)

        user_id = request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        card_code = request.query_params.get('card_code')
        if card_code:
            queryset = queryset.filter(user__card_code__iexact=card_code.strip())

        barcode = request.query_params.get('barcode')
        if barcode:
            queryset = queryset.filter(copy__barcode__iexact=barcode.strip())

        search_q = request.query_params.get('search') or request.query_params.get('q')
        if search_q:
            sq = search_q.strip()
            from django.db.models import Q
            queryset = queryset.filter(
                Q(user__card_code__icontains=sq) |
                Q(user__full_name__icontains=sq) |
                Q(book__title__icontains=sq) |
                Q(copy__barcode__icontains=sq)
            )

        paginator = StandardPagination()
        page_records = paginator.paginate_queryset(queryset, request)
        serializer = LoanSerializer(page_records, many=True)
        response = paginator.get_paginated_response(serializer.data)

        # Attach real-time summary counts to response meta
        response.data['meta']['counts'] = {
            'total': Loan.objects.count(),
            'active': Loan.objects.filter(status=LoanStatus.ACTIVE, due_at__gte=now).count(),
            'overdue': Loan.objects.filter(status=LoanStatus.ACTIVE, due_at__lt=now).count(),
            'returned': Loan.objects.filter(status=LoanStatus.RETURNED).count(),
            'lost': Loan.objects.filter(status=LoanStatus.LOST).count(),
        }
        return response

class MyLoansView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Strict anti-IDOR: always filtered by request.user
        queryset = Loan.objects.select_related('copy', 'book').filter(user=request.user)

        status_q = request.query_params.get('status')
        if status_q:
            queryset = queryset.filter(status=status_q)

        queryset = queryset.order_by('-borrowed_at')

        paginator = StandardPagination()
        page_records = paginator.paginate_queryset(queryset, request)
        serializer = LoanSerializer(page_records, many=True)
        return paginator.get_paginated_response(serializer.data)

class RenewLoanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        loan = renew_loan(loan_id=pk, user=request.user, request=request)
        return Response({
            'detail': f'Gia hạn sách thành công! Hạn trả mới: {loan.due_at.strftime("%d/%m/%Y")}.',
            'data': LoanSerializer(loan).data
        }, status=status.HTTP_200_OK)

class ReturnLoanView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        serializer = ReturnLoanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        condition = serializer.validated_data['condition']
        damage_level = serializer.validated_data.get('damage_level')
        amount_override = serializer.validated_data.get('amount_override')
        note = serializer.validated_data.get('note')

        loan, created_fines = return_loan(
            loan_id=pk,
            condition=condition,
            damage_level=damage_level,
            amount_override=amount_override,
            note=note,
            admin_user=request.user,
            request=request
        )

        from apps.fines.serializers import FineSerializer
        return Response({
            'detail': 'Xác nhận trả sách thành công.',
            'data': {
                'loan': LoanSerializer(loan).data,
                'fines': FineSerializer(created_fines, many=True).data,
            }
        }, status=status.HTTP_200_OK)

class MarkLostView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        note = request.data.get('note', '')
        loan, created_fines = return_loan(
            loan_id=pk,
            condition=ReturnCondition.LOST,
            note=note,
            admin_user=request.user,
            request=request
        )

        from apps.fines.serializers import FineSerializer
        return Response({
            'detail': 'Đã ghi nhận báo mất sách và tạo các khoản phạt đền bù theo quy định.',
            'data': {
                'loan': LoanSerializer(loan).data,
                'fines': FineSerializer(created_fines, many=True).data,
            }
        }, status=status.HTTP_200_OK)

class DeskPatronView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        card_code = request.query_params.get('card_code')
        if not card_code:
            return Response({'detail': 'Vui lòng cung cấp mã thẻ bạn đọc.'}, status=status.HTTP_400_BAD_REQUEST)

        code_clean = card_code.strip()
        user = User.objects.filter(
            Q(card_code__iexact=code_clean) | Q(username__iexact=code_clean),
            deleted_at__isnull=True
        ).first()
        if not user:
            return Response({'detail': f'Không tìm thấy bạn đọc với mã thẻ: {code_clean}'}, status=status.HTTP_404_NOT_FOUND)

        # Policy & Limits
        policy = Policy.objects.filter(role=user.role).first()
        max_limit = policy.max_loans if policy else (10 if user.role == 'lecturer' else 5)

        # Active loans & overdue
        active_loans = Loan.objects.filter(user=user, status=LoanStatus.ACTIVE)
        active_count = active_loans.count()
        has_overdue = active_loans.filter(due_at__lt=timezone.now()).exists()

        # Unpaid fines
        unpaid_fines = Fine.objects.filter(user=user, status=FineStatus.UNPAID)
        unpaid_total = sum(f.amount - f.paid_amount for f in unpaid_fines)

        # Ready reservations (held copies waiting for patron pickup)
        ready_reservations = Reservation.objects.filter(
            user=user,
            status=ReservationStatus.READY
        ).select_related('book', 'copy')
        ready_res_list = [
            {
                'id': r.id,
                'book_id': r.book.id,
                'book_title': r.book.title,
                'barcode': r.copy.barcode if r.copy else '',
                'shelf_location': r.copy.shelf_location if r.copy else '',
                'hold_expires_at': r.hold_expires_at,
            }
            for r in ready_reservations
        ]

        return Response({
            'data': {
                'id': user.id,
                'username': user.username,
                'full_name': user.full_name,
                'role': user.role,
                'card_code': user.card_code,
                'avatar': user.avatar,
                'department': user.department or 'Trường ĐH Giao thông vận tải TP.HCM',
                'card_expiry': user.card_expiry,
                'is_card_valid': user.is_card_valid,
                'is_currently_locked': user.is_currently_locked,
                'active_loans_count': active_count,
                'max_loans': max_limit,
                'remaining_quota': max(0, max_limit - active_count),
                'has_overdue': has_overdue,
                'has_unpaid_fines': unpaid_fines.exists(),
                'unpaid_fines_total': unpaid_total,
                'ready_reservations': ready_res_list,
            }
        }, status=status.HTTP_200_OK)

class DeskReturnLookupView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        barcode = request.query_params.get('barcode')
        if not barcode:
            return Response({'detail': 'Vui lòng cung cấp mã vạch sách.'}, status=status.HTTP_400_BAD_REQUEST)

        bc_clean = barcode.strip().upper()
        loan = Loan.objects.filter(
            copy__barcode__iexact=bc_clean,
            status=LoanStatus.ACTIVE
        ).select_related('user', 'copy', 'book').first()

        if not loan:
            return Response({
                'detail': f'Không tìm thấy lượt mượn đang kích hoạt cho mã vạch "{bc_clean}".'
            }, status=status.HTTP_404_NOT_FOUND)

        now = timezone.now()
        is_overdue = loan.due_at < now
        days_late = max(0, (now.date() - loan.due_at.date()).days) if is_overdue else 0
        policy = Policy.objects.filter(role=loan.user.role).first()
        fine_rate = policy.fine_per_day if policy else 2000
        estimated_fine = days_late * fine_rate

        book_price = loan.book_price_snapshot or (loan.book.price if loan.book else 100000) or 100000

        return Response({
            'data': {
                'loan_id': loan.id,
                'patron_name': loan.user.full_name,
                'patron_card_code': loan.user.card_code,
                'book_title': loan.book.title if loan.book else 'Tài liệu Thư viện',
                'barcode': loan.copy.barcode,
                'shelf_location': loan.copy.shelf_location or 'Quầy kho A',
                'borrowed_at': loan.borrowed_at.isoformat(),
                'due_at': loan.due_at.isoformat(),
                'is_overdue': is_overdue,
                'days_late': days_late,
                'estimated_fine': estimated_fine,
                'book_price': book_price,
                'processing_fee': 20000,
            }
        }, status=status.HTTP_200_OK)

class BatchCheckoutView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        user_id = request.data.get('user_id')
        card_code = request.data.get('card_code')
        barcodes = request.data.get('barcodes', [])

        if not barcodes or not isinstance(barcodes, list):
            return Response({'detail': 'Vui lòng chọn ít nhất 1 cuốn sách trong giỏ mượn.'}, status=status.HTTP_400_BAD_REQUEST)

        if user_id:
            patron = User.objects.filter(id=user_id, deleted_at__isnull=True).first()
        elif card_code:
            patron = User.objects.filter(card_code__iexact=str(card_code).strip(), deleted_at__isnull=True).first()
        else:
            return Response({'detail': 'Thiếu thông tin mã thẻ hoặc ID bạn đọc.'}, status=status.HTTP_400_BAD_REQUEST)

        if not patron:
            return Response({'detail': 'Không tìm thấy bạn đọc trong hệ thống.'}, status=status.HTTP_404_NOT_FOUND)

        created_loans = []
        with transaction.atomic():
            for bc in barcodes:
                loan = borrow_direct(
                    patron_card_code=patron.card_code,
                    barcode=str(bc).strip(),
                    admin_user=request.user,
                    request=request
                )
                created_loans.append(loan)

        return Response({
            'detail': f'Đã lập phiếu mượn thành công cho {len(created_loans)} cuốn sách.',
            'data': LoanSerializer(created_loans, many=True).data
        }, status=status.HTTP_201_CREATED)


