import io
import re
from typing import List, Optional
import barcode
from barcode.writer import ImageWriter, SVGWriter
from django.db import transaction
from django.db.models import Q, Count, Min, Max
from django.utils import timezone
from apps.core.exceptions import BusinessLogicError
from apps.core.enums import CopyStatus, LoanStatus, ReservationStatus
from .models import Category, Author, Book, Copy, BarcodeSequence, DeaccessionBatch

BARCODE_REGEX = re.compile(r'^UTH-([A-Z0-9]{2,10})-(\d{6})$')

def normalize_barcode(raw: str) -> str:
    cleaned = (raw or '').strip().upper()
    if not BARCODE_REGEX.match(cleaned):
        raise BusinessLogicError('INVALID_BARCODE_FORMAT')
    return cleaned

def generate_barcodes_for_category(category: Category, quantity: int) -> List[str]:
    if quantity <= 0:
        return []
    
    with transaction.atomic():
        seq, created = BarcodeSequence.objects.select_for_update().get_or_create(
            category=category,
            defaults={'last_value': 0}
        )
        start_val = seq.last_value
        seq.last_value += quantity
        seq.save(update_fields=['last_value'])

    barcodes = [f"UTH-{category.code}-{val:06d}" for val in range(start_val + 1, start_val + quantity + 1)]
    return barcodes

def generate_barcode_image(barcode_str: str, output_format: str = 'png') -> bytes:
    code128 = barcode.get_barcode_class('code128')
    buffer = io.BytesIO()
    if output_format == 'svg':
        bc = code128(barcode_str, writer=SVGWriter())
        bc.write(buffer)
    else:
        bc = code128(barcode_str, writer=ImageWriter())
        bc.write(buffer)
    return buffer.getvalue()

def search_books(
    q: Optional[str] = None,
    category_id: Optional[int] = None,
    category_query: Optional[str] = None,
    author_id: Optional[int] = None,
    author_name: Optional[str] = None,
    publisher: Optional[str] = None,
    year: Optional[int] = None,
    year_from: Optional[int] = None,
    year_to: Optional[int] = None,
    available_only: bool = False,
    ordering: str = '-created_at'
):
    queryset = Book.objects.filter(deleted_at__isnull=True).select_related('category').prefetch_related('authors', 'copies')

    if q:
        cleaned_q = ' '.join(q.strip().split())
        # Use unaccent with ilike / icontains on title, author name, publisher, isbn, keywords
        queryset = queryset.filter(
            Q(title__unaccent__icontains=cleaned_q) |
            Q(authors__name__unaccent__icontains=cleaned_q) |
            Q(publisher__unaccent__icontains=cleaned_q) |
            Q(isbn__icontains=cleaned_q) |
            Q(keywords__unaccent__icontains=cleaned_q)
        ).distinct()

    if category_id:
        queryset = queryset.filter(category_id=category_id)
    elif category_query:
        cleaned_cat = category_query.strip()
        queryset = queryset.filter(
            Q(category__name__unaccent__icontains=cleaned_cat) |
            Q(category__code__icontains=cleaned_cat)
        )

    if author_id:
        queryset = queryset.filter(authors__id=author_id)

    if author_name:
        cleaned_author = ' '.join(author_name.strip().split())
        queryset = queryset.filter(authors__name__unaccent__icontains=cleaned_author).distinct()

    if publisher:
        cleaned_pub = publisher.strip()
        queryset = queryset.filter(publisher__icontains=cleaned_pub)

    if year:
        queryset = queryset.filter(year=year)
    else:
        if year_from:
            queryset = queryset.filter(year__gte=year_from)
        if year_to:
            queryset = queryset.filter(year__lte=year_to)

    if available_only:
        queryset = queryset.filter(
            copies__status=CopyStatus.AVAILABLE,
            copies__reading_room_only=False,
            copies__deleted_at__isnull=True
        ).distinct()

    valid_orderings = {
        'relevance': '-created_at',
        'newest': '-created_at',
        'title': 'title',
        '-title': '-title',
        'year': '-year',
        '-year': '-year',
    }
    order_field = valid_orderings.get(ordering, '-created_at')
    return queryset.order_by(order_field)

def get_book_facets() -> dict:
    """
    Trả về dữ liệu đa diện (facets) cho OPAC:
    - Danh mục kèm số lượng sách
    - Danh sách nhà xuất bản phổ biến
    - Năm xuất bản nhỏ nhất & lớn nhất
    """
    categories = list(
        Category.objects.annotate(book_count=Count('books', filter=Q(books__deleted_at__isnull=True)))
        .filter(book_count__gt=0)
        .values('id', 'name', 'code', 'book_count')
        .order_by('-book_count', 'name')
    )

    publishers = list(
        Book.objects.filter(deleted_at__isnull=True, publisher__isnull=False)
        .exclude(publisher='')
        .values('publisher')
        .annotate(count=Count('id'))
        .order_by('-count')[:15]
    )

    year_stats = Book.objects.filter(deleted_at__isnull=True, year__isnull=False).aggregate(
        min_year=Min('year'),
        max_year=Max('year')
    )

    return {
        'categories': categories,
        'publishers': publishers,
        'years': {
            'min': year_stats.get('min_year') or 2000,
            'max': year_stats.get('max_year') or timezone.now().year
        }
    }


def suggest_books(q: str, limit: int = 10):
    if not q or not q.strip():
        return []
    cleaned_q = ' '.join(q.strip().split())
    books = Book.objects.filter(
        deleted_at__isnull=True,
        title__unaccent__icontains=cleaned_q
    ).select_related('category').prefetch_related('authors')[:limit]
    
    results = []
    for b in books:
        author_names = ", ".join([a.name for a in b.authors.all()])
        results.append({
            'id': b.id,
            'title': b.title,
            'author': author_names,
            'category': b.category.name,
            'cover_image': b.cover_image,
        })
    return results

def delete_book(book_id: int):
    # BR10: Chỉ xóa (mềm) đầu sách khi không có bản sao đang mượn (borrowed/reserved_hold) VÀ không có Reservation pending/ready
    book = Book.objects.filter(id=book_id, deleted_at__isnull=True).first()
    if not book:
        raise BusinessLogicError('NOT_FOUND')

    has_active_copies = Copy.objects.filter(
        book=book,
        deleted_at__isnull=True,
        status__in=[CopyStatus.BORROWED, CopyStatus.RESERVED_HOLD]
    ).exists()
    if has_active_copies:
        raise BusinessLogicError('BOOK_HAS_ACTIVE_LOANS')

    from apps.reservations.models import Reservation
    has_active_reservations = Reservation.objects.filter(
        book=book,
        status__in=[ReservationStatus.PENDING, ReservationStatus.READY]
    ).exists()
    if has_active_reservations:
        raise BusinessLogicError('BOOK_HAS_ACTIVE_RESERVATIONS')

    book.deleted_at = timezone.now()
    book.save(update_fields=['deleted_at'])
    return book

def import_books_from_csv(csv_text: str) -> dict:
    import csv
    import io

    if csv_text.startswith('\ufeff'):
        csv_text = csv_text[1:]

    reader = csv.reader(io.StringIO(csv_text))
    rows = list(reader)
    if not rows:
        return {'imported_books': 0, 'created_copies': 0, 'errors': ['Tập tin CSV rỗng.']}

    headers = [h.strip().lower() for h in rows[0]]
    header_map = {}
    for idx, h in enumerate(headers):
        if any(k in h for k in ['tên sách', 'title', 'tựa đề']):
            header_map['title'] = idx
        elif any(k in h for k in ['tác giả', 'author']):
            header_map['author'] = idx
        elif 'isbn' in h:
            header_map['isbn'] = idx
        elif any(k in h for k in ['khoa', 'chuyên ngành', 'category', 'mã khoa']):
            header_map['category'] = idx
        elif any(k in h for k in ['nhà xuất bản', 'nxb', 'publisher']):
            header_map['publisher'] = idx
        elif any(k in h for k in ['năm', 'year']):
            header_map['year'] = idx
        elif any(k in h for k in ['giá', 'price']):
            header_map['price'] = idx
        elif any(k in h for k in ['số lượng', 'số bản sao', 'copies', 'bản sao']):
            header_map['copies'] = idx
        elif any(k in h for k in ['vị trí', 'kệ', 'shelf']):
            header_map['shelf'] = idx

    if 'title' not in header_map:
        return {'imported_books': 0, 'created_copies': 0, 'errors': ['Không tìm thấy cột "Tên sách" hoặc "title" trong dòng tiêu đề CSV.']}

    default_cat = Category.objects.first()
    imported_books = 0
    created_copies = 0
    errors = []

    for r_idx, row in enumerate(rows[1:], start=2):
        if not row or not any(field.strip() for field in row):
            continue

        try:
            title = row[header_map['title']].strip() if 'title' in header_map and len(row) > header_map['title'] else ''
            if not title:
                continue

            author_name = row[header_map['author']].strip() if 'author' in header_map and len(row) > header_map['author'] else 'Nhiều tác giả'
            isbn = row[header_map['isbn']].strip() if 'isbn' in header_map and len(row) > header_map['isbn'] else None
            cat_code = row[header_map['category']].strip() if 'category' in header_map and len(row) > header_map['category'] else ''
            publisher = row[header_map['publisher']].strip() if 'publisher' in header_map and len(row) > header_map['publisher'] else 'NXB Giao thông Vận tải'
            year_val = row[header_map['year']].strip() if 'year' in header_map and len(row) > header_map['year'] else '2023'
            price_val = row[header_map['price']].strip() if 'price' in header_map and len(row) > header_map['price'] else '150000'
            copies_val = row[header_map['copies']].strip() if 'copies' in header_map and len(row) > header_map['copies'] else '3'
            shelf_val = row[header_map['shelf']].strip() if 'shelf' in header_map and len(row) > header_map['shelf'] else 'Kệ A1 - Tầng 1'

            try:
                year = int(re.sub(r'\D', '', year_val)) if year_val else 2023
            except ValueError:
                year = 2023

            try:
                price = int(re.sub(r'\D', '', price_val)) if price_val else 150000
            except ValueError:
                price = 150000

            try:
                copies_count = max(1, min(20, int(re.sub(r'\D', '', copies_val)))) if copies_val else 3
            except ValueError:
                copies_count = 3

            cat = None
            if cat_code:
                cat = Category.objects.filter(Q(code__iexact=cat_code) | Q(name__icontains=cat_code)).first()
            if not cat:
                cat = default_cat

            author, _ = Author.objects.get_or_create(
                name=author_name or 'Nhiều tác giả',
                defaults={'bio': f'Tác giả giảng dạy và nghiên cứu tại Trường ĐH Giao thông vận tải TP.HCM.'}
            )

            with transaction.atomic():
                book = None
                if isbn:
                    book = Book.objects.filter(isbn=isbn, deleted_at__isnull=True).first()
                if not book:
                    book = Book.objects.filter(title=title, deleted_at__isnull=True).first()

                if not book:
                    book = Book.objects.create(
                        title=title,
                        isbn=isbn or None,
                        publisher=publisher or 'NXB Giao thông Vận tải',
                        year=year,
                        price=price,
                        category=cat,
                        processing_fee=20000,
                        language='Tiếng Việt',
                        keywords=f"{cat.name if cat else ''}, UTH, Giáo trình",
                        description=f"Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH).",
                    )
                    book.authors.add(author)
                    imported_books += 1
                else:
                    book.authors.add(author)

                if cat:
                    barcodes = generate_barcodes_for_category(cat, copies_count)
                    for bc in barcodes:
                        Copy.objects.create(
                            book=book,
                            barcode=bc,
                            shelf_location=shelf_val or f'Kệ {cat.code}-01',
                            status=CopyStatus.AVAILABLE,
                            purchase_price=price,
                            source='Nhập bổ sung thư viện UTH',
                            supplier='Trung tâm Thông tin - Thư viện UTH',
                        )
                        created_copies += 1

        except Exception as e:
            errors.append(f"Dòng {r_idx}: Lỗi {str(e)}")

    return {
        'imported_books': imported_books,
        'created_copies': created_copies,
        'errors': errors
    }

def export_books_to_csv() -> str:
    import csv
    import io
    output = io.StringIO()
    output.write('\ufeff')
    writer = csv.writer(output)
    writer.writerow([
        'Mã sách', 'Tên đầu sách', 'Tác giả', 'ISBN', 'Chuyên ngành', 'Mã khoa',
        'Nhà xuất bản', 'Năm XB', 'Giá bìa (VND)', 'Tổng bản sao', 'Bản sẵn sàng'
    ])

    books = Book.objects.filter(deleted_at__isnull=True).select_related('category').prefetch_related('authors', 'copies').order_by('id')
    for b in books:
        authors_str = ", ".join([a.name for a in b.authors.all()])
        total_copies = b.copies.filter(deleted_at__isnull=True).count()
        avail_copies = b.copies.filter(deleted_at__isnull=True, status=CopyStatus.AVAILABLE, reading_room_only=False).count()
        writer.writerow([
            b.id,
            b.title,
            authors_str,
            b.isbn or '',
            b.category.name if b.category else '',
            b.category.code if b.category else '',
            b.publisher or '',
            b.year or '',
            b.price,
            total_copies,
            avail_copies,
        ])
    return output.getvalue()

def create_deaccession_batch(
    decision_number: str,
    decision_date,
    reason: str,
    copy_ids: List[int],
    created_by,
    code: Optional[str] = None,
    committee: Optional[str] = None,
    note: Optional[str] = None,
    request=None
) -> DeaccessionBatch:
    with transaction.atomic():
        copies = Copy.objects.select_for_update().filter(id__in=copy_ids, deleted_at__isnull=True)
        if len(copies) != len(copy_ids):
            raise BusinessLogicError('NOT_FOUND', detail='Một số bản sao không tồn tại hoặc đã bị xóa.')

        for cp in copies:
            if cp.status == CopyStatus.BORROWED:
                raise BusinessLogicError('COPY_BORROWED', detail=f"Bản sao mã vạch {cp.barcode} đang có bạn đọc mượn, không thể thanh lý.")
            if cp.status == CopyStatus.WITHDRAWN:
                raise BusinessLogicError('COPY_ALREADY_WITHDRAWN', detail=f"Bản sao mã vạch {cp.barcode} đã thanh lý trước đó.")

        if not code or not code.strip():
            year_now = timezone.now().year
            count_year = DeaccessionBatch.objects.filter(created_at__year=year_now).count() + 1
            code = f"BBTL-{year_now}-{count_year:03d}"

        total_value = sum(cp.purchase_price or (cp.book.price if cp.book else 0) or 0 for cp in copies)

        batch = DeaccessionBatch.objects.create(
            code=code.strip(),
            decision_number=decision_number.strip(),
            decision_date=decision_date,
            reason=reason,
            status='draft',
            committee=committee or 'Hội đồng thanh lý tài liệu Thư viện Trường ĐH Giao thông Vận tải TP.HCM',
            total_copies=len(copies),
            total_value=total_value,
            note=note,
            created_by=created_by,
        )

        for cp in copies:
            cp.deaccession_batch = batch
            cp.save(update_fields=['deaccession_batch'])

        from apps.audit.services import log_action
        log_action(
            user=created_by,
            action='CREATE_DEACCESSION_BATCH',
            entity_type='DeaccessionBatch',
            entity_id=batch.id,
            detail={'code': batch.code, 'total_copies': batch.total_copies, 'total_value': batch.total_value},
            request=request
        )

        return batch

def approve_deaccession_batch(batch_id: int, approved_by, approval_data: dict = None, request=None) -> DeaccessionBatch:
    with transaction.atomic():
        batch = DeaccessionBatch.objects.select_for_update().filter(id=batch_id).first()
        if not batch:
            raise BusinessLogicError('NOT_FOUND', detail='Không tìm thấy biên bản thanh lý.')

        if batch.status != 'draft':
            raise BusinessLogicError('INVALID_STATUS', detail=f'Biên bản đang ở trạng thái {batch.get_status_display()}, không thể duyệt.')

        # Căn cứ pháp lý phê duyệt của Ban Giám hiệu
        if approval_data:
            batch.bgh_decision_number = approval_data.get('bgh_decision_number', '').strip()
            batch.bgh_decision_date = approval_data.get('bgh_decision_date')
            batch.bgh_approver_name = approval_data.get('bgh_approver_name', '').strip()
            batch.disposal_method = approval_data.get('disposal_method') or 'Tiêu hủy phân loại sinh học'
            batch.approval_note = approval_data.get('approval_note', '').strip()

        copies = Copy.objects.select_for_update().filter(deaccession_batch=batch)
        for cp in copies:
            cp.status = CopyStatus.WITHDRAWN
            qd_ref = batch.bgh_decision_number or batch.decision_number
            cp.note = f"Thanh lý theo QĐ {qd_ref} (Biên bản {batch.code})"
            cp.save(update_fields=['status', 'note'])

        batch.status = 'approved'
        batch.approved_by = approved_by
        batch.approved_at = timezone.now()
        batch.save(update_fields=[
            'status', 'approved_by', 'approved_at',
            'bgh_decision_number', 'bgh_decision_date', 'bgh_approver_name',
            'disposal_method', 'approval_note'
        ])

        from apps.audit.services import log_action
        log_action(
            user=approved_by,
            action='APPROVE_DEACCESSION_BATCH',
            entity_type='DeaccessionBatch',
            entity_id=batch.id,
            detail={
                'code': batch.code,
                'total_copies': batch.total_copies,
                'bgh_decision_number': batch.bgh_decision_number,
                'bgh_approver_name': batch.bgh_approver_name,
            },
            request=request
        )

        return batch

def cancel_deaccession_batch(batch_id: int, user, reason: str = None, request=None) -> DeaccessionBatch:
    with transaction.atomic():
        batch = DeaccessionBatch.objects.select_for_update().filter(id=batch_id).first()
        if not batch:
            raise BusinessLogicError('NOT_FOUND', detail='Không tìm thấy biên bản thanh lý.')

        if batch.status != 'draft':
            raise BusinessLogicError('INVALID_STATUS', detail=f'Biên bản đã {batch.get_status_display()}, không thể hủy.')

        Copy.objects.filter(deaccession_batch=batch).update(deaccession_batch=None)

        batch.status = 'cancelled'
        if reason:
            batch.note = f"{(batch.note or '')}\nLý do hủy: {reason}".strip()
        batch.save(update_fields=['status', 'note'])

        from apps.audit.services import log_action
        log_action(
            user=user,
            action='CANCEL_DEACCESSION_BATCH',
            entity_type='DeaccessionBatch',
            entity_id=batch.id,
            detail={'code': batch.code},
            request=request
        )

        return batch

