import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Search,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  ScanLine,
  X,
  XCircle,
  Layers,
  Clock,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { api, formatApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { QRFinePaymentModal } from '@/components/ui/QRFinePaymentModal';
import { formatCurrencyVND, formatDateVN, cn } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { useRealtimeSync, broadcastRealtimeSync } from '@/lib/realtime';

interface FineRecord {
  id: number;
  patron_name: string;
  patron_card_code: string;
  patron_role?: string;
  book_title?: string;
  copy_barcode?: string;
  type: string;
  amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: string;
  damage_level?: string;
  note?: string;
  waive_reason?: string;
  created_at: string;
}

export const FinesManagementPage: React.FC = () => {
  const [fines, setFines] = useState<FineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [cardCode, setCardCode] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Collect modal
  const [collectTarget, setCollectTarget] = useState<FineRecord | null>(null);
  const [collectAmount, setCollectAmount] = useState<string>('');
  const [collectNote, setCollectNote] = useState<string>('');
  const [collectLoading, setCollectLoading] = useState(false);

  // Waive modal
  const [waiveTarget, setWaiveTarget] = useState<FineRecord | null>(null);
  const [waiveReason, setWaiveReason] = useState<string>('');
  const [waiveLoading, setWaiveLoading] = useState(false);

  // VietQR modal for librarian / desk
  const [qrTarget, setQrTarget] = useState<FineRecord | null>(null);


  const fetchFines = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (appliedSearch.trim()) params.append('search', appliedSearch.trim());
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());

      const res = await api.get<{ data: FineRecord[]; meta: { total: number; total_pages: number } }>(
        `/fines?${params.toString()}`
      );
      setFines(res.data.data);
      setTotalRecords(res.data.meta.total);
      setTotalPages(res.data.meta.total_pages);
    } catch (err) {
      if (!isBackground) {
        setError(formatApiError(err));
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, appliedSearch, page, pageSize]);

  useEffect(() => {
    fetchFines();
  }, [fetchFines]);

  // Realtime synchronization: updates live when fines are incurred, paid, or waived
  useRealtimeSync('fines', () => fetchFines(true), 5000);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(cardCode);
    setPage(1);
  };

  const handleClearSearch = () => {
    setCardCode('');
    setAppliedSearch('');
    setPage(1);
  };

  const handleOpenCollect = (f: FineRecord) => {
    setCollectTarget(f);
    setCollectAmount(f.remaining_amount.toString());
    setCollectNote('');
  };

  const handleOpenWaive = (f: FineRecord) => {
    setWaiveTarget(f);
    setWaiveReason('');
  };

  const handleConfirmCollect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectTarget) return;

    setCollectLoading(true);
    try {
      const amountVal = parseInt(collectAmount, 10);
      await api.post(`/fines/${collectTarget.id}/collect`, {
        amount: amountVal,
        note: collectNote,
      });
      toast.success(`Đã thu ${formatCurrencyVND(amountVal)} thành công!`);
      setCollectTarget(null);
      fetchFines();
      broadcastRealtimeSync('fines');
      broadcastRealtimeSync('notifications');
      broadcastRealtimeSync('dashboard');
      window.dispatchEvent(new CustomEvent('uth-refresh-notifications'));
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setCollectLoading(false);
    }
  };

  const handleConfirmWaive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waiveTarget) return;

    if (!waiveReason.trim()) {
      toast.warning('Bắt buộc phải nhập lý do miễn giảm.');
      return;
    }

    setWaiveLoading(true);
    try {
      await api.post(`/fines/${waiveTarget.id}/waive`, {
        reason: waiveReason.trim(),
      });
      toast.success(`Đã miễn giảm khoản phạt cho bạn đọc ${waiveTarget.patron_name}.`);
      setWaiveTarget(null);
      fetchFines();
      broadcastRealtimeSync('fines');
      broadcastRealtimeSync('notifications');
      broadcastRealtimeSync('dashboard');
      window.dispatchEvent(new CustomEvent('uth-refresh-notifications'));
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setWaiveLoading(false);
    }
  };

  const getRoleAbbr = (role?: string) => {
    if (!role) return 'SV';
    const r = role.toLowerCase();
    if (r.includes('lecturer') || r.includes('giảng') || r.includes('teacher')) return 'GV';
    if (r.includes('admin') || r.includes('quản') || r.includes('librarian') || r.includes('thủ thư')) return 'AD';
    return 'SV';
  };

  return (
    <div className="space-y-5 pb-12 animate-page-enter">
      {/* Hero Header */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>Quản lý Tiền phạt & Công nợ (Fines)</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Thu tiền phạt trễ hạn, đền bù tài liệu hư hỏng hoặc làm mất sách theo biểu phí quy định của Thư viện UTH
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => fetchFines()}
            disabled={loading}
            className="text-xs h-9 px-3.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl bg-white transition-colors inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50 font-medium"
            title="Tải lại dữ liệu"
          >
            <RotateCw className={cn('w-3.5 h-3.5 text-gray-500', loading && 'animate-spin')} />
            <span>Làm mới</span>
          </button>
          <Link
            to="/admin/circulation"
            className="inline-flex items-center justify-center text-xs font-semibold h-9 px-4 rounded-xl border border-brand text-brand hover:bg-teal-50/70 transition-all bg-white shadow-2xs shrink-0"
          >
            <ScanLine className="w-3.5 h-3.5 mr-1.5 text-brand" />
            Mở Quầy lưu thông
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-xs border-gray-200/80">
        <CardContent className="p-4 space-y-3">
          {/* Segmented Filter Tabs: Soft Outline Pills */}
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3">
            <button
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
              onClick={() => {
                setStatusFilter('unpaid');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === 'unpaid'
                  ? 'bg-red-50 text-red-600 border-red-300 shadow-2xs'
                  : 'bg-red-50/60 text-red-600 border-red-200/80 hover:bg-red-100/70'
              )}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Chưa thanh toán</span>
            </button>

            <button
              onClick={() => {
                setStatusFilter('partial');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === 'partial'
                  ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                  : 'bg-amber-50/60 text-amber-700 border-amber-200/80 hover:bg-amber-100/70'
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Nộp một phần</span>
            </button>

            <button
              onClick={() => {
                setStatusFilter('paid');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === 'paid'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                  : 'bg-emerald-50/60 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70'
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đã thanh toán đủ</span>
            </button>

            <button
              onClick={() => {
                setStatusFilter('waived');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === 'waived'
                  ? 'bg-purple-50 text-purple-800 border-purple-300 shadow-2xs'
                  : 'bg-purple-50/60 text-purple-700 border-purple-200/80 hover:bg-purple-100/70'
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Được miễn giảm</span>
            </button>
          </div>

          {/* Search Controls & Pagination Limit */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xl flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  placeholder="Tìm bạn đọc (tên, MSSV/MGV), mã phạt hoặc tên sách..."
                  value={cardCode}
                  onChange={(e) => setCardCode(e.target.value)}
                  className="pl-9 pr-8 w-full text-xs h-9 rounded-xl border-gray-200 focus:border-brand bg-white"
                />
                {cardCode && (
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

      {/* Main Table */}
      {loading ? (
        <div className="p-16 text-center text-xs text-gray-500 bg-white border border-gray-200/80 rounded-2xl shadow-xs space-y-2">
          <RotateCw className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
          <p className="font-semibold text-gray-700">Đang tải danh sách khoản phạt...</p>
          <p className="text-[11px] text-gray-400">Đang đồng bộ tình trạng công nợ bạn đọc</p>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchFines()} />
      ) : fines.length === 0 ? (
        <EmptyState
          title="Không có khoản phạt nào"
          description={appliedSearch ? `Không có bản ghi nào khớp với từ khóa "${appliedSearch}".` : 'Hệ thống không ghi nhận khoản phạt nào phù hợp với bộ lọc.'}
        />
      ) : (
        <Card className="shadow-xs border-gray-200/80">
          <div className="overflow-x-auto min-h-[320px]">
            <Table containerClassName="border-0 shadow-none rounded-none">
              <TableHeader>
                <TableRow className="bg-gray-50/90 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                  <TableHead className="w-16">Mã</TableHead>
                  <TableHead className="w-56">Bạn đọc</TableHead>
                  <TableHead>Loại phạt / Ghi chú</TableHead>
                  <TableHead className="w-32">Tổng phạt</TableHead>
                  <TableHead className="w-32">Đã nộp</TableHead>
                  <TableHead className="w-32">Còn nợ</TableHead>
                  <TableHead className="w-32 text-center">Trạng thái</TableHead>
                  <TableHead className="w-20 text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fines.map((f, index) => {
                  const roleAbbr = getRoleAbbr(f.patron_role);
                  const firstChar = f.patron_name?.trim()?.charAt(0)?.toUpperCase() || 'U';

                  return (
                    <TableRow key={f.id} className="hover:bg-teal-50/15 transition-colors">
                      {/* ID */}
                      <TableCell className="font-mono text-gray-400 text-xs">
                        #{f.id}
                      </TableCell>

                      {/* Patron: Re-formatted with role badge at the outer edge */}
                      <TableCell>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-teal-50 text-brand font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200/70">
                              {firstChar}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 text-xs truncate" title={f.patron_name}>
                                {f.patron_name}
                              </p>
                              <p className="font-mono text-[11px] text-gray-500 mt-0.5">
                                {f.patron_card_code}
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

                      {/* Type & Note */}
                      <TableCell>
                        <p className="font-medium text-gray-800 text-xs">
                          {f.type === 'overdue' ? 'Phạt trễ hạn' : f.type === 'damage' ? 'Bồi thường hỏng sách' : 'Bồi thường mất sách'}
                        </p>
                        {f.book_title && (
                          <p className="text-[11px] text-gray-500 truncate max-w-sm" title={f.book_title}>
                            {f.book_title}
                          </p>
                        )}
                        {f.note && (
                          <p className="text-[11px] text-gray-400 italic mt-0.5 line-clamp-1">{f.note}</p>
                        )}
                      </TableCell>

                      {/* Total Amount */}
                      <TableCell className="font-mono font-medium text-gray-800 text-xs">
                        {formatCurrencyVND(f.amount)}
                      </TableCell>

                      {/* Paid */}
                      <TableCell className="font-mono text-emerald-700 font-medium text-xs">
                        {formatCurrencyVND(f.paid_amount)}
                      </TableCell>

                      {/* Remaining */}
                      <TableCell>
                        <span className={cn('font-mono font-bold text-xs', f.remaining_amount > 0 ? 'text-red-600' : 'text-gray-400')}>
                          {formatCurrencyVND(f.remaining_amount)}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            f.status === 'paid'
                              ? 'success'
                              : f.status === 'partial'
                              ? 'warning'
                              : f.status === 'waived'
                              ? 'default'
                              : 'danger'
                          }
                          size="sm"
                          hasDot
                        >
                          {f.status === 'paid'
                            ? 'Đã nộp đủ'
                            : f.status === 'partial'
                            ? 'Nộp một phần'
                            : f.status === 'waived'
                            ? 'Được miễn'
                            : 'Chưa nộp'}
                        </Badge>
                      </TableCell>

                      {/* Actions: ActionMenu */}
                      <TableCell className="text-center relative">
                        {f.remaining_amount > 0 && f.status !== 'waived' ? (
                          <ActionMenu
                            title={`Khoản phạt #${f.id}`}
                            statusDot={f.status === 'partial' ? 'warning' : 'danger'}
                            isNearBottom={index >= fines.length - 2 && fines.length > 2}
                            items={[
                              {
                                label: 'Hiện mã VietQR thanh toán',
                                icon: <QrCode className="w-3.5 h-3.5" />,
                                variant: 'info',
                                onClick: () => setQrTarget(f),
                              },
                              {
                                label: 'Thu tiền phạt tại quầy',
                                icon: <DollarSign className="w-3.5 h-3.5" />,
                                variant: 'primary',
                                onClick: () => handleOpenCollect(f),
                              },
                              {
                                label: 'Miễn giảm khoản phạt',
                                icon: <ShieldCheck className="w-3.5 h-3.5" />,
                                variant: 'purple',
                                isDividerBefore: true,
                                onClick: () => handleOpenWaive(f),
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

          {/* Pagination with Limit 5 */}
          <div className="p-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div>
              Hiển thị trang <strong>{page}</strong> / <strong>{totalPages}</strong> (Tổng <strong>{totalRecords}</strong> khoản phạt, giới hạn <strong>{pageSize}</strong>/trang)
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalRecords={totalRecords}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </Card>
      )}

      {/* Collect Modal */}
      <Modal
        isOpen={Boolean(collectTarget)}
        onClose={() => setCollectTarget(null)}
        title="Thu Tiền Phạt Lưu Thông UTH"
        description={`Bạn đọc: ${collectTarget?.patron_name} (${collectTarget?.patron_card_code})`}
        size="md"
      >
        <form onSubmit={handleConfirmCollect}>
          <ModalBody className="space-y-4">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Tổng khoản phạt:</span>
                <span className="font-bold text-gray-800">{formatCurrencyVND(collectTarget?.amount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Đã nộp trước đó:</span>
                <span className="font-bold text-emerald-700">{formatCurrencyVND(collectTarget?.paid_amount || 0)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1 text-red-600">
                <span className="font-semibold">Còn lại cần nộp:</span>
                <span className="font-bold text-sm">{formatCurrencyVND(collectTarget?.remaining_amount || 0)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Số tiền thu đợt này (VNĐ)</label>
              <Input
                type="number"
                value={collectAmount}
                onChange={(e) => setCollectAmount(e.target.value)}
                min="1000"
                max={collectTarget?.remaining_amount || 0}
                required
                className="w-full text-sm font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Ghi chú biên nhận (tùy chọn)</label>
              <Input
                type="text"
                placeholder="VD: Thu tiền mặt tại quầy A..."
                value={collectNote}
                onChange={(e) => setCollectNote(e.target.value)}
                className="w-full text-xs"
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <button
              type="button"
              onClick={() => setCollectTarget(null)}
              className="h-8 px-3.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center shadow-2xs"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={collectLoading}
              className="h-8 px-4 text-xs font-semibold rounded-lg border border-brand text-brand hover:bg-teal-50 bg-white transition-colors inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <DollarSign className="w-3.5 h-3.5 text-brand" />
              <span>{collectLoading ? 'Đang thu...' : 'Xác nhận thu tiền'}</span>
            </button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Waive Modal */}
      <Modal
        isOpen={Boolean(waiveTarget)}
        onClose={() => setWaiveTarget(null)}
        title="Miễn Giảm Khoản Phạt"
        description={`Bạn đọc: ${waiveTarget?.patron_name} (${waiveTarget?.patron_card_code})`}
        size="md"
      >
        <form onSubmit={handleConfirmWaive}>
          <ModalBody className="space-y-4">
            <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-purple-700">Khoản phạt:</span>
                <span className="font-bold text-purple-900">{formatCurrencyVND(waiveTarget?.remaining_amount || 0)}</span>
              </div>
              <p className="text-[11px] text-purple-600 mt-1">
                Lưu ý: Khoản phạt sau khi miễn giảm sẽ chuyển sang trạng thái "Được miễn" và không thể thu lại.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Lý do miễn giảm <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="VD: Lý do chính đáng có xác nhận của khoa..."
                value={waiveReason}
                onChange={(e) => setWaiveReason(e.target.value)}
                required
                className="w-full text-xs"
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <button
              type="button"
              onClick={() => setWaiveTarget(null)}
              className="h-8 px-3.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center shadow-2xs"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={waiveLoading}
              className="h-8 px-4 text-xs font-semibold rounded-lg border border-purple-400 text-purple-600 hover:bg-purple-50 bg-white transition-colors inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>{waiveLoading ? 'Đang miễn...' : 'Xác nhận miễn giảm'}</span>
            </button>
          </ModalFooter>
        </form>
      </Modal>

      {/* VietQR Payment Modal for Desk / Admin */}
      <QRFinePaymentModal
        isOpen={!!qrTarget}
        onClose={() => setQrTarget(null)}
        fineId={qrTarget?.id}
        amount={qrTarget?.remaining_amount || 0}
        fineTypeDisplay={
          qrTarget?.type === 'overdue'
            ? 'Quá hạn trả tài liệu'
            : qrTarget?.type === 'damage'
            ? 'Hư hỏng tài liệu'
            : 'Làm mất tài liệu'
        }
        bookTitle={qrTarget?.book_title}
        patronCardCode={qrTarget?.patron_card_code || ''}
        patronName={qrTarget?.patron_name}
        onSuccess={() => fetchFines(true)}
      />
    </div>
  );
};
