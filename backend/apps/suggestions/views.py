from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.accounts.permissions import IsAdminUserRole
from apps.core.pagination import StandardPagination
from apps.core.enums import SuggestionStatus, NotificationType, NotificationChannel
from apps.notifications.models import Notification
from apps.audit.services import log_action
from .models import Suggestion
from .serializers import (
    SuggestionSerializer,
    CreateSuggestionSerializer,
    ReviewSuggestionSerializer,
)

class MySuggestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Suggestion.objects.filter(user=request.user).order_by('-created_at')
        status_param = request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        paginator = StandardPagination()
        page_records = paginator.paginate_queryset(queryset, request)
        serializer = SuggestionSerializer(page_records, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = CreateSuggestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        suggestion = Suggestion.objects.create(
            user=request.user,
            book_title=serializer.validated_data['book_title'],
            author=serializer.validated_data.get('author', ''),
            reason=serializer.validated_data['reason'],
            status=SuggestionStatus.PENDING,
        )

        log_action(
            user=request.user,
            action='SUGGESTION_CREATE',
            entity_type='Suggestion',
            entity_id=suggestion.id,
            detail={'book_title': suggestion.book_title, 'author': suggestion.author},
            request=request
        )

        return Response(SuggestionSerializer(suggestion).data, status=status.HTTP_201_CREATED)


class AdminSuggestionListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        queryset = Suggestion.objects.select_related('user', 'reviewed_by').order_by('-created_at')
        status_param = request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(book_title__icontains=search)

        paginator = StandardPagination()
        page_records = paginator.paginate_queryset(queryset, request)
        serializer = SuggestionSerializer(page_records, many=True)
        return paginator.get_paginated_response(serializer.data)


class ApproveSuggestionView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        suggestion = Suggestion.objects.filter(id=pk).first()
        if not suggestion:
            return Response({'detail': 'Đề xuất không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReviewSuggestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        suggestion.status = SuggestionStatus.APPROVED
        suggestion.review_note = serializer.validated_data.get('review_note', '')
        suggestion.reviewed_by = request.user
        suggestion.reviewed_at = timezone.now()
        suggestion.save(update_fields=['status', 'review_note', 'reviewed_by', 'reviewed_at', 'updated_at'])

        Notification.objects.create(
            user=suggestion.user,
            type=NotificationType.SUGGESTION_RESULT,
            channel=NotificationChannel.IN_APP,
            content=f"Đề xuất sách '{suggestion.book_title}' của bạn đã được duyệt. {suggestion.review_note}".strip(),
            link='/suggestions'
        )

        log_action(
            user=request.user,
            action='SUGGESTION_APPROVE',
            entity_type='Suggestion',
            entity_id=suggestion.id,
            detail={'book_title': suggestion.book_title, 'note': suggestion.review_note},
            request=request
        )

        return Response(SuggestionSerializer(suggestion).data, status=status.HTTP_200_OK)


class RejectSuggestionView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        suggestion = Suggestion.objects.filter(id=pk).first()
        if not suggestion:
            return Response({'detail': 'Đề xuất không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReviewSuggestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        suggestion.status = SuggestionStatus.REJECTED
        suggestion.review_note = serializer.validated_data.get('review_note', '')
        suggestion.reviewed_by = request.user
        suggestion.reviewed_at = timezone.now()
        suggestion.save(update_fields=['status', 'review_note', 'reviewed_by', 'reviewed_at', 'updated_at'])

        Notification.objects.create(
            user=suggestion.user,
            type=NotificationType.SUGGESTION_RESULT,
            channel=NotificationChannel.IN_APP,
            content=f"Đề xuất sách '{suggestion.book_title}' của bạn đã bị từ chối. Lý do: {suggestion.review_note}".strip(),
            link='/suggestions'
        )

        log_action(
            user=request.user,
            action='SUGGESTION_REJECT',
            entity_type='Suggestion',
            entity_id=suggestion.id,
            detail={'book_title': suggestion.book_title, 'note': suggestion.review_note},
            request=request
        )

        return Response(SuggestionSerializer(suggestion).data, status=status.HTTP_200_OK)


class ReceiveSuggestionView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        suggestion = Suggestion.objects.filter(id=pk).first()
        if not suggestion:
            return Response({'detail': 'Đề xuất không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        suggestion.status = SuggestionStatus.RECEIVED
        suggestion.received_at = timezone.now()
        suggestion.save(update_fields=['status', 'received_at', 'updated_at'])

        Notification.objects.create(
            user=suggestion.user,
            type=NotificationType.SUGGESTION_RESULT,
            channel=NotificationChannel.IN_APP,
            content=f"Sách bạn đề xuất '{suggestion.book_title}' đã được nhập về thư viện UTH!",
            link='/books'
        )

        log_action(
            user=request.user,
            action='SUGGESTION_RECEIVE',
            entity_type='Suggestion',
            entity_id=suggestion.id,
            detail={'book_title': suggestion.book_title},
            request=request
        )

        return Response(SuggestionSerializer(suggestion).data, status=status.HTTP_200_OK)
