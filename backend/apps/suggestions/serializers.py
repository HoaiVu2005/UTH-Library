from rest_framework import serializers
from .models import Suggestion
from apps.accounts.serializers import UserSummarySerializer

class SuggestionSerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)
    reviewed_by = UserSummarySerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Suggestion
        fields = [
            'id', 'user', 'book_title', 'author', 'reason',
            'status', 'status_display', 'review_note',
            'reviewed_by', 'reviewed_at', 'received_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'status', 'status_display', 'review_note',
            'reviewed_by', 'reviewed_at', 'received_at',
            'created_at', 'updated_at'
        ]

class CreateSuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suggestion
        fields = ['book_title', 'author', 'reason']

    def validate_book_title(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError('Tên sách không được để trống.')
        return val

    def validate_reason(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError('Lý do đề xuất không được để trống.')
        return val

class ReviewSuggestionSerializer(serializers.Serializer):
    review_note = serializers.CharField(required=False, allow_blank=True, default='')
