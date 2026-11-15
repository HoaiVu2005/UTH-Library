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

class Copy(BaseModel):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='copies')
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
        ]

    def __str__(self):
        return f"{self.barcode} ({self.book.title})"

