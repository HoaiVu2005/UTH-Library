import io
import re
from typing import List, Optional
import barcode
from barcode.writer import ImageWriter, SVGWriter
from django.db import transaction
from django.db.models import Q, Count
from django.utils import timezone
from apps.core.exceptions import BusinessLogicError
from apps.core.enums import CopyStatus, LoanStatus, ReservationStatus
from .models import Category, Author, Book, Copy, BarcodeSequence

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
    author_id: Optional[int] = None,
    author_name: Optional[str] = None,
    year: Optional[int] = None,
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

    if author_id:
        queryset = queryset.filter(authors__id=author_id)

    if author_name:
        cleaned_author = ' '.join(author_name.strip().split())
        queryset = queryset.filter(authors__name__unaccent__icontains=cleaned_author).distinct()

    if year:
        queryset = queryset.filter(year=year)

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
    }
    order_field = valid_orderings.get(ordering, '-created_at')
    return queryset.order_by(order_field)

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
