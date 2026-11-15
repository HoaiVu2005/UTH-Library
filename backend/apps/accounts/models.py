import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from apps.core.models import BaseModel
from apps.core.enums import UserRole, LockReason

class UserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('Tên đăng nhập không được để trống')
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', UserRole.STUDENT)
        user = self.model(username=username, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', UserRole.ADMIN)
        extra_fields.setdefault('card_code', f"ADMIN_{username.upper()}")
        return self.create_user(username, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=150, unique=True, db_index=True)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.CharField(max_length=500, blank=True, null=True)
    dob = models.DateField(blank=True, null=True, verbose_name='Ngày sinh')
    address = models.CharField(max_length=500, blank=True, null=True)
    
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.STUDENT, db_index=True)
    card_code = models.CharField(max_length=50, unique=True, db_index=True, verbose_name='Mã thẻ bạn đọc')
    department = models.CharField(max_length=255, blank=True, null=True, verbose_name='Khoa / Đơn vị')
    card_expiry = models.DateField(blank=True, null=True, verbose_name='Hạn thẻ')
    
    # Account status & Lockouts
    is_locked = models.BooleanField(default=False)
    lock_reason = models.CharField(max_length=30, choices=LockReason.choices, blank=True, null=True)
    locked_until = models.DateTimeField(blank=True, null=True)
    failed_login_count = models.PositiveIntegerField(default=0)
    last_failed_login_at = models.DateTimeField(blank=True, null=True)
    reservation_locked_until = models.DateTimeField(blank=True, null=True)
    password_changed_at = models.DateTimeField(default=timezone.now)
    must_change_password = models.BooleanField(default=False)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['full_name', 'card_code']

    class Meta:
        db_table = 'users'
        verbose_name = 'Người dùng'
        verbose_name_plural = 'Người dùng'
        indexes = [
            models.Index(fields=['role', 'is_active']),
            models.Index(fields=['card_code']),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.card_code})"

    @property
    def is_card_valid(self):
        if not self.card_expiry:
            return True
        return self.card_expiry >= timezone.localdate()

    @property
    def is_currently_locked(self):
        if self.is_locked:
            return True
        if self.locked_until and self.locked_until > timezone.now():
            return True
        return False

    @property
    def is_reservation_locked(self):
        if self.reservation_locked_until and self.reservation_locked_until > timezone.now():
            return True
        return False

class RefreshToken(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='refresh_tokens')
    token_hash = models.CharField(max_length=64, unique=True, db_index=True)
    family_id = models.UUIDField(default=uuid.uuid4, db_index=True)
    expires_at = models.DateTimeField()
    idle_expires_at = models.DateTimeField()
    last_used_at = models.DateTimeField(blank=True, null=True)
    revoked_at = models.DateTimeField(blank=True, null=True)
    user_agent = models.CharField(max_length=500, blank=True, null=True)
    ip = models.GenericIPAddressField(blank=True, null=True)

    class Meta:
        db_table = 'refresh_tokens'
        verbose_name = 'Refresh Token'
        verbose_name_plural = 'Refresh Tokens'
        indexes = [
            models.Index(fields=['family_id']),
            models.Index(fields=['token_hash']),
            models.Index(fields=['user', 'revoked_at']),
        ]

    @property
    def is_valid(self):
        now = timezone.now()
        if self.revoked_at is not None:
            return False
        if now > self.expires_at:
            return False
        if now > self.idle_expires_at:
            return False
        return True

class PasswordResetToken(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token_hash = models.CharField(max_length=64, unique=True, db_index=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'password_reset_tokens'
        verbose_name = 'Mã đặt lại mật khẩu'
        verbose_name_plural = 'Mã đặt lại mật khẩu'

