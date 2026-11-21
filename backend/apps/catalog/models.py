from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from apps.core.enums import CopyStatus

class Category(BaseModel):
    code = models.CharField(max_length=10, unique=True, db_index=True, help_text='Mã 2-4 ký tự in hoa (VD: CNTT, GTVT)')
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'categories'
        verbose_name = 'Chuyên ngành'
        verbose_name_plural = 'Chuyên ngành'
        ordering = ['display_order', 'name']

    def save(self, *args, **kwargs):
        self.code = self.code.strip().upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.code} - {self.name}"

class Author(BaseModel):
    name = models.CharField(max_length=255, unique=True, db_index=True)
    bio = models.TextField(blank=True, null=True)
    nationality = models.CharField(max_length=100, blank=True, null=True)
    birth_year = models.IntegerField(blank=True, null=True)
    death_year = models.IntegerField(blank=True, null=True)

    class Meta:
        db_table = 'authors'
        verbose_name = 'Tác giả'
        verbose_name_plural = 'Tác giả'
        ordering = ['name']

    def __str__(self):
        return self.name

class Book(BaseModel):
    isbn = models.CharField(max_length=20, db_index=True, blank=True, null=True)
    title = models.CharField(max_length=500, db_index=True)
    publisher = models.CharField(max_length=255, blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='books')
    authors = models.ManyToManyField(Author, related_name='books', blank=True)
    description = models.TextField(blank=True, null=True)
    cover_image = models.CharField(max_length=500, blank=True, null=True)
    language = models.CharField(max_length=50, default='Tiếng Việt')
    page_count = models.IntegerField(blank=True, null=True)
    edition = models.CharField(max_length=50, blank=True, null=True)
    price = models.BigIntegerField(default=100000, help_text='Giá bìa sách (VND)')
    processing_fee = models.BigIntegerField(default=20000, help_text='Phí xử lý khi làm mất sách (VND)')
    keywords = models.CharField(max_length=500, blank=True, null=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'books'
        verbose_name = 'Đầu sách'
        verbose_name_plural = 'Đầu sách'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['isbn']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return self.title

class BarcodeSequence(models.Model):
    category = models.OneToOneField(Category, on_delete=models.CASCADE, related_name='barcode_sequence')
    last_value = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'barcode_sequences'
        verbose_name = 'Số thứ tự mã vạch'
        verbose_name_plural = 'Số thứ tự mã vạch'

    def __str__(self):
        return f"{self.category.code}: {self.last_value}"

class DeaccessionBatch(BaseModel):
    REASON_CHOICES = [
        ('damaged', 'Hư hỏng không thể phục hồi'),
        ('lost', 'Mất tài liệu không tìm thấy'),
        ('outdated', 'Lạc hậu nội dung / Hết hạn lưu trữ'),
        ('other', 'Lý do khác'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Dự thảo'),
        ('pending_approval', 'Chờ duyệt'),
        ('approved', 'Đã duyệt'),
        ('executed', 'Đã thực hiện'),
        ('rejected', 'Từ chối'),
        ('cancelled', 'Đã hủy'),
    ]

    code = models.CharField(max_length=50, unique=True, db_index=True, help_text='Mã biên bản (VD: BBTL-2026-001)')
    decision_number = models.CharField(max_length=100, help_text='Số quyết định (VD: 128/QĐ-ĐHGTVT)')
    decision_date = models.DateField(help_text='Ngày ký quyết định')
    reason = models.CharField(max_length=50, choices=REASON_CHOICES, default='damaged')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', db_index=True)
    committee = models.TextField(blank=True, null=True, help_text='Thành viên Hội đồng thanh lý')
    total_copies = models.PositiveIntegerField(default=0)
    total_value = models.BigIntegerField(default=0, help_text='Tổng nguyên giá tài liệu thanh lý (VND)')
    note = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='created_deaccession_batches')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_deaccession_batches')
    approved_at = models.DateTimeField(null=True, blank=True)

    # Căn cứ phê duyệt của Ban Giám hiệu / Hội đồng cấp Trường
    bgh_decision_number = models.CharField(max_length=100, blank=True, null=True, help_text='Số quyết định phê duyệt BGH (VD: 125/QĐ-ĐHGTVT-BGH)')
    bgh_decision_date = models.DateField(blank=True, null=True, help_text='Ngày ký QĐ phê duyệt BGH')
    bgh_approver_name = models.CharField(max_length=150, blank=True, null=True, help_text='Người ký duyệt BGH (VD: PGS.TS Nguyễn Xuân Phương - Hiệu trưởng)')
    disposal_method = models.CharField(max_length=100, blank=True, null=True, default='Tiêu hủy phân loại sinh học', help_text='Phương thức xử lý tài sản thanh lý')
    approval_note = models.TextField(blank=True, null=True, help_text='Ý kiến / Căn cứ phê duyệt của BGH')

    class Meta:
        db_table = 'deaccession_batches'
        verbose_name = 'Biên bản Thanh lý Sách'
        verbose_name_plural = 'Biên bản Thanh lý Sách'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} - {self.decision_number} ({self.get_status_display()})"

class Copy(BaseModel):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='copies')
    deaccession_batch = models.ForeignKey(
        DeaccessionBatch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='copies'
    )
    barcode = models.CharField(max_length=50, unique=True, db_index=True)
    shelf_location = models.CharField(max_length=100, default='Kệ 01', help_text='Vị trí kệ')
    status = models.CharField(
        max_length=20,
        choices=CopyStatus.choices,
        default=CopyStatus.AVAILABLE,
        db_index=True
    )
    reading_room_only = models.BooleanField(default=False, help_text='Chỉ đọc tại chỗ, không mượn về')
    held_for_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='held_copies'
    )
    hold_expires_at = models.DateTimeField(null=True, blank=True)
    acquired_date = models.DateField(auto_now_add=True)
    purchase_price = models.BigIntegerField(blank=True, null=True)
    source = models.CharField(max_length=100, default='Trường cấp')
    supplier = models.CharField(max_length=255, blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    version = models.PositiveIntegerField(default=1, help_text='Khóa lạc quan')
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'copies'
        verbose_name = 'Bản sao sách'
        verbose_name_plural = 'Bản sao sách'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['barcode']),
            models.Index(fields=['held_for_user']),
            models.Index(fields=['deaccession_batch']),
        ]

    def __str__(self):
        return f"{self.barcode} ({self.book.title})"


class DigitalResource(BaseModel):
    ACCESS_LEVEL_CHOICES = [
        ('all_active', 'Tất cả bạn đọc có thẻ hợp lệ'),
        ('students_only', 'Chỉ Sinh viên chính khóa'),
        ('lecturers_only', 'Chỉ Giảng viên & Nghiên cứu sinh'),
    ]

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='digital_resources')
    title = models.CharField(max_length=255, help_text="Tên tài liệu số (VD: Giáo trình chính thức PDF)")
    file = models.FileField(upload_to='digital_resources/%Y/%m/', help_text="Tập tin PDF tài liệu số")
    file_size_bytes = models.BigIntegerField(default=0)
    page_count = models.PositiveIntegerField(default=0)
    allow_download = models.BooleanField(default=False, help_text="Cho phép tải về hoặc chỉ đọc bảo mật trực tuyến")
    access_level = models.CharField(max_length=30, choices=ACCESS_LEVEL_CHOICES, default='all_active')
    view_count = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='uploaded_digital_resources')

    class Meta:
        db_table = 'digital_resources'
        verbose_name = 'Tài liệu / Giáo trình Số'
        verbose_name_plural = 'Tài liệu / Giáo trình Số'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.book.title}"


class ReadingSession(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reading_sessions')
    digital_resource = models.ForeignKey(DigitalResource, on_delete=models.CASCADE, related_name='sessions')
    current_page = models.PositiveIntegerField(default=1)
    max_page_reached = models.PositiveIntegerField(default=1)
    total_seconds_spent = models.PositiveIntegerField(default=0)
    last_accessed = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reading_sessions'
        verbose_name = 'Phiên đọc sách số'
        verbose_name_plural = 'Phiên đọc sách số'
        unique_together = ('user', 'digital_resource')
        ordering = ['-last_accessed']

    def __str__(self):
        return f"{self.user.username} - {self.digital_resource.title} (Trang {self.current_page})"

