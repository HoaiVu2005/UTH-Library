from rest_framework import serializers
from apps.circulation.models import Loan
from apps.catalog.serializers import CopySerializer

class LoanSerializer(serializers.ModelSerializer):
    patron_name = serializers.CharField(source='user.full_name', read_only=True)
    patron_card_code = serializers.CharField(source='user.card_code', read_only=True)
    patron_role = serializers.CharField(source='user.role', read_only=True)
    patron_avatar = serializers.CharField(source='user.avatar', read_only=True, default=None)
    book_title = serializers.CharField(source='book.title', read_only=True)
    cover_image = serializers.CharField(source='book.cover_image', read_only=True, default='')
    category_name = serializers.CharField(source='book.category.name', read_only=True, default='')
    copy_barcode = serializers.CharField(source='copy.barcode', read_only=True)
    shelf_location = serializers.CharField(source='copy.shelf_location', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_late = serializers.IntegerField(read_only=True)

    class Meta:
        model = Loan
        fields = [
            'id', 'user', 'patron_name', 'patron_card_code', 'patron_role', 'patron_avatar',
            'book', 'book_title', 'cover_image', 'category_name', 'copy', 'copy_barcode', 'shelf_location',
            'borrowed_at', 'due_at', 'returned_at', 'renewal_count',
            'status', 'return_condition', 'lost_at', 'note',
            'is_overdue', 'days_late', 'fine_per_day_snapshot',
            'loan_days_snapshot', 'renewal_limit_snapshot', 'book_price_snapshot',
        ]
        read_only_fields = fields

class DirectBorrowSerializer(serializers.Serializer):
    patron_card_code = serializers.CharField(required=True, trim_whitespace=True)
    barcode = serializers.CharField(required=True, trim_whitespace=True)

class ReservationBorrowSerializer(serializers.Serializer):
    reservation_id = serializers.IntegerField(required=True)
    barcode = serializers.CharField(required=True, trim_whitespace=True)

class ReturnLoanSerializer(serializers.Serializer):
    condition = serializers.ChoiceField(choices=['normal', 'damaged', 'lost'], default='normal')
    damage_level = serializers.ChoiceField(choices=['light', 'medium', 'heavy'], required=False, allow_null=True)
    amount_override = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    note = serializers.CharField(required=False, allow_blank=True, allow_null=True)

