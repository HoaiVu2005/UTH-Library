from rest_framework import serializers
from apps.core.enums import CopyStatus
from .models import Category, Author, Book, Copy, DeaccessionBatch, DigitalResource, ReadingSession

class CategorySerializer(serializers.ModelSerializer):
    book_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Category
        fields = ['id', 'code', 'name', 'description', 'display_order', 'book_count']

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['id', 'name', 'bio', 'nationality', 'birth_year', 'death_year']

class CopySerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    held_for_user_code = serializers.CharField(source='held_for_user.card_code', read_only=True, default=None)
    book_id = serializers.IntegerField(source='book.id', read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_isbn = serializers.CharField(source='book.isbn', read_only=True, default='')
    book_cover_image = serializers.CharField(source='book.cover_image', read_only=True, default=None)
    category_name = serializers.CharField(source='book.category.name', read_only=True)
    category_code = serializers.CharField(source='book.category.code', read_only=True)
    deaccession_batch_code = serializers.CharField(source='deaccession_batch.code', read_only=True, default=None)
    book = serializers.SerializerMethodField()

    class Meta:
        model = Copy
        fields = [
            'id', 'barcode', 'shelf_location', 'status', 'status_display',
            'reading_room_only', 'held_for_user', 'held_for_user_code',
            'hold_expires_at', 'acquired_date', 'purchase_price',
            'source', 'supplier', 'note',
            'book_id', 'book_title', 'book_isbn', 'book_cover_image', 'category_name', 'category_code', 'book',
            'deaccession_batch', 'deaccession_batch_code',
        ]
        read_only_fields = ['id', 'barcode', 'acquired_date', 'held_for_user', 'hold_expires_at']

    def get_book(self, obj):
        if not obj.book:
            return None
        return {
            'id': obj.book.id,
            'title': obj.book.title,
            'isbn': obj.book.isbn or '',
            'publisher': obj.book.publisher or '',
            'cover_image': obj.book.cover_image,
            'category': {
                'id': obj.book.category.id if obj.book.category else None,
                'code': obj.book.category.code if obj.book.category else '',
                'name': obj.book.category.name if obj.book.category else '',
            },
            'authors_names': [a.name for a in obj.book.authors.all()] if obj.book else [],
        }

class BookListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_code = serializers.CharField(source='category.code', read_only=True)
    category_detail = serializers.SerializerMethodField()
    authors = serializers.SerializerMethodField()
    authors_names = serializers.SerializerMethodField()
    total_copies = serializers.SerializerMethodField()
    total_copies_count = serializers.SerializerMethodField()
    available_copies = serializers.SerializerMethodField()
    available_copies_count = serializers.SerializerMethodField()
    only_reading_room = serializers.SerializerMethodField()
    has_digital_resource = serializers.SerializerMethodField()
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'id', 'isbn', 'title', 'publisher', 'year', 'category', 'category_name',
            'category_code', 'category_detail',
            'authors', 'authors_names', 'cover_image', 'price', 'language', 'page_count',
            'total_copies', 'total_copies_count', 'available_copies', 'available_copies_count',
            'only_reading_room', 'has_digital_resource', 'created_at',
        ]

    def get_has_digital_resource(self, obj):
        return obj.digital_resources.filter(is_active=True).exists()

    def get_category_detail(self, obj):
        if not obj.category:
            return None
        return {
            'id': obj.category.id,
            'code': obj.category.code,
            'name': obj.category.name,
        }

    def get_authors(self, obj):
        return [{'id': a.id, 'name': a.name} for a in obj.authors.all()]

    def get_authors_names(self, obj):
        return [a.name for a in obj.authors.all()]

    def get_total_copies(self, obj):
        return obj.copies.filter(deleted_at__isnull=True).count()

    def get_total_copies_count(self, obj):
        return self.get_total_copies(obj)

    def get_available_copies(self, obj):
        return obj.copies.filter(
            deleted_at__isnull=True,
            status=CopyStatus.AVAILABLE,
            reading_room_only=False
        ).count()

    def get_available_copies_count(self, obj):
        return self.get_available_copies(obj)

    def get_only_reading_room(self, obj):
        copies = obj.copies.filter(deleted_at__isnull=True)
        if not copies.exists():
            return False
        return copies.filter(reading_room_only=False).count() == 0

    def get_cover_image(self, obj):
        img = obj.cover_image
        if not img:
            return None
        s = str(img).strip()
        if any(bad in s.lower() for bad in ['khoa ', 'viện ', 'bộ môn ', 'phòng ban', 'chuyên ngành']):
            return None
        return s

class DigitalResourceSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_id = serializers.IntegerField(source='book.id', read_only=True)
    access_level_display = serializers.CharField(source='get_access_level_display', read_only=True)
    file_size_formatted = serializers.SerializerMethodField()
    has_access = serializers.SerializerMethodField()
    user_reading_session = serializers.SerializerMethodField()

    class Meta:
        model = DigitalResource
        fields = [
            'id', 'book_id', 'book_title', 'title', 'file', 'file_size_bytes',
            'file_size_formatted', 'page_count', 'allow_download', 'access_level',
            'access_level_display', 'view_count', 'description', 'is_active',
            'has_access', 'user_reading_session', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'view_count', 'file_size_bytes', 'created_at', 'updated_at']

    def get_file_size_formatted(self, obj):
        bytes_val = obj.file_size_bytes or 0
        if bytes_val < 1024:
            return f"{bytes_val} B"
        elif bytes_val < 1024 * 1024:
            return f"{bytes_val / 1024:.1f} KB"
        else:
            return f"{bytes_val / (1024 * 1024):.1f} MB"

    def get_has_access(self, obj):
        request = self.context.get('request')
        if not request or not hasattr(request, 'user') or not request.user.is_authenticated:
            return False
        user = request.user
        if getattr(user, 'role', '') in ['admin', 'librarian']:
            return True
        if not getattr(user, 'is_active', True) or getattr(user, 'is_currently_locked', False) or not getattr(user, 'is_card_valid', True):
            return False
        if obj.access_level == 'students_only' and getattr(user, 'role', '') != 'student':
            return False
        if obj.access_level == 'lecturers_only' and getattr(user, 'role', '') != 'lecturer':
            return False
        return True

    def get_user_reading_session(self, obj):
        request = self.context.get('request')
        if not request or not hasattr(request, 'user') or not request.user.is_authenticated:
            return None
        session = obj.sessions.filter(user=request.user).first()
        if not session:
            return None
        return {
            'current_page': session.current_page,
            'max_page_reached': session.max_page_reached,
            'total_seconds_spent': session.total_seconds_spent,
            'progress_percent': int(round((session.current_page / max(1, obj.page_count)) * 100)) if obj.page_count else 0,
            'last_accessed': session.last_accessed.isoformat() if session.last_accessed else None
        }


class ReadingSessionSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='digital_resource.book.title', read_only=True)
    book_id = serializers.IntegerField(source='digital_resource.book.id', read_only=True)
    book_cover_image = serializers.CharField(source='digital_resource.book.cover_image', read_only=True)
    resource_title = serializers.CharField(source='digital_resource.title', read_only=True)
    page_count = serializers.IntegerField(source='digital_resource.page_count', read_only=True)
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = ReadingSession
        fields = [
            'id', 'digital_resource', 'book_id', 'book_title', 'book_cover_image',
            'resource_title', 'page_count', 'current_page', 'max_page_reached',
            'total_seconds_spent', 'progress_percent', 'last_accessed'
        ]

    def get_progress_percent(self, obj):
        total = obj.digital_resource.page_count or 1
        return min(100, int(round((obj.current_page / max(1, total)) * 100)))


class BookDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    authors = AuthorSerializer(many=True, read_only=True)
    copies = serializers.SerializerMethodField()
    available_copies_count = serializers.SerializerMethodField()
    can_borrow_home = serializers.SerializerMethodField()
    only_reading_room = serializers.SerializerMethodField()
    is_reserved_by_user = serializers.SerializerMethodField()
    user_reservation = serializers.SerializerMethodField()
    digital_resources = serializers.SerializerMethodField()
    has_digital_resource = serializers.SerializerMethodField()
    digital_documents = serializers.SerializerMethodField()
    primary_digital_document_id = serializers.SerializerMethodField()
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'id', 'isbn', 'title', 'publisher', 'year', 'category',
            'authors', 'description', 'cover_image', 'language',
            'page_count', 'edition', 'price', 'processing_fee', 'keywords',
            'copies', 'available_copies_count', 'can_borrow_home', 'only_reading_room',
            'is_reserved_by_user', 'user_reservation', 'digital_resources', 'has_digital_resource',
            'digital_documents', 'primary_digital_document_id',
            'created_at', 'updated_at',
        ]

    def get_digital_resources(self, obj):
        resources = obj.digital_resources.filter(is_active=True).order_by('created_at')
        return DigitalResourceSerializer(resources, many=True, context=self.context).data

    def get_digital_documents(self, obj):
        from apps.digital_library.models import DigitalDocument
        from apps.digital_library.serializers import DigitalDocumentListSerializer
        docs = DigitalDocument.objects.filter(catalog_book=obj, status='published').prefetch_related('versions')
        return DigitalDocumentListSerializer(docs, many=True, context=self.context).data

    def get_primary_digital_document_id(self, obj):
        from apps.digital_library.models import DigitalDocument
        doc = DigitalDocument.objects.filter(catalog_book=obj, status='published').first()
        return doc.id if doc else None

    def get_has_digital_resource(self, obj):
        from apps.digital_library.models import DigitalDocument
        return (
            obj.digital_resources.filter(is_active=True).exists() or
            DigitalDocument.objects.filter(catalog_book=obj, status='published').exists()
        )

    def get_copies(self, obj):
        active_copies = obj.copies.filter(deleted_at__isnull=True).order_by('barcode')
        return CopySerializer(active_copies, many=True).data

    def get_available_copies_count(self, obj):
        return obj.copies.filter(
            deleted_at__isnull=True,
            status=CopyStatus.AVAILABLE,
            reading_room_only=False
        ).count()

    def get_can_borrow_home(self, obj):
        copies = obj.copies.filter(deleted_at__isnull=True)
        return copies.filter(reading_room_only=False).exists()

    def get_only_reading_room(self, obj):
        copies = obj.copies.filter(deleted_at__isnull=True)
        if not copies.exists():
            return False
        return copies.filter(reading_room_only=False).count() == 0

    def get_cover_image(self, obj):
        img = obj.cover_image
        if not img:
            return None
        s = str(img).strip()
        if any(bad in s.lower() for bad in ['khoa ', 'viện ', 'bộ môn ', 'phòng ban', 'chuyên ngành']):
            return None
        return s

    def get_user_reservation(self, obj):
        request = self.context.get('request')
        if not request or not hasattr(request, 'user') or not request.user.is_authenticated:
            return None
        from apps.reservations.models import Reservation
        from apps.core.enums import ReservationStatus
        res = Reservation.objects.filter(
            user=request.user,
            book=obj,
            status__in=[ReservationStatus.PENDING, ReservationStatus.READY]
        ).first()
        if not res:
            return None
        return {
            'id': res.id,
            'status': res.status,
            'queue_position': getattr(res, 'queue_position', None),
            'hold_expires_at': res.hold_expires_at.isoformat() if res.hold_expires_at else None,
        }

    def get_is_reserved_by_user(self, obj):
        return self.get_user_reservation(obj) is not None

class BookWriteSerializer(serializers.ModelSerializer):
    category_id = serializers.IntegerField(write_only=True, required=False)
    author_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    author_names = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)
    initial_copies = serializers.IntegerField(write_only=True, required=False, default=0, min_value=0, max_value=50)
    shelf_location = serializers.CharField(write_only=True, required=False, allow_blank=True, default='')

    class Meta:
        model = Book
        fields = [
            'isbn', 'title', 'publisher', 'year', 'category', 'category_id',
            'author_ids', 'author_names', 'initial_copies', 'shelf_location',
            'description', 'language', 'page_count',
            'edition', 'price', 'processing_fee', 'keywords', 'cover_image',
        ]
        extra_kwargs = {
            'category': {'required': False},
        }

    def to_internal_value(self, data):
        # Support category_id as alias for category
        if 'category_id' in data and 'category' not in data:
            data = data.copy()
            data['category'] = data['category_id']
        return super().to_internal_value(data)

    def create(self, validated_data):
        author_ids = validated_data.pop('author_ids', [])
        author_names = validated_data.pop('author_names', [])
        initial_copies = validated_data.pop('initial_copies', 0)
        shelf_location = validated_data.pop('shelf_location', '')

        cat_id = validated_data.pop('category_id', None)
        if 'category' not in validated_data and cat_id:
            validated_data['category'] = Category.objects.get(id=cat_id)

        book = Book.objects.create(**validated_data)

        final_authors = []
        if author_ids:
            final_authors.extend(Author.objects.filter(id__in=author_ids))
        for a_name in author_names:
            clean_name = str(a_name).strip()
            if clean_name:
                auth, _ = Author.objects.get_or_create(name=clean_name)
                final_authors.append(auth)

        if final_authors:
            book.authors.set(final_authors)

        if initial_copies > 0 and book.category:
            from .services import generate_barcodes_for_category
            barcodes = generate_barcodes_for_category(book.category, initial_copies)
            copies_to_create = []
            loc = shelf_location.strip() or f"Kệ {book.category.code}-01 - Tầng 2"
            for bc in barcodes:
                copies_to_create.append(
                    Copy(
                        book=book,
                        barcode=bc,
                        shelf_location=loc,
                        status=CopyStatus.AVAILABLE,
                        reading_room_only=False,
                        purchase_price=book.price,
                        source='Mua mới',
                    )
                )
            Copy.objects.bulk_create(copies_to_create)

        return book

    def update(self, instance, validated_data):
        author_ids = validated_data.pop('author_ids', None)
        author_names = validated_data.pop('author_names', None)
        validated_data.pop('initial_copies', None)
        validated_data.pop('shelf_location', None)
        cat_id = validated_data.pop('category_id', None)
        if cat_id:
            validated_data['category'] = Category.objects.get(id=cat_id)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if author_ids is not None or author_names is not None:
            final_authors = []
            if author_ids:
                final_authors.extend(Author.objects.filter(id__in=author_ids))
            if author_names:
                for a_name in author_names:
                    clean_name = str(a_name).strip()
                    if clean_name:
                        auth, _ = Author.objects.get_or_create(name=clean_name)
                        final_authors.append(auth)
            instance.authors.set(final_authors)

        return instance

class BatchCopyCreateSerializer(serializers.Serializer):
    book_id = serializers.IntegerField(required=True)
    quantity = serializers.IntegerField(required=True, min_value=1, max_value=100)
    shelf_location = serializers.CharField(required=False, default='Kệ 01', max_length=100)
    purchase_price = serializers.IntegerField(required=False, min_value=0, allow_null=True)
    reading_room_only = serializers.BooleanField(required=False, default=False)
    source = serializers.CharField(required=False, default='Trường cấp')
    supplier = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    note = serializers.CharField(required=False, allow_blank=True, allow_null=True)

class DeaccessionBatchSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True, default=None)
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = DeaccessionBatch
        fields = [
            'id', 'code', 'decision_number', 'decision_date', 'reason', 'reason_display',
            'status', 'status_display', 'committee', 'total_copies', 'total_value',
            'note', 'created_by', 'created_by_name', 'approved_by', 'approved_by_name',
            'approved_at', 'bgh_decision_number', 'bgh_decision_date', 'bgh_approver_name',
            'disposal_method', 'approval_note', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_copies', 'total_value', 'status', 'created_by', 'approved_by', 'approved_at', 'created_at', 'updated_at']

class DeaccessionBatchDetailSerializer(DeaccessionBatchSerializer):
    copies = CopySerializer(many=True, read_only=True)

    class Meta(DeaccessionBatchSerializer.Meta):
        fields = DeaccessionBatchSerializer.Meta.fields + ['copies']

class CreateDeaccessionBatchSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50, required=False, allow_blank=True)
    decision_number = serializers.CharField(max_length=100)
    decision_date = serializers.DateField()
    reason = serializers.ChoiceField(choices=DeaccessionBatch.REASON_CHOICES, default='damaged')
    committee = serializers.CharField(required=False, allow_blank=True)
    note = serializers.CharField(required=False, allow_blank=True)
    copy_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
        help_text='Danh sách ID các bản sao sách cần thanh lý'
    )
    copy_reasons = serializers.DictField(
        child=serializers.CharField(),
        required=False,
        help_text='Lý do thanh lý chi tiết cho từng bản sao (copy_id -> reason)'
    )

class ApproveDeaccessionBatchSerializer(serializers.Serializer):
    bgh_decision_number = serializers.CharField(max_length=100, required=True, help_text='Số quyết định phê duyệt BGH')
    bgh_decision_date = serializers.DateField(required=True, help_text='Ngày ký quyết định BGH')
    bgh_approver_name = serializers.CharField(max_length=150, required=True, help_text='Người ký phê duyệt BGH (VD: PGS.TS Nguyễn Xuân Phương - Hiệu trưởng)')
    disposal_method = serializers.CharField(max_length=100, required=False, default='Tiêu hủy phân loại sinh học')
    approval_note = serializers.CharField(required=False, allow_blank=True, default='')


