from django.db import models
from .enums import UserRole

class BaseModel(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class SystemConfig(BaseModel):
    library_name = models.CharField(max_length=255, default='Thư viện UTH - Đại học Giao thông vận tải TP.HCM')
    address = models.CharField(max_length=500, default='Số 2, Đường Võ Oanh, Phường 25, Quận Bình Thạnh, TP.HCM')
    hotline = models.CharField(max_length=50, default='(028) 3899 1373')
    email = models.EmailField(default='library@uth.edu.vn')
    opening_hours = models.JSONField(default=dict, blank=True)
    logo = models.CharField(max_length=500, blank=True, null=True)
    favicon = models.CharField(max_length=500, blank=True, null=True)

    # Business Rules Configurations
    overdue_grace_days = models.IntegerField(default=0, help_text='Số ngày ân hạn trước khi tính phạt')
    overdue_lost_days = models.IntegerField(default=30, help_text='Số ngày quá hạn tự động chuyển thành sách mất')
    reminder_days = models.IntegerField(default=2, help_text='Số ngày nhắc hạn trước khi đến hạn trả')
    card_expiring_days = models.IntegerField(default=30, help_text='Số ngày thông báo thẻ sắp hết hạn')
    
    # No-show Policy
    noshow_limit = models.IntegerField(default=3, help_text='Giới hạn số lần no-show trước khi bị khóa')
    noshow_window_days = models.IntegerField(default=90, help_text='Cửa sổ ngày xét no-show (VD: 90 ngày)')
    noshow_lock_days = models.IntegerField(default=30, help_text='Thời gian khóa đặt trước (VD: 30 ngày)')

    # Upload and Session
    upload_max_size = models.BigIntegerField(default=5242880, help_text='Dung lượng upload tối đa (5MB)')
    session_idle_hours = models.IntegerField(default=8, help_text='Thời gian rảnh trước khi hết hạn phiên')
    login_max_attempts = models.IntegerField(default=5, help_text='Số lần đăng nhập sai liên tiếp trước khi khóa')
    login_lock_minutes = models.IntegerField(default=15, help_text='Thời gian khóa đăng nhập tạm thời (phút)')
    login_daily_max_attempts = models.IntegerField(default=10, help_text='Số lần đăng nhập sai trong 24h trước khi khóa 24h')

    def save(self, *args, **kwargs):
        # Enforce singleton pattern (single row with id=1)
        self.id = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_solo(cls):
        obj, created = cls.objects.get_or_create(id=1)
        return obj

    def __str__(self):
        return self.library_name

    class Meta:
        db_table = 'system_config'
        verbose_name = 'Cấu hình hệ thống'
        verbose_name_plural = 'Cấu hình hệ thống'

class Policy(BaseModel):
    role = models.CharField(max_length=20, choices=UserRole.choices)
    is_current = models.BooleanField(default=True, db_index=True)

    # Loan & Renewal rules
    max_loans = models.PositiveIntegerField(help_text='Số sách mượn tối đa')
    loan_days = models.PositiveIntegerField(help_text='Số ngày mượn một lần')
    renewal_limit = models.PositiveIntegerField(default=1, help_text='Số lần gia hạn tối đa')
    renewal_days = models.PositiveIntegerField(default=7, help_text='Số ngày cộng thêm mỗi lần gia hạn')
    fine_per_day = models.BigIntegerField(default=2000, help_text='Tiền phạt mỗi ngày quá hạn (VND)')
    
    # Reservation rules
    hold_days = models.PositiveIntegerField(default=3, help_text='Số ngày giữ sách sau khi ready')
    max_reservations_pending = models.PositiveIntegerField(default=3, help_text='Số lượng đặt trước pending tối đa')
    max_ready_reservations = models.PositiveIntegerField(default=3, help_text='Số lượng ready tối đa')

    # Damage compensation percentages
    damage_light_pct = models.PositiveIntegerField(default=20, help_text='% bồi thường hỏng nhẹ')
    damage_medium_pct = models.PositiveIntegerField(default=50, help_text='% bồi thường hỏng vừa')
    damage_heavy_pct = models.PositiveIntegerField(default=80, help_text='% bồi thường hỏng nặng')

    # Reading Room rules [P1]
    reading_room_hours = models.PositiveIntegerField(default=2)
    reading_room_grace_minutes = models.PositiveIntegerField(default=30)
    reading_room_overstay_lock_days = models.PositiveIntegerField(default=7)
    reading_room_max_per_day = models.PositiveIntegerField(default=2)

    class Meta:
        db_table = 'policies'
        verbose_name = 'Chính sách mượn trả'
        verbose_name_plural = 'Chính sách mượn trả'
        ordering = ['-created_at']

    def __str__(self):
        return f"Policy {self.role} (Current: {self.is_current})"

class Holiday(BaseModel):
    date = models.DateField(unique=True)
    name = models.CharField(max_length=255)
    repeat_annually = models.BooleanField(default=False)

    class Meta:
        db_table = 'holidays'
        verbose_name = 'Ngày nghỉ lễ'
        verbose_name_plural = 'Ngày nghỉ lễ'
        ordering = ['date']

    def __str__(self):
        return f"{self.date} - {self.name}"

