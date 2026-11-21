from django.utils import timezone
from django.db.models import Q, Count, Exists, OuterRef
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.accounts.permissions import IsAdminUserRole, IsAdminOnlyRole
from apps.accounts.models import User
from apps.core.pagination import StandardPagination
from apps.core.enums import SuggestionStatus, CampaignStatus, NotificationType, NotificationChannel, UserRole
from apps.notifications.models import Notification
from apps.audit.services import log_action
from .models import Suggestion, SuggestionCampaign, SuggestionVote
from .serializers import (
    SuggestionCampaignSerializer,
    CreateCampaignSerializer,
    SuggestionSerializer,
    CommunitySuggestionSerializer,
    CreateSuggestionSerializer,
    ReviewSuggestionSerializer,
)


def auto_close_expired_campaigns():
    """
    Tự động cập nhật trạng thái các đợt khảo sát đã quá ngày kết thúc sang CLOSED.
    Đảm bảo khi hết hạn, hệ thống tự động khóa mà không cần thủ thư phải trực bấm nút.
    """
    today = timezone.localdate()
    SuggestionCampaign.objects.filter(
        status=CampaignStatus.OPEN,
        end_date__lt=today
    ).update(status=CampaignStatus.CLOSED)


class ActiveCampaignView(APIView):
    """
    Lấy thông tin đợt khảo sát đề xuất sách đang mở hiện tại
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        auto_close_expired_campaigns()
        today = timezone.localdate()
        active_campaign = SuggestionCampaign.objects.filter(
            status=CampaignStatus.OPEN,
            start_date__lte=today,
            end_date__gte=today
        ).order_by('-start_date').first()

        if active_campaign:
            serializer = SuggestionCampaignSerializer(active_campaign, context={'request': request})
            return Response({
                'has_active_campaign': True,
                'campaign': serializer.data
            })

        # Nếu không có đợt mở, tìm đợt gần nhất (đã đóng hoặc sắp mở) để bạn đọc tham khảo
        recent_campaign = SuggestionCampaign.objects.order_by('-created_at').first()
        recent_data = SuggestionCampaignSerializer(recent_campaign, context={'request': request}).data if recent_campaign else None

        return Response({
            'has_active_campaign': False,
            'campaign': None,
            'recent_campaign': recent_data
        })


class CampaignListView(APIView):
    """
    Danh sách các đợt khảo sát (Bạn đọc xem được, Thủ thư/Admin tạo đợt mới)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        auto_close_expired_campaigns()
        queryset = SuggestionCampaign.objects.all().order_by('-start_date', '-created_at')
        status_param = request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        paginator = StandardPagination()
        page_records = paginator.paginate_queryset(queryset, request)
        serializer = SuggestionCampaignSerializer(page_records, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        # Chỉ Thủ thư hoặc Admin mới được tạo đợt mới
        if request.user.role not in (UserRole.ADMIN, UserRole.LIBRARIAN) and not request.user.is_staff:
            return Response({'detail': 'Bạn không có quyền tạo đợt khảo sát đề xuất sách.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = CreateCampaignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        campaign = SuggestionCampaign.objects.create(
            title=serializer.validated_data['title'],
            description=serializer.validated_data.get('description', ''),
            start_date=serializer.validated_data['start_date'],
            end_date=serializer.validated_data['end_date'],
            status=serializer.validated_data.get('status', CampaignStatus.OPEN),
            target_audience=serializer.validated_data.get('target_audience', 'Toàn trường UTH'),
            created_by=request.user
        )

        log_action(
            user=request.user,
            action='CAMPAIGN_CREATE',
            entity_type='SuggestionCampaign',
            entity_id=campaign.id,
            detail={'title': campaign.title, 'start_date': str(campaign.start_date), 'end_date': str(campaign.end_date)},
            request=request
        )

        # Khi đợt đang mở, tự động gửi thông báo đến toàn thể sinh viên và giảng viên
        if campaign.status == CampaignStatus.OPEN:
            patrons = User.objects.filter(is_active=True, role__in=[UserRole.STUDENT, UserRole.LECTURER])
            notifications = [
                Notification(
                    user=p,
                    type=NotificationType.SUGGESTION_RESULT,
                    channel=NotificationChannel.IN_APP,
                    content=f"Thư viện UTH vừa mở {campaign.title}! Bạn đọc có thể gửi đề xuất giáo trình và bình chọn sách ngay bây giờ.",
                    link='/suggestions',
                    dedupe_key=f"camp_open_{campaign.id}_{p.id}"
                )
                for p in patrons
            ]
            Notification.objects.bulk_create(notifications, ignore_conflicts=True)

        return Response(SuggestionCampaignSerializer(campaign, context={'request': request}).data, status=status.HTTP_201_CREATED)


class CampaignDetailView(APIView):
    """
    Chi tiết, Cập nhật trạng thái đợt khảo sát
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        campaign = SuggestionCampaign.objects.filter(id=pk).first()
        if not campaign:
            return Response({'detail': 'Đợt khảo sát không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(SuggestionCampaignSerializer(campaign, context={'request': request}).data)

    def patch(self, request, pk):
        if request.user.role not in (UserRole.ADMIN, UserRole.LIBRARIAN) and not request.user.is_staff:
            return Response({'detail': 'Bạn không có quyền cập nhật đợt khảo sát.'}, status=status.HTTP_403_FORBIDDEN)

        campaign = SuggestionCampaign.objects.filter(id=pk).first()
        if not campaign:
            return Response({'detail': 'Đợt khảo sát không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        old_status = campaign.status
        for field in ['title', 'description', 'start_date', 'end_date', 'status', 'target_audience']:
            if field in request.data:
                setattr(campaign, field, request.data[field])

        campaign.save()

        # Nếu mở lại đợt khảo sát, gửi thông báo đến bạn đọc
        if campaign.status == CampaignStatus.OPEN and old_status != CampaignStatus.OPEN:
            patrons = User.objects.filter(is_active=True, role__in=[UserRole.STUDENT, UserRole.LECTURER])
            notifications = [
                Notification(
                    user=p,
                    type=NotificationType.SUGGESTION_RESULT,
                    channel=NotificationChannel.IN_APP,
                    content=f"Thư viện UTH vừa mở đợt khảo sát: '{campaign.title}'! Bạn đọc có thể gửi đề xuất giáo trình và bình chọn sách ngay bây giờ.",
                    link='/suggestions',
                    dedupe_key=f"camp_reopen_{campaign.id}_{p.id}"
                )
                for p in patrons
            ]
            Notification.objects.bulk_create(notifications, ignore_conflicts=True)

        log_action(
            user=request.user,
            action='CAMPAIGN_UPDATE',
            entity_type='SuggestionCampaign',
            entity_id=campaign.id,
            detail={'title': campaign.title, 'status': campaign.status},
            request=request
        )

        return Response(SuggestionCampaignSerializer(campaign, context={'request': request}).data)


class CommunitySuggestionListView(APIView):
    """
    Bảng nguyện vọng cộng đồng: Bạn đọc xem toàn bộ đề xuất trong đợt và bình chọn ủng hộ
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        auto_close_expired_campaigns()
        today = timezone.localdate()

        user_voted_subquery = SuggestionVote.objects.filter(
            suggestion=OuterRef('pk'),
            user=request.user
        )

        queryset = Suggestion.objects.select_related('user', 'campaign').annotate(
            annotated_votes_count=Count('votes', distinct=True),
            user_voted=Exists(user_voted_subquery)
        )

        campaign_id = request.query_params.get('campaign_id')
        if campaign_id:
            if campaign_id in ('active', 'current'):
                active_campaign = SuggestionCampaign.objects.filter(
                    status=CampaignStatus.OPEN,
                    start_date__lte=today,
                    end_date__gte=today
                ).order_by('-start_date').first()
                if active_campaign:
                    queryset = queryset.filter(campaign=active_campaign)
                else:
                    queryset = queryset.none()
            elif campaign_id == 'all':
                pass
            else:
                queryset = queryset.filter(campaign_id=campaign_id)
        else:
            # MẶC ĐỊNH: Chỉ hiển thị đề xuất thuộc đợt đang mở hiện tại!
            # Đề xuất của đợt cũ/đã đóng hoặc không gắn đợt sẽ bị ẩn khỏi bảng bình chọn cộng đồng.
            active_campaign = SuggestionCampaign.objects.filter(
                status=CampaignStatus.OPEN,
                start_date__lte=today,
                end_date__gte=today
            ).order_by('-start_date').first()
            if active_campaign:
                queryset = queryset.filter(campaign=active_campaign)
            else:
                queryset = queryset.none()

        department = request.query_params.get('department')
        if department:
            queryset = queryset.filter(
                Q(department__icontains=department) | Q(user__department__icontains=department)
            )

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(book_title__icontains=search) | Q(author__icontains=search)
            )

        status_param = request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        ordering = request.query_params.get('ordering', '-votes')
        if ordering in ('-votes', 'votes_desc'):
            queryset = queryset.order_by('-annotated_votes_count', '-created_at')
        elif ordering in ('votes', 'votes_asc'):
            queryset = queryset.order_by('annotated_votes_count', '-created_at')
        else:
            queryset = queryset.order_by('-created_at')

        paginator = StandardPagination()
        page_records = paginator.paginate_queryset(queryset, request)
        serializer = CommunitySuggestionSerializer(page_records, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


class VoteSuggestionView(APIView):
    """
    Bình chọn / Hủy bình chọn (Toggle Upvote) cho đề xuất sách
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        auto_close_expired_campaigns()
        suggestion = Suggestion.objects.filter(id=pk).first()
        if not suggestion:
            return Response({'detail': 'Đề xuất sách không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        # Kiểm tra nếu đề xuất gắn với một đợt khảo sát
        if suggestion.campaign:
            today = timezone.localdate()
            if suggestion.campaign.status != CampaignStatus.OPEN or today > suggestion.campaign.end_date:
                return Response({
                    'detail': f"Đợt khảo sát '{suggestion.campaign.title}' đã kết thúc nhận bình chọn."
                }, status=status.HTTP_400_BAD_REQUEST)

        # Toggle vote
        existing_vote = SuggestionVote.objects.filter(suggestion=suggestion, user=request.user).first()
        if existing_vote:
            existing_vote.delete()
            voted = False
            message = 'Đã hủy ủng hộ đề xuất sách.'
        else:
            SuggestionVote.objects.create(suggestion=suggestion, user=request.user)
            voted = True
            message = f"Đã ủng hộ đề xuất sách '{suggestion.book_title}'!"

        votes_count = suggestion.votes.count()

        log_action(
            user=request.user,
            action='SUGGESTION_VOTE' if voted else 'SUGGESTION_UNVOTE',
            entity_type='Suggestion',
            entity_id=suggestion.id,
            detail={'book_title': suggestion.book_title, 'voted': voted, 'total_votes': votes_count},
            request=request
        )

        return Response({
            'voted': voted,
            'votes_count': votes_count,
            'message': message
        }, status=status.HTTP_200_OK)


class MySuggestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        auto_close_expired_campaigns()
        user_voted_subquery = SuggestionVote.objects.filter(
            suggestion=OuterRef('pk'),
            user=request.user
        )

        queryset = Suggestion.objects.filter(user=request.user).select_related('campaign', 'reviewed_by').annotate(
            annotated_votes_count=Count('votes', distinct=True),
            user_voted=Exists(user_voted_subquery)
        ).order_by('-created_at')

        campaign_id = request.query_params.get('campaign_id')
        if campaign_id and campaign_id != 'all':
            queryset = queryset.filter(campaign_id=campaign_id)

        status_param = request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        today_param = request.query_params.get('today')
        date_preset = request.query_params.get('date_preset')
        date_exact = request.query_params.get('date')
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')

        now = timezone.now()
        if today_param in ('true', '1', 'True') or date_preset == 'today':
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            queryset = queryset.filter(created_at__gte=today_start)
        elif date_preset == 'week':
            week_ago = now - timezone.timedelta(days=7)
            queryset = queryset.filter(created_at__gte=week_ago)
        elif date_preset == 'month':
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            queryset = queryset.filter(created_at__gte=month_start)
        elif date_exact:
            queryset = queryset.filter(created_at__date=date_exact)
        else:
            if from_date:
                queryset = queryset.filter(created_at__date__gte=from_date)
            if to_date:
                queryset = queryset.filter(created_at__date__lte=to_date)

        paginator = StandardPagination()
        page_records = paginator.paginate_queryset(queryset, request)
        serializer = SuggestionSerializer(page_records, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        # 1. Tìm đợt khảo sát đang mở
        today = timezone.localdate()
        active_campaign = SuggestionCampaign.objects.filter(
            status=CampaignStatus.OPEN,
            start_date__lte=today,
            end_date__gte=today
        ).order_by('-start_date').first()

        # Nếu không có đợt nào đang mở, thông báo văn minh
        if not active_campaign and not request.data.get('bypass_campaign'):
            return Response({
                'detail': 'Hiện tại Thư viện UTH chưa mở đợt khảo sát đề xuất bổ sung học liệu mới. Vui lòng theo dõi thông báo đợt khảo sát của nhà trường.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Giới hạn tối đa 3 đề xuất đang chờ duyệt
        pending_count = Suggestion.objects.filter(user=request.user, status=SuggestionStatus.PENDING).count()
        if pending_count >= 3:
            return Response({
                'detail': 'Bạn đang có 3 đề xuất mua sách đang chờ duyệt (hạn mức tối đa). Vui lòng đợi thủ thư xử lý trước khi gửi thêm đề xuất mới.'
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = CreateSuggestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        book_title = serializer.validated_data['book_title'].strip()
        
        # 2. Kiểm tra sách đã có trong kho OPAC chưa
        from apps.catalog.models import Book
        if Book.objects.filter(title__iexact=book_title).exists():
            return Response({
                'detail': f"Sách '{book_title}' đã có sẵn trong kho Thư viện UTH, bạn đọc có thể tra cứu và mượn trực tiếp mà không cần gửi đề xuất."
            }, status=status.HTTP_400_BAD_REQUEST)

        # 3. Kiểm tra xem sách này đã được ai đề xuất trong đợt hiện tại chưa (Chống trùng lặp, gợi ý bấm Ủng hộ)
        existing_suggestion = None
        if active_campaign:
            existing_suggestion = Suggestion.objects.filter(
                campaign=active_campaign,
                book_title__iexact=book_title,
                status=SuggestionStatus.PENDING
            ).first()

        if existing_suggestion:
            return Response({
                'detail': f"Đầu sách '{book_title}' đã được một bạn đọc khác đề xuất trong đợt này rồi! Bạn vui lòng chuyển sang mục 'Bảng nguyện vọng cộng đồng' và bấm nút 'Ủng hộ (+1)' để tăng mức độ ưu tiên cho cuốn sách này nhé."
            }, status=status.HTTP_400_BAD_REQUEST)

        department = serializer.validated_data.get('department') or request.user.department or ''

        suggestion = Suggestion.objects.create(
            user=request.user,
            campaign=active_campaign,
            book_title=book_title,
            author=serializer.validated_data.get('author', ''),
            department=department,
            reason=serializer.validated_data['reason'],
            status=SuggestionStatus.PENDING,
        )

        # Mặc định người đề xuất tự động ủng hộ 1 vote cho sách của mình
        SuggestionVote.objects.get_or_create(suggestion=suggestion, user=request.user)

        log_action(
            user=request.user,
            action='SUGGESTION_CREATE',
            entity_type='Suggestion',
            entity_id=suggestion.id,
            detail={
                'book_title': suggestion.book_title,
                'author': suggestion.author,
                'campaign': active_campaign.title if active_campaign else None
            },
            request=request
        )

        # Gửi thông báo đến Admin và Thủ thư
        admins = User.objects.filter(
            Q(role=UserRole.ADMIN) | Q(is_staff=True),
            is_active=True
        )
        patron_name = request.user.full_name or request.user.username
        patron_card = f" ({request.user.card_code})" if request.user.card_code else ""
        campaign_info = f" [Đợt: {active_campaign.title}]" if active_campaign else ""
        content = f"Bạn đọc {patron_name}{patron_card} vừa gửi đề xuất sách mới: '{suggestion.book_title}'{campaign_info}."
        
        for admin_user in admins:
            Notification.objects.create(
                user=admin_user,
                type=NotificationType.SUGGESTION_RESULT,
                channel=NotificationChannel.IN_APP,
                content=content,
                link='/admin/suggestions',
                is_read=False,
                dedupe_key=f"sugg_new_{suggestion.id}_{admin_user.id}"
            )

        return Response(SuggestionSerializer(suggestion, context={'request': request}).data, status=status.HTTP_201_CREATED)


class AdminSuggestionListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        auto_close_expired_campaigns()
        queryset = Suggestion.objects.select_related('user', 'reviewed_by', 'campaign').annotate(
            annotated_votes_count=Count('votes', distinct=True)
        )

        status_param = request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        campaign_id = request.query_params.get('campaign_id')
        if campaign_id:
            queryset = queryset.filter(campaign_id=campaign_id)

        department = request.query_params.get('department')
        if department:
            queryset = queryset.filter(
                Q(department__icontains=department) | Q(user__department__icontains=department)
            )

        today_param = request.query_params.get('today')
        date_preset = request.query_params.get('date_preset')
        date_exact = request.query_params.get('date')
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')

        now = timezone.now()
        if today_param in ('true', '1', 'True') or date_preset == 'today':
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            queryset = queryset.filter(created_at__gte=today_start)
        elif date_preset == 'week':
            week_ago = now - timezone.timedelta(days=7)
            queryset = queryset.filter(created_at__gte=week_ago)
        elif date_preset == 'month':
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            queryset = queryset.filter(created_at__gte=month_start)
        elif date_exact:
            queryset = queryset.filter(created_at__date=date_exact)
        else:
            if from_date:
                queryset = queryset.filter(created_at__date__gte=from_date)
            if to_date:
                queryset = queryset.filter(created_at__date__lte=to_date)

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(book_title__icontains=search) | Q(author__icontains=search)
            )

        # Sắp xếp
        ordering = request.query_params.get('ordering', '-votes')
        if ordering in ('-votes', 'votes_desc'):
            queryset = queryset.order_by('-annotated_votes_count', '-created_at')
        elif ordering in ('votes', 'votes_asc'):
            queryset = queryset.order_by('annotated_votes_count', '-created_at')
        else:
            queryset = queryset.order_by('-created_at')

        paginator = StandardPagination()
        page_records = paginator.paginate_queryset(queryset, request)
        serializer = SuggestionSerializer(page_records, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


class ApproveSuggestionView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        suggestion = Suggestion.objects.filter(id=pk).first()
        if not suggestion:
            return Response({'detail': 'Đề xuất không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        # Phân tầng phê duyệt: Đề xuất giá từ 2.000.000đ hoặc từ 5 bản chuyển Trưởng thư viện / Admin duyệt
        price = request.data.get('price', 0) or getattr(suggestion, 'estimated_price', 0)
        quantity = request.data.get('quantity', 1) or getattr(suggestion, 'quantity', 1)
        try:
            price_val = int(price)
            qty_val = int(quantity)
        except (ValueError, TypeError):
            price_val = 0
            qty_val = 1

        if (price_val >= 2000000 or qty_val >= 5) and request.user.role != UserRole.ADMIN:
            return Response({
                'detail': 'Đề xuất có tổng kinh phí từ 2.000.000đ hoặc số lượng từ 5 bản trở lên, vượt hạn mức duyệt của Thủ thư. Bắt buộc phải do Trưởng thư viện / Quản trị viên phê duyệt.'
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = ReviewSuggestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        suggestion.status = SuggestionStatus.APPROVED
        suggestion.review_note = serializer.validated_data.get('review_note', '')
        suggestion.reviewed_by = request.user
        suggestion.reviewed_at = timezone.now()
        suggestion.save(update_fields=['status', 'review_note', 'reviewed_by', 'reviewed_at', 'updated_at'])

        # Thông báo cho người đề xuất chính
        Notification.objects.create(
            user=suggestion.user,
            type=NotificationType.SUGGESTION_RESULT,
            channel=NotificationChannel.IN_APP,
            content=f"Đề xuất sách '{suggestion.book_title}' của bạn đã được Thư viện phê duyệt mua sắm! {suggestion.review_note}".strip(),
            link='/suggestions'
        )

        # Thông báo cho các bạn đọc đã bấm Ủng hộ
        voter_ids = SuggestionVote.objects.filter(suggestion=suggestion).exclude(user=suggestion.user).values_list('user_id', flat=True)
        for v_id in voter_ids:
            Notification.objects.create(
                user_id=v_id,
                type=NotificationType.SUGGESTION_RESULT,
                channel=NotificationChannel.IN_APP,
                content=f"Đầu sách '{suggestion.book_title}' mà bạn cùng ủng hộ đã được Thư viện phê duyệt mua sắm!",
                link='/suggestions'
            )

        # Mark pending admin notifications as read
        Notification.objects.filter(
            dedupe_key__startswith=f"sugg_new_{suggestion.id}_"
        ).update(is_read=True)

        log_action(
            user=request.user,
            action='SUGGESTION_APPROVE',
            entity_type='Suggestion',
            entity_id=suggestion.id,
            detail={'book_title': suggestion.book_title, 'note': suggestion.review_note},
            request=request
        )

        return Response(SuggestionSerializer(suggestion, context={'request': request}).data, status=status.HTTP_200_OK)


class RejectSuggestionView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        suggestion = Suggestion.objects.filter(id=pk).first()
        if not suggestion:
            return Response({'detail': 'Đề xuất không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        price = request.data.get('price', 0) or getattr(suggestion, 'estimated_price', 0)
        quantity = request.data.get('quantity', 1) or getattr(suggestion, 'quantity', 1)
        try:
            price_val = int(price)
            qty_val = int(quantity)
        except (ValueError, TypeError):
            price_val = 0
            qty_val = 1

        if (price_val >= 2000000 or qty_val >= 5) and request.user.role != UserRole.ADMIN:
            return Response({
                'detail': 'Đề xuất có tổng kinh phí từ 2.000.000đ hoặc số lượng từ 5 bản trở lên, vượt hạn mức duyệt của Thủ thư. Bắt buộc phải do Trưởng thư viện / Quản trị viên phê duyệt.'
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = ReviewSuggestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        note = serializer.validated_data.get('review_note', '').strip()
        if not note:
            return Response({'detail': 'Vui lòng cung cấp lý do từ chối đề xuất mua sách (bắt buộc).'}, status=status.HTTP_400_BAD_REQUEST)

        suggestion.status = SuggestionStatus.REJECTED
        suggestion.review_note = note
        suggestion.reviewed_by = request.user
        suggestion.reviewed_at = timezone.now()
        suggestion.save(update_fields=['status', 'review_note', 'reviewed_by', 'reviewed_at', 'updated_at'])

        Notification.objects.create(
            user=suggestion.user,
            type=NotificationType.SUGGESTION_RESULT,
            channel=NotificationChannel.IN_APP,
            content=f"Đề xuất sách '{suggestion.book_title}' của bạn chưa được duyệt trong đợt này. Lý do: {suggestion.review_note}".strip(),
            link='/suggestions'
        )

        Notification.objects.filter(
            dedupe_key__startswith=f"sugg_new_{suggestion.id}_"
        ).update(is_read=True)

        log_action(
            user=request.user,
            action='SUGGESTION_REJECT',
            entity_type='Suggestion',
            entity_id=suggestion.id,
            detail={'book_title': suggestion.book_title, 'note': suggestion.review_note},
            request=request
        )

        return Response(SuggestionSerializer(suggestion, context={'request': request}).data, status=status.HTTP_200_OK)


class ReceiveSuggestionView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        suggestion = Suggestion.objects.filter(id=pk).first()
        if not suggestion:
            return Response({'detail': 'Đề xuất không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        suggestion.status = SuggestionStatus.RECEIVED
        suggestion.received_at = timezone.now()
        suggestion.save(update_fields=['status', 'received_at', 'updated_at'])

        # Thông báo cho người đề xuất
        Notification.objects.create(
            user=suggestion.user,
            type=NotificationType.SUGGESTION_RESULT,
            channel=NotificationChannel.IN_APP,
            content=f"Sách bạn đề xuất '{suggestion.book_title}' đã được nhập về kho Thư viện UTH! Bạn có thể đến mượn ngay.",
            link='/books'
        )

        # Thông báo cho người đã cùng ủng hộ
        voter_ids = SuggestionVote.objects.filter(suggestion=suggestion).exclude(user=suggestion.user).values_list('user_id', flat=True)
        for v_id in voter_ids:
            Notification.objects.create(
                user_id=v_id,
                type=NotificationType.SUGGESTION_RESULT,
                channel=NotificationChannel.IN_APP,
                content=f"Đầu sách '{suggestion.book_title}' mà bạn cùng ủng hộ đã được nhập về kho Thư viện UTH!",
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

        return Response(SuggestionSerializer(suggestion, context={'request': request}).data, status=status.HTTP_200_OK)
