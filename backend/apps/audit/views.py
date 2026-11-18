from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.accounts.permissions import IsAdminOnlyRole
from .models import AuditLog
from .serializers import AuditLogSerializer

class AuditLogListView(APIView):
    permission_classes = [IsAdminOnlyRole]

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

        date_preset = request.query_params.get('date_preset')
        date_exact = request.query_params.get('date')
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')

        now = timezone.now()
        today = now.date()
        if date_preset == 'today' or request.query_params.get('today') in ('true', '1', 'True'):
            queryset = queryset.filter(created_at__date=today)
        elif date_preset == 'week':
            week_ago = today - timezone.timedelta(days=7)
            queryset = queryset.filter(created_at__date__gte=week_ago)
        elif date_preset == 'month':
            month_start = today.replace(day=1)
            queryset = queryset.filter(created_at__date__gte=month_start)
        elif date_exact:
            queryset = queryset.filter(created_at__date=date_exact)
        else:
            if from_date:
                queryset = queryset.filter(created_at__date__gte=from_date)
            if to_date:
                queryset = queryset.filter(created_at__date__lte=to_date)

        paginator = request.versioning_scheme if hasattr(request, 'versioning_scheme') else None
        page = request.query_params.get('page', 1)
        
        from apps.core.pagination import StandardPagination
        pagination = StandardPagination()
        page_records = pagination.paginate_queryset(queryset, request)
        serializer = AuditLogSerializer(page_records, many=True)
        return pagination.get_paginated_response(serializer.data)

