from rest_framework import serializers
from .models import User, StudentRoster, StudentStatus, PaymentTransaction, PaymentMethod, TransactionStatus, TransactionType

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True, trim_whitespace=True)
    password = serializers.CharField(required=True, write_only=True)

class UserSummarySerializer(serializers.ModelSerializer):
    is_card_valid = serializers.BooleanField(read_only=True)
    is_currently_locked = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'email', 'phone', 'avatar',
            'role', 'card_code', 'department', 'card_expiry',
            'is_locked', 'locked_until', 'is_card_valid', 'is_currently_locked',
            'borrow_override_until',
            'has_active_borrow_override', 'must_change_password',
        ]
        read_only_fields = fields

class UserProfileSerializer(serializers.ModelSerializer):
    is_card_valid = serializers.BooleanField(read_only=True)
    is_currently_locked = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'email', 'phone', 'avatar',
            'dob', 'address', 'role', 'card_code', 'department',
            'card_expiry', 'is_locked', 'lock_reason', 'locked_until',
            'is_card_valid', 'is_currently_locked',
            'borrow_override_until', 'has_active_borrow_override',
            'must_change_password', 'created_at',
        ]
        read_only_fields = [
            'id', 'username', 'role', 'card_code', 'department',
            'card_expiry', 'is_locked', 'lock_reason', 'locked_until',
            'is_card_valid', 'is_currently_locked',
            'borrow_override_until', 'has_active_borrow_override',
            'must_change_password', 'created_at',
        ]

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)

class ForgotPasswordSerializer(serializers.Serializer):
    email_or_username = serializers.CharField(required=True, trim_whitespace=True)

class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, write_only=True)



class UserAdminSerializer(serializers.ModelSerializer):
    is_card_valid = serializers.BooleanField(read_only=True)
    is_currently_locked = serializers.BooleanField(read_only=True)
    active_loans_count = serializers.IntegerField(read_only=True, default=0)
    unpaid_fines_count = serializers.IntegerField(read_only=True, default=0)
    reservations_count = serializers.IntegerField(read_only=True, default=0)
    major = serializers.SerializerMethodField()
    class_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'email', 'phone', 'avatar',
            'dob', 'address', 'role', 'card_code', 'department', 'major', 'class_name',
            'card_expiry', 'is_locked', 'lock_reason', 'locked_until',
            'is_card_valid', 'is_currently_locked',
            'borrow_override_until', 'borrow_override_reason',
            'has_active_borrow_override', 'must_change_password', 'created_at', 'deleted_at',
            'active_loans_count', 'unpaid_fines_count', 'reservations_count',
        ]
        read_only_fields = ['id', 'created_at', 'deleted_at', 'major', 'class_name']

    def get_major(self, obj):
        roster = getattr(obj, 'roster_entry', None)
        if roster and roster.major:
            return roster.major
        from apps.accounts.models import StudentRoster
        r = StudentRoster.objects.filter(student_code__iexact=obj.username).first()
        return r.major if r else None

    def get_class_name(self, obj):
        roster = getattr(obj, 'roster_entry', None)
        if roster and roster.class_name:
            return roster.class_name
        from apps.accounts.models import StudentRoster
        r = StudentRoster.objects.filter(student_code__iexact=obj.username).first()
        return r.class_name if r else None

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Đảm bảo avatar luôn đồng bộ với StudentRoster nếu avatar của User bị trống hoặc không hợp lệ
        raw_avatar = ret.get('avatar')
        is_valid = False
        if raw_avatar:
            v = str(raw_avatar).strip().lower()
            if v.startswith(('http://', 'https://', '/media/', 'data:image/')) or any(
                v.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg']
            ):
                is_valid = True

        if not is_valid:
            roster = getattr(instance, 'roster_entry', None)
            if roster and roster.avatar:
                ret['avatar'] = roster.avatar
            else:
                from apps.accounts.models import StudentRoster
                from django.db.models import Q
                r = StudentRoster.objects.filter(
                    Q(student_code__iexact=instance.card_code) | Q(student_code__iexact=instance.username)
                ).first()
                if r and r.avatar:
                    ret['avatar'] = r.avatar
        return ret

class UserCreateAdminSerializer(serializers.ModelSerializer):
    password = serializers.CharField(required=True, write_only=True)
    avatar = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = [
            'username', 'password', 'full_name', 'email', 'phone',
            'role', 'card_code', 'department', 'card_expiry', 'dob', 'address', 'avatar'
        ]

    def to_internal_value(self, data):
        # Allow multipart file or empty avatar without triggering CharField validation error
        if hasattr(data, 'copy'):
            data = data.copy()
        elif isinstance(data, dict):
            data = data.copy()
        if 'avatar' in data and not isinstance(data['avatar'], str):
            data.pop('avatar', None)
        return super().to_internal_value(data)

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class StudentRosterSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    card_code = serializers.SerializerMethodField()
    user_id = serializers.SerializerMethodField()
    is_card_issued = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = StudentRoster
        fields = [
            'id', 'student_code', 'full_name', 'department', 'major', 'class_name',
            'email', 'phone', 'academic_year', 'status', 'status_display',
            'is_card_issued', 'card_code', 'user_id', 'avatar', 'created_at',
        ]

    def get_is_card_issued(self, obj):
        if not obj.is_card_issued:
            return False
        if obj.user and obj.user.deleted_at is not None:
            return False
        return bool(obj.user or obj.is_card_issued)

    def get_card_code(self, obj):
        if obj.user and obj.user.deleted_at is None:
            return obj.user.card_code
        return None

    def get_user_id(self, obj):
        if obj.user and obj.user.deleted_at is None:
            return obj.user.id
        return None

    def get_avatar(self, obj):
        if obj.avatar:
            return obj.avatar
        if obj.user and obj.user.avatar:
            return obj.user.avatar
        return None

class PaymentTransactionSerializer(serializers.ModelSerializer):
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    collected_by_name = serializers.CharField(source='collected_by.full_name', read_only=True)
    card_code = serializers.CharField(source='user.card_code', read_only=True)
    department = serializers.CharField(source='user.department', read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = [
            'id', 'transaction_code', 'receipt_code', 'transaction_type', 'transaction_type_display',
            'user', 'student_code', 'payer_name', 'amount', 'payment_method', 'payment_method_display',
            'status', 'status_display', 'collected_by', 'collected_by_name', 'collected_at',
            'card_code', 'department', 'note', 'created_at',
        ]
