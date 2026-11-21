import os
import re
import secrets
from django.conf import settings
from django.utils import timezone
from django.http import HttpResponse, FileResponse
from django.db.models import Count, Q, Prefetch
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.accounts.permissions import IsAdminUserRole, IsAdminOnlyRole
from apps.audit.services import log_action
from apps.core.exceptions import BusinessLogicError
from apps.core.pagination import StandardPagination
from apps.core.enums import CopyStatus, UserRole
from .models import Category, Author, Book, Copy, DeaccessionBatch, DigitalResource, ReadingSession
from .serializers import (
    CategorySerializer,
    AuthorSerializer,
    BookListSerializer,
    BookDetailSerializer,
    BookWriteSerializer,
    CopySerializer,
    BatchCopyCreateSerializer,
    DeaccessionBatchSerializer,
    DeaccessionBatchDetailSerializer,
    CreateDeaccessionBatchSerializer,
    ApproveDeaccessionBatchSerializer,
    DigitalResourceSerializer,
    ReadingSessionSerializer,
)
from .services import (
    search_books,
    suggest_books,
    get_book_facets,
    delete_book,
    generate_barcodes_for_category,
    generate_barcode_image,
    normalize_barcode,
    import_books_from_csv,
    export_books_to_csv,
    create_deaccession_batch,
    approve_deaccession_batch,
    cancel_deaccession_batch,
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
        category_param = request.query_params.get('category_id') or request.query_params.get('category')
        category_id = None
        category_query = None
        if category_param:
            clean_cat = str(category_param).strip()
            if clean_cat.isdigit():
                category_id = int(clean_cat)
            else:
                category_query = clean_cat

        author_id = request.query_params.get('author_id')
        author_name = request.query_params.get('author') or request.query_params.get('author_name')
        publisher = request.query_params.get('publisher')
        year = request.query_params.get('year')
        year_from = request.query_params.get('year_from')
        year_to = request.query_params.get('year_to')
        available_only = request.query_params.get('available_only', 'false').lower() == 'true'
        ordering = request.query_params.get('ordering', '-created_at')

        is_staff = request.user.is_authenticated and getattr(request.user, 'role', '') in [UserRole.ADMIN, UserRole.LIBRARIAN]
        include_archived_param = request.query_params.get('include_archived')
        if include_archived_param is not None:
            include_archived = include_archived_param.lower() == 'true'
        else:
            include_archived = is_staff

        queryset = search_books(
            q=q,
            category_id=category_id,
            category_query=category_query,
            author_id=int(author_id) if author_id else None,
            author_name=author_name,
            publisher=publisher,
            year=int(year) if year else None,
            year_from=int(year_from) if year_from else None,
            year_to=int(year_to) if year_to else None,
            available_only=available_only,
            ordering=ordering,
            include_archived=include_archived,
        )

        paginator = StandardPagination()
        page_records = paginator.paginate_queryset(queryset, request)
        serializer = BookListSerializer(page_records, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        return BookAdminCreateView().post(request)

class BookFacetsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        facets = get_book_facets()
        return Response(facets, status=status.HTTP_200_OK)

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
        if request.user.role != UserRole.ADMIN:
            raise BusinessLogicError('FORBIDDEN', detail='Chỉ Quản trị viên mới có thẩm quyền xóa đầu sách khỏi danh mục.')
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

        # Tự động đồng bộ xóa mềm bản sao của các đầu sách đã bị xóa
        Copy.objects.filter(book__deleted_at__isnull=False, deleted_at__isnull=True).update(
            deleted_at=timezone.now(), status=CopyStatus.WITHDRAWN
        )

        if group_by == 'copy':
            queryset = Copy.objects.filter(deleted_at__isnull=True, book__deleted_at__isnull=True).select_related(
                'book', 'book__category', 'held_for_user'
            ).prefetch_related('book__authors').order_by('-created_at')

            if barcode_q:
                queryset = queryset.filter(barcode__icontains=barcode_q)

            if status_q:
                if status_q in ('reserved', 'reserved_hold'):
                    queryset = queryset.filter(status__in=['reserved', 'reserved_hold'])
                else:
                    queryset = queryset.filter(status=status_q)
            else:
                # Ở tab 'Tất cả trạng thái': chỉ xem bản sao đang lưu thông (loại trừ đã thanh lý)
                queryset = queryset.exclude(status='withdrawn')

            if book_id:
                queryset = queryset.filter(book_id=book_id)

            ids_param = request.query_params.get('ids')
            if ids_param:
                id_list = [int(i.strip()) for i in ids_param.split(',') if i.strip().isdigit()]
                if id_list:
                    queryset = queryset.filter(id__in=id_list)

            paginator = StandardPagination()
            page_records = paginator.paginate_queryset(queryset, request)
            serializer = CopySerializer(page_records, many=True)
            return paginator.get_paginated_response(serializer.data)

        # Default: group_by == 'book'
        # Bắt buộc lọc deleted_at__isnull=True trên Book để Bản sao LUÔN MATCH 100% với Đầu sách
        book_qs = Book.objects.filter(deleted_at__isnull=True)
        if barcode_q:
            book_qs = book_qs.filter(copies__barcode__icontains=barcode_q, copies__deleted_at__isnull=True)

        if status_q:
            if status_q in ('reserved', 'reserved_hold'):
                book_qs = book_qs.filter(copies__status__in=['reserved', 'reserved_hold'], copies__deleted_at__isnull=True)
            else:
                book_qs = book_qs.filter(copies__status=status_q, copies__deleted_at__isnull=True)
        else:
            # Ở tab 'Tất cả trạng thái':
            # Chỉ hiển thị các đầu sách có bản sao trong lưu thông (loại trừ sách chỉ có bản sao đã thanh lý)
            book_qs = book_qs.filter(copies__deleted_at__isnull=True).exclude(
                id__in=Book.objects.filter(deleted_at__isnull=True, copies__deleted_at__isnull=True)
                .annotate(
                    active_circ_count=Count('copies', filter=Q(copies__deleted_at__isnull=True) & ~Q(copies__status='withdrawn'))
                )
                .filter(active_circ_count=0)
                .values('id')
            )

        if book_id:
            book_qs = book_qs.filter(id=book_id)

        book_qs = book_qs.distinct().select_related('category').prefetch_related('authors').order_by('-id')

        # Prefetch active copies
        copy_filter = Q(deleted_at__isnull=True)
        if status_q:
            if status_q in ('reserved', 'reserved_hold'):
                copy_filter &= Q(status__in=['reserved', 'reserved_hold'])
            else:
                copy_filter &= Q(status=status_q)
        else:
            # Ở tab 'Tất cả trạng thái': loại bỏ các bản sao đã thanh lý khỏi danh sách con
            copy_filter &= ~Q(status='withdrawn')

        book_qs = book_qs.prefetch_related(
            Prefetch('copies', queryset=Copy.objects.filter(copy_filter).order_by('id'), to_attr='active_copies')
        )

        paginator = StandardPagination()
        page_records = paginator.paginate_queryset(book_qs, request)

        results = []
        for b in (page_records or []):
            copies = getattr(b, 'active_copies', [])
            total_qty = len(copies)
            avail_qty = sum(1 for c in copies if c.status == 'available')
            borrowed_qty = sum(1 for c in copies if c.status == 'borrowed')
            reserved_qty = sum(1 for c in copies if c.status in ('reserved', 'reserved_hold'))
            damaged_qty = sum(1 for c in copies if c.status == 'damaged')
            lost_qty = sum(1 for c in copies if c.status == 'lost')
            withdrawn_qty = sum(1 for c in copies if c.status == 'withdrawn')
            shelf_locations = list(dict.fromkeys(c.shelf_location for c in copies if c.shelf_location))

            cover_img = b.cover_image
            if not cover_img:
                same_book = Book.objects.filter(
                    Q(title=b.title) | (Q(isbn=b.isbn) if b.isbn else Q(pk=-1)),
                    cover_image__isnull=False
                ).exclude(cover_image='').first()
                if same_book:
                    cover_img = same_book.cover_image

            results.append({
                'book_id': b.id,
                'book_title': b.title,
                'book_isbn': b.isbn,
                'book_cover_image': cover_img or None,
                'category_code': b.category.code if b.category else 'UTH',
                'category_name': b.category.name if b.category else 'Chung',
                'authors_names': [a.name for a in b.authors.all()],
                'total_quantity': total_qty,
                'available_quantity': avail_qty,
                'borrowed_quantity': borrowed_qty,
                'reserved_quantity': reserved_qty,
                'damaged_quantity': damaged_qty,
                'lost_quantity': lost_qty,
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
        raise BusinessLogicError(
            'DIRECT_WITHDRAW_DEPRECATED',
            detail='Theo Thông tư 02/2020/TT-BVHTTDL và quy chế Thư viện UTH, không cho phép thanh lý trực tiếp bản sao đơn lẻ. Mọi bản sao hư hỏng/lạc hậu bắt buộc phải đưa vào Biên bản thanh lý theo lô trình Hội đồng và Ban Giám hiệu phê duyệt.'
        )

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
            "\ufeffTên sách,Tác giả,ISBN,Mã khoa,Nhà xuất bản,Năm XB,Giá bìa,Số bản sao,Vị trí kệ,Ảnh bìa,Tóm tắt nội dung\n"
            "Thiết kế hình học đường ô tô,GS.TS. Nguyễn Xuân Trục,978-604-0-12345-1,GTVT,NXB Giao thông Vận tải,2023,185000,5,Kệ GTVT-01 - Tầng 2,https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80,Giáo trình chuyên ngành Kỹ thuật xây dựng công trình giao thông - ĐH Giao thông vận tải TP.HCM.\n"
            "Quản trị Logistics và Chuỗi cung ứng,GS.TS. Đặng Đình Đào,978-604-0-20001-0,GTVT,NXB Bách Khoa,2024,240000,4,Kệ LOG-02 - Tầng 2,https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80,Tài liệu giảng dạy cốt lõi ngành Logistics và Quản trị chuỗi cung ứng hiện đại.\n"
            "Lập trình Ứng dụng Web với React và Django,Robert C. Martin,978-013-2-35088-4,CNTT,NXB Thông tin & Truyền thông,2023,220000,5,Kệ CNTT-03 - Tầng 3,https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80,Hướng dẫn kiến trúc và thực hành xây dựng ứng dụng web hiện đại chuẩn Enterprise.\n"
            "Khai thác và Quản lý Cảng biển,PGS.TS. Nguyễn Hữu Dũng,978-604-0-20004-1,HH,NXB Giao thông Vận tải,2023,280000,4,Kệ LOG-01 - Tầng 2,https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=400&q=80,Giáo trình chuyên sâu ngành Điều khiển tàu biển và Quản lý cảng biển UTH.\n"
            "Kỹ thuật Cầu Bê tông Cốt thép,PGS.TS. Nguyễn Viết Trung,978-604-0-10006-6,CTGT,NXB Xây Dựng,2022,260000,3,Kệ CTGT-02 - Tầng 2,https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=400&q=80,Lý thuyết và ví dụ tính toán thiết kế cầu bê tông cốt thép dự ứng lực theo tiêu chuẩn TCVN.\n"
        )
        response = HttpResponse(template_csv.encode('utf-8-sig'), content_type='text/csv; charset=utf-8-sig')
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


class DeaccessionBatchListCreateView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        status_filter = request.query_params.get('status')
        reason_filter = request.query_params.get('reason')
        search = request.query_params.get('search')

        qs = DeaccessionBatch.objects.select_related('created_by', 'approved_by').order_by('-created_at')

        if status_filter:
            qs = qs.filter(status=status_filter)
        if reason_filter:
            qs = qs.filter(reason=reason_filter)
        if search:
            qs = qs.filter(
                Q(code__icontains=search) |
                Q(decision_number__icontains=search) |
                Q(committee__icontains=search) |
                Q(note__icontains=search)
            )

        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = DeaccessionBatchSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = CreateDeaccessionBatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        d = serializer.validated_data

        batch = create_deaccession_batch(
            decision_number=d['decision_number'],
            decision_date=d['decision_date'],
            reason=d['reason'],
            copy_ids=d['copy_ids'],
            committee=d.get('committee', ''),
            note=d.get('note', ''),
            code=d.get('code', ''),
            copy_reasons=d.get('copy_reasons', {}),
            created_by=request.user,
            request=request,
        )
        detail_ser = DeaccessionBatchDetailSerializer(batch)
        return Response({'data': detail_ser.data, 'message': 'Đã lập biên bản thanh lý thành công.'}, status=status.HTTP_201_CREATED)


class DeaccessionBatchDetailView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request, pk):
        batch = DeaccessionBatch.objects.select_related('created_by', 'approved_by').prefetch_related(
            Prefetch('copies', queryset=Copy.objects.select_related('book', 'book__category'))
        ).filter(id=pk).first()

        if not batch:
            return Response({'detail': 'Không tìm thấy biên bản thanh lý.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = DeaccessionBatchDetailSerializer(batch)
        return Response({'data': serializer.data}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        reason = request.data.get('reason') or request.query_params.get('reason', '')
        batch = cancel_deaccession_batch(batch_id=pk, user=request.user, reason=reason, request=request)
        serializer = DeaccessionBatchSerializer(batch)
        return Response({'data': serializer.data, 'message': 'Đã hủy biên bản thanh lý thành công.'}, status=status.HTTP_200_OK)


class ApproveDeaccessionBatchView(APIView):
    permission_classes = [IsAdminOnlyRole]

    def post(self, request, pk):
        serializer = ApproveDeaccessionBatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        batch = approve_deaccession_batch(
            batch_id=pk,
            approved_by=request.user,
            approval_data=serializer.validated_data,
            request=request
        )
        response_serializer = DeaccessionBatchDetailSerializer(batch)
        return Response({
            'data': response_serializer.data,
            'message': f'Phê duyệt biên bản thanh lý {batch.code} thành công theo Quyết định số {batch.bgh_decision_number} của Ban Giám hiệu.'
        }, status=status.HTTP_200_OK)


class DeaccessionCandidatesView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        status_q = request.query_params.get('status', '').strip()
        search_q = request.query_params.get('search', '').strip()

        qs = Copy.objects.filter(
            deleted_at__isnull=True,
            deaccession_batch__isnull=True,
        ).exclude(
            status__in=['borrowed', 'withdrawn']
        ).select_related('book', 'book__category').prefetch_related('book__authors')

        if status_q:
            qs = qs.filter(status=status_q)
        else:
            # Default: damaged or lost
            qs = qs.filter(status__in=['damaged', 'lost'])

        if search_q:
            qs = qs.filter(
                Q(barcode__icontains=search_q) |
                Q(book__title__icontains=search_q) |
                Q(book__isbn__icontains=search_q)
            )

        qs = qs.order_by('-status', '-created_at')

        copies_data = []
        total_value = 0
        damaged_count = 0
        lost_count = 0

        for cp in qs:
            val = cp.purchase_price or (cp.book.price if cp.book else 0) or 0
            total_value += val
            if cp.status == 'damaged':
                damaged_count += 1
            elif cp.status == 'lost':
                lost_count += 1

            copies_data.append({
                'id': cp.id,
                'barcode': cp.barcode,
                'book_id': cp.book.id if cp.book else None,
                'book_title': cp.book.title if cp.book else 'Không xác định',
                'book_cover': cp.book.cover_image if cp.book and cp.book.cover_image else None,
                'book_isbn': cp.book.isbn if cp.book else None,
                'category_name': cp.book.category.name if cp.book and cp.book.category else None,
                'authors': [a.name for a in cp.book.authors.all()] if cp.book else [],
                'status': cp.status,
                'status_display': cp.get_status_display(),
                'note': cp.note or '',
                'shelf_location': cp.shelf_location or 'Khu vực bảo quản xử lý',
                'purchase_price': val,
                'created_at': cp.created_at.isoformat() if cp.created_at else None,
            })

        return Response({
            'data': {
                'count': len(copies_data),
                'total_value': total_value,
                'damaged_count': damaged_count,
                'lost_count': lost_count,
                'candidates': copies_data,
            }
        }, status=status.HTTP_200_OK)


# ==============================================================================
# PHÂN HỆ GIÁO TRÌNH SỐ & TÀI LIỆU ĐIỆN TỬ (DIGITAL RESOURCES & DRM E-READER)
# ==============================================================================

def extract_pdf_page_count(file_path):
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
            matches = re.findall(rb'/Type\s*/Page\b', content)
            if matches:
                return len(matches)
    except Exception:
        pass
    return 1


class DigitalResourceListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUserRole()]

    def get(self, request):
        book_id = request.query_params.get('book_id')
        q = request.query_params.get('q', '').strip()

        qs = DigitalResource.objects.filter(is_active=True).select_related('book')
        if book_id:
            qs = qs.filter(book_id=book_id)
        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(book__title__icontains=q))

        serializer = DigitalResourceSerializer(qs, many=True, context={'request': request})
        return Response({'results': serializer.data, 'count': qs.count()}, status=status.HTTP_200_OK)

    def post(self, request):
        book_id = request.data.get('book_id') or request.data.get('book')
        if not book_id:
            return Response({'code': 'BOOK_REQUIRED', 'detail': 'Vui lòng chọn đầu sách liên kết.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            book = Book.objects.get(pk=book_id, deleted_at__isnull=True)
        except Book.DoesNotExist:
            return Response({'code': 'BOOK_NOT_FOUND', 'detail': 'Không tìm thấy đầu sách tương ứng.'}, status=status.HTTP_404_NOT_FOUND)

        pdf_file = request.FILES.get('file')
        if not pdf_file:
            return Response({'code': 'FILE_REQUIRED', 'detail': 'Vui lòng tải lên tập tin PDF giáo trình.'}, status=status.HTTP_400_BAD_REQUEST)

        title = request.data.get('title', '').strip() or f"Giáo trình {book.title}"
        access_level = request.data.get('access_level', 'all_active')
        description = request.data.get('description', '')
        allow_download = str(request.data.get('allow_download', 'false')).lower() in ['true', '1']

        resource = DigitalResource.objects.create(
            book=book,
            title=title,
            file=pdf_file,
            file_size_bytes=pdf_file.size,
            access_level=access_level,
            description=description,
            allow_download=allow_download,
            created_by=request.user,
        )

        # Tự động tính số trang từ file đã lưu
        if resource.file and os.path.exists(resource.file.path):
            page_count = extract_pdf_page_count(resource.file.path)
            resource.page_count = page_count
            resource.save(update_fields=['page_count'])

        log_action(
            user=request.user,
            action='UPLOAD_DIGITAL_RESOURCE',
            entity_type='DigitalResource',
            entity_id=resource.id,
            detail={
                'book_id': book.id,
                'book_title': book.title,
                'file_size': resource.file_size_bytes,
                'page_count': resource.page_count,
            },
            request=request
        )

        serializer = DigitalResourceSerializer(resource, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DigitalResourceDetailView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUserRole()]

    def get(self, request, pk):
        try:
            resource = DigitalResource.objects.select_related('book').get(pk=pk, is_active=True)
        except DigitalResource.DoesNotExist:
            return Response({'code': 'NOT_FOUND', 'detail': 'Không tìm thấy tài liệu số.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = DigitalResourceSerializer(resource, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        try:
            resource = DigitalResource.objects.get(pk=pk)
        except DigitalResource.DoesNotExist:
            return Response({'code': 'NOT_FOUND', 'detail': 'Không tìm thấy tài liệu số.'}, status=status.HTTP_404_NOT_FOUND)

        if 'title' in request.data:
            resource.title = request.data['title'].strip()
        if 'access_level' in request.data:
            resource.access_level = request.data['access_level']
        if 'description' in request.data:
            resource.description = request.data['description']
        if 'allow_download' in request.data:
            resource.allow_download = str(request.data['allow_download']).lower() in ['true', '1']
        if 'is_active' in request.data:
            resource.is_active = str(request.data['is_active']).lower() in ['true', '1']

        resource.save()
        serializer = DigitalResourceSerializer(resource, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        try:
            resource = DigitalResource.objects.get(pk=pk)
        except DigitalResource.DoesNotExist:
            return Response({'code': 'NOT_FOUND', 'detail': 'Không tìm thấy tài liệu số.'}, status=status.HTTP_404_NOT_FOUND)

        resource.is_active = False
        resource.save(update_fields=['is_active'])

        log_action(
            user=request.user,
            action='DELETE_DIGITAL_RESOURCE',
            entity_type='DigitalResource',
            entity_id=resource.id,
            detail={'book_id': resource.book_id},
            request=request
        )
        return Response({'detail': 'Đã xóa tài liệu số thành công.'}, status=status.HTTP_200_OK)


class DigitalResourceStreamView(APIView):
    """
    Endpoint bảo mật stream dữ liệu PDF của giáo trình số.
    Bắt buộc:
    1. Đăng nhập JWT.
    2. Thẻ thư viện UTH còn hiệu lực (chống sinh viên bị khóa thẻ / hết hạn).
    3. Thỏa mãn cấp độ truy cập (students_only / lecturers_only).
    Ghi nhận lượt đọc vào Audit Log và tăng view_count.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            resource = DigitalResource.objects.select_related('book').get(pk=pk, is_active=True)
        except DigitalResource.DoesNotExist:
            return Response({'code': 'NOT_FOUND', 'detail': 'Không tìm thấy tài liệu số.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        role = getattr(user, 'role', '')

        # Thủ thư & Quản trị viên luôn có quyền kiểm duyệt tài liệu
        if role not in [UserRole.ADMIN, UserRole.LIBRARIAN]:
            # Kiểm tra thẻ thư viện của bạn đọc (còn hiệu lực, không bị khóa)
            if not getattr(user, 'is_active', True) or getattr(user, 'is_currently_locked', False) or not getattr(user, 'is_card_valid', True):
                return Response({
                    'code': 'ACTIVE_CARD_REQUIRED',
                    'detail': 'Bạn cần có Thẻ thư viện UTH còn hiệu lực (chưa bị khóa và chưa hết hạn) để mở đọc giáo trình số.'
                }, status=status.HTTP_403_FORBIDDEN)

            # Kiểm tra phân quyền truy cập tài liệu
            if resource.access_level == 'students_only' and role != UserRole.STUDENT:
                return Response({
                    'code': 'STUDENTS_ONLY',
                    'detail': 'Tài liệu số này dành riêng cho Sinh viên chính khóa UTH.'
                }, status=status.HTTP_403_FORBIDDEN)

            if resource.access_level == 'lecturers_only' and role != UserRole.LECTURER:
                return Response({
                    'code': 'LECTURERS_ONLY',
                    'detail': 'Tài liệu số này dành riêng cho Giảng viên & Nghiên cứu sinh UTH.'
                }, status=status.HTTP_403_FORBIDDEN)

        # Cập nhật lượt xem
        DigitalResource.objects.filter(pk=pk).update(view_count=resource.view_count + 1)

        # Ghi nhận nhật ký đọc sách phục vụ thống kê & kiểm định AUN-QA
        log_action(
            user=user,
            action='READ_DIGITAL_RESOURCE',
            entity_type='DigitalResource',
            entity_id=resource.id,
            detail={
                'book_id': resource.book_id,
                'book_title': resource.book.title,
                'user_role': role,
                'user_mssv': getattr(user, 'username', '')
            },
            request=request
        )

        if not resource.file or not os.path.exists(resource.file.path):
            return Response({
                'code': 'FILE_NOT_FOUND',
                'detail': 'Tập tin giáo trình chưa được lưu trữ hoặc đường dẫn không khả dụng.'
            }, status=status.HTTP_404_NOT_FOUND)

        # Trả về stream file PDF bảo mật
        response = FileResponse(open(resource.file.path, 'rb'), content_type='application/pdf')
        filename = os.path.basename(resource.file.name)
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        return response


class ReadingProgressView(APIView):
    """
    Theo dõi và đồng bộ tiến độ đọc sách số của sinh viên theo thời gian thực.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            resource = DigitalResource.objects.get(pk=pk, is_active=True)
        except DigitalResource.DoesNotExist:
            return Response({'code': 'NOT_FOUND', 'detail': 'Không tìm thấy tài liệu số.'}, status=status.HTTP_404_NOT_FOUND)

        session, _ = ReadingSession.objects.get_or_create(
            user=request.user,
            digital_resource=resource,
            defaults={'current_page': 1, 'max_page_reached': 1, 'total_seconds_spent': 0}
        )
        serializer = ReadingSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, pk):
        try:
            resource = DigitalResource.objects.get(pk=pk, is_active=True)
        except DigitalResource.DoesNotExist:
            return Response({'code': 'NOT_FOUND', 'detail': 'Không tìm thấy tài liệu số.'}, status=status.HTTP_404_NOT_FOUND)

        current_page = request.data.get('current_page')
        seconds_increment = request.data.get('seconds_increment', 0)

        session, _ = ReadingSession.objects.get_or_create(
            user=request.user,
            digital_resource=resource,
            defaults={'current_page': 1, 'max_page_reached': 1, 'total_seconds_spent': 0}
        )

        if current_page is not None:
            try:
                page_num = max(1, int(current_page))
                session.current_page = page_num
                if page_num > session.max_page_reached:
                    session.max_page_reached = page_num
            except (ValueError, TypeError):
                pass

        if seconds_increment:
            try:
                session.total_seconds_spent += max(0, int(seconds_increment))
            except (ValueError, TypeError):
                pass

        session.save()
        serializer = ReadingSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PatronRecentReadingListView(APIView):
    """
    Danh sách các giáo trình số bạn đọc đang đọc gần đây, hiển thị trên Dashboard.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = ReadingSession.objects.filter(
            user=request.user,
            digital_resource__is_active=True
        ).select_related('digital_resource__book').order_by('-last_accessed')[:8]
        serializer = ReadingSessionSerializer(sessions, many=True)
        return Response({'results': serializer.data}, status=status.HTTP_200_OK)




