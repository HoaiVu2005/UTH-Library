import uuid
from typing import Any
from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.core.models import BaseModel
from apps.catalog.models import Book


class DocumentType(models.TextChoices):
    EBOOK = 'ebook', 'Sách điện tử'
    TEXTBOOK = 'textbook', 'Giáo trình'
    THESIS = 'thesis', 'Khóa luận tốt nghiệp'
    CAPSTONE = 'capstone', 'Đồ án tốt nghiệp'
    PROJECT = 'project', 'Đồ án môn học'
    INTERNSHIP_REPORT = 'internship_report', 'Báo cáo thực tập'
    RESEARCH_PROJECT = 'research_project', 'Công trình nghiên cứu khoa học'
    JOURNAL_PAPER = 'journal_paper', 'Bài báo khoa học'
    LECTURE_SLIDE = 'lecture_slide', 'Slide bài giảng'
    LEARNING_MATERIAL = 'learning_material', 'Tài liệu học tập & tham khảo'


class DocumentStatus(models.TextChoices):
    DRAFT = 'draft', 'Bản nháp'
    PENDING_APPROVAL = 'pending_approval', 'Chờ phê duyệt'
    PUBLISHED = 'published', 'Đã xuất bản'
    REJECTED = 'rejected', 'Từ chối duyệt'
    DISABLED = 'disabled', 'Tạm ngưng phục vụ'
    ARCHIVED = 'archived', 'Lưu trữ lịch sử'


class AccessScope(models.TextChoices):
    ALL_UNIVERSITY = 'all_university', 'Toàn trường'
    BY_DEPARTMENT = 'by_department', 'Theo khoa'
    BY_MAJOR = 'by_major', 'Theo ngành'
    SPECIFIC_USERS = 'specific_users', 'Theo người dùng chỉ định'


class DigitalDocument(BaseModel):
    objects: Any = models.Manager()

    # Core Metadata
    title = models.CharField(max_length=500, db_index=True, verbose_name='Tên tài liệu / đề tài')
    document_type = models.CharField(
        max_length=30,
        choices=DocumentType.choices,
        default=DocumentType.LEARNING_MATERIAL,
        db_index=True,
        verbose_name='Loại tài liệu'
    )
    status = models.CharField(
        max_length=20,
        choices=DocumentStatus.choices,
        default=DocumentStatus.DRAFT,
        db_index=True,
        verbose_name='Trạng thái kiểm duyệt'
    )
    cover_image = models.CharField(max_length=500, blank=True, null=True, verbose_name='Ảnh bìa / Biểu trưng')
    abstract = models.TextField(blank=True, null=True, verbose_name='Tóm tắt nội dung')
    keywords = models.CharField(max_length=500, blank=True, null=True, verbose_name='Từ khóa')
    language = models.CharField(max_length=50, default='Tiếng Việt', verbose_name='Ngôn ngữ')
    year = models.PositiveIntegerField(null=True, blank=True, db_index=True, verbose_name='Năm xuất bản / Năm bảo vệ')

    # Phân loại chuyên ngành UTH
    department = models.CharField(max_length=255, blank=True, null=True, db_index=True, verbose_name='Khoa / Viện')
    major = models.CharField(max_length=255, blank=True, null=True, db_index=True, verbose_name='Ngành đào tạo')
    author_names = models.CharField(max_length=500, blank=True, null=True, db_index=True, verbose_name='Tác giả / Sinh viên thực hiện')
    advisor_names = models.CharField(max_length=500, blank=True, null=True, verbose_name='Giảng viên hướng dẫn')
    publisher = models.CharField(max_length=255, blank=True, null=True, verbose_name='Nhà xuất bản')
    isbn = models.CharField(max_length=50, blank=True, null=True, verbose_name='ISBN nếu có')
    source_license = models.CharField(max_length=255, blank=True, null=True, verbose_name='Nguồn tài liệu và quyền công bố')

    # Trường metadata động tùy biến theo từng loại tài liệu
    metadata = models.JSONField(default=dict, blank=True, verbose_name='Metadata đặc thù theo loại')

    # Liên kết với đầu sách in truyền thống trong OPAC (nếu có)
    catalog_book = models.ForeignKey(
        Book,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='digital_documents',
        verbose_name='Đầu sách OPAC liên kết'
    )

    # Chính sách phân quyền truy cập
    access_scope = models.CharField(
        max_length=30,
        choices=AccessScope.choices,
        default=AccessScope.ALL_UNIVERSITY,
        db_index=True,
        verbose_name='Phạm vi truy cập'
    )
    allowed_departments = models.JSONField(default=list, blank=True, verbose_name='Danh sách khoa được đọc')
    allowed_majors = models.JSONField(default=list, blank=True, verbose_name='Danh sách ngành được đọc')
    allowed_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name='permitted_digital_documents',
        verbose_name='Bạn đọc được chỉ định cụ thể'
    )
    access_start_date = models.DateField(null=True, blank=True, verbose_name='Ngày bắt đầu hiệu lực')
    access_end_date = models.DateField(null=True, blank=True, verbose_name='Ngày kết thúc hiệu lực')
    require_active_card = models.BooleanField(default=False, verbose_name='Yêu cầu thẻ thư viện còn hạn')
    allow_download = models.BooleanField(default=False, verbose_name='Cho phép tải xuống PDF')
    allow_print = models.BooleanField(default=False, verbose_name='Cho phép in ấn')
    campus_only = models.BooleanField(default=False, verbose_name='Chỉ đọc tại mạng nội bộ Thư viện/Campus')

    # Quy trình duyệt & Người lập
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_digital_documents',
        verbose_name='Người tạo / Thủ thư'
    )
    submitted_at = models.DateTimeField(null=True, blank=True, verbose_name='Thời điểm gửi duyệt')
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_digital_documents',
        verbose_name='Người phê duyệt / Admin'
    )
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name='Thời điểm phê duyệt')
    rejection_reason = models.TextField(blank=True, null=True, verbose_name='Lý do từ chối')
    disable_reason = models.TextField(blank=True, null=True, verbose_name='Lý do thu hồi / ngưng phục vụ')

    # Thống kê & Phiên bản
    total_views = models.PositiveIntegerField(default=0, verbose_name='Tổng lượt mở đọc')
    total_reading_seconds = models.PositiveIntegerField(default=0, verbose_name='Tổng thời gian đọc (giây)')
    current_version_number = models.PositiveIntegerField(default=1, verbose_name='Số hiệu phiên bản hiện hành')

    class Meta:
        db_table = 'digital_documents'
        verbose_name = 'Tài liệu số & Học liệu điện tử'
        verbose_name_plural = 'Tài liệu số & Học liệu điện tử'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['document_type', 'status']),
            models.Index(fields=['department', 'major']),
            models.Index(fields=['year']),
        ]

    def __str__(self):
        return f"[{self.get_document_type_display()}] {self.title} ({self.get_status_display()})"


class DigitalDocumentVersion(BaseModel):
    objects: Any = models.Manager()

    document = models.ForeignKey(
        DigitalDocument,
        on_delete=models.CASCADE,
        related_name='versions',
        verbose_name='Tài liệu số'
    )
    version_number = models.PositiveIntegerField(default=1, verbose_name='Số phiên bản')
    file = models.FileField(upload_to='digital_library/%Y/%m/', verbose_name='Tập tin PDF')
    file_size_bytes = models.BigIntegerField(default=0, verbose_name='Dung lượng file (bytes)')
    file_hash_sha256 = models.CharField(max_length=64, blank=True, null=True, db_index=True, verbose_name='Mã băm SHA256 kiểm tra trùng lặp')
    page_count = models.PositiveIntegerField(default=1, verbose_name='Số trang tài liệu')
    change_log = models.TextField(blank=True, null=True, verbose_name='Mô tả thay đổi phiên bản')
    is_current = models.BooleanField(default=True, verbose_name='Là phiên bản hiện hành')
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        verbose_name='Người tải lên'
    )

    class Meta:
        db_table = 'digital_document_versions'
        verbose_name = 'Phiên bản tài liệu số'
        verbose_name_plural = 'Phiên bản tài liệu số'
        ordering = ['-version_number']
        unique_together = ('document', 'version_number')

    def __str__(self):
        return f"{self.document.title} - Phiên bản v{self.version_number}"


class DigitalReadingSession(BaseModel):
    objects: Any = models.Manager()

    STATUS_CHOICES = [
        ('active', 'Đang hoạt động'),
        ('idle', 'Tạm nghỉ'),
        ('expired', 'Hết hạn'),
        ('revoked', 'Bị thu hồi'),
    ]

    session_id = models.UUIDField(default=uuid.uuid4, unique=True, db_index=True, verbose_name='Mã định danh phiên')
    session_code = models.CharField(max_length=50, unique=True, db_index=True, verbose_name='Mã hiển thị Watermark')
    document = models.ForeignKey(
        DigitalDocument,
        on_delete=models.PROTECT,
        related_name='reading_sessions',
        verbose_name='Tài liệu đang đọc'
    )
    version = models.ForeignKey(
        DigitalDocumentVersion,
        on_delete=models.PROTECT,
        related_name='reading_sessions',
        verbose_name='Phiên bản đang đọc'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='digital_reading_sessions',
        verbose_name='Bạn đọc'
    )

    # Snapshot thông tin bạn đọc tại thời điểm cấp phiên (để in Watermark bất biến)
    user_full_name = models.CharField(max_length=255, verbose_name='Họ tên bạn đọc')
    user_code = models.CharField(max_length=50, verbose_name='MSSV / Mã cán bộ')
    user_department = models.CharField(max_length=255, blank=True, null=True, verbose_name='Khoa bạn đọc')
    user_major = models.CharField(max_length=255, blank=True, null=True, verbose_name='Ngành bạn đọc')

    ip_address = models.GenericIPAddressField(blank=True, null=True, verbose_name='Địa chỉ IP')
    user_agent = models.CharField(max_length=500, blank=True, null=True, verbose_name='Trình duyệt / Thiết bị')

    # Tiến độ & Heartbeat
    current_page = models.PositiveIntegerField(default=1, verbose_name='Trang hiện tại')
    max_page_reached = models.PositiveIntegerField(default=1, verbose_name='Trang cao nhất đã đọc')
    total_seconds_spent = models.PositiveIntegerField(default=0, verbose_name='Tổng thời lượng đọc thực tế (giây)')
    last_active_at = models.DateTimeField(auto_now=True, verbose_name='Thời điểm tương tác cuối')
    expires_at = models.DateTimeField(verbose_name='Thời điểm hết hạn phiên')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name='Trạng thái phiên')

    class Meta:
        db_table = 'digital_reading_sessions'
        verbose_name = 'Phiên đọc tài liệu số'
        verbose_name_plural = 'Phiên đọc tài liệu số'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'document']),
            models.Index(fields=['status', 'expires_at']),
        ]

    def __str__(self):
        return f"{self.session_code} - {self.user_code} ({self.document.title})"

    @property
    def is_valid(self):
        return self.status == 'active' and self.expires_at > timezone.now()


class ApprovalLog(BaseModel):
    objects: Any = models.Manager()

    ACTION_CHOICES = [
        ('submit', 'Gửi duyệt'),
        ('approve', 'Phê duyệt xuất bản'),
        ('reject', 'Từ chối duyệt'),
        ('disable', 'Tạm ngưng phục vụ'),
        ('archive', 'Lưu trữ lịch sử'),
        ('restore', 'Khôi phục phục vụ'),
    ]

    document = models.ForeignKey(
        DigitalDocument,
        on_delete=models.CASCADE,
        related_name='approval_logs',
        verbose_name='Tài liệu số'
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        verbose_name='Người thực hiện'
    )
    action = models.CharField(max_length=30, choices=ACTION_CHOICES, verbose_name='Hành động')
    note = models.TextField(blank=True, null=True, verbose_name='Ghi chú / Lý do')

    class Meta:
        db_table = 'digital_approval_logs'
        verbose_name = 'Nhật ký kiểm duyệt tài liệu'
        verbose_name_plural = 'Nhật ký kiểm duyệt tài liệu'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.document.title} - {self.get_action_display()} bởi {self.actor.full_name}"

