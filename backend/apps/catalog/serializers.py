from rest_framework import serializers
from apps.core.enums import CopyStatus
from .models import Category, Author, Book, Copy

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
    book = serializers.SerializerMethodField()

    class Meta:
        model = Copy
        fields = [
            'id', 'barcode', 'shelf_location', 'status', 'status_display',
            'reading_room_only', 'held_for_user', 'held_for_user_code',
            'hold_expires_at', 'acquired_date', 'purchase_price',
            'source', 'supplier', 'note',
            'book_id', 'book_title', 'book_isbn', 'book_cover_image', 'category_name', 'category_code', 'book',
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

    class Meta:
        model = Book
        fields = [
            'id', 'isbn', 'title', 'publisher', 'year', 'category', 'category_name',
            'category_code', 'category_detail',
            'authors', 'authors_names', 'cover_image', 'price', 'language', 'page_count',
            'total_copies', 'total_copies_count', 'available_copies', 'available_copies_count',
            'only_reading_room', 'created_at',
        ]

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

class BookDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    authors = AuthorSerializer(many=True, read_only=True)
    copies = serializers.SerializerMethodField()
    available_copies_count = serializers.SerializerMethodField()
    can_borrow_home = serializers.SerializerMethodField()
    only_reading_room = serializers.SerializerMethodField()
    is_reserved_by_user = serializers.SerializerMethodField()
    user_reservation = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'id', 'isbn', 'title', 'publisher', 'year', 'category',
            'authors', 'description', 'cover_image', 'language',
            'page_count', 'edition', 'price', 'processing_fee', 'keywords',
            'copies', 'available_copies_count', 'can_borrow_home', 'only_reading_room',
            'is_reserved_by_user', 'user_reservation',
            'created_at', 'updated_at',
        ]

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
        return self.get_available_copies_count(obj) > 0

    def get_only_reading_room(self, obj):
        copies = obj.copies.filter(deleted_at__isnull=True)
        if not copies.exists():
            return False
        return copies.filter(reading_room_only=False).count() == 0

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

