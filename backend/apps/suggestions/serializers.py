from rest_framework import serializers
from .models import Suggestion, SuggestionCampaign, SuggestionVote
from apps.accounts.serializers import UserSummarySerializer

class SuggestionCampaignSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by = UserSummarySerializer(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    total_suggestions = serializers.SerializerMethodField()
    total_votes = serializers.SerializerMethodField()

    class Meta:
        model = SuggestionCampaign
        fields = [
            'id', 'title', 'description', 'start_date', 'end_date',
            'status', 'status_display', 'target_audience', 'created_by',
            'is_active', 'days_remaining', 'total_suggestions', 'total_votes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'is_active', 'days_remaining', 'created_at', 'updated_at']

    def get_total_suggestions(self, obj):
        return obj.suggestions.count()

    def get_total_votes(self, obj):
        return SuggestionVote.objects.filter(suggestion__campaign=obj).count()


class CreateCampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = SuggestionCampaign
        fields = ['title', 'description', 'start_date', 'end_date', 'status', 'target_audience']

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({'end_date': 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.'})
        return attrs


class SuggestionSerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)
    reviewed_by = UserSummarySerializer(read_only=True)
    campaign = SuggestionCampaignSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    votes_count = serializers.SerializerMethodField()
    is_voted_by_me = serializers.SerializerMethodField()

    class Meta:
        model = Suggestion
        fields = [
            'id', 'user', 'campaign', 'book_title', 'author', 'department', 'reason',
            'status', 'status_display', 'review_note',
            'reviewed_by', 'reviewed_at', 'received_at',
            'votes_count', 'is_voted_by_me',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'campaign', 'status', 'status_display', 'review_note',
            'reviewed_by', 'reviewed_at', 'received_at', 'votes_count', 'is_voted_by_me',
            'created_at', 'updated_at'
        ]

    def get_votes_count(self, obj):
        if hasattr(obj, 'annotated_votes_count'):
            return obj.annotated_votes_count
        return obj.votes.count()

    def get_is_voted_by_me(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        if hasattr(obj, 'user_voted'):
            return bool(obj.user_voted)
        return obj.votes.filter(user=request.user).exists()


class CommunitySuggestionSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    votes_count = serializers.SerializerMethodField()
    is_voted_by_me = serializers.SerializerMethodField()
    suggester_name = serializers.SerializerMethodField()
    suggester_department = serializers.CharField(source='user.department', read_only=True)
    campaign_title = serializers.CharField(source='campaign.title', read_only=True, default='')

    class Meta:
        model = Suggestion
        fields = [
            'id', 'campaign', 'campaign_title', 'book_title', 'author', 'department', 'reason',
            'status', 'status_display', 'votes_count', 'is_voted_by_me',
            'suggester_name', 'suggester_department', 'created_at'
        ]

    def get_votes_count(self, obj):
        if hasattr(obj, 'annotated_votes_count'):
            return obj.annotated_votes_count
        return obj.votes.count()

    def get_is_voted_by_me(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        if hasattr(obj, 'user_voted'):
            return bool(obj.user_voted)
        return obj.votes.filter(user=request.user).exists()

    def get_suggester_name(self, obj):
        # Trả về tên viết gọn hoặc đầy đủ của bạn đọc đề xuất
        if obj.user:
            return obj.user.full_name or obj.user.username
        return 'Bạn đọc UTH'


class CreateSuggestionSerializer(serializers.ModelSerializer):
    campaign_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Suggestion
        fields = ['book_title', 'author', 'department', 'reason', 'campaign_id']

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
