from rest_framework import serializers
from .models import Fine, FinePayment

class FinePaymentSerializer(serializers.ModelSerializer):
    collector_name = serializers.CharField(source='collected_by.full_name', read_only=True)

    class Meta:
        model = FinePayment
        fields = ['id', 'fine', 'amount', 'collected_by', 'collector_name', 'collected_at', 'note']
        read_only_fields = fields

class FineSerializer(serializers.ModelSerializer):
    patron_name = serializers.CharField(source='user.full_name', read_only=True)
    patron_card_code = serializers.CharField(source='user.card_code', read_only=True)
    remaining_amount = serializers.IntegerField(read_only=True)
    book_title = serializers.CharField(source='loan.book.title', read_only=True, default=None)
    copy_barcode = serializers.CharField(source='loan.copy.barcode', read_only=True, default=None)
    payments = FinePaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Fine
        fields = [
            'id', 'loan', 'book_title', 'copy_barcode', 'user', 'patron_name',
            'patron_card_code', 'type', 'amount', 'paid_amount', 'remaining_amount',
            'status', 'damage_level', 'note', 'waive_reason', 'waived_by',
            'created_at', 'payments',
        ]
        read_only_fields = fields

class CollectFineSerializer(serializers.Serializer):
    amount = serializers.IntegerField(required=True, min_value=1)
    note = serializers.CharField(required=False, allow_blank=True, allow_null=True)

class WaiveFineSerializer(serializers.Serializer):
    reason = serializers.CharField(required=True, trim_whitespace=True, min_length=3)

