import concurrent.futures
import pytest
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.core.enums import UserRole, CopyStatus
from apps.catalog.models import Category, Author, Book, Copy, BarcodeSequence
from apps.catalog.services import (
    generate_barcodes_for_category,
    generate_barcode_image,
    normalize_barcode,
    delete_book,
)
from apps.circulation.models import Loan
from apps.core.exceptions import BusinessLogicError

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def admin_user(db):
    user, _ = User.objects.get_or_create(
        username='admin_test',
        defaults={'role': UserRole.ADMIN, 'card_code': 'ADMIN_T01'}
    )
    user.set_password('Admin123')
    user.save()
    return user

@pytest.mark.django_db
def test_unaccent_search_finds_accented_titles(api_client):
    cat, _ = Category.objects.get_or_create(code='GTVT', defaults={'name': 'Giao thông'})
    Book.objects.get_or_create(
        title='Quy hoạch và Quản lý Giao thông Đô thị',
        category=cat,
        defaults={'price': 100000}
    )
    # Search 'giao thong' without accents
    response = api_client.get('/api/v1/books', {'q': 'giao thong'})
    assert response.status_code == 200
    data = response.json()['data']
    assert len(data) > 0
    # Every book in results should relate to 'Giao thông'
    titles = [b['title'] for b in data]
    assert any('Giao thông' in t for t in titles)

@pytest.mark.django_db
def test_search_suggest(api_client):
    cat, _ = Category.objects.get_or_create(code='LOG', defaults={'name': 'Logistics'})
    Book.objects.get_or_create(
        title='Quản trị Chuỗi Cung ứng và Logistics Toàn cầu',
        category=cat,
        defaults={'price': 100000}
    )
    response = api_client.get('/api/v1/search/suggest', {'q': 'logistics'})
    assert response.status_code == 200
    data = response.json()['data']
    assert len(data) > 0
    assert any('Logistics' in item['title'] for item in data)

@pytest.mark.django_db
def test_barcode_generation_format_and_sequence(db):
    cat = Category.objects.create(code='TEST', name='Chuyên ngành Thử nghiệm')
    barcodes = generate_barcodes_for_category(cat, 5)

    assert len(barcodes) == 5
    assert barcodes[0] == 'UTH-TEST-000001'
    assert barcodes[4] == 'UTH-TEST-000005'

    # Next batch continues sequence
    next_barcodes = generate_barcodes_for_category(cat, 3)
    assert next_barcodes[0] == 'UTH-TEST-000006'
    assert next_barcodes[2] == 'UTH-TEST-000008'

@pytest.mark.django_db(transaction=True)
def test_concurrent_barcode_generation_no_duplicates(db):
    cat, _ = Category.objects.get_or_create(code='CONC', defaults={'name': 'Chuyên ngành Song song'})
    BarcodeSequence.objects.get_or_create(category=cat, defaults={'last_value': 0})

    def worker():
        from django.db import connection
        connection.close() # get fresh connection per thread
        return generate_barcodes_for_category(cat, 10)

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(worker) for _ in range(5)]
        results = [f.result() for f in futures]

    all_barcodes = []
    for batch in results:
        all_barcodes.extend(batch)

    # 5 workers * 10 barcodes = 50 total barcodes
    assert len(all_barcodes) == 50
    # Must be completely unique (no collision)
    assert len(set(all_barcodes)) == 50

@pytest.mark.django_db
def test_barcode_image_generation():
    png_bytes = generate_barcode_image('UTH-CNTT-000123', output_format='png')
    assert png_bytes.startswith(b'\x89PNG\r\n\x1a\n')

    svg_bytes = generate_barcode_image('UTH-CNTT-000123', output_format='svg')
    assert b'<svg' in svg_bytes

@pytest.mark.django_db
def test_normalize_barcode():
    assert normalize_barcode('  uth-cntt-000123  ') == 'UTH-CNTT-000123'
    with pytest.raises(BusinessLogicError) as exc:
        normalize_barcode('INVALID_CODE')
    assert exc.value.code == 'INVALID_BARCODE_FORMAT'

@pytest.mark.django_db
def test_book_delete_with_active_loans_rejected(db):
    cat, _ = Category.objects.get_or_create(code='DEL', defaults={'name': 'Xóa Thử Nghiệm'})
    book = Book.objects.create(title='Sách Đang Mượn', category=cat)
    copy = Copy.objects.create(book=book, barcode='UTH-DEL-999999', status=CopyStatus.BORROWED)

    with pytest.raises(BusinessLogicError) as exc:
        delete_book(book.id)
    assert exc.value.code == 'BOOK_HAS_ACTIVE_LOANS'

@pytest.mark.django_db
def test_book_delete_with_physical_copies_rejected(db):
    cat, _ = Category.objects.get_or_create(code='DEL', defaults={'name': 'Xóa Thử Nghiệm'})
    book = Book.objects.create(title='Sách Có Bản Sao Kệ', category=cat)
    Copy.objects.create(book=book, barcode='UTH-DEL-888888', status=CopyStatus.AVAILABLE)

    with pytest.raises(BusinessLogicError) as exc:
        delete_book(book.id)
    assert exc.value.code == 'BOOK_HAS_COPIES'

@pytest.mark.django_db
def test_book_delete_with_withdrawn_copies_rejected(db):
    cat, _ = Category.objects.get_or_create(code='DEL', defaults={'name': 'Xóa Thử Nghiệm'})
    book = Book.objects.create(title='Sách Đã Thanh Lý Bản Sao', category=cat)
    Copy.objects.create(book=book, barcode='UTH-DEL-777777', status=CopyStatus.WITHDRAWN)

    with pytest.raises(BusinessLogicError) as exc:
        delete_book(book.id)
    assert exc.value.code == 'BOOK_HAS_WITHDRAWN_COPIES'

@pytest.mark.django_db
def test_book_delete_mistake_without_copies_allowed(db):
    cat, _ = Category.objects.get_or_create(code='DEL', defaults={'name': 'Xóa Thử Nghiệm'})
    book = Book.objects.create(title='Sách Nhập Nhầm Không Có Bản Sao', category=cat)

    deleted = delete_book(book.id)
    assert deleted.deleted_at is not None
    assert Book.objects.filter(id=book.id, deleted_at__isnull=True).count() == 0
