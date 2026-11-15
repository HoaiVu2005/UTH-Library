from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.accounts.permissions import IsAdminUserRole
from .models import AuditLog
from .serializers import AuditLogSerializer

class AuditLogListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        queryset = AuditLog.objects.select_related('user').all()

        action = request.query_params.get('action')
        if action:
            queryset = queryset.filter(action=action)

        user_id = request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        entity_type = request.query_params.get('entity_type')
        if entity_type:
            queryset = queryset.filter(entity_type=entity_type)

        from_date = request.query_params.get('from_date')
        if from_date:
            queryset = queryset.filter(created_at__date__gte=from_date)

        to_date = request.query_params.get('to_date')
        if to_date:
            queryset = queryset.filter(created_at__date__lte=to_date)

        paginator = request.versioning_scheme if hasattr(request, 'versioning_scheme') else None
        page = request.query_params.get('page', 1)
        
        from apps.core.pagination import StandardPagination
        pagination = StandardPagination()
        page_records = pagination.paginate_queryset(queryset, request)
        serializer = AuditLogSerializer(page_records, many=True)
        return pagination.get_paginated_response(serializer.data)

