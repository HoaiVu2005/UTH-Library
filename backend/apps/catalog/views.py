import secrets
from django.conf import settings
from django.http import HttpResponse
from django.db.models import Count, Q, Prefetch
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.accounts.permissions import IsAdminUserRole
from apps.audit.services import log_action
from apps.core.exceptions import BusinessLogicError
from apps.core.pagination import StandardPagination
from apps.core.enums import CopyStatus
from .models import Category, Author, Book, Copy
from .serializers import (
    CategorySerializer,
    AuthorSerializer,
    BookListSerializer,
    BookDetailSerializer,
    BookWriteSerializer,
    CopySerializer,
    BatchCopyCreateSerializer,
)
from .services import (
    search_books,
    suggest_books,
    delete_book,
    generate_barcodes_for_category,
    generate_barcode_image,
    normalize_barcode,
    import_books_from_csv,
    export_books_to_csv,
)
from .isbn_service import lookup_isbn_metadata

class SuggestBooksView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        q = request.query_params.get('q', '')
        suggestions = suggest_books(q=q, limit=10)
        return Response({'data': suggestions}, status=status.HTTP_200_OK)

class BookListView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUserRole()]

    def get(self, request):
        q = request.query_params.get('q')
        category_id = request.query_params.get('category_id') or request.query_params.get('category')
        author_id = request.query_params.get('author_id')
        author_name = request.query_params.get('author') or request.query_params.get('author_name')
        year = request.query_params.get('year')
        available_only = request.query_params.get('available_only', 'false').lower() == 'true'
        ordering = request.query_params.get('ordering', '-created_at')

        queryset = search_books(
            q=q,
            category_id=int(category_id) if category_id else None,
            author_id=int(author_id) if author_id else None,
            author_name=author_name,
            year=int(year) if year else None,
            available_only=available_only,
            ordering=ordering,
        )

        paginator = StandardPagination()
        page_records = paginator.paginate_queryset(queryset, request)
        serializer = BookListSerializer(page_records, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        return BookAdminCreateView().post(request)

class BookDetailView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUserRole()]

    def get(self, request, pk):
        book = Book.objects.filter(id=pk, deleted_at__isnull=True).select_related('category').prefetch_related('authors', 'copies').first()
        if not book:
            raise BusinessLogicError('NOT_FOUND', detail='Không tìm thấy đầu sách yêu cầu.')
        serializer = BookDetailSerializer(book, context={'request': request})
        return Response({'data': serializer.data}, status=status.HTTP_200_OK)

    def put(self, request, pk):
        return BookAdminUpdateDeleteView().put(request, pk)

    def delete(self, request, pk):
        return BookAdminUpdateDeleteView().delete(request, pk)

class RelatedBooksView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        book = Book.objects.filter(id=pk, deleted_at__isnull=True).first()
        if not book:
            raise BusinessLogicError('NOT_FOUND')

        related = Book.objects.filter(
            category=book.category,
            deleted_at__isnull=True
        ).exclude(id=book.id).select_related('category').prefetch_related('authors', 'copies')[:6]

        serializer = BookListSerializer(related, many=True)
        return Response({'data': serializer.data}, status=status.HTTP_200_OK)

class BookCopiesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        book = Book.objects.filter(id=pk, deleted_at__isnull=True).first()
        if not book:
            raise BusinessLogicError('NOT_FOUND')

        copies = Copy.objects.filter(book=book, deleted_at__isnull=True).order_by('barcode')
        serializer = CopySerializer(copies, many=True)
        return Response({'data': serializer.data}, status=status.HTTP_200_OK)

class BookAdminCreateView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        serializer = BookWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        book = serializer.save()

        log_action(
            user=request.user,
            action='CREATE_BOOK',
            entity_type='Book',
            entity_id=book.id,
            detail={'title': book.title, 'isbn': book.isbn},
            request=request
        )

        return Response({'data': BookDetailSerializer(book).data}, status=status.HTTP_201_CREATED)

class BookAdminUpdateDeleteView(APIView):
    permission_classes = [IsAdminUserRole]

    def put(self, request, pk):
        book = Book.objects.filter(id=pk, deleted_at__isnull=True).first()
        if not book:
            raise BusinessLogicError('NOT_FOUND')

        serializer = BookWriteSerializer(book, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        book = serializer.save()

        log_action(
            user=request.user,
            action='UPDATE_BOOK',
            entity_type='Book',
            entity_id=book.id,
            detail={'title': book.title},
            request=request
        )

        return Response({'data': BookDetailSerializer(book).data}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        book = delete_book(pk)

        log_action(
            user=request.user,
            action='DELETE_BOOK',
            entity_type='Book',
            entity_id=book.id,
            detail={'title': book.title},
            request=request
        )

        return Response({'detail': 'Xóa đầu sách thành công.'}, status=status.HTTP_200_OK)

class BookCoverUploadView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        book = Book.objects.filter(id=pk, deleted_at__isnull=True).first()
        if not book:
            raise BusinessLogicError('NOT_FOUND')

        file_obj = request.FILES.get('cover')
        if not file_obj:
            raise BusinessLogicError('VALIDATION_ERROR', detail='Vui lòng chọn tập tin ảnh bìa.')

        if file_obj.size > 5 * 1024 * 1024:
            raise BusinessLogicError('FILE_TOO_LARGE')

        header = file_obj.read(12)
        file_obj.seek(0)
        is_jpeg = header.startswith(b'\xff\xd8\xff')
        is_png = header.startswith(b'\x89PNG\r\n\x1a\n')
        is_webp = header.startswith(b'RIFF') and header[8:12] == b'WEBP'

        if not (is_jpeg or is_png or is_webp):
            raise BusinessLogicError('FILE_TYPE_NOT_ALLOWED')

        ext = 'jpg' if is_jpeg else ('png' if is_png else 'webp')
        filename = f"cover_{book.id}_{secrets.token_hex(8)}.{ext}"
        upload_dir = settings.MEDIA_ROOT / 'covers'
        upload_dir.mkdir(parents=True, exist_ok=True)
        file_path = upload_dir / filename

        with open(file_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        cover_url = f"{settings.MEDIA_URL}covers/{filename}"
        book.cover_image = cover_url
        book.save(update_fields=['cover_image'])

        return Response({
            'data': {'cover_image': cover_url},
            'detail': 'Tải lên ảnh bìa sách thành công.'
        }, status=status.HTTP_200_OK)

class CopyAdminListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        group_by = request.query_params.get('group_by', 'book')
        barcode_q = request.query_params.get('barcode', '').strip()
        status_q = request.query_params.get('status', '').strip()
        book_id = request.query_params.get('book_id', '').strip()

        if group_by == 'copy':
            queryset = Copy.objects.filter(deleted_at__isnull=True).select_related(
                'book', 'book__category', 'held_for_user'
            ).prefetch_related('book__authors').order_by('-created_at')

            if barcode_q:
                queryset = queryset.filter(barcode__icontains=barcode_q)

            if status_q:
                queryset = queryset.filter(status=status_q)

            if book_id:
                queryset = queryset.filter(book_id=book_id)

            paginator = StandardPagination()
            page_records = paginator.paginate_queryset(queryset, request)
            serializer = CopySerializer(page_records, many=True)
            return paginator.get_paginated_response(serializer.data)

        # Default: group_by == 'book'
        book_qs = Book.objects.filter(copies__deleted_at__isnull=True)
        if barcode_q:
            book_qs = book_qs.filter(copies__barcode__icontains=barcode_q)
        if status_q:
            book_qs = book_qs.filter(copies__status=status_q)
        if book_id:
            book_qs = book_qs.filter(id=book_id)

        book_qs = book_qs.distinct().select_related('category').prefetch_related('authors').order_by('-id')

        # Prefetch active copies
        copy_filter = Q(deleted_at__isnull=True)
        book_qs = book_qs.prefetch_related(
            Prefetch('copies', queryset=Copy.objects.filter(copy_filter).order_by('id'), to_attr='active_copies')
        )

        paginator = StandardPagination()
        page_records = paginator.paginate_queryset(book_qs, request)

        results = []
        for b in page_records:
            copies = getattr(b, 'active_copies', [])
            total_qty = len(copies)
            avail_qty = sum(1 for c in copies if c.status == 'available')
            borrowed_qty = sum(1 for c in copies if c.status == 'borrowed')
            reserved_qty = sum(1 for c in copies if c.status == 'reserved')
            damaged_qty = sum(1 for c in copies if c.status in ('damaged', 'lost'))
            withdrawn_qty = sum(1 for c in copies if c.status == 'withdrawn')
            shelf_locations = list(dict.fromkeys(c.shelf_location for c in copies if c.shelf_location))

            results.append({
                'book_id': b.id,
                'book_title': b.title,
                'book_isbn': b.isbn,
                'book_cover_image': b.cover_image or None,
                'category_code': b.category.code if b.category else 'UTH',
                'category_name': b.category.name if b.category else 'Chung',
                'authors_names': [a.name for a in b.authors.all()],
                'total_quantity': total_qty,
                'available_quantity': avail_qty,
                'borrowed_quantity': borrowed_qty,
                'reserved_quantity': reserved_qty,
                'damaged_quantity': damaged_qty,
                'withdrawn_quantity': withdrawn_qty,
                'shelf_location': shelf_locations[0] if shelf_locations else 'Quầy lưu trữ trung tâm',
                'shelf_locations': shelf_locations,
                'reading_room_only': any(c.reading_room_only for c in copies),
                'can_borrow_home': any(not c.reading_room_only for c in copies),
                'copies': CopySerializer(copies, many=True).data,
            })

        return paginator.get_paginated_response(results)

class CopyLookupView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        raw_barcode = request.query_params.get('barcode', '')
        normalized = normalize_barcode(raw_barcode)

        copy = Copy.objects.filter(barcode=normalized, deleted_at__isnull=True).select_related('book', 'held_for_user').first()
        if not copy:
            raise BusinessLogicError('NOT_FOUND', detail=f"Không tìm thấy bản sao với mã vạch {normalized}.")

        serializer = CopySerializer(copy)
        data = serializer.data
        data['book_title'] = copy.book.title
        data['book_id'] = copy.book.id
        return Response({'data': data}, status=status.HTTP_200_OK)

class CopyBarcodeImageView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request, pk):
        copy = Copy.objects.filter(id=pk, deleted_at__isnull=True).first()
        if not copy:
            raise BusinessLogicError('NOT_FOUND')

        fmt = request.query_params.get('format', 'png').lower()
        if fmt not in ['png', 'svg']:
            fmt = 'png'

        img_bytes = generate_barcode_image(copy.barcode, output_format=fmt)
        content_type = 'image/svg+xml' if fmt == 'svg' else 'image/png'
        return HttpResponse(img_bytes, content_type=content_type)

class BatchCopyCreateView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        serializer = BatchCopyCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        book_id = serializer.validated_data['book_id']
        quantity = serializer.validated_data['quantity']
        shelf_location = serializer.validated_data['shelf_location']
        purchase_price = serializer.validated_data.get('purchase_price')
        reading_room_only = serializer.validated_data['reading_room_only']
        source = serializer.validated_data['source']
        supplier = serializer.validated_data.get('supplier')
        note = serializer.validated_data.get('note')

        book = Book.objects.filter(id=book_id, deleted_at__isnull=True).select_related('category').first()
        if not book:
            raise BusinessLogicError('NOT_FOUND')

        barcodes = generate_barcodes_for_category(book.category, quantity)

        created_copies = []
        for bc in barcodes:
            created_copies.append(
                Copy(
                    book=book,
                    barcode=bc,
                    shelf_location=shelf_location,
                    status=CopyStatus.AVAILABLE,
                    reading_room_only=reading_room_only,
                    purchase_price=purchase_price or book.price,
                    source=source,
                    supplier=supplier,
                    note=note,
                )
            )

        Copy.objects.bulk_create(created_copies)

        log_action(
            user=request.user,
            action='BATCH_CREATE_COPIES',
            entity_type='Book',
            entity_id=book.id,
            detail={'quantity': quantity, 'barcodes': barcodes},
            request=request
        )

        return Response({
            'detail': f"Đã tạo thành công {quantity} bản sao.",
            'barcodes': barcodes
        }, status=status.HTTP_201_CREATED)

class CopyUpdateView(APIView):
    permission_classes = [IsAdminUserRole]

    def put(self, request, pk):
        copy = Copy.objects.filter(id=pk, deleted_at__isnull=True).first()
        if not copy:
            raise BusinessLogicError('NOT_FOUND')

        serializer = CopySerializer(copy, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()

        return Response({'data': CopySerializer(updated).data}, status=status.HTTP_200_OK)

class CopyWithdrawView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        copy = Copy.objects.filter(id=pk, deleted_at__isnull=True).first()
        if not copy:
            raise BusinessLogicError('NOT_FOUND')

        if copy.status in [CopyStatus.BORROWED, CopyStatus.RESERVED_HOLD]:
            raise BusinessLogicError('CONFLICT', detail='Không thể thanh lý bản sao đang được mượn hoặc giữ chỗ.')

        copy.status = CopyStatus.WITHDRAWN
        copy.note = f"{copy.note or ''} [Thanh lý bởi {request.user.username}]".strip()
        copy.save(update_fields=['status', 'note'])

        log_action(
            user=request.user,
            action='WITHDRAW_COPY',
            entity_type='Copy',
            entity_id=copy.id,
            detail={'barcode': copy.barcode},
            request=request
        )

        return Response({'detail': f'Bản sao {copy.barcode} đã được chuyển sang trạng thái thanh lý.'}, status=status.HTTP_200_OK)

class CategoryListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUserRole()]

    def get(self, request):
        categories = Category.objects.annotate(book_count=Count('books', filter=Q(books__deleted_at__isnull=True))).order_by('display_order', 'name')
        serializer = CategorySerializer(categories, many=True)
        return Response({'data': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cat = serializer.save()
        return Response({'data': CategorySerializer(cat).data}, status=status.HTTP_201_CREATED)

class CategoryDetailView(APIView):
    permission_classes = [IsAdminUserRole]

    def put(self, request, pk):
        category = Category.objects.filter(id=pk).first()
        if not category:
            raise BusinessLogicError('NOT_FOUND')
        serializer = CategorySerializer(category, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        cat = serializer.save()
        return Response({'data': CategorySerializer(cat).data}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        category = Category.objects.filter(id=pk).first()
        if not category:
            raise BusinessLogicError('NOT_FOUND')
        if category.books.filter(deleted_at__isnull=True).exists():
            raise BusinessLogicError('CONFLICT', detail='Không thể xóa chuyên ngành đang có đầu sách.')
        category.delete()
        return Response({'detail': 'Xóa chuyên ngành thành công.'}, status=status.HTTP_200_OK)

class AuthorListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUserRole()]

    def get(self, request):
        authors = Author.objects.all().order_by('name')
        serializer = AuthorSerializer(authors, many=True)
        return Response({'data': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AuthorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        author = serializer.save()
        return Response({'data': AuthorSerializer(author).data}, status=status.HTTP_201_CREATED)

class AuthorDetailView(APIView):
    permission_classes = [IsAdminUserRole]

    def put(self, request, pk):
        author = Author.objects.filter(id=pk).first()
        if not author:
            raise BusinessLogicError('NOT_FOUND')
        serializer = AuthorSerializer(author, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        auth = serializer.save()
        return Response({'data': AuthorSerializer(auth).data}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        author = Author.objects.filter(id=pk).first()
        if not author:
            raise BusinessLogicError('NOT_FOUND')
        if author.books.filter(deleted_at__isnull=True).exists():
            raise BusinessLogicError('CONFLICT', detail='Không thể xóa tác giả có liên kết với sách.')
        author.delete()
        return Response({'detail': 'Xóa tác giả thành công.'}, status=status.HTTP_200_OK)

class BookCsvTemplateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        template_csv = (
            "\ufeffTên sách,Tác giả,ISBN,Mã khoa,Nhà xuất bản,Năm XB,Giá bìa,Số bản sao,Vị trí kệ\n"
            "Thiết kế hình học đường ô tô,GS.TS. Nguyễn Xuân Trục,978-604-0-12345-1,GTVT,NXB Giao thông Vận tải,2023,185000,5,Kệ GTVT-01 - Tầng 2\n"
            "Quản trị Logistics và Chuỗi cung ứng,GS.TS. Đặng Đình Đào,978-604-0-20001-0,LOG,NXB Bách Khoa,2024,240000,4,Kệ LOG-02 - Tầng 2\n"
            "Lập trình Ứng dụng Web với React và Django,Robert C. Martin,978-013-2-35088-4,CNTT,NXB Thông tin & Truyền thông,2023,220000,5,Kệ CNTT-03 - Tầng 3\n"
            "Khai thác và Quản lý Cảng biển,PGS.TS. Nguyễn Hữu Dũng,978-604-0-20004-1,LOG,NXB Giao thông Vận tải,2023,280000,4,Kệ LOG-01 - Tầng 2\n"
            "Kỹ thuật Cầu Bê tông Cốt thép,PGS.TS. Nguyễn Viết Trung,978-604-0-10006-6,GTVT,NXB Xây Dựng,2022,260000,3,Kệ GTVT-02 - Tầng 2\n"
        )
        response = HttpResponse(template_csv, content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="mau_nhap_sach_uth.csv"'
        return response

class BookCsvExportView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        csv_data = export_books_to_csv()
        response = HttpResponse(csv_data, content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="danh_muc_sach_uth.csv"'
        return response

class BookCsvImportView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        csv_text = ''
        if 'file' in request.FILES:
            uploaded_file = request.FILES['file']
            csv_text = uploaded_file.read().decode('utf-8', errors='replace')
        elif 'csv_data' in request.data:
            csv_text = request.data['csv_data']
        else:
            return Response({'detail': 'Vui lòng chọn file CSV hoặc gửi chuỗi dữ liệu csv_data.'}, status=status.HTTP_400_BAD_REQUEST)

        result = import_books_from_csv(csv_text)
        return Response({'data': result}, status=status.HTTP_200_OK)


class ISBNLookupView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        isbn = request.query_params.get('isbn', '').strip()
        if not isbn:
            return Response(
                {'success': False, 'detail': 'Vui lòng cung cấp tham số mã ISBN cần tra cứu.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        result = lookup_isbn_metadata(isbn)
        return Response({'data': result}, status=status.HTTP_200_OK)


