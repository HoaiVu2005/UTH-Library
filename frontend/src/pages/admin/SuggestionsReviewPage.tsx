import React, { useEffect, useState, useCallback } from 'react';
import { Lightbulb, CheckCircle2, XCircle, PackageCheck, Search, AlertCircle, RotateCcw, X, Layers, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import { cn, formatDateVN } from '@/lib/utils';
import { format } from 'date-fns';
import { useRealtimeSync, broadcastRealtimeSync } from '@/lib/realtime';

interface SuggestionItem {
  id: number;
  book_title: string;
  author?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'received';
  status_display: string;
  review_note?: string;
  created_at: string;
  reviewed_at?: string;
  received_at?: string;
  user: {
    id: number;
    full_name: string;
    card_code: string;
    role?: string;
    department?: string;
  };
  reviewed_by?: {
    full_name: string;
  };
}

export const SuggestionsReviewPage: React.FC = () => {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal State for Approve/Reject Note
  const [actionItem, setActionItem] = useState<{ item: SuggestionItem; type: 'approve' | 'reject' } | null>(null);
  const [reviewNote, setReviewNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchSuggestions = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      let url = `/suggestions?page=${page}&page_size=${pageSize}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (appliedSearch.trim()) url += `&search=${encodeURIComponent(appliedSearch.trim())}`;

      const res = await api.get(url);
      setSuggestions(res.data?.data || []);
      setTotalRecords(res.data?.meta?.total || res.data?.data?.length || 0);
      setTotalPages(res.data?.meta?.total_pages || 1);
    } catch (err) {
      console.error('Failed to fetch suggestions for admin', err);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, [page, pageSize, statusFilter, appliedSearch]);

  useEffect(() => {
    fetchSuggestions(true);
  }, [fetchSuggestions]);

  // Realtime synchronization: updates live when student submits or actions occur
  useRealtimeSync('suggestions', () => fetchSuggestions(false), 4000);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchQuery.trim());
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setAppliedSearch('');
    setPage(1);
  };

  const getRoleAbbr = (role?: string, cardCode?: string) => {
    if (role) {
      const r = role.toLowerCase();
      if (r.includes('lecturer') || r.includes('giảng') || r.includes('teacher')) return 'GV';
      if (r.includes('admin') || r.includes('quản') || r.includes('librarian') || r.includes('thủ thư')) return 'AD';
      return 'SV';
    }
    if (cardCode) {
      const c = cardCode.toUpperCase();
      if (c.startsWith('GV')) return 'GV';
      if (c.startsWith('AD') || c.startsWith('LIB')) return 'AD';
    }
    return 'SV';
  };

  const handleOpenActionModal = (item: SuggestionItem, type: 'approve' | 'reject') => {
    setActionItem({ item, type });
    setReviewNote(
      type === 'approve'
        ? 'Đã duyệt mua tài liệu phục vụ đào tạo.'
        : 'Hiện thư viện đã có tài liệu tương đương hoặc chưa phù hợp kế hoạch mua sắm đợt này.'
    );
  };

  const handleConfirmAction = async () => {
    if (!actionItem) return;
    try {
      setIsSubmitting(true);
      const endpoint = actionItem.type === 'approve'
        ? `/suggestions/${actionItem.item.id}/approve`
        : `/suggestions/${actionItem.item.id}/reject`;

      await api.post(endpoint, { review_note: reviewNote.trim() });
      toast.success(
        actionItem.type === 'approve'
          ? `Đã duyệt đề xuất "${actionItem.item.book_title}".`
          : `Đã từ chối đề xuất "${actionItem.item.book_title}".`
      );
      setActionItem(null);
      fetchSuggestions(false);
      broadcastRealtimeSync('suggestions');
      broadcastRealtimeSync('notifications');
      window.dispatchEvent(new CustomEvent('uth-refresh-notifications'));
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Lỗi khi xử lý đề xuất.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkReceived = async (item: SuggestionItem) => {
    try {
      setIsSubmitting(true);
      await api.post(`/suggestions/${item.id}/receive`);
      toast.success(`Đã đánh dấu sách "${item.book_title}" đã nhập kho!`);
      fetchSuggestions(false);
      broadcastRealtimeSync('suggestions');
      broadcastRealtimeSync('notifications');
      window.dispatchEvent(new CustomEvent('uth-refresh-notifications'));
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Lỗi khi cập nhật trạng thái nhập kho.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pb-12 animate-page-enter">
      {/* Hero Header */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>Duyệt Đề xuất Mua sách mới (Suggestions)</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Xem xét các yêu cầu bổ sung giáo trình, tài liệu chuyên ngành từ sinh viên và giảng viên UTH
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchSuggestions(true)}
            disabled={isLoading}
            className="text-xs h-9 px-3.5 border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl"
            title="Tải lại dữ liệu"
          >
            <RotateCcw className={cn('w-3.5 h-3.5 mr-1.5 text-gray-500', isLoading && 'animate-spin')} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-xs border-gray-200/80">
        <CardContent className="p-4 space-y-3">
          {/* Segmented Filter Tabs: Soft Colored Pills */}
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3">
            {/* Chờ duyệt */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('pending');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === 'pending'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400 shadow-2xs'
                  : 'bg-amber-50/60 text-amber-700 border-amber-200/80 hover:bg-amber-100/70'
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Chờ duyệt (Pending)</span>
            </button>

            {/* Đã duyệt */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('approved');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === 'approved'
                  ? 'bg-blue-100 text-blue-900 border-blue-300 ring-2 ring-blue-400 shadow-2xs'
                  : 'bg-blue-50/60 text-blue-700 border-blue-200/80 hover:bg-blue-100/70'
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đã duyệt (Approved)</span>
            </button>

            {/* Đã nhập kho */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('received');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === 'received'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 ring-2 ring-emerald-400 shadow-2xs'
                  : 'bg-emerald-50/60 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70'
              )}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Đã nhập kho (Received)</span>
            </button>

            {/* Đã từ chối */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('rejected');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === 'rejected'
                  ? 'bg-red-100 text-red-900 border-red-300 ring-2 ring-red-400 shadow-2xs'
                  : 'bg-red-50/60 text-red-600 border-red-200/80 hover:bg-red-100/70'
              )}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Đã từ chối (Rejected)</span>
            </button>

            {/* Tất cả */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === ''
                  ? 'bg-slate-100 text-slate-800 border-slate-300 ring-2 ring-slate-400/40 shadow-2xs'
                  : 'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-slate-100/80'
              )}
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Tất cả</span>
            </button>
          </div>

          {/* Search Controls & Pagination Limit */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xl flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  placeholder="Tìm theo tên sách đề xuất..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 w-full text-xs h-9 rounded-xl border-gray-200 focus:border-brand bg-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                    title="Xóa tìm kiếm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Outline style Search Button */}
              <button
                type="submit"
                className="h-9 px-3.5 rounded-xl text-xs font-semibold shrink-0 border border-brand text-brand hover:bg-teal-50 bg-white transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Search className="w-3.5 h-3.5 text-brand" />
                <span>Tìm kiếm</span>
              </button>
            </form>

            <div className="flex items-center gap-2.5 shrink-0 text-xs text-gray-500">
              <span className="text-[11px] text-gray-500">Hiển thị:</span>
              <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50/60">
                {[5, 10, 20].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setPageSize(size);
                      setPage(1);
                    }}
                    className={cn(
                      'px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all',
                      pageSize === size
                        ? 'bg-white text-brand shadow-2xs border border-gray-200'
                        : 'text-gray-500 hover:text-gray-800'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {appliedSearch && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                  <span>"{appliedSearch}"</span>
                  <button
                    onClick={handleClearSearch}
                    className="text-gray-400 hover:text-gray-700 font-bold ml-1"
                    title="Bỏ lọc tìm kiếm"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions Table */}
      {isLoading ? (
        <div className="p-16 text-center text-xs text-gray-500 bg-white border border-gray-200/80 rounded-2xl shadow-xs space-y-2">
          <RotateCcw className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
          <p className="font-semibold text-gray-700">Đang tải danh sách đề xuất...</p>
        </div>
      ) : suggestions.length === 0 ? (
        <EmptyState
          title="Không có đề xuất nào"
          description={
            appliedSearch
              ? `Không tìm thấy đề xuất nào khớp với từ khóa "${appliedSearch}".`
              : 'Hiện không có đề xuất mua sách nào trong danh mục này.'
          }
        />
      ) : (
        <Card className="shadow-xs border-gray-200/80">
          <div className="overflow-x-auto min-h-[320px]">
            <Table containerClassName="border-0 shadow-none rounded-none">
              <TableHeader>
                <TableRow className="bg-gray-50/90 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                  <TableHead className="w-16">Mã</TableHead>
                  <TableHead>Tài liệu đề xuất</TableHead>
                  <TableHead className="w-56">Người đề xuất</TableHead>
                  <TableHead className="w-56">Lý do</TableHead>
                  <TableHead className="w-32 text-center">Trạng thái</TableHead>
                  <TableHead className="w-44">Phản hồi</TableHead>
                  <TableHead className="w-20 text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suggestions.map((s, index) => {
                  const firstChar = s.user?.full_name?.trim()?.charAt(0)?.toUpperCase() || 'U';
                  const roleAbbr = getRoleAbbr(s.user?.role, s.user?.card_code);

                  return (
                    <TableRow key={s.id} className="hover:bg-teal-50/15 transition-colors">
                      {/* ID */}
                      <TableCell className="font-mono text-gray-400 text-xs">#{s.id}</TableCell>

                      {/* Title & Author */}
                      <TableCell className="max-w-xs">
                        <p className="font-medium text-gray-800 text-xs line-clamp-2" title={s.book_title}>
                          {s.book_title}
                        </p>
                        {s.author && <p className="text-[11px] text-gray-500 mt-0.5">Tác giả: {s.author}</p>}
                      </TableCell>

                      {/* Patron: Re-formatted with role badge at the outer edge */}
                      <TableCell>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-teal-50 text-brand font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200/70">
                              {firstChar}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 text-xs truncate" title={s.user?.full_name}>
                                {s.user?.full_name}
                              </p>
                              <p className="font-mono text-[11px] text-gray-500 mt-0.5">
                                {s.user?.card_code}
                              </p>
                            </div>
                          </div>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 select-none shadow-2xs',
                              roleAbbr === 'GV'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : roleAbbr === 'AD'
                                ? 'bg-purple-50 text-purple-700 border-purple-300'
                                : 'bg-blue-50 text-blue-700 border-blue-300'
                            )}
                            title={roleAbbr === 'GV' ? 'Giảng viên' : roleAbbr === 'AD' ? 'Quản trị viên' : 'Sinh viên'}
                          >
                            {roleAbbr}
                          </span>
                        </div>
                      </TableCell>

                      {/* Reason */}
                      <TableCell className="max-w-xs">
                        <p className="text-gray-700 line-clamp-2 text-xs">{s.reason}</p>
                        <span className="text-[10px] text-gray-400 block mt-1">
                          Ngày gửi: {formatDateVN(s.created_at)}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        <Badge
                          variant={s.status === 'received' ? 'success' : s.status === 'approved' ? 'info' : s.status === 'rejected' ? 'danger' : 'warning'}
                          size="sm"
                        >
                          {s.status_display}
                        </Badge>
                      </TableCell>

                      {/* Review Note */}
                      <TableCell className="max-w-xs text-gray-600 text-xs">
                        {s.review_note || '—'}
                      </TableCell>

                      {/* Actions: ActionMenu */}
                      <TableCell className="text-center relative">
                        {s.status === 'pending' ? (
                          <ActionMenu
                            title={`Đề xuất #${s.id}`}
                            statusDot="warning"
                            isNearBottom={index >= suggestions.length - 2 && suggestions.length > 2}
                            items={[
                              {
                                label: 'Phê duyệt mua sách',
                                icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                                variant: 'primary',
                                onClick: () => handleOpenActionModal(s, 'approve'),
                              },
                              {
                                label: 'Từ chối đề xuất',
                                icon: <XCircle className="w-3.5 h-3.5" />,
                                variant: 'danger',
                                isDividerBefore: true,
                                onClick: () => handleOpenActionModal(s, 'reject'),
                              },
                            ]}
                          />
                        ) : s.status === 'approved' ? (
                          <ActionMenu
                            title={`Đề xuất #${s.id}`}
                            statusDot="info"
                            isNearBottom={index >= suggestions.length - 2 && suggestions.length > 2}
                            items={[
                              {
                                label: 'Xác nhận nhập kho',
                                icon: <PackageCheck className="w-3.5 h-3.5" />,
                                variant: 'primary',
                                onClick: () => handleMarkReceived(s),
                              },
                            ]}
                          />
                        ) : (
                          <span className="text-gray-300 select-none font-bold">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="p-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div>
              Hiển thị <strong>{suggestions.length}</strong> / <strong>{totalRecords}</strong> đề xuất
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </div>
        </Card>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={Boolean(actionItem)}
        onClose={() => setActionItem(null)}
        title={actionItem?.type === 'approve' ? 'Duyệt mua tài liệu đề xuất' : 'Từ chối đề xuất mua sách'}
        description={actionItem ? `Sách: ${actionItem.item.book_title} (Bạn đọc: ${actionItem.item.user?.full_name})` : undefined}
      >
        {actionItem && (
          <div>
            <ModalBody className="space-y-3.5">
              <Textarea
                label="Ghi chú phản hồi cho bạn đọc"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
                required
              />
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" size="md" onClick={() => setActionItem(null)}>
                Hủy
              </Button>
              <Button
                variant={actionItem.type === 'approve' ? 'primary' : 'danger'}
                size="md"
                onClick={handleConfirmAction}
                isLoading={isSubmitting}
              >
                {actionItem.type === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  );
};