from django.db import connection
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.accounts.permissions import IsAdminUserRole
from apps.audit.services import log_action
from apps.core.exceptions import BusinessLogicError
from .models import SystemConfig, Policy, Holiday
from .serializers import (
    PublicSystemConfigSerializer,
    AdminSystemConfigSerializer,
    PolicySerializer,
    HolidaySerializer,
)

class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        db_status = 'connected'
        db_error = None
        try:
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1;')
                cursor.fetchone()
        except Exception as e:
            db_status = 'disconnected'
            db_error = str(e)

        data = {
            'status': 'ok' if db_status == 'connected' else 'error',
            'database': db_status,
            'timestamp': timezone.now().isoformat(),
        }
        if db_error:
            data['error'] = db_error
            return Response(data, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response(data, status=status.HTTP_200_OK)

class PublicSystemConfigView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        config = SystemConfig.get_solo()
        serializer = PublicSystemConfigSerializer(config)
        return Response({'data': serializer.data}, status=status.HTTP_200_OK)

class AdminSystemConfigView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        config = SystemConfig.get_solo()
        serializer = AdminSystemConfigSerializer(config)
        return Response({'data': serializer.data}, status=status.HTTP_200_OK)

    def put(self, request):
        config = SystemConfig.get_solo()
        serializer = AdminSystemConfigSerializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        log_action(
            user=request.user,
            action='UPDATE_SYSTEM_CONFIG',
            entity_type='SystemConfig',
            entity_id=config.id,
            detail=serializer.validated_data,
            request=request
        )

        return Response({'data': serializer.data}, status=status.HTTP_200_OK)

class PolicyListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        # Current active policies
        policies = Policy.objects.filter(is_current=True)
        serializer = PolicySerializer(policies, many=True)
        return Response({'data': serializer.data}, status=status.HTTP_200_OK)

class PolicyUpdateView(APIView):
    permission_classes = [IsAdminUserRole]

    def put(self, request, role):
        # Policy is APPEND-ONLY to ensure historical snapshots can always be traced (BR21)
        old_policy = Policy.objects.filter(role=role, is_current=True).first()
        serializer = PolicySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated = serializer.validated_data
        validated['role'] = role
        validated['is_current'] = True

        # Deactivate old policy
        if old_policy:
            old_policy.is_current = False
            old_policy.save(update_fields=['is_current'])

        new_policy = Policy.objects.create(**validated)

        log_action(
            user=request.user,
            action='UPDATE_POLICY',
            entity_type='Policy',
            entity_id=new_policy.id,
            detail={'role': role, 'old_id': old_policy.id if old_policy else None},
            request=request
        )

        return Response({'data': PolicySerializer(new_policy).data}, status=status.HTTP_200_OK)

class HolidayListView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUserRole()]

    def get(self, request):
        holidays = Holiday.objects.all()
        serializer = HolidaySerializer(holidays, many=True)
        return Response({'data': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = HolidaySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'data': serializer.data}, status=status.HTTP_201_CREATED)

