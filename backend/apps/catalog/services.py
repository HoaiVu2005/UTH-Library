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
    ordering: str = '-created_at',
    include_archived: bool = True,
):
    queryset = Book.objects.filter(deleted_at__isnull=True).select_related('category').prefetch_related('authors', 'copies')

    if not include_archived:
        # Ẩn khỏi cổng tra cứu sinh viên các đầu sách đã thanh lý hết toàn bộ bản sao
        queryset = queryset.annotate(
            active_circ_count=Count('copies', filter=Q(copies__deleted_at__isnull=True) & ~Q(copies__status=CopyStatus.WITHDRAWN))
        ).exclude(active_circ_count=0, copies__status=CopyStatus.WITHDRAWN)

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
    """
    Quy tắc nghiệp vụ xóa đầu sách chuẩn kiểm toán và quản lý tài sản thư viện:
    1. Đầu sách nhập nhầm (chưa từng tạo bản sao, chưa có lịch sử mượn trả) -> Cho phép xóa an toàn.
    2. Đầu sách đang có bản sao vật lý trên kệ/trong kho -> CHẶN XÓA để bảo toàn số liệu kiểm kê thực tế.
    3. Đầu sách đã thanh lý hết bản sao (withdrawn) -> CHẶN XÓA để bảo toàn hồ sơ biên bản thanh lý và kiểm toán tài chính;
       thay vào đó đầu sách sẽ được lưu trữ lịch sử và ẩn khỏi cổng tra cứu sinh viên.
    """
    book = Book.objects.filter(id=book_id, deleted_at__isnull=True).first()
    if not book:
        raise BusinessLogicError('NOT_FOUND', detail='Không tìm thấy đầu sách cần xóa.')

    # Kiểm tra bản sao vật lý
    total_copies = book.copies.filter(deleted_at__isnull=True).count()
    if total_copies > 0:
        in_circulation = book.copies.filter(
            deleted_at__isnull=True,
            status__in=[CopyStatus.BORROWED, CopyStatus.RESERVED_HOLD]
        ).count()
        if in_circulation > 0:
            raise BusinessLogicError(
                'BOOK_HAS_ACTIVE_LOANS',
                detail=f'Không thể xóa: Đầu sách đang có {in_circulation} bản sao đang được sinh viên mượn hoặc chờ nhận sách.'
            )

        active_copies = book.copies.filter(deleted_at__isnull=True).exclude(status=CopyStatus.WITHDRAWN).count()
        if active_copies > 0:
            raise BusinessLogicError(
                'BOOK_HAS_COPIES',
                detail=f'Không thể xóa đầu sách: Tựa sách này đang có {active_copies} bản sao vật lý trên kệ/trong kho lưu thông. Để đảm bảo dữ liệu phần mềm khớp với thực tế kiểm kê tài sản, hệ thống không cho phép xóa dây chuyền. Vui lòng thanh lý bản sao theo quy trình trước khi rút đầu sách.'
            )

        withdrawn_count = book.copies.filter(deleted_at__isnull=True, status=CopyStatus.WITHDRAWN).count()
        raise BusinessLogicError(
            'BOOK_HAS_WITHDRAWN_COPIES',
            detail=f'Không thể xóa đầu sách: Cuốn sách này đã từng lưu thông và có {withdrawn_count} bản sao nằm trong Biên bản thanh lý / Hồ sơ kiểm toán tài sản. Để bảo toàn số liệu kiểm toán, đầu sách này được lưu trữ lịch sử và ẩn khỏi cổng tra cứu sinh viên chứ không được xóa khỏi hệ thống.'
        )

    from apps.reservations.models import Reservation
    has_active_reservations = Reservation.objects.filter(
        book=book,
        status__in=[ReservationStatus.PENDING, ReservationStatus.READY]
    ).exists()
    if has_active_reservations:
        raise BusinessLogicError(
            'BOOK_HAS_ACTIVE_RESERVATIONS',
            detail='Không thể xóa đầu sách: Đang có bạn đọc xếp hàng mượn sách tựa sách này.'
        )

    from apps.circulation.models import Loan
    if Loan.objects.filter(book=book).exists():
        raise BusinessLogicError(
            'BOOK_HAS_LOAN_HISTORY',
            detail='Không thể xóa đầu sách: Tựa sách này đã từng phát sinh giao dịch mượn trả của sinh viên. Dữ liệu cần được lưu vết phục vụ kiểm toán tài sản và AUN-QA.'
        )

    # Đầu sách nhập nhầm (chưa có bản sao, chưa có lịch sử lưu thông): Cho phép xóa
    now = timezone.now()
    book.deleted_at = now
    book.save(update_fields=['deleted_at'])
    return book

def import_books_from_csv(csv_text: str) -> dict:
    import csv
    import io
    import unicodedata

    if csv_text.startswith('\ufeff'):
        csv_text = csv_text[1:]

    lines = [ln for ln in csv_text.splitlines() if ln.strip()]
    if not lines:
        return {'imported_books': 0, 'created_copies': 0, 'errors': ['Tập tin CSV rỗng.']}

    # Tự động phát hiện dấu phân cách (comma, semicolon, tab, pipe)
    delimiters = [',', ';', '\t', '|']
    best_delimiter = ','
    best_count = 0
    first_line = lines[0]
    for d in delimiters:
        cnt = first_line.count(d)
        if cnt > best_count:
            best_count = cnt
            best_delimiter = d

    reader = csv.reader(io.StringIO(csv_text), delimiter=best_delimiter)
    rows = list(reader)
    if not rows or len(rows) < 1:
        return {'imported_books': 0, 'created_copies': 0, 'errors': ['Tập tin CSV không có dữ liệu tiêu đề.']}

    def normalize_header(h: str) -> str:
        if not h:
            return ''
        s = h.strip().lower().replace('đ', 'd').replace('Đ', 'd')
        s = ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
        return re.sub(r'[^a-z0-9]+', '_', s).strip('_')

    headers = [normalize_header(h) for h in rows[0]]
    header_map = {}

    for idx, h in enumerate(headers):
        tokens = h.split('_')
        if any(k in h for k in ['ten_sach', 'title', 'tua_de', 'ten_dau_sach']) and 'title' not in header_map:
            header_map['title'] = idx
        elif any(k in h for k in ['tac_gia', 'author', 'tacgia']) and 'author' not in header_map:
            header_map['author'] = idx
        elif 'isbn' in h and 'isbn' not in header_map:
            header_map['isbn'] = idx
        elif any(k in h for k in ['ma_khoa', 'khoa', 'category']) and 'category' not in header_map:
            header_map['category'] = idx
        elif any(k in h for k in ['chuyen_nganh', 'nganh', 'bo_mon']) and 'category' not in header_map:
            header_map['category'] = idx
        elif any(k in h for k in ['nha_xuat_ban', 'nxb', 'publisher']) and 'publisher' not in header_map:
            header_map['publisher'] = idx
        elif (any(k in h for k in ['nam_xb', 'nam_xuat_ban']) or h in ['nam', 'year']) and 'year' not in header_map:
            header_map['year'] = idx
        elif any(k in h for k in ['gia_bia', 'gia', 'price', 'don_gia']) and 'price' not in header_map:
            header_map['price'] = idx
        elif any(k in h for k in ['so_ban_sao', 'so_luong', 'copies', 'ban_sao', 'so_ban']) and 'copies' not in header_map:
            header_map['copies'] = idx
        elif (any(k in h for k in ['vi_tri_ke', 'vi_tri', 'shelf']) or h == 'ke') and 'shelf' not in header_map:
            header_map['shelf'] = idx
        elif (
            any(k in h for k in ['anh_bia', 'cover', 'cover_image', 'hinh_anh', 'image', 'url_anh', 'link_anh', 'anh_sach'])
            or (h in ['anh', 'cover', 'image'])
            or ('anh' in tokens and not any(ng in h for ng in ['nganh', 'tieng_anh']))
        ) and 'cover_image' not in header_map:
            header_map['cover_image'] = idx
        elif any(k in h for k in ['tom_tat_noi_dung', 'tom_tat', 'mo_ta', 'description', 'abstract', 'noi_dung']) and 'description' not in header_map:
            header_map['description'] = idx

    if 'title' not in header_map:
        return {'imported_books': 0, 'created_copies': 0, 'errors': ['Không tìm thấy cột "Tên sách" hoặc "title" trong dòng tiêu đề CSV.']}

    # Tự động dọn dẹp các đầu sách cũ từng bị lưu nhầm tên Khoa / Viện vào trường cover_image
    try:
        corrupted = Book.objects.filter(
            Q(cover_image__istartswith='Khoa ') |
            Q(cover_image__istartswith='Viện ') |
            Q(cover_image__istartswith='Bộ môn ')
        )
        for cb in corrupted:
            cb.cover_image = None
            cb.save(update_fields=['cover_image'])
    except Exception:
        pass

    default_cat = Category.objects.first()
    imported_books = 0
    created_copies = 0
    errors = []

    for r_idx, row in enumerate(rows[1:], start=2):
        if not row or not any(field.strip() for field in row):
            continue

        try:
            # 1. Tên sách (Bắt buộc)
            title = row[header_map['title']].strip() if 'title' in header_map and len(row) > header_map['title'] else ''
            if not title:
                errors.append(f"Dòng {r_idx}: Bỏ qua do thiếu 'Tên sách' (bắt buộc).")
                continue

            # 2. Tác giả (Bắt buộc)
            author_name = row[header_map['author']].strip() if 'author' in header_map and len(row) > header_map['author'] else ''
            if not author_name:
                errors.append(f"Dòng {r_idx}: Sách '{title}' thiếu 'Tác giả' (bắt buộc).")
                continue

            # 3. ISBN (Không bắt buộc)
            isbn = row[header_map['isbn']].strip() if 'isbn' in header_map and len(row) > header_map['isbn'] else None
            if isbn and len(isbn) < 5:
                isbn = None

            # 4. Mã khoa (Bắt buộc)
            cat_code = row[header_map['category']].strip() if 'category' in header_map and len(row) > header_map['category'] else ''
            if not cat_code:
                errors.append(f"Dòng {r_idx}: Sách '{title}' thiếu 'Mã khoa' (bắt buộc).")
                continue

            cat = Category.objects.filter(Q(code__iexact=cat_code) | Q(name__icontains=cat_code)).first()
            if not cat:
                cat = default_cat

            # 5. Nhà xuất bản (Không bắt buộc)
            publisher = row[header_map['publisher']].strip() if 'publisher' in header_map and len(row) > header_map['publisher'] else 'NXB Giao thông Vận tải'

            # 6. Năm XB (Không bắt buộc)
            year_val = row[header_map['year']].strip() if 'year' in header_map and len(row) > header_map['year'] else '2024'
            try:
                year = int(re.sub(r'\D', '', year_val)) if year_val else 2024
            except ValueError:
                year = 2024

            # 7. Giá bìa (Không bắt buộc)
            price_val = row[header_map['price']].strip() if 'price' in header_map and len(row) > header_map['price'] else '150000'
            try:
                price = int(re.sub(r'\D', '', price_val)) if price_val else 150000
            except ValueError:
                price = 150000

            # 8. Số bản sao (Bắt buộc)
            copies_val = row[header_map['copies']].strip() if 'copies' in header_map and len(row) > header_map['copies'] else ''
            if not copies_val:
                errors.append(f"Dòng {r_idx}: Sách '{title}' thiếu 'Số bản sao' (bắt buộc).")
                continue

            try:
                copies_count = max(1, min(50, int(re.sub(r'\D', '', copies_val))))
            except ValueError:
                errors.append(f"Dòng {r_idx}: Sách '{title}' có 'Số bản sao' không hợp lệ ({copies_val}).")
                continue

            # 9. Vị trí kệ (Bắt buộc)
            shelf_val = row[header_map['shelf']].strip() if 'shelf' in header_map and len(row) > header_map['shelf'] else ''
            if not shelf_val:
                errors.append(f"Dòng {r_idx}: Sách '{title}' thiếu 'Vị trí kệ' (bắt buộc).")
                continue

            # 10. Ảnh bìa (Không bắt buộc)
            cover_image_raw = row[header_map['cover_image']].strip() if 'cover_image' in header_map and len(row) > header_map['cover_image'] else ''
            cover_image_val = ''
            if cover_image_raw:
                c_low = cover_image_raw.lower()
                is_invalid = any(bad in c_low for bad in ['khoa ', 'viện ', 'bộ môn ', 'phòng ban', 'chuyên ngành'])
                if not is_invalid and (
                    cover_image_raw.startswith(('http://', 'https://', '/', 'data:image')) or
                    any(c_low.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp']) or
                    any(c_low.split('?')[0].endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp'])
                ):
                    cover_image_val = cover_image_raw

            # 11. Tóm tắt nội dung (Không bắt buộc)
            description_val = row[header_map['description']].strip() if 'description' in header_map and len(row) > header_map['description'] else ''

            author, _ = Author.objects.get_or_create(
                name=author_name,
                defaults={'bio': f'Tác giả giảng dạy và nghiên cứu tại Trường ĐH Giao thông vận tải TP.HCM.'}
            )

            with transaction.atomic():
                book = None
                if isbn:
                    book = Book.objects.filter(isbn=isbn).order_by('-id').first()
                if not book:
                    book = Book.objects.filter(title=title).order_by('-id').first()

                if not book:
                    book = Book.objects.create(
                        title=title,
                        isbn=isbn or None,
                        publisher=publisher or 'NXB Giao thông Vận tải',
                        year=year,
                        price=price,
                        category=cat,
                        cover_image=cover_image_val or None,
                        description=description_val or f"Tài liệu giảng dạy và học tập chuyên ngành {cat.name if cat else 'UTH'} tại Trường Đại học Giao thông vận tải TP.HCM.",
                        processing_fee=20000,
                        language='Tiếng Việt',
                        keywords=f"{cat.name if cat else ''}, UTH, Giáo trình, {cat_code}",
                    )
                    book.authors.add(author)
                    imported_books += 1
                else:
                    fields_to_update = []
                    # Nếu đầu sách từng bị xóa mềm trước đó, khôi phục lại trạng thái hoạt động
                    if book.deleted_at is not None:
                        book.deleted_at = None
                        fields_to_update.append('deleted_at')
                        imported_books += 1

                    if cover_image_val:
                        book.cover_image = cover_image_val
                        fields_to_update.append('cover_image')
                    elif book.cover_image and any(bad in book.cover_image for bad in ['Khoa ', 'Viện ', 'Bộ môn ']):
                        book.cover_image = None
                        fields_to_update.append('cover_image')

                    if description_val and (not book.description or 'Tài liệu giảng dạy' in book.description):
                        book.description = description_val
                        fields_to_update.append('description')
                    if fields_to_update:
                        book.save(update_fields=fields_to_update)
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
        'Mã sách', 'Tên sách', 'Tác giả', 'ISBN', 'Mã khoa', 'Chuyên ngành',
        'Nhà xuất bản', 'Năm XB', 'Giá bìa (VND)', 'Số bản sao', 'Bản sẵn sàng', 'Vị trí kệ', 'Ảnh bìa', 'Tóm tắt nội dung'
    ])

    books = Book.objects.filter(deleted_at__isnull=True).select_related('category').prefetch_related('authors', 'copies').order_by('id')
    for b in books:
        authors_str = ", ".join([a.name for a in b.authors.all()])
        total_copies = b.copies.filter(deleted_at__isnull=True).count()
        avail_copies = b.copies.filter(deleted_at__isnull=True, status=CopyStatus.AVAILABLE, reading_room_only=False).count()
        shelf_sample = b.copies.first().shelf_location if b.copies.exists() else 'Khu vực lưu trữ'
        writer.writerow([
            b.id,
            b.title,
            authors_str,
            b.isbn or '',
            b.category.code if b.category else '',
            b.category.name if b.category else '',
            b.publisher or '',
            b.year or '',
            b.price,
            total_copies,
            avail_copies,
            shelf_sample,
            b.cover_image or '',
            b.description or '',
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
    copy_reasons: Optional[dict] = None,
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

        reason_dict = dict(DeaccessionBatch.REASON_CHOICES)
        for cp in copies:
            cp.deaccession_batch = batch
            cp.status = CopyStatus.PENDING_DEACCESSION
            update_fields = ['deaccession_batch', 'status']
            if copy_reasons and (str(cp.id) in copy_reasons or cp.id in copy_reasons):
                r_val = copy_reasons.get(str(cp.id)) or copy_reasons.get(cp.id)
                r_text = reason_dict.get(r_val, r_val)
                cp.note = f"{cp.note or ''} [Thanh lý: {r_text}]".strip()
                update_fields.append('note')
            cp.save(update_fields=update_fields)

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

        # Nguyên tắc Maker-Checker (Bốn mắt): Người lập biên bản không được tự duyệt
        if batch.created_by == approved_by:
            raise BusinessLogicError(
                'MAKER_CHECKER_VIOLATION',
                detail='Người lập biên bản không được phép tự phê duyệt biên bản thanh lý của chính mình (Nguyên tắc kiểm soát độc lập Maker-Checker theo Thông tư 02/2020/TT-BVHTTDL).'
            )

        if batch.status not in ['draft', 'pending_approval']:
            raise BusinessLogicError('INVALID_STATUS', detail=f'Biên bản đang ở trạng thái {batch.get_status_display()}, không thể duyệt.')

        # Căn cứ pháp lý phê duyệt của Ban Giám hiệu (Bắt buộc theo v2.1)
        bgh_num = approval_data.get('bgh_decision_number', '').strip() if approval_data else ''
        bgh_date = approval_data.get('bgh_decision_date') if approval_data else None
        if not bgh_num:
            raise BusinessLogicError('VALIDATION_ERROR', detail='Bắt buộc phải nhập Số quyết định phê duyệt của Ban Giám hiệu.')
        if not bgh_date:
            raise BusinessLogicError('VALIDATION_ERROR', detail='Bắt buộc phải nhập Ngày ký quyết định của Ban Giám hiệu.')

        if approval_data:
            batch.bgh_decision_number = bgh_num
            batch.bgh_decision_date = bgh_date
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

        if batch.status in ['approved', 'executed']:
            raise BusinessLogicError('LOCKED_BATCH', detail='Biên bản đã được phê duyệt, đã khóa và không thể thay đổi hoặc hủy bỏ.')

        # Kiểm tra thẩm quyền hủy biên bản:
        # Thủ thư chỉ được hủy biên bản do chính mình lập khi còn ở trạng thái Dự thảo (draft)
        from apps.core.enums import UserRole
        if getattr(user, 'role', '') == UserRole.LIBRARIAN:
            if batch.created_by != user:
                raise BusinessLogicError('FORBIDDEN', detail='Thủ thư chỉ được phép hủy biên bản thanh lý do chính mình lập.')
            if batch.status != 'draft':
                raise BusinessLogicError('INVALID_STATUS', detail='Thủ thư chỉ được phép hủy biên bản khi đang ở trạng thái Dự thảo.')

        for cp in Copy.objects.filter(deaccession_batch=batch):
            cp.deaccession_batch = None
            cp.status = CopyStatus.AVAILABLE
            cp.save(update_fields=['deaccession_batch', 'status'])

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

