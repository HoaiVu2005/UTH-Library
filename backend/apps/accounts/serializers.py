from rest_framework import serializers
from .models import User

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
