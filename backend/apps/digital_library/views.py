import os
import re
import uuid
import secrets
from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from django.http import FileResponse, Http404
from django.db.models import Count, Sum, Q, F
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.accounts.permissions import IsAdminUserRole, IsAdminOnlyRole
from apps.audit.services import log_action
from apps.core.pagination import StandardPagination
from .models import (
    DigitalDocument,
    DigitalDocumentVersion,
    DigitalReadingSession,
    ApprovalLog,
    DocumentType,
    DocumentStatus,
    AccessScope,
)
from .serializers import (
    DigitalDocumentListSerializer,
    DigitalDocumentDetailSerializer,
    DigitalDocumentCreateUpdateSerializer,
    DigitalDocumentVersionSerializer,
    DigitalReadingSessionSerializer,
    ApprovalLogSerializer,
)


def extract_pdf_page_count(file_path):
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
            matches = re.findall(rb'/Type\s*/Page\b', content)
            if matches:
                return len(matches)
    except Exception:
        pass
    return 1


def save_uploaded_cover_image(cover_file) -> str | None:
    if not cover_file:
        return None
    try:
        content_type = getattr(cover_file, 'content_type', '') or ''
        ext = 'jpg'
        if 'png' in content_type:
            ext = 'png'
        elif 'webp' in content_type:
            ext = 'webp'
        elif 'jpeg' in content_type or 'jpg' in content_type:
            ext = 'jpg'

        filename = f"cover_doc_{secrets.token_hex(8)}.{ext}"
        upload_dir = settings.MEDIA_ROOT / 'digital_covers'
        upload_dir.mkdir(parents=True, exist_ok=True)
        file_path = upload_dir / filename
        with open(file_path, 'wb+') as dest:
            for chunk in cover_file.chunks():
                dest.write(chunk)
        return f"{settings.MEDIA_URL}digital_covers/{filename}"
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning("Failed to save cover image: %s", e)
        return None


# ==============================================================================
# 1. TRA CỨU & DANH SÁCH TÀI LIỆU SỐ (PUBLIC & PATRON PORTAL)
# ==============================================================================

class DigitalDocumentListView(APIView):
    pagination_class = StandardPagination

    def get_permissions(self):
        return [AllowAny()]

    def get(self, request):
        user = request.user
        is_staff_admin = user.is_authenticated and getattr(user, 'role', '') in ['admin', 'librarian']

        qs = DigitalDocument.objects.all().select_related('created_by', 'catalog_book').prefetch_related('versions')

        # Bạn đọc thông thường chỉ xem tài liệu đã xuất bản (Published)
        status_param = request.query_params.get('status')
        if is_staff_admin and status_param:
            qs = qs.filter(status=status_param)
        elif not is_staff_admin:
            qs = qs.filter(status=DocumentStatus.PUBLISHED)

        # Bộ lọc tìm kiếm tổng hợp
        q = request.query_params.get('q', '').strip()
        if q:
            qs = qs.filter(
                Q(title__icontains=q) |
                Q(author_names__icontains=q) |
                Q(advisor_names__icontains=q) |
                Q(keywords__icontains=q) |
                Q(abstract__icontains=q) |
                Q(publisher__icontains=q)
            )

        # Lọc theo 10 loại tài liệu
        doc_type = request.query_params.get('document_type')
        if doc_type:
            qs = qs.filter(document_type=doc_type)

        # Lọc theo Khoa
        department = request.query_params.get('department')
        if department:
            qs = qs.filter(department__icontains=department)

        # Lọc theo Ngành
        major = request.query_params.get('major')
        if major:
            qs = qs.filter(major__icontains=major)

        # Lọc theo Năm
        year = request.query_params.get('year')
        if year and year.isdigit():
            qs = qs.filter(year=int(year))

        # Lọc theo Tác giả
        author = request.query_params.get('author')
        if author:
            qs = qs.filter(author_names__icontains=author)

        # Lọc theo Đầu sách in OPAC liên kết
        catalog_book_id = request.query_params.get('catalog_book_id') or request.query_params.get('book_id')
        if catalog_book_id and catalog_book_id.strip().isdigit():
            qs = qs.filter(catalog_book_id=int(catalog_book_id.strip()))

        # Sắp xếp
        ordering = request.query_params.get('ordering', '-created_at')
        if ordering in ['-created_at', 'created_at', '-total_views', 'total_views', '-year', 'year', 'title']:
            qs = qs.order_by(ordering)
        else:
            qs = qs.order_by('-created_at')

        paginator = self.pagination_class()
        paginated_qs = paginator.paginate_queryset(qs, request)
        serializer = DigitalDocumentListSerializer(paginated_qs, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


class DigitalDocumentDetailView(APIView):
    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAdminUserRole()]
        return [AllowAny()]

    def get(self, request, pk):
        try:
            doc = DigitalDocument.objects.select_related('created_by', 'approved_by', 'catalog_book').prefetch_related('versions', 'approval_logs').get(pk=pk)
        except DigitalDocument.DoesNotExist:
            return Response({'code': 'NOT_FOUND', 'detail': 'Không tìm thấy tài liệu số.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        is_staff_admin = user.is_authenticated and getattr(user, 'role', '') in ['admin', 'librarian']

        if not is_staff_admin and doc.status != DocumentStatus.PUBLISHED:
            return Response({'code': 'NOT_PUBLISHED', 'detail': 'Tài liệu chưa được phê duyệt xuất bản.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = DigitalDocumentDetailSerializer(doc, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        try:
            doc = DigitalDocument.objects.get(pk=pk)
        except DigitalDocument.DoesNotExist:
            return Response({'code': 'NOT_FOUND', 'detail': 'Không tìm thấy tài liệu số.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        doc_title = doc.title
        doc.delete()

        try:
            log_action(
                user=user,
                action="DELETE_DIGITAL_DOCUMENT",
                entity_type='DigitalDocument',
                entity_id=pk,
                detail={'title': doc_title},
                request=request
            )
        except Exception:
            pass

        return Response({'success': True, 'message': 'Đã xóa tài liệu số thành công.'}, status=status.HTTP_200_OK)


# ==============================================================================
# 2. QUẢN TRỊ & TIẾP NHẬN TÀI LIỆU (LIBRARIAN & ADMIN WORKFLOW)
# ==============================================================================

class DigitalDocumentCreateView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        try:
            # Build data dictionary safely without deepcopying file objects (_io.BufferedRandom)
            raw_post = getattr(request, '_request', request).POST if hasattr(request, '_request') else getattr(request, 'POST', {})
            source_data = raw_post if (raw_post and len(raw_post) > 0) else request.data
            data = {}
            for key in source_data:
                if key in ('file', 'cover_image'):
                    continue
                if key in ('allowed_departments', 'allowed_majors') and hasattr(source_data, 'getlist'):
                    data[key] = source_data.getlist(key)
                else:
                    data[key] = source_data.get(key)

            # Xử lý ảnh bìa nếu có upload tập tin hình ảnh
            cover_file = request.FILES.get('cover_image')
            if cover_file:
                cover_url = save_uploaded_cover_image(cover_file)
                if cover_url:
                    data['cover_image'] = cover_url
            elif isinstance(source_data.get('cover_image'), str) and source_data.get('cover_image').strip():
                data['cover_image'] = source_data.get('cover_image').strip()

            # Liên kết đầu sách in OPAC nếu có
            catalog_book_param = source_data.get('catalog_book') or source_data.get('catalog_book_id') or source_data.get('book_id')
            if catalog_book_param and str(catalog_book_param).strip().isdigit():
                data['catalog_book'] = int(str(catalog_book_param).strip())
                # Tự động kế thừa ảnh bìa từ đầu sách in OPAC nếu chưa có ảnh bìa riêng
                if not data.get('cover_image'):
                    try:
                        from apps.catalog.models import Book
                        cat_book = Book.objects.filter(pk=data['catalog_book']).first()
                        if cat_book and cat_book.cover_image:
                            data['cover_image'] = cat_book.cover_image
                    except Exception:
                        pass

            serializer = DigitalDocumentCreateUpdateSerializer(data=data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            pdf_file = request.FILES.get('file')
            if not pdf_file:
                return Response({'code': 'FILE_REQUIRED', 'detail': 'Vui lòng đính kèm tập tin PDF cho tài liệu số.'}, status=status.HTTP_400_BAD_REQUEST)

            source_license = (source_data.get('source_license') or '').strip()
            if not source_license:
                return Response({'code': 'LICENSE_REQUIRED', 'detail': 'Bắt buộc phải khai báo nguồn tài liệu và loại bản quyền (Nội bộ UTH / Giáo trình giảng viên / Tài liệu mở / Bản quyền bên thứ ba) khi đăng tải học liệu số.'}, status=status.HTTP_400_BAD_REQUEST)

            user = request.user
            auto_publish_raw = source_data.get('auto_publish', False)
            can_publish = getattr(user, 'role', '') in ('admin', 'librarian')

            # Theo quy định v2.1: Tài liệu bản quyền bên thứ ba do Thủ thư tải lên bắt buộc phải lưu nháp/chờ duyệt, chỉ Trưởng thư viện mới được xuất bản
            is_third_party = any(k in source_license.lower() for k in ['thứ ba', 'thu ba', 'third_party', 'third party', 'nxb ngoài', 'mua bản quyền'])
            if is_third_party and getattr(user, 'role', '') != 'admin':
                initial_status = DocumentStatus.PENDING_APPROVAL
                auto_publish = False
            else:
                auto_publish = str(auto_publish_raw).lower() in ('true', '1') and can_publish
                initial_status = DocumentStatus.PUBLISHED if auto_publish else DocumentStatus.DRAFT

            doc = serializer.save(
                created_by=user,
                status=initial_status,
                current_version_number=1,
                submitted_at=timezone.now() if initial_status == DocumentStatus.PENDING_APPROVAL else None,
                approved_by=user if initial_status == DocumentStatus.PUBLISHED else None,
                approved_at=timezone.now() if initial_status == DocumentStatus.PUBLISHED else None,
            )

            # Tạo phiên bản 1 (Version 1)
            version = DigitalDocumentVersion.objects.create(
                document=doc,
                version_number=1,
                file=pdf_file,
                file_size_bytes=pdf_file.size,
                change_log='Khởi tạo phiên bản đầu tiên của tài liệu',
                is_current=True,
                uploaded_by=user,
            )

            # Tự động trích xuất số trang an toàn
            try:
                if version.file and hasattr(version.file, 'path') and os.path.exists(version.file.path):
                    p_count = extract_pdf_page_count(version.file.path)
                    version.page_count = p_count
                    version.save(update_fields=['page_count'])
            except Exception:
                pass

            # Ghi nhật ký phê duyệt
            try:
                ApprovalLog.objects.create(
                    document=doc,
                    actor=user,
                    action='approve' if auto_publish else 'submit',
                    note='Quản trị viên xuất bản trực tiếp học liệu số' if auto_publish else 'Khởi tạo tài liệu trên hệ thống'
                )
            except Exception:
                pass

            try:
                log_action(
                    user=user,
                    action='CREATE_DIGITAL_DOCUMENT',
                    entity_type='DigitalDocument',
                    entity_id=doc.id,
                    detail={'document_type': doc.document_type, 'status': doc.status, 'auto_publish': auto_publish},
                    request=request
                )
            except Exception:
                pass

            detail_serializer = DigitalDocumentDetailSerializer(doc, context={'request': request})
            return Response(detail_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as exc:
            import logging
            logging.getLogger(__name__).exception("Error creating digital document: %s", exc)
            return Response({
                'code': 'CREATE_DOCUMENT_ERROR',
                'detail': f"Lỗi tạo tài liệu: {str(exc)}"
            }, status=status.HTTP_400_BAD_REQUEST)


class DigitalDocumentUpdateView(APIView):
    permission_classes = [IsAdminUserRole]

    def patch(self, request, pk):
        try:
            doc = DigitalDocument.objects.get(pk=pk)
        except DigitalDocument.DoesNotExist:
            return Response({'code': 'NOT_FOUND', 'detail': 'Không tìm thấy tài liệu số.'}, status=status.HTTP_404_NOT_FOUND)

        raw_post = getattr(request, '_request', request).POST if hasattr(request, '_request') else getattr(request, 'POST', {})
        source_data = raw_post if (raw_post and len(raw_post) > 0) else request.data
        data = {}
        for key in source_data:
            if key in ('file', 'cover_image'):
                continue
            if key in ('allowed_departments', 'allowed_majors') and hasattr(source_data, 'getlist'):
                data[key] = source_data.getlist(key)
            else:
                data[key] = source_data.get(key)

        cover_file = request.FILES.get('cover_image')
        if cover_file:
            cover_url = save_uploaded_cover_image(cover_file)
            if cover_url:
                data['cover_image'] = cover_url
        elif isinstance(source_data.get('cover_image'), str):
            data['cover_image'] = source_data.get('cover_image').strip()

        serializer = DigitalDocumentCreateUpdateSerializer(doc, data=data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Kiểm tra nếu có upload tập tin PDF mới -> Tạo version mới, KHÔNG ghi đè file cũ
        pdf_file = request.FILES.get('file')
        change_log = source_data.get('change_log', 'Cập nhật nội dung tài liệu')

        if pdf_file:
            new_version_num = doc.current_version_number + 1
            # Đánh dấu các version cũ không còn là current
            doc.versions.filter(is_current=True).update(is_current=False)

            new_version = DigitalDocumentVersion.objects.create(
                document=doc,
                version_number=new_version_num,
                file=pdf_file,
                file_size_bytes=pdf_file.size,
                change_log=change_log,
                is_current=True,
                uploaded_by=request.user,
            )
            if new_version.file and os.path.exists(new_version.file.path):
                p_count = extract_pdf_page_count(new_version.file.path)
                new_version.page_count = p_count
                new_version.save(update_fields=['page_count'])

            doc.current_version_number = new_version_num
            doc.save(update_fields=['current_version_number'])

        updated_doc = serializer.save()

        detail_serializer = DigitalDocumentDetailSerializer(updated_doc, context={'request': request})
        return Response(detail_serializer.data, status=status.HTTP_200_OK)


class DigitalDocumentWorkflowActionView(APIView):
    """
    Xử lý quy trình kiểm duyệt:
    - submit: Thủ thư gửi duyệt (Draft -> Pending)
    - approve: Admin phê duyệt xuất bản (Pending -> Published)
    - reject: Admin từ chối duyệt (Pending -> Rejected)
    - disable: Admin tạm ngưng phục vụ (Published -> Disabled)
    - archive: Admin lưu trữ lịch sử (Any -> Archived)
    - restore: Khôi phục lại
    """
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        try:
            doc = DigitalDocument.objects.get(pk=pk)
        except DigitalDocument.DoesNotExist:
            return Response({'code': 'NOT_FOUND', 'detail': 'Không tìm thấy tài liệu số.'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        note = request.data.get('note', '').strip()
        user = request.user
        is_admin = getattr(user, 'role', '') == 'admin'
        is_staff = getattr(user, 'role', '') in ('admin', 'librarian')

        if action == 'submit':
            doc.status = DocumentStatus.PENDING_APPROVAL
            doc.submitted_at = timezone.now()
            doc.save(update_fields=['status', 'submitted_at'])
            ApprovalLog.objects.create(document=doc, actor=user, action='submit', note=note or 'Gửi Admin kiểm duyệt xuất bản')

        elif action == 'approve':
            # Tài liệu bản quyền bên thứ 3 cần Admin phê duyệt; Tài liệu nội bộ UTH / OPAC thủ thư được duyệt trực tiếp
            is_third_party = any(k in (doc.source_license or '').lower() for k in ['thứ ba', 'thu ba', 'third_party', 'third party', 'nxb ngoài', 'mua bản quyền'])
            if is_third_party and not is_admin:
                return Response({'code': 'ADMIN_ONLY', 'detail': 'Chỉ Quản trị viên (Admin) mới có quyền phê duyệt xuất bản tài liệu bản quyền bên thứ ba.'}, status=status.HTTP_403_FORBIDDEN)
            doc.status = DocumentStatus.PUBLISHED
            doc.approved_by = user
            doc.approved_at = timezone.now()
            doc.rejection_reason = None
            doc.save(update_fields=['status', 'approved_by', 'approved_at', 'rejection_reason'])
            ApprovalLog.objects.create(document=doc, actor=user, action='approve', note=note or 'Phê duyệt xuất bản chính thức lên Thư viện số')

        elif action == 'reject':
            if not is_admin:
                return Response({'code': 'ADMIN_ONLY', 'detail': 'Chỉ Quản trị viên mới có quyền từ chối xuất bản.'}, status=status.HTTP_403_FORBIDDEN)
            if not note:
                return Response({'code': 'REASON_REQUIRED', 'detail': 'Vui lòng cung cấp lý do từ chối kiểm duyệt.'}, status=status.HTTP_400_BAD_REQUEST)
            doc.status = DocumentStatus.REJECTED
            doc.rejection_reason = note
            doc.save(update_fields=['status', 'rejection_reason'])
            ApprovalLog.objects.create(document=doc, actor=user, action='reject', note=note)

        elif action == 'disable':
            # Cả Quản trị viên và Thủ thư đều có quyền tạm ngưng phục vụ tài liệu
            doc.status = DocumentStatus.DISABLED
            doc.disable_reason = note or 'Tạm ngưng phục vụ theo yêu cầu quản lý'
            doc.save(update_fields=['status', 'disable_reason'])
            # Thu hồi các phiên đọc đang hoạt động
            doc.reading_sessions.filter(status='active').update(status='revoked')
            ApprovalLog.objects.create(document=doc, actor=user, action='disable', note=doc.disable_reason)

        elif action == 'archive':
            if not is_staff:
                return Response({'code': 'STAFF_ONLY', 'detail': 'Chỉ Thủ thư hoặc Quản trị viên mới có quyền lưu trữ tài liệu.'}, status=status.HTTP_403_FORBIDDEN)
            doc.status = DocumentStatus.ARCHIVED
            doc.save(update_fields=['status'])
            doc.reading_sessions.filter(status='active').update(status='revoked')
            ApprovalLog.objects.create(document=doc, actor=user, action='archive', note=note or 'Chuyển sang lưu trữ lịch sử')

        elif action == 'restore':
            if not is_staff:
                return Response({'code': 'STAFF_ONLY', 'detail': 'Chỉ Thủ thư hoặc Quản trị viên mới có quyền khôi phục tài liệu.'}, status=status.HTTP_403_FORBIDDEN)
            doc.status = DocumentStatus.PUBLISHED
            doc.disable_reason = None
            doc.save(update_fields=['status', 'disable_reason'])
            ApprovalLog.objects.create(document=doc, actor=user, action='restore', note=note or 'Khôi phục phục vụ sinh viên')

        elif action == 'delete':
            if not is_staff:
                return Response({'code': 'STAFF_ONLY', 'detail': 'Chỉ Thủ thư hoặc Quản trị viên mới có quyền xóa tài liệu.'}, status=status.HTTP_403_FORBIDDEN)
            doc_title = doc.title
            doc.delete()
            try:
                log_action(
                    user=user,
                    action="DELETE_DIGITAL_DOC",
                    entity_type='DigitalDocument',
                    entity_id=pk,
                    detail={'title': doc_title, 'note': note},
                    request=request
                )
            except Exception:
                pass
            return Response({'success': True, 'message': 'Đã xóa tài liệu số thành công.'}, status=status.HTTP_200_OK)

        else:
            return Response({'code': 'INVALID_ACTION', 'detail': f'Hành động {action} không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)

        log_action(
            user=user,
            action=f"WORKFLOW_{action.upper()}_DIGITAL_DOC",
            entity_type='DigitalDocument',
            entity_id=doc.id,
            detail={'action': action, 'note': note, 'status': doc.status},
            request=request
        )

        detail_serializer = DigitalDocumentDetailSerializer(doc, context={'request': request})
        return Response(detail_serializer.data, status=status.HTTP_200_OK)


# ==============================================================================
# 3. PHIÊN ĐỌC BẢO MẬT & DYNAMIC WATERMARK
# ==============================================================================

class StartReadingSessionView(APIView):
    """
    Khởi tạo phiên đọc bảo mật trực tiếp từ Backend.
    Kiểm tra đầy đủ quyền truy cập, tạo Session Code và trả về thông tin Watermark.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            doc = DigitalDocument.objects.prefetch_related('versions').get(pk=pk)
        except DigitalDocument.DoesNotExist:
            return Response({'code': 'NOT_FOUND', 'detail': 'Không tìm thấy tài liệu số.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        is_staff_admin = getattr(user, 'role', '') in ['admin', 'librarian']

        # Kiểm tra xuất bản
        if not is_staff_admin and doc.status != DocumentStatus.PUBLISHED:
            return Response({
                'code': 'NOT_PUBLISHED',
                'detail': f'Tài liệu hiện đang ở trạng thái "{doc.get_status_display()}", chưa được mở đọc.'
            }, status=status.HTTP_403_FORBIDDEN)

        # Kiểm tra điều kiện truy cập (Access Scope)
        if not is_staff_admin:
            list_serializer = DigitalDocumentListSerializer()
            has_access, denial_reason = list_serializer._check_access(doc, user)
            if not has_access:
                return Response({
                    'code': 'ACCESS_DENIED',
                    'detail': denial_reason
                }, status=status.HTTP_403_FORBIDDEN)

        # Lấy phiên bản hiện hành
        current_version = doc.versions.filter(is_current=True).first() or doc.versions.first()
        if not current_version or not current_version.file:
            return Response({
                'code': 'NO_FILE_AVAILABLE',
                'detail': 'Tập tin tài liệu số hiện chưa sẵn sàng trên hệ thống lưu trữ.'
            }, status=status.HTTP_404_NOT_FOUND)

        # Kiểm tra phiên đọc dở trước đó của bạn đọc trên tài liệu này
        existing_session = DigitalReadingSession.objects.filter(
            user=user,
            document=doc,
            status='active',
            expires_at__gt=timezone.now()
        ).first()

        start_page = 1
        if existing_session:
            start_page = existing_session.current_page
            # Gia hạn phiên
            existing_session.expires_at = timezone.now() + timedelta(hours=4)
            existing_session.save(update_fields=['expires_at'])
            session = existing_session
        else:
            # Tạo phiên mới
            random_hex = secrets.token_hex(3).upper()
            today_str = timezone.localdate().strftime('%Y%m%d')
            session_code = f"SES-{today_str}-{random_hex}"
            
            # Lấy thông tin sinh viên từ user/roster
            user_dept = getattr(user, 'department', '') or ''
            user_major = ''
            if hasattr(user, 'student_roster') and user.student_roster:
                user_major = user.student_roster.major or ''

            # Lấy vị trí đọc dở gần nhất nếu có để tiếp nối tiến độ
            last_session = DigitalReadingSession.objects.filter(user=user, document=doc).order_by('-last_active_at').first()
            start_max_page = 1
            if last_session:
                start_page = last_session.current_page
                start_max_page = max(last_session.max_page_reached, start_page)

            full_name = getattr(user, 'full_name', '') or (user.get_full_name() if hasattr(user, 'get_full_name') else '') or user.username
            client_ip = request.META.get('REMOTE_ADDR') or None
            session = DigitalReadingSession.objects.create(
                session_code=session_code,
                document=doc,
                version=current_version,
                user=user,
                user_full_name=full_name,
                user_code=user.username,
                user_department=user_dept,
                user_major=user_major,
                ip_address=client_ip,
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                current_page=start_page,
                max_page_reached=start_max_page,
                expires_at=timezone.now() + timedelta(hours=4),
                status='active',
            )

            # Chỉ tăng tổng lượt mở đọc khi thực sự tạo phiên đọc mới
            DigitalDocument.objects.filter(pk=pk).update(total_views=F('total_views') + 1)

        # Ghi nhật ký kiểm toán an toàn
        try:
            log_action(
                user=user,
                action='START_DIGITAL_READING_SESSION',
                entity_type='DigitalDocument',
                entity_id=doc.id,
                detail={
                    'session_code': session.session_code,
                    'session_id': str(session.session_id),
                    'document_type': doc.document_type,
                    'version': current_version.version_number,
                    'page': start_page,
                },
                request=request
            )
        except Exception:
            pass

        # Trả về thông tin phiên đọc và payload Watermark bảo mật
        now_str = timezone.localtime().strftime('%d/%m/%Y %H:%M:%S')
        patron_display_name = getattr(user, 'full_name', '') or (user.get_full_name() if hasattr(user, 'get_full_name') else '') or user.username
        return Response({
            'session_id': str(session.session_id),
            'session_code': session.session_code,
            'document_id': doc.id,
            'document_title': doc.title,
            'document_type': doc.document_type,
            'document_type_display': doc.get_document_type_display(),
            'version_number': current_version.version_number,
            'page_count': current_version.page_count,
            'current_page': session.current_page,
            'total_seconds_spent': session.total_seconds_spent,
            'watermark': {
                'institution': 'THƯ VIỆN UTH – BẢN QUYỀN ĐH GTVT TP.HCM',
                'patron_name': patron_display_name,
                'patron_code': user.username,
                'access_time': now_str,
                'session_code': session.session_code,
            },
            'allow_download': doc.allow_download,
            'allow_print': doc.allow_print,
        }, status=status.HTTP_200_OK)


class StreamDocumentPdfView(APIView):
    """
    Stream nhị phân dữ liệu file PDF trực tiếp thông qua Session ID đã được xác thực.
    Không để lộ đường dẫn file trực tiếp.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        try:
            session = DigitalReadingSession.objects.select_related('version', 'document').get(
                session_id=session_id,
                user=request.user,
                status='active'
            )
        except DigitalReadingSession.DoesNotExist:
            return Response({
                'code': 'INVALID_SESSION',
                'detail': 'Phiên đọc không tồn tại, đã hết hạn hoặc đã bị thu hồi.'
            }, status=status.HTTP_403_FORBIDDEN)

        if session.expires_at < timezone.now():
            session.status = 'expired'
            session.save(update_fields=['status'])
            return Response({
                'code': 'SESSION_EXPIRED',
                'detail': 'Phiên đọc đã hết hạn hiệu lực. Vui lòng làm mới trang để khởi tạo phiên mới.'
            }, status=status.HTTP_403_FORBIDDEN)

        version = session.version
        file_path = version.file.path if (version.file and hasattr(version.file, 'path')) else None
        if not file_path or not os.path.exists(file_path):
            sample_candidate = os.path.join(settings.BASE_DIR, 'media', 'digital_resources', 'sample', 'giao_trinh_mau_uth.pdf')
            if not os.path.exists(sample_candidate):
                media_root = getattr(settings, 'MEDIA_ROOT', '')
                if media_root:
                    sample_candidate = os.path.join(media_root, 'digital_resources', 'sample', 'giao_trinh_mau_uth.pdf')
            if os.path.exists(sample_candidate):
                file_path = sample_candidate
            else:
                return Response({
                    'code': 'FILE_NOT_FOUND',
                    'detail': 'Tập tin tài liệu không tồn tại trên hệ thống lưu trữ.'
                }, status=status.HTTP_404_NOT_FOUND)

        response = FileResponse(open(file_path, 'rb'), content_type='application/pdf')
        filename = f"{session.document.title}_v{version.version_number}.pdf"
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        return response


class ReadingSessionHeartbeatView(APIView):
    """
    Đồng bộ trang đang đọc và thời lượng học tập thực tế (Heartbeat mỗi 15-30 giây).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        try:
            session = DigitalReadingSession.objects.select_related('document').get(
                session_id=session_id,
                user=request.user,
                status='active'
            )
        except DigitalReadingSession.DoesNotExist:
            return Response({'code': 'INVALID_SESSION', 'detail': 'Phiên đọc không hợp lệ.'}, status=status.HTTP_404_NOT_FOUND)

        current_page = request.data.get('current_page')
        seconds_increment = request.data.get('seconds_increment', 0)

        if current_page is not None:
            try:
                page_num = max(1, int(current_page))
                session.current_page = page_num
                if page_num > session.max_page_reached:
                    session.max_page_reached = page_num
            except (ValueError, TypeError):
                pass

        if seconds_increment:
            try:
                incr = max(0, min(120, int(seconds_increment)))
                session.total_seconds_spent += incr
                # Tăng thời lượng của tài liệu
                DigitalDocument.objects.filter(id=session.document_id).update(
                    total_reading_seconds=session.document.total_reading_seconds + incr
                )
            except (ValueError, TypeError):
                pass

        # Gia hạn phiên đọc
        session.expires_at = timezone.now() + timedelta(hours=4)
        session.save()

        return Response({
            'status': 'ok',
            'current_page': session.current_page,
            'total_seconds_spent': session.total_seconds_spent,
        }, status=status.HTTP_200_OK)


# ==============================================================================
# 4. LỊCH SỬ ĐỌC CÁ NHÂN & BÁO CÁO THỐNG KÊ QUẢN TRỊ
# ==============================================================================

class PatronReadingHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination

    def get(self, request):
        user_sessions = DigitalReadingSession.objects.filter(user=request.user).select_related(
            'document', 'version'
        ).order_by('document_id', '-last_active_at')

        # Gom nhóm theo từng tài liệu để khử trùng lặp và đồng bộ toàn diện
        latest_sessions_by_doc = {}
        for s in user_sessions:
            doc_id = s.document_id
            if doc_id not in latest_sessions_by_doc:
                latest_sessions_by_doc[doc_id] = {
                    'session': s,
                    'total_seconds': s.total_seconds_spent,
                    'max_page': s.max_page_reached,
                    'current_page': s.current_page,
                    'last_active_at': s.last_active_at,
                }
            else:
                entry = latest_sessions_by_doc[doc_id]
                entry['total_seconds'] += s.total_seconds_spent
                if s.max_page_reached > entry['max_page']:
                    entry['max_page'] = s.max_page_reached
                if s.last_active_at > entry['last_active_at']:
                    entry['last_active_at'] = s.last_active_at
                    entry['current_page'] = s.current_page
                    entry['session'] = s

        # Sắp xếp theo lần đọc gần nhất giảm dần
        sorted_entries = sorted(
            latest_sessions_by_doc.values(),
            key=lambda e: e['last_active_at'],
            reverse=True
        )

        consolidated_sessions = []
        for entry in sorted_entries:
            s = entry['session']
            s.total_seconds_spent = entry['total_seconds']
            s.max_page_reached = entry['max_page']
            s.current_page = entry['current_page']
            consolidated_sessions.append(s)

        paginator = self.pagination_class()
        paginated_qs = paginator.paginate_queryset(consolidated_sessions, request)
        serializer = DigitalReadingSessionSerializer(paginated_qs, many=True)
        return paginator.get_paginated_response(serializer.data)


class DigitalLibraryStatsView(APIView):
    """
    Thống kê chuyên sâu phục vụ Quản trị Thư viện số và Kiểm định AUN-QA:
    - Tổng số tài liệu theo loại
    - Tổng lượt đọc và tổng thời gian đọc (giờ)
    - Tài liệu được đọc nhiều nhất
    - Phân bố lượt đọc theo Khoa và Ngành
    - Nhật ký kiểm duyệt gần nhất
    """
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        total_docs = DigitalDocument.objects.count()  # type: ignore
        published_docs = DigitalDocument.objects.filter(status=DocumentStatus.PUBLISHED).count()  # type: ignore
        pending_docs = DigitalDocument.objects.filter(status=DocumentStatus.PENDING_APPROVAL).count()  # type: ignore
        draft_docs = DigitalDocument.objects.filter(status=DocumentStatus.DRAFT).count()  # type: ignore

        total_sessions = DigitalReadingSession.objects.count()  # type: ignore
        total_seconds = DigitalReadingSession.objects.aggregate(total=Sum('total_seconds_spent'))['total'] or 0  # type: ignore
        total_hours = round(total_seconds / 3600, 1)

        # Phân bố tài liệu theo 10 loại
        docs_by_type = list(
            DigitalDocument.objects.values('document_type')  # type: ignore
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        type_labels = dict(DocumentType.choices)
        type_distribution = [
            {'type': item['document_type'], 'label': type_labels.get(item['document_type'], item['document_type']), 'count': item['count']}
            for item in docs_by_type
        ]

        # Top 10 tài liệu được đọc nhiều nhất
        top_documents = list(
            DigitalDocument.objects.filter(status=DocumentStatus.PUBLISHED)  # type: ignore
            .order_by('-total_views')[:10]
            .values('id', 'title', 'document_type', 'department', 'total_views', 'total_reading_seconds')
        )
        for item in top_documents:
            item['document_type_display'] = type_labels.get(item['document_type'], item['document_type'])
            item['reading_hours'] = round((item['total_reading_seconds'] or 0) / 3600, 1)

        # Phân bố lượt đọc theo Khoa
        reads_by_dept = list(
            DigitalReadingSession.objects.exclude(user_department__isnull=True).exclude(user_department='')
            .values('user_department')
            .annotate(reads=Count('id'), total_seconds=Sum('total_seconds_spent'))
            .order_by('-reads')[:8]
        )

        # Lịch sử kiểm duyệt gần nhất
        recent_logs = ApprovalLogSerializer(
            ApprovalLog.objects.select_related('document', 'actor').order_by('-created_at')[:15],
            many=True
        ).data

        return Response({
            'overview': {
                'total_documents': total_docs,
                'published_documents': published_docs,
                'pending_approval_documents': pending_docs,
                'draft_documents': draft_docs,
                'total_reading_sessions': total_sessions,
                'total_reading_hours': total_hours,
            },
            'type_distribution': type_distribution,
            'top_documents': top_documents,
            'reads_by_department': reads_by_dept,
            'recent_approval_logs': recent_logs,
        }, status=status.HTTP_200_OK)

