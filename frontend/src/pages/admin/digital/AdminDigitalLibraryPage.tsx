import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Edit,
  Eye,
  Archive,
  BarChart2,
  FileText,
  Upload,
  Lock,
  ChevronRight,
  MoreVertical,
  Check,
  X,
  Shield,
  FileCheck,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
const DigitalPdfReaderModal = lazy(() => import('@/features/ebook/DigitalPdfReaderModal'));
import { CreateEditDocumentModal } from './CreateEditDocumentModal';
import { ApprovalRejectModal } from './ApprovalRejectModal';
import { AunQaAnalyticsTab } from './AunQaAnalyticsTab';

interface DigitalDocumentItem {
  id: number;
  title: string;
  document_type: string;
  document_type_display: string;
  status: 'draft' | 'pending_approval' | 'published' | 'rejected' | 'disabled' | 'archived';
  status_display: string;
  department: string;
  major: string;
  author_names: string;
  advisor_names: string;
  year: number;
  access_scope: string;
  access_scope_display: string;
  require_active_card: boolean;
  total_views: number;
  total_reading_seconds: number;
  reading_hours: number;
  current_version_number: number;
  created_at: string;
  cover_image?: string;
  user_has_access: boolean;
}

export const AdminDigitalLibraryPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'admin' || user?.role === 'librarian';

  // Tabs: 'catalog' | 'pending' | 'analytics'
  const [activeTab, setActiveTab] = useState<'catalog' | 'pending' | 'analytics'>('catalog');

  // Documents State
  const [documents, setDocuments] = useState<DigitalDocumentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingDoc, setEditingDoc] = useState<any | null>(null);
  const [isNewVersionMode, setIsNewVersionMode] = useState<boolean>(false);
  const [previewDocId, setPreviewDocId] = useState<number | null>(null);

  // Workflow Action Modal (Reject / Disable / Archive / Restore)
  const [workflowTargetDoc, setWorkflowTargetDoc] = useState<any | null>(null);
  const [workflowActionType, setWorkflowActionType] = useState<'reject' | 'disable' | 'archive' | 'restore'>('reject');
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState<boolean>(false);

  // Stats Counters
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [publishedCount, setPublishedCount] = useState<number>(0);
  const [draftCount, setDraftCount] = useState<number>(0);

  const fetchDocuments = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params: any = {
        page,
        page_size: 10,
      };

      if (activeTab === 'pending') {
        params.status = 'pending_approval';
      } else if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (typeFilter !== 'all') {
        params.document_type = typeFilter;
      }

      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }

      const res = await api.get('/digital-library/documents', { params });
      const data = res.data?.data || res.data?.results || res.data || [];
      const total = res.data?.total || res.data?.count || data.length;

      setDocuments(Array.isArray(data) ? data : []);
      setTotalCount(total);
      setTotalPages(res.data?.total_pages || Math.ceil(total / 10) || 1);
      setCurrentPage(page);

      // Fetch quick stats counters
      try {
        const statsRes = await api.get('/digital-library/admin/stats');
        const ov = statsRes.data?.overview || {};
        setPendingCount(ov.pending_approval_documents || 0);
        setPublishedCount(ov.published_documents || 0);
        setDraftCount(ov.draft_documents || 0);
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Failed to fetch digital library documents', err);
      toast.error('Không thể tải danh sách tài liệu số.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter, typeFilter, searchQuery]);

  useEffect(() => {
    fetchDocuments(1);
  }, [fetchDocuments]);

  // Quick 1-click Approve for Admin
  const handleQuickApprove = async (doc: DigitalDocumentItem) => {
    try {
      await api.post(`/digital-library/documents/${doc.id}/approve`, {
        action: 'approve',
        note: 'Admin duyệt xuất bản nhanh trên hàng đợi kiểm duyệt.',
      });
      toast.success(`Đã phê duyệt xuất bản học liệu: "${doc.title}"!`);
      fetchDocuments(currentPage);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Phê duyệt tài liệu thất bại.');
    }
  };

  // Open Modal for Reject / Disable / Archive / Restore
  const openWorkflowAction = (
    doc: DigitalDocumentItem,
    action: 'reject' | 'disable' | 'archive' | 'restore'
  ) => {
    setWorkflowTargetDoc(doc);
    setWorkflowActionType(action);
    setIsWorkflowModalOpen(true);
  };

  const getStatusBadge = (status: string, display: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">{display}</Badge>;
      case 'pending_approval':
        return <Badge variant="warning">{display}</Badge>;
      case 'draft':
        return <Badge variant="neutral">{display}</Badge>;
      case 'rejected':
        return <Badge variant="danger">{display}</Badge>;
      case 'disabled':
        return <Badge variant="danger">{display}</Badge>;
      case 'archived':
        return <Badge variant="neutral">{display}</Badge>;
      default:
        return <Badge variant="neutral">{display}</Badge>;
    }
  };

  return (
    <div className="space-y-5 pb-12 animate-page-enter">
      {/* 1. Top Header & Action Toolbar - UTH Portal Style */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <Shield className="w-5 h-5 text-[#008B8B]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#008B8B] tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>Quản lý Thư viện Số & Kiểm duyệt Học liệu</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Biên mục 10 loại tài liệu học liệu, kiểm soát bản quyền với Dynamic Watermark đa lớp và kiểm định AUN-QA
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingDoc(null);
              setIsNewVersionMode(false);
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center justify-center text-xs font-bold h-9 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white transition-all shadow-xs shrink-0 cursor-pointer"
            title="Biên mục và tải lên tài liệu học liệu số mới"
          >
            <Plus className="w-4 h-4 mr-1.5 text-white" />
            <span>Thêm học liệu số mới</span>
          </button>
        </div>
      </div>

      {/* 2. Overview Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Kho học liệu số"
          value={totalCount}
          subtext="Tài liệu số trong hệ thống"
          icon={<Layers className="w-5 h-5 text-brand" />}
        />
        <StatCard
          title="Đã xuất bản"
          value={publishedCount}
          subtext="Sinh viên được phép tra cứu"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Chờ kiểm duyệt"
          value={pendingCount}
          subtext={pendingCount > 0 ? 'Cần Admin phê duyệt ngay' : 'Hàng đợi trống'}
          icon={<FileCheck className="w-5 h-5 text-amber-600" />}
        />
        <StatCard
          title="Bản nháp"
          value={draftCount}
          subtext="Thủ thư đang biên mục"
          icon={<Edit className="w-5 h-5 text-blue-600" />}
        />
      </div>

      {/* 3. Main Tabs Navigation: Danh mục vs Chờ duyệt vs AUN-QA */}
      <div className="flex items-center gap-1 border-b border-gray-200 bg-white px-2 pt-1 rounded-t-xl shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all cursor-pointer',
            activeTab === 'catalog'
              ? 'border-brand text-brand font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
        >
          <Layers className="h-4 w-4" />
          <span>Danh mục tài liệu số</span>
          <span className="ml-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] text-teal-800 font-bold">
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all cursor-pointer',
            activeTab === 'pending'
              ? 'border-amber-600 text-amber-700 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
        >
          <FileCheck className="h-4 w-4" />
          <span>Hàng đợi Chờ kiểm duyệt</span>
          {pendingCount > 0 && (
            <span className="ml-1 rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px] font-black">
              {pendingCount}
            </span>
          )}
        </button>

        {isStaff && (
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={cn(
              'flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all cursor-pointer',
              activeTab === 'analytics'
                ? 'border-brand text-brand font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <BarChart2 className="h-4 w-4" />
            <span>Báo cáo Thống kê & Kiểm định AUN-QA</span>
          </button>
        )}
      </div>

      {/* 4. Tab Content */}
      {activeTab === 'analytics' ? (
        <AunQaAnalyticsTab />
      ) : (
        <div className="space-y-4">
          {/* Filters Bar Card */}
          <Card className="shadow-xs border-gray-200/80">
            <CardContent className="p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="flex-1 max-w-md relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên tài liệu, tác giả, chuyên ngành..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 text-xs h-9 rounded-xl border border-gray-200 focus:outline-none focus:border-brand bg-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {activeTab === 'catalog' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-gray-500 font-medium">Trạng thái:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-brand bg-white"
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="published">Đã xuất bản (Published)</option>
                      <option value="pending_approval">Chờ duyệt (Pending)</option>
                      <option value="draft">Bản nháp (Draft)</option>
                      <option value="rejected">Bị từ chối (Rejected)</option>
                      <option value="disabled">Tạm khóa (Disabled)</option>
                      <option value="archived">Lưu trữ (Archived)</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-500 font-medium">Loại học liệu:</span>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-brand bg-white"
                  >
                    <option value="all">Tất cả thể loại</option>
                    <option value="thesis">Khóa luận tốt nghiệp</option>
                    <option value="capstone">Đồ án tốt nghiệp</option>
                    <option value="project">Đồ án môn học</option>
                    <option value="internship_report">Báo cáo thực tập</option>
                    <option value="textbook">Giáo trình</option>
                    <option value="ebook">Sách điện tử (E-book)</option>
                    <option value="research_project">Công trình NCKH</option>
                    <option value="journal_paper">Bài báo khoa học</option>
                    <option value="lecture_slide">Slide bài giảng</option>
                    <option value="learning_material">Tài liệu tham khảo</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => fetchDocuments(currentPage)}
                  className="inline-flex items-center justify-center text-xs font-semibold h-8 px-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all bg-white shadow-2xs shrink-0 cursor-pointer"
                  title="Tải lại danh sách"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1 text-gray-500" />
                  <span>Làm mới</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Table of Documents */}
          {loading ? (
            <div className="py-20 text-center text-xs text-gray-400 flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-gray-200/80">
              <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
              <p>Đang tải danh sách học liệu số...</p>
            </div>
          ) : documents.length === 0 ? (
            <EmptyState
              title={
                activeTab === 'pending'
                  ? 'Không có học liệu nào đang chờ kiểm duyệt'
                  : 'Không tìm thấy tài liệu số phù hợp'
              }
              description={
                activeTab === 'pending'
                  ? 'Tất cả học liệu đã được duyệt hoặc chưa có tài liệu mới được thủ thư gửi lên.'
                  : 'Hãy thử thay đổi điều kiện lọc hoặc tạo mới tài liệu học liệu.'
              }
              actionText="Tiếp nhận học liệu số mới"
              onAction={() => {
                setEditingDoc(null);
                setIsNewVersionMode(false);
                setIsCreateModalOpen(true);
              }}
            />
          ) : (
            <Card className="shadow-xs border-gray-200/80 rounded-2xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <TableHead>Học liệu số & Tác giả</TableHead>
                    <TableHead className="w-48">Phân loại & Khoa</TableHead>
                    <TableHead className="w-40">Phạm vi truy cập</TableHead>
                    <TableHead className="w-36 text-center">Trạng thái</TableHead>
                    <TableHead className="w-28 text-right">Lượt đọc</TableHead>
                    <TableHead className="w-44 text-right">Thao tác nghiệp vụ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-teal-50/20 transition-colors group">
                      {/* Document info */}
                      <TableCell className="max-w-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-12 rounded-lg bg-teal-50 border border-teal-100 text-brand flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                            {doc.cover_image ? (
                              <img src={doc.cover_image} alt={doc.title} className="w-full h-full object-cover" />
                            ) : (
                              <FileText className="w-5 h-5 text-brand" />
                            )}
                          </div>
                          <div className="space-y-1 min-w-0">
                            <p className="font-bold text-xs text-gray-800 group-hover:text-brand transition-colors line-clamp-2 leading-snug">
                              {doc.title}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              <span className="font-medium text-gray-700">{doc.author_names}</span>
                              {doc.advisor_names && (
                                <span className="text-gray-400"> • GVHD: {doc.advisor_names}</span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                              <span>Năm {doc.year}</span>
                              <span>•</span>
                              <span className="font-mono">v{doc.current_version_number}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Type & Dept */}
                      <TableCell>
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100/70 text-teal-800">
                            {doc.document_type_display}
                          </span>
                          <p className="text-[11px] text-gray-600 font-medium">
                            {doc.department || 'Toàn trường'}
                          </p>
                          {doc.major && (
                            <p className="text-[10px] text-gray-400">{doc.major}</p>
                          )}
                        </div>
                      </TableCell>

                      {/* Access Scope */}
                      <TableCell>
                        <div className="space-y-1">
                          <span className="font-medium text-xs text-gray-700 block">
                            {doc.access_scope_display}
                          </span>
                          {doc.require_active_card && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-semibold">
                              <Lock className="w-3 h-3" /> Cần thẻ thư viện
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        {getStatusBadge(doc.status, doc.status_display)}
                      </TableCell>

                      {/* Stats */}
                      <TableCell className="text-right">
                        <p className="font-bold text-xs text-gray-800">{doc.total_views} <span className="text-[10px] font-normal text-gray-400">lượt</span></p>
                        <p className="text-[10px] text-brand font-mono font-medium">{doc.reading_hours} giờ đọc</p>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview / Read Button */}
                          <button
                            type="button"
                            onClick={() => setPreviewDocId(doc.id)}
                            className="p-1.5 rounded-lg hover:bg-teal-50 text-gray-500 hover:text-brand transition-colors cursor-pointer"
                            title="Đọc thử có Watermark"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Approval Queue Specific Actions */}
                          {doc.status === 'pending_approval' && (
                            <>
                              {isStaff && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickApprove(doc)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                                  title="Phê duyệt xuất bản ngay"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Duyệt</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => openWorkflowAction(doc, 'reject')}
                                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] flex items-center gap-1 border border-rose-200 cursor-pointer"
                                title="Từ chối phê duyệt"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Từ chối</span>
                              </button>
                            </>
                          )}

                          {/* Standard Catalog Actions */}
                          {doc.status !== 'pending_approval' && (
                            <>
                              {/* Edit metadata */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingDoc(doc);
                                  setIsNewVersionMode(false);
                                  setIsCreateModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                                title="Chỉnh sửa thông tin metadata"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              {/* Upload new version */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingDoc(doc);
                                  setIsNewVersionMode(true);
                                  setIsCreateModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-teal-50 text-gray-500 hover:text-brand transition-colors cursor-pointer"
                                title="Phát hành phiên bản mới (Không ghi đè file cũ)"
                              >
                                <Upload className="w-4 h-4" />
                              </button>

                              {/* Disable / Archive */}
                              {isStaff && doc.status === 'published' && (
                                <button
                                  type="button"
                                  onClick={() => openWorkflowAction(doc, 'disable')}
                                  className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-500 hover:text-amber-600 transition-colors cursor-pointer"
                                  title="Tạm khóa quyền đọc"
                                >
                                  <Lock className="w-4 h-4" />
                                </button>
                              )}

                              {isStaff && doc.status === 'disabled' && (
                                <button
                                  type="button"
                                  onClick={() => openWorkflowAction(doc, 'restore')}
                                  className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 transition-colors cursor-pointer"
                                  title="Mở khóa học liệu"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => fetchDocuments(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* Create / Edit / New Version Modal */}
      {isCreateModalOpen && (
        <CreateEditDocumentModal
          isOpen={isCreateModalOpen}
          documentToEdit={editingDoc}
          isNewVersion={isNewVersionMode}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingDoc(null);
            setIsNewVersionMode(false);
          }}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            setEditingDoc(null);
            setIsNewVersionMode(false);
            fetchDocuments(currentPage);
          }}
        />
      )}

      {/* Reject / Disable / Archive / Restore Reason Modal */}
      {isWorkflowModalOpen && workflowTargetDoc && (
        <ApprovalRejectModal
          isOpen={isWorkflowModalOpen}
          document={workflowTargetDoc}
          actionType={workflowActionType}
          onClose={() => {
            setIsWorkflowModalOpen(false);
            setWorkflowTargetDoc(null);
          }}
          onSuccess={() => {
            setIsWorkflowModalOpen(false);
            setWorkflowTargetDoc(null);
            fetchDocuments(currentPage);
          }}
        />
      )}

      {/* Watermark PDF Reader Modal */}
      {previewDocId && (
        <Suspense fallback={null}>
          <DigitalPdfReaderModal
            documentId={previewDocId}
            isOpen={Boolean(previewDocId)}
            onClose={() => setPreviewDocId(null)}
          />
        </Suspense>
      )}
    </div>
  );
};
