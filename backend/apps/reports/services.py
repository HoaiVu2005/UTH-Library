from datetime import timedelta
from django.db.models import Count, Sum, F, Q
from django.utils import timezone

from apps.catalog.models import Book, Copy, Category
from apps.circulation.models import Loan
from apps.reservations.models import Reservation
from apps.fines.models import Fine
from apps.suggestions.models import Suggestion
from apps.accounts.models import User
from apps.core.enums import (
    CopyStatus,
    LoanStatus,
    ReservationStatus,
    FineStatus,
    SuggestionStatus,
)

def get_dashboard_summary():
    now = timezone.now()

    total_books = Book.objects.filter(deleted_at__isnull=True).count()
    total_copies = Copy.objects.count()
    available_copies = Copy.objects.filter(status=CopyStatus.AVAILABLE).count()
    borrowed_copies = Copy.objects.filter(status=CopyStatus.BORROWED).count()
    reserved_copies = Copy.objects.filter(status=CopyStatus.RESERVED_HOLD).count()
    damaged_lost_copies = Copy.objects.filter(status__in=[CopyStatus.DAMAGED, CopyStatus.LOST]).count()

    active_loans = Loan.objects.filter(status=LoanStatus.ACTIVE).count()
    overdue_loans = Loan.objects.filter(status=LoanStatus.ACTIVE, due_at__lt=now).count()

    unpaid_fines_agg = Fine.objects.filter(
        status__in=[FineStatus.UNPAID, FineStatus.PARTIAL]
    ).aggregate(
        total_debt=Sum(F('amount') - F('paid_amount'))
    )
    total_unpaid_fines = unpaid_fines_agg['total_debt'] or 0

    collected_fines_agg = Fine.objects.aggregate(total_collected=Sum('paid_amount'))
    total_collected_fines = collected_fines_agg['total_collected'] or 0

    student_loans = Loan.objects.filter(status=LoanStatus.ACTIVE, user__role='student').count()
    lecturer_loans = Loan.objects.filter(status=LoanStatus.ACTIVE, user__role='lecturer').count()
    total_lifetime_borrows = Loan.objects.count()

    pending_reservations = Reservation.objects.filter(status=ReservationStatus.PENDING).count()
    ready_reservations = Reservation.objects.filter(status=ReservationStatus.READY).count()
    pending_suggestions = Suggestion.objects.filter(status=SuggestionStatus.PENDING).count()

    # Activity today (since 00:00:00 today)
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_reservations = Reservation.objects.filter(created_at__gte=start_of_today).count()
    today_pending_reservations = Reservation.objects.filter(created_at__gte=start_of_today, status=ReservationStatus.PENDING).count()
    today_suggestions = Suggestion.objects.filter(created_at__gte=start_of_today).count()
    today_pending_suggestions = Suggestion.objects.filter(created_at__gte=start_of_today, status=SuggestionStatus.PENDING).count()

    total_users = User.objects.filter(deleted_at__isnull=True).count()
    locked_users = User.objects.filter(is_locked=True, deleted_at__isnull=True).count()

    return {
        'total_books': total_books,
        'total_copies': total_copies,
        'available_copies': available_copies,
        'borrowed_copies': borrowed_copies,
        'reserved_copies': reserved_copies,
        'damaged_lost_copies': damaged_lost_copies,
        'active_loans': active_loans,
        'overdue_loans': overdue_loans,
        'total_unpaid_fines': total_unpaid_fines,
        'total_collected_fines': total_collected_fines,
        'student_loans': student_loans,
        'lecturer_loans': lecturer_loans,
        'total_lifetime_borrows': total_lifetime_borrows,
        'pending_reservations': pending_reservations,
        'ready_reservations': ready_reservations,
        'pending_suggestions': pending_suggestions,
        'today_reservations': today_reservations,
        'today_pending_reservations': today_pending_reservations,
        'today_suggestions': today_suggestions,
        'today_pending_suggestions': today_pending_suggestions,
        'total_users': total_users,
        'locked_users': locked_users,
    }

def get_dashboard_action_items():
    now = timezone.now()
    soon_threshold = now + timedelta(hours=24)

    # 1. Pending Suggestions
    pending_suggestions = list(
        Suggestion.objects.filter(status=SuggestionStatus.PENDING)
        .select_related('user')
        .order_by('-created_at')[:5]
        .values('id', 'book_title', 'user__full_name', 'created_at')
    )

    # 2. Ready Holds expiring within 24h
    expiring_holds = list(
        Reservation.objects.filter(
            status=ReservationStatus.READY,
            hold_expires_at__lte=soon_threshold,
            hold_expires_at__gt=now,
        )
        .select_related('user', 'book', 'copy')
        .order_by('hold_expires_at')[:5]
        .values('id', 'book__title', 'user__full_name', 'copy__barcode', 'hold_expires_at')
    )

    # 3. Severely Overdue Loans (> 7 days)
    severe_threshold = now - timedelta(days=7)
    severe_overdue = list(
        Loan.objects.filter(
            status=LoanStatus.ACTIVE,
            due_at__lte=severe_threshold,
        )
        .select_related('user', 'copy__book')
        .order_by('due_at')[:5]
        .values('id', 'copy__book__title', 'user__full_name', 'user__card_code', 'due_at')
    )

    return {
        'pending_suggestions': pending_suggestions,
        'expiring_holds': expiring_holds,
        'severe_overdue': severe_overdue,
    }

def get_top_borrowed_report(limit=10):
    top_books = (
        Loan.objects.values('book_id', 'book__title', 'book__isbn', 'book__category__name')
        .annotate(total_borrows=Count('id'))
        .order_by('-total_borrows')[:limit]
    )

    results = []
    for item in top_books:
        results.append({
            'book_id': item['book_id'],
            'title': item['book__title'],
            'isbn': item['book__isbn'] or '---',
            'category': item['book__category__name'] or 'Chung',
            'total_borrows': item['total_borrows'],
        })
    return results

def get_overdue_report():
    now = timezone.now()
    overdue_loans = (
        Loan.objects.filter(status=LoanStatus.ACTIVE, due_at__lt=now)
        .select_related('user', 'copy__book')
        .order_by('due_at')
    )

    results = []
    for loan in overdue_loans:
        days_late = loan.days_late
        est_fine = days_late * loan.fine_per_day_snapshot
        results.append({
            'loan_id': loan.id,
            'book_title': loan.copy.book.title,
            'barcode': loan.copy.barcode,
            'user_name': loan.user.full_name,
            'card_code': loan.user.card_code,
            'borrowed_at': loan.borrowed_at.isoformat(),
            'due_at': loan.due_at.isoformat(),
            'days_late': days_late,
            'estimated_fine': est_fine,
        })
    return results

def get_inventory_report():
    categories = Category.objects.all().order_by('name')
    results = []

    for cat in categories:
        copies = Copy.objects.filter(book__category=cat)
        total = copies.count()
        available = copies.filter(status=CopyStatus.AVAILABLE).count()
        borrowed = copies.filter(status=CopyStatus.BORROWED).count()
        reserved = copies.filter(status=CopyStatus.RESERVED_HOLD).count()
        damaged = copies.filter(status=CopyStatus.DAMAGED).count()
        lost = copies.filter(status=CopyStatus.LOST).count()
        withdrawn = copies.filter(status=CopyStatus.WITHDRAWN).count()

        results.append({
            'category_id': cat.id,
            'category_name': cat.name,
            'category_code': cat.code,
            'total_copies': total,
            'available': available,
            'borrowed': borrowed,
            'reserved': reserved,
            'damaged': damaged,
            'lost': lost,
            'withdrawn': withdrawn,
        })
    return results

def get_borrow_trends(days=7):
    today = timezone.localdate()
    results = []

    for i in range(days - 1, -1, -1):
        target_date = today - timedelta(days=i)
        borrows_count = Loan.objects.filter(borrowed_at__date=target_date).count()
        returns_count = Loan.objects.filter(returned_at__date=target_date).count()

        results.append({
            'date': target_date.strftime('%d/%m'),
            'borrows': borrows_count,
            'returns': returns_count,
        })
    return results

