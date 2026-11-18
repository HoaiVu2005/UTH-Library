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
            'reservation_locked_until', 'must_change_password',
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
            'is_card_valid', 'is_currently_locked', 'reservation_locked_until',
            'must_change_password', 'created_at',
        ]
        read_only_fields = [
            'id', 'username', 'role', 'card_code', 'department',
            'card_expiry', 'is_locked', 'lock_reason', 'locked_until',
            'is_card_valid', 'is_currently_locked', 'reservation_locked_until',
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

    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'email', 'phone', 'avatar',
            'dob', 'address', 'role', 'card_code', 'department',
            'card_expiry', 'is_locked', 'lock_reason', 'locked_until',
            'is_card_valid', 'is_currently_locked', 'reservation_locked_until',
            'must_change_password', 'created_at', 'deleted_at',
            'active_loans_count', 'unpaid_fines_count', 'reservations_count',
        ]
        read_only_fields = ['id', 'created_at', 'deleted_at']

class UserCreateAdminSerializer(serializers.ModelSerializer):
    password = serializers.CharField(required=True, write_only=True, min_length=8)
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
    card_code = serializers.CharField(source='user.card_code', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = StudentRoster
        fields = [
            'id', 'student_code', 'full_name', 'department', 'major', 'class_name',
            'email', 'phone', 'academic_year', 'status', 'status_display',
            'is_card_issued', 'card_code', 'user_id', 'created_at',
        ]

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
