from rest_framework import serializers
from .models import SystemConfig, Policy, Holiday

class PublicSystemConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemConfig
        fields = [
            'library_name', 'address', 'hotline', 'email',
            'opening_hours', 'logo', 'favicon', 'reminder_days',
            'hold_days_default',
        ]
        
    hold_days_default = serializers.SerializerMethodField()

    def get_hold_days_default(self, obj):
        return 3

class AdminSystemConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemConfig
        fields = '__all__'

class PolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = Policy
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = '__all__'

