from django.utils import timezone
from django.db import transaction
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.accounts.models import User
from apps.accounts.permissions import IsAdminUserRole
from apps.core.pagination import StandardPagination
from apps.core.enums import LoanStatus, ReturnCondition, FineStatus, ReservationStatus
from apps.core.models import Policy
from apps.fines.models import Fine
from apps.catalog.models import Copy
from apps.reservations.models import Reservation
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
            'detail': f'Nhận sách mượn sách thành công cho bạn đọc {loan.user.card_code}.',
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
            queryset = queryset.filter(
                Q(user__card_code__icontains=sq) |
                Q(user__full_name__icontains=sq) |
                Q(book__title__icontains=sq) |
                Q(copy__barcode__icontains=sq)
            )

        # Date filtering (actions: borrowed or returned on that date)
        date_preset = request.query_params.get('date_preset')
        date_exact = request.query_params.get('date')
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')

        today = now.date()
        if date_preset == 'today' or request.query_params.get('today') in ('true', '1', 'True'):
            queryset = queryset.filter(Q(borrowed_at__date=today) | Q(returned_at__date=today))
        elif date_preset == 'week':
            week_ago = today - timezone.timedelta(days=7)
            queryset = queryset.filter(Q(borrowed_at__date__gte=week_ago) | Q(returned_at__date__gte=week_ago))
        elif date_preset == 'month':
            month_start = today.replace(day=1)
            queryset = queryset.filter(Q(borrowed_at__date__gte=month_start) | Q(returned_at__date__gte=month_start))
        elif date_exact:
            queryset = queryset.filter(Q(borrowed_at__date=date_exact) | Q(returned_at__date=date_exact))
        else:
            if from_date:
                queryset = queryset.filter(Q(borrowed_at__date__gte=from_date) | Q(returned_at__date__gte=from_date))
            if to_date:
                queryset = queryset.filter(Q(borrowed_at__date__lte=to_date) | Q(returned_at__date__lte=to_date))

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
    permission_classes = [IsAdminUserRole]

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
        unpaid_fines = Fine.objects.filter(
            user=user,
            status__in=[FineStatus.UNPAID, FineStatus.PARTIAL],
        )
        unpaid_total = sum(f.amount - f.paid_amount for f in unpaid_fines)
        overdue_count = active_loans.filter(due_at__lt=timezone.now()).count()

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
                'book_cover': r.book.cover_image if r.book.cover_image else None,
                'barcode': r.copy.barcode if r.copy else '',
                'shelf_location': r.copy.shelf_location if r.copy else '',
                'hold_expires_at': r.hold_expires_at.isoformat() if r.hold_expires_at else None,
            }
            for r in ready_reservations
        ]
        ready_count = len(ready_res_list)

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
                'lock_reason': user.lock_reason or '',
                'lock_reason_label': (
                    user.get_lock_reason_display() if user.lock_reason else 'Chưa ghi nhận lý do'
                ),
                'has_active_borrow_override': user.has_active_borrow_override,
                'borrow_override_until': user.borrow_override_until,
                'active_loans_count': active_count,
                'overdue_loans_count': overdue_count,
                'max_loans': max_limit,
                'remaining_quota': max(0, max_limit - (active_count + ready_count)),
                'has_overdue': has_overdue,
                'has_unpaid_fines': unpaid_fines.exists(),
                'unpaid_fines_count': unpaid_fines.count(),
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
        try:
            loan = Loan.objects.filter(
                copy__barcode__iexact=bc_clean,
                status=LoanStatus.ACTIVE
            ).select_related('user', 'copy', 'book').prefetch_related('book__authors').first()

            if not loan:
                # Kiểm tra trạng thái thực tế của cuốn sách để báo rõ ràng cho thủ thư
                copy_obj = Copy.objects.filter(barcode__iexact=bc_clean).select_related('book').first()
                if not copy_obj:
                    return Response({
                        'detail': f'Không tìm thấy bản sao với mã vạch "{bc_clean}" trong hệ thống Thư viện UTH.'
                    }, status=status.HTTP_404_NOT_FOUND)

                book_title = copy_obj.book.title if copy_obj.book else 'Tài liệu Thư viện'
                if copy_obj.status == 'withdrawn' or copy_obj.deleted_at is not None:
                    return Response({
                        'detail': f'Bản sao "{bc_clean}" ({book_title}) đã được thanh lý khỏi thư viện qua biên bản thanh lý tài sản.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                elif copy_obj.status == 'available':
                    return Response({
                        'detail': f'Bản sao "{bc_clean}" ({book_title}) hiện đang ở trạng thái "Sẵn sàng trên kệ" (không có phiếu mượn nào chưa trả).'
                    }, status=status.HTTP_400_BAD_REQUEST)
                elif copy_obj.status in ('reserved', 'reserved_hold'):
                    return Response({
                        'detail': f'Bản sao "{bc_clean}" ({book_title}) đang chờ bạn đọc đã yêu cầu mượn đến nhận.'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Kiểm tra xem sách đã từng được hoàn trả gần đây chưa
                last_loan = Loan.objects.filter(copy=copy_obj).order_by('-returned_at', '-id').first()
                if last_loan and last_loan.status == LoanStatus.RETURNED:
                    ret_str = last_loan.returned_at.strftime("%d/%m/%Y %H:%M") if last_loan.returned_at else ""
                    return Response({
                        'detail': f'Bản sao "{bc_clean}" ({book_title}) đã được bạn đọc {last_loan.user.full_name} ({last_loan.user.card_code}) hoàn trả trước đó{f" vào lúc {ret_str}" if ret_str else ""}.'
                    }, status=status.HTTP_400_BAD_REQUEST)

                return Response({
                    'detail': f'Không tìm thấy lượt mượn đang kích hoạt cho mã vạch "{bc_clean}" ({book_title}).'
                }, status=status.HTTP_404_NOT_FOUND)

            now = timezone.now()
            is_overdue = loan.due_at < now
            days_late = max(0, (now.date() - loan.due_at.date()).days) if is_overdue else 0
            policy = Policy.objects.filter(role=loan.user.role).first()
            fine_rate = policy.fine_per_day if policy else 2000
            estimated_fine = days_late * fine_rate

            book_price = loan.book_price_snapshot or (loan.book.price if loan.book else 100000) or 100000

            book_authors_str = ''
            if loan.book:
                book_authors_str = ', '.join([a.name for a in loan.book.authors.all()])

            return Response({
                'data': {
                    'loan_id': loan.id,
                    'patron_name': loan.user.full_name,
                    'patron_card_code': loan.user.card_code,
                    'patron_avatar': str(loan.user.avatar or ''),
                    'patron_department': loan.user.department or '',
                    'patron_role': loan.user.role or '',
                    'book_title': loan.book.title if loan.book else 'Tài liệu Thư viện',
                    'book_cover_image': str(loan.book.cover_image or '') if loan.book else '',
                    'book_authors': book_authors_str,
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
        except Exception as e:
            return Response({
                'detail': f'Lỗi hệ thống khi tra cứu mã vạch "{bc_clean}": {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

        # BR02: Check quota upfront before processing batch
        from .services import get_current_policy_for_user
        from apps.core.enums import LoanStatus, ReservationStatus
        from apps.reservations.models import Reservation
        policy = get_current_policy_for_user(patron)
        active_loans_count = Loan.objects.filter(user=patron, status=LoanStatus.ACTIVE).count()
        ready_reservations_count = Reservation.objects.filter(user=patron, status=ReservationStatus.READY).count()
        remaining_quota = max(0, policy.max_loans - (active_loans_count + ready_reservations_count))

        # Check which barcodes correspond to patron's ready reservations
        ready_barcodes = set(
            Reservation.objects.filter(
                user=patron,
                status=ReservationStatus.READY,
                copy__barcode__in=barcodes
            ).values_list('copy__barcode', flat=True)
        )
        non_reserved_barcodes = [bc for bc in barcodes if bc not in ready_barcodes]

        if len(non_reserved_barcodes) > remaining_quota:
            if remaining_quota == 0:
                return Response({
                    'detail': f'Bạn đọc đã đạt giới hạn tối đa {policy.max_loans} cuốn (đang mượn {active_loans_count} cuốn và có {ready_reservations_count} cuốn chờ nhận tại quầy). Chỉ có thể nhận những cuốn đã sẵn sàng.'
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    'detail': f'Bạn đọc chỉ còn được mượn thêm {remaining_quota} cuốn ngoài danh sách mượn sách (hiện đang mượn: {active_loans_count}, đang chờ nhận sách: {ready_reservations_count} / tối đa: {policy.max_loans} cuốn).'
                }, status=status.HTTP_400_BAD_REQUEST)

        if active_loans_count + len(barcodes) > policy.max_loans:
            return Response({
                'detail': f'Tổng số sách mượn ({active_loans_count + len(barcodes)}) sẽ vượt quá hạn mức tối đa {policy.max_loans} cuốn.'
            }, status=status.HTTP_400_BAD_REQUEST)

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


