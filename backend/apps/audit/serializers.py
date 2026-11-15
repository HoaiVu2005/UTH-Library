from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True, default='Hệ thống')
    full_name = serializers.CharField(source='user.full_name', read_only=True, default='Hệ thống')

    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'username', 'full_name', 'action',
            'entity_type', 'entity_id', 'detail', 'ip_address',
            'user_agent', 'created_at',
        ]
        read_only_fields = fields

