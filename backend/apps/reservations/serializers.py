from rest_framework import serializers
from .models import Reservation

class ReservationSerializer(serializers.ModelSerializer):
    patron_name = serializers.CharField(source='user.full_name', read_only=True)
    patron_card_code = serializers.CharField(source='user.card_code', read_only=True)
    patron_avatar = serializers.CharField(source='user.avatar', read_only=True, default=None)
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_cover = serializers.CharField(source='book.cover_image', read_only=True, default=None)
    book_isbn = serializers.CharField(source='book.isbn', read_only=True, default=None)
    copy_barcode = serializers.CharField(source='copy.barcode', read_only=True, default=None)
    shelf_location = serializers.CharField(source='copy.shelf_location', read_only=True, default=None)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    book = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    copy = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = [
            'id', 'user', 'patron_name', 'patron_card_code', 'patron_avatar',
            'book', 'book_title', 'book_cover', 'book_isbn',
            'copy', 'copy_barcode', 'shelf_location', 'status',
            'status_display', 'type', 'ready_at', 'hold_expires_at', 'queue_position',
            'notified_at', 'no_show_counted', 'cancel_reason', 'created_at',
        ]
        read_only_fields = fields

    def get_book(self, obj):
        if not obj.book:
            return None
        return {
            'id': obj.book.id,
            'title': obj.book.title,
            'isbn': obj.book.isbn or '',
            'cover_image': obj.book.cover_image or '',
            'category': {
                'code': obj.book.category.code if obj.book.category else '',
                'name': obj.book.category.name if obj.book.category else '',
            } if obj.book.category else None,
        }

    def get_user(self, obj):
        if not obj.user:
            return None
        return {
            'id': obj.user.id,
            'full_name': obj.user.full_name,
            'card_code': obj.user.card_code,
            'department': obj.user.department or 'Khoa CNTT - UTH',
            'avatar': obj.user.avatar or '',
            'role': obj.user.role,
        }

    def get_copy(self, obj):
        if not obj.copy:
            return None
        return {
            'id': obj.copy.id,
            'barcode': obj.copy.barcode,
            'shelf_location': obj.copy.shelf_location or 'Quầy A',
            'status': obj.copy.status,
            'reading_room_only': obj.copy.reading_room_only,
        }

class CreateReservationSerializer(serializers.Serializer):
    book_id = serializers.IntegerField(required=True)


