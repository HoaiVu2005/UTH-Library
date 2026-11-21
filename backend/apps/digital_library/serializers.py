from rest_framework import serializers
from django.utils import timezone
from apps.catalog.models import Book
from .models import (
    DigitalDocument,
    DigitalDocumentVersion,
    DigitalReadingSession,
    ApprovalLog,
    DocumentType,
    DocumentStatus,
    AccessScope,
)


def format_bytes(bytes_val):
    if not bytes_val:
        return '0 B'
    if bytes_val < 1024:
        return f"{bytes_val} B"
    elif bytes_val < 1024 * 1024:
        return f"{bytes_val / 1024:.1f} KB"
    else:
        return f"{bytes_val / (1024 * 1024):.1f} MB"


class DigitalDocumentVersionSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    file_size_formatted = serializers.SerializerMethodField()

    class Meta:
        model = DigitalDocumentVersion
        fields = [
            'id', 'version_number', 'file', 'file_size_bytes', 'file_size_formatted',
            'file_hash_sha256', 'page_count', 'change_log', 'is_current',
            'uploaded_by', 'uploaded_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'version_number', 'file_size_bytes', 'file_hash_sha256', 'created_at']

    def get_file_size_formatted(self, obj):
        return format_bytes(obj.file_size_bytes)


class ApprovalLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.full_name', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = ApprovalLog
        fields = ['id', 'actor', 'actor_name', 'action', 'action_display', 'note', 'created_at']


class DigitalDocumentListSerializer(serializers.ModelSerializer):
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    access_scope_display = serializers.CharField(source='get_access_scope_display', read_only=True)
    current_version = serializers.SerializerMethodField()
    has_access = serializers.SerializerMethodField()
    access_denial_reason = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    page_count = serializers.SerializerMethodField()
    file_size_formatted = serializers.SerializerMethodField()
    catalog_book_id = serializers.IntegerField(source='catalog_book.id', read_only=True, allow_null=True)
    catalog_book_title = serializers.CharField(source='catalog_book.title', read_only=True, allow_null=True)

    class Meta:
        model = DigitalDocument
        fields = [
            'id', 'title', 'document_type', 'document_type_display',
            'status', 'status_display', 'cover_image', 'year',
            'department', 'major', 'author_names', 'advisor_names',
            'publisher', 'source_license', 'current_version_number',
            'total_views', 'total_reading_seconds', 'access_scope',
            'access_scope_display', 'has_access', 'access_denial_reason',
            'created_by_name', 'page_count', 'file_size_formatted',
            'catalog_book_id', 'catalog_book_title',
            'current_version', 'created_at', 'updated_at'
        ]

    def _check_access(self, obj, user):
        """Kiểm tra quyền truy cập của người dùng đối với tài liệu số."""
        if not user or not user.is_authenticated:
            return False, 'Vui lòng đăng nhập tài khoản UTH để đọc tài liệu này.'

        # Quản trị viên và Thủ thư luôn có quyền xem để kiểm duyệt
        if getattr(user, 'role', '') in ['admin', 'librarian']:
            return True, None

        # Tài liệu chỉ cho phép đọc khi đã được xuất bản (Published)
        if obj.status != DocumentStatus.PUBLISHED:
            return False, f'Tài liệu hiện đang ở trạng thái {obj.get_status_display()}, chưa được mở phục vụ bạn đọc.'

        # Kiểm tra khoảng thời gian hiệu lực
        today = timezone.localdate()
        if obj.access_start_date and today < obj.access_start_date:
            return False, f'Tài liệu chỉ mở bắt đầu từ ngày {obj.access_start_date.strftime("%d/%m/%Y")}.'
        if obj.access_end_date and today > obj.access_end_date:
            return False, f'Tài liệu đã hết hạn truy cập từ ngày {obj.access_end_date.strftime("%d/%m/%Y")}.'

        # Kiểm tra thẻ thư viện nếu chính sách yêu cầu
        if obj.require_active_card:
            if not getattr(user, 'is_active', True) or getattr(user, 'is_currently_locked', False) or not getattr(user, 'is_card_valid', True):
                return False, 'Chính sách tài liệu yêu cầu Thẻ thư viện UTH còn hiệu lực (chưa bị khóa và chưa hết hạn).'

        # Kiểm tra phạm vi truy cập (Access Scope)
        user_dept = getattr(user, 'department', '') or ''
        # Lấy thông tin ngành từ student_roster nếu có
        user_major = ''
        if hasattr(user, 'student_roster') and user.student_roster:
            user_major = user.student_roster.major or ''

        if obj.access_scope == AccessScope.ALL_UNIVERSITY:
            return True, None

        elif obj.access_scope == AccessScope.BY_DEPARTMENT:
            allowed = obj.allowed_departments or []
            if not allowed and obj.department:
                allowed = [obj.department]
            
            # Khớp tương đối không phân biệt hoa thường
            matched = any(al.lower() in user_dept.lower() or user_dept.lower() in al.lower() for al in allowed if al)
            if not matched:
                dept_names = ', '.join(allowed) if allowed else obj.department or 'khoa chỉ định'
                return False, f'Tài liệu này chỉ dành riêng cho bạn đọc thuộc: {dept_names}.'
            return True, None

        elif obj.access_scope == AccessScope.BY_MAJOR:
            allowed = obj.allowed_majors or []
            if not allowed and obj.major:
                allowed = [obj.major]
            matched = any(al.lower() in user_major.lower() or user_major.lower() in al.lower() for al in allowed if al)
            if not matched:
                major_names = ', '.join(allowed) if allowed else obj.major or 'chuyên ngành chỉ định'
                return False, f'Tài liệu này chỉ dành riêng cho sinh viên chuyên ngành: {major_names}.'
            return True, None

        elif obj.access_scope == AccessScope.SPECIFIC_USERS:
            if not obj.allowed_users.filter(id=user.id).exists():
                return False, 'Tài liệu này giới hạn danh sách bạn đọc được cấp quyền đặc biệt.'
            return True, None

        return True, None

    def get_has_access(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None
        has_access, _ = self._check_access(obj, user)
        return has_access

    def get_access_denial_reason(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None
        _, reason = self._check_access(obj, user)
        return reason

    def get_current_version(self, obj):
        current = obj.versions.filter(is_current=True).first() or obj.versions.first()
        if not current:
            return None
        return {
            'id': current.id,
            'version_number': current.version_number,
            'page_count': current.page_count,
            'file_size_formatted': format_bytes(current.file_size_bytes),
            'created_at': current.created_at.isoformat() if current.created_at else None,
        }

    def get_created_by_name(self, obj):
        return obj.created_by.full_name if obj.created_by else None

    def get_page_count(self, obj):
        current = self.get_current_version(obj)
        return current['page_count'] if current else 0

    def get_file_size_formatted(self, obj):
        current = self.get_current_version(obj)
        return current['file_size_formatted'] if current else '0 B'


class DigitalDocumentDetailSerializer(DigitalDocumentListSerializer):
    versions = DigitalDocumentVersionSerializer(many=True, read_only=True)
    approval_logs = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()
    user_reading_session = serializers.SerializerMethodField()

    class Meta(DigitalDocumentListSerializer.Meta):
        fields = DigitalDocumentListSerializer.Meta.fields + [
            'abstract', 'keywords', 'language', 'isbn', 'metadata',
            'allowed_departments', 'allowed_majors', 'access_start_date',
            'access_end_date', 'require_active_card', 'allow_download',
            'allow_print', 'campus_only', 'submitted_at', 'approved_by',
            'approved_by_name', 'approved_at', 'rejection_reason',
            'disable_reason', 'versions', 'approval_logs', 'user_reading_session'
        ]

    def get_approved_by_name(self, obj):
        return obj.approved_by.full_name if obj.approved_by else None

    def get_approval_logs(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None
        # Chỉ thủ thư và admin mới xem được chi tiết nhật ký duyệt
        if user and getattr(user, 'role', '') in ['admin', 'librarian']:
            return ApprovalLogSerializer(obj.approval_logs.all(), many=True).data
        return []

    def get_user_reading_session(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None
        if not user or not user.is_authenticated:
            return None
        session = obj.reading_sessions.filter(user=user, status='active').order_by('-last_active_at').first()
        if not session:
            return None
        cur_version = obj.versions.filter(is_current=True).first()
        total_p = cur_version.page_count if cur_version else 1
        return {
            'session_id': str(session.session_id),
            'session_code': session.session_code,
            'current_page': session.current_page,
            'max_page_reached': session.max_page_reached,
            'total_seconds_spent': session.total_seconds_spent,
            'progress_percent': min(100, int(round((session.current_page / max(1, total_p)) * 100))),
            'last_active_at': session.last_active_at.isoformat() if session.last_active_at else None,
        }


class DigitalDocumentCreateUpdateSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True, required=False)
    change_log = serializers.CharField(write_only=True, required=False, allow_blank=True)
    catalog_book = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all(), required=False, allow_null=True)

    class Meta:
        model = DigitalDocument
        fields = [
            'id', 'title', 'document_type', 'department', 'major',
            'author_names', 'advisor_names', 'publisher', 'isbn',
            'source_license', 'year', 'language', 'abstract', 'keywords',
            'metadata', 'access_scope', 'allowed_departments',
            'allowed_majors', 'access_start_date', 'access_end_date',
            'require_active_card', 'allow_download', 'allow_print',
            'campus_only', 'file', 'change_log', 'cover_image',
            'catalog_book'
        ]

    def create(self, validated_data):
        validated_data.pop('file', None)
        validated_data.pop('change_log', None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('file', None)
        validated_data.pop('change_log', None)
        return super().update(instance, validated_data)


class DigitalReadingSessionSerializer(serializers.ModelSerializer):
    document_title = serializers.CharField(source='document.title', read_only=True)
    document_type = serializers.CharField(source='document.document_type', read_only=True)
    document_type_display = serializers.CharField(source='document.get_document_type_display', read_only=True)
    document_cover_image = serializers.CharField(source='document.cover_image', read_only=True)
    version_number = serializers.IntegerField(source='version.version_number', read_only=True)
    total_pages = serializers.IntegerField(source='version.page_count', read_only=True)
    progress_percent = serializers.SerializerMethodField()
    started_at = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = DigitalReadingSession
        fields = [
            'id', 'session_id', 'session_code', 'document', 'document_title',
            'document_type', 'document_type_display', 'document_cover_image',
            'version_number', 'total_pages', 'current_page', 'max_page_reached',
            'total_seconds_spent', 'progress_percent', 'started_at',
            'last_active_at', 'expires_at', 'status', 'user_full_name',
            'user_code', 'user_department', 'user_major'
        ]

    def get_progress_percent(self, obj):
        total = obj.version.page_count if obj.version else 1
        return min(100, int(round((obj.current_page / max(1, total)) * 100)))
