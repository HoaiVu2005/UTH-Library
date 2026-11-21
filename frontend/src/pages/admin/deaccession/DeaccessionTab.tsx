import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Printer,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  AlertTriangle,
  Clock,
  Scan,
  Layers,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import { formatCurrencyVND, formatDateVN, cn } from '@/lib/utils';
import { DeaccessionModal } from './DeaccessionModal';
import { DeaccessionScanModal } from './DeaccessionScanModal';
import { DeaccessionPrintModal } from './DeaccessionPrintModal';
import { DeaccessionApproveModal } from './DeaccessionApproveModal';

export interface DeaccessionBatchListItem {
  id: number;
  code: string;
  decision_number: string;
  decision_date: string;
  reason: string;
  reason_display: string;
  status: 'draft' | 'approved' | 'cancelled';
  status_display: string;
  committee: string;
  total_copies: number;
  total_value: number;
  note?: string;
  created_by_name: string;
  approved_by_name?: string | null;
  approved_at?: string | null;
  created_at: string;
}

export const DeaccessionTab: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [batches, setBatches] = useState<DeaccessionBatchListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [reasonFilter, setReasonFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [printBatchId, setPrintBatchId] = useState<number | null>(null);

  // Actions confirmation
  const [approvingBatch, setApprovingBatch] = useState<DeaccessionBatchListItem | null>(null);
  const [cancellingBatch, setCancellingBatch] = useState<DeaccessionBatchListItem | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/deaccession-batches', {
        params: {
          page,
          page_size: pageSize,
          search: appliedSearch || undefined,
          status: statusFilter || undefined,
          reason: reasonFilter || undefined,
        },
      });
      const data = res.data?.data || res.data;
      const results = data.results || data || [];
      setBatches(results);
      setTotalRecords(data.count ?? results.length);
      setTotalPages(Math.ceil((data.count ?? results.length) / pageSize) || 1);
    } catch {
      toast.error('Không thể tải danh sách biên bản thanh lý.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [page, pageSize, appliedSearch, statusFilter, reasonFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(searchQuery.trim());
  };

  const handleApprove = async () => {
    if (!approvingBatch) return;
    setIsProcessingAction(true);
    try {
      await api.post(`/deaccession-batches/${approvingBatch.id}/approve`);
      toast.success(
        `Đã phê duyệt biên bản ${approvingBatch.code}. Tất cả ${approvingBatch.total_copies} bản sao đã chuyển sang Đã thanh lý.`
      );
      setApprovingBatch(null);
      fetchBatches();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Không thể phê duyệt biên bản.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleCancel = async () => {
    if (!cancellingBatch) return;
    setIsProcessingAction(true);
    try {
      await api.delete(`/deaccession-batches/${cancellingBatch.id}`);
      toast.success(`Đã hủy biên bản thanh lý ${cancellingBatch.code}.`);
      setCancellingBatch(null);
      fetchBatches();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Không thể hủy biên bản.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const renderStatusBadge = (b: DeaccessionBatchListItem) => {
    switch (b.status) {
      case 'approved':
        return <Badge variant="success">Đã phê duyệt</Badge>;
      case 'draft':
        return <Badge variant="warning">Dự thảo</Badge>;
      case 'cancelled':
        return <Badge variant="neutral">Đã hủy</Badge>;
      default:
        return <Badge variant="neutral">{b.status_display}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <Card className="shadow-xs border-gray-200/80">
        <CardContent className="p-4 space-y-3">
          {/* Segmented Status Filter Tabs: Soft Colored Pills */}
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3">
            <button
              type="button"
              onClick={() => {
                setStatusFilter('');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === ''
                  ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
                  : 'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-slate-100/80'
              )}
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Tất cả trạng thái</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter('draft');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === 'draft'
                  ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                  : 'bg-amber-50/60 text-amber-700 border-amber-200/80 hover:bg-amber-100/70'
              )}
            >
              <span>Dự thảo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter('approved');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === 'approved'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                  : 'bg-emerald-50/60 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70'
              )}
            >
              <span>Đã phê duyệt</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter('cancelled');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === 'cancelled'
                  ? 'bg-gray-100 text-gray-800 border-gray-300 shadow-2xs'
                  : 'bg-gray-50 text-gray-600 border-gray-200/80 hover:bg-gray-100'
              )}
            >
              <span>Đã hủy</span>
            </button>
          </div>

          {/* Search Controls & Action Buttons */}
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 pt-1">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  placeholder="Tìm theo số QĐ, mã biên bản..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 w-full text-xs h-9 rounded-xl border-gray-200 focus:border-brand bg-white"
                />
              </div>
              <Button type="submit" variant="secondary" size="sm" className="h-9 px-4 text-xs font-semibold shrink-0">
                Tìm kiếm
              </Button>
            </form>

            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-40 shrink-0">
                <Select
                  value={reasonFilter}
                  onChange={(e) => {
                    setReasonFilter(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: '', label: 'Tất cả lý do' },
                    { value: 'damaged', label: 'Hư hỏng' },
                    { value: 'outdated', label: 'Lạc hậu' },
                    { value: 'lost', label: 'Mất mát' },
                    { value: 'duplicate_surplus', label: 'Dư thừa' },
                  ]}
                  className="text-xs h-9 rounded-xl border-gray-200"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsScanModalOpen(true)}
                className="h-9 flex items-center gap-1.5 text-xs text-brand border-teal-300 hover:bg-teal-50 shadow-2xs font-bold rounded-xl shrink-0"
              >
                <Scan className="h-4 w-4 text-brand" />
                <span>Quét thanh lý tự động</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                className="h-9 flex items-center gap-1.5 text-xs font-bold shadow-2xs rounded-xl shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Lập biên bản mới</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batches Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-500 text-sm gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
            Đang tải danh sách biên bản thanh lý...
          </div>
        ) : batches.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="Chưa có biên bản thanh lý nào"
              description="Bạn có thể lập biên bản thanh lý tài liệu định kỳ theo quyết định của Hội đồng trường."
              actionText="Lập biên bản đầu tiên"
              onAction={() => setIsCreateModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Mã biên bản</TableHead>
                  <TableHead>Quyết định & Hội đồng</TableHead>
                  <TableHead>Lý do thanh lý</TableHead>
                  <TableHead className="text-center w-24">Số lượng</TableHead>
                  <TableHead className="text-right w-28">Tổng giá trị</TableHead>
                  <TableHead className="w-28 text-center">Trạng thái</TableHead>
                  <TableHead className="w-36">Người lập / Ngày lập</TableHead>
                  <TableHead className="w-40 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow key={batch.id} className="hover:bg-gray-50/70">
                    <TableCell className="font-mono font-semibold text-teal-900 text-xs">
                      {batch.code}
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-medium text-gray-900">{batch.decision_number}</div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" /> Ngày QĐ: {formatDateVN(batch.decision_date)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-gray-800">{batch.reason_display}</span>
                      {batch.note && (
                        <div className="text-[11px] text-gray-500 line-clamp-1">{batch.note}</div>
                      )}
                    </TableCell>

                    <TableCell className="text-center font-semibold text-gray-900 text-xs">
                      {batch.total_copies} cuốn
                    </TableCell>

                    <TableCell className="text-right font-medium text-xs text-teal-800">
                      {formatCurrencyVND(batch.total_value)}
                    </TableCell>

                    <TableCell className="text-center">{renderStatusBadge(batch)}</TableCell>

                    <TableCell>
                      <div className="text-xs font-medium text-gray-900">{batch.created_by_name}</div>
                      <div className="text-[11px] text-gray-500">{formatDateVN(batch.created_at)}</div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPrintBatchId(batch.id)}
                          className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-teal-700 transition-colors"
                          title="Xem & In biên bản A4"
                        >
                          <Printer className="h-4 w-4" />
                        </button>

                        {batch.status === 'draft' && (
                          <>
                            {isAdmin ? (
                              <button
                                type="button"
                                onClick={() => setApprovingBatch(batch)}
                                className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer"
                                title="Phê duyệt thanh lý (Căn cứ QĐ của Ban Giám hiệu)"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 text-[10.5px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80"
                                title="Biên bản đang chờ Ban Giám hiệu và Lãnh đạo thư viện phê duyệt"
                              >
                                <Clock className="h-3 w-3" /> Chờ BGH duyệt
                              </span>
                            )}

                            {(isAdmin || batch.created_by_name === user?.full_name) && (
                              <button
                                type="button"
                                onClick={() => setCancellingBatch(batch)}
                                className="rounded p-1.5 text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors cursor-pointer"
                                title="Hủy biên bản"
                              >
                                <XCircle className="h-4 w-4" />
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
          </div>
        )}

        {/* Pagination */}
        {batches.length > 0 && totalPages > 1 && (
          <div className="border-t border-gray-200 px-4 py-3">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalRecords={totalRecords}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Create Batch Modal */}
      <DeaccessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchBatches();
        }}
      />

      {/* Auto Deaccession Scan Modal */}
      <DeaccessionScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onSuccess={() => {
          fetchBatches();
        }}
      />

      {/* Print Preview Modal */}
      <DeaccessionPrintModal
        isOpen={!!printBatchId}
        onClose={() => setPrintBatchId(null)}
        batchId={printBatchId}
      />

      {/* BGH Approve Modal */}
      <DeaccessionApproveModal
        isOpen={!!approvingBatch}
        onClose={() => setApprovingBatch(null)}
        batch={approvingBatch}
        onSuccess={() => {
          fetchBatches();
        }}
      />

      {/* Cancel Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!cancellingBatch}
        title="Xác nhận hủy Biên bản Thanh lý"
        description={
          cancellingBatch
            ? `Bạn có chắc chắn muốn hủy biên bản "${cancellingBatch.code}"? Các bản sao sách trong danh sách sẽ được giải phóng và có thể đưa vào biên bản khác.`
            : ''
        }
        confirmText="Hủy biên bản"
        cancelText="Quay lại"
        variant="danger"
        isLoading={isProcessingAction}
        onConfirm={handleCancel}
        onClose={() => setCancellingBatch(null)}
      />
    </div>
  );
};
