import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BookmarkCheck,
  Clock,
  ArrowUpCircle,
  Search,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  RotateCw,
  ScanLine,
  X,
  XCircle,
  Layers,
  Barcode as BarcodeIcon,
  Printer,
  Copy,
  MoreVertical,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Barcode } from '@/components/ui/Barcode';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { toast } from '@/components/ui/Toast';
import { useRealtimeSync, broadcastRealtimeSync } from '@/lib/realtime';
import { cn, formatDateVN } from '@/lib/utils';

interface ReservationItem {
  id: number;
  book?: {
    id: number;
    title: string;
    isbn?: string;
    cover_image?: string;
  };
  book_title?: string;
  book_cover?: string;
  book_isbn?: string;
  copy?: {
    id?: number;
    barcode: string;
    shelf_location?: string;
  };
  copy_barcode?: string;
  shelf_location?: string;
  user?: {
    id: number;
    full_name: string;
    card_code: string;
    role?: string;
    department?: string;
    avatar?: string;
  };
  patron_name?: string;
  patron_card_code?: string;
  patron_role?: string;
  patron_avatar?: string;
  status: 'ready' | 'pending' | 'fulfilled' | 'expired' | 'cancelled';
  status_display: string;
  queue_position?: number;
  created_at: string;
  ready_at?: string;
  hold_expires_at?: string;
}

export const AdminReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ready');
  const [search, setSearch] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [advancingId, setAdvancingId] = useState<number | null>(null);

  // Checkout & Cancel reservation states
  const [checkoutTarget, setCheckoutTarget] = useState<ReservationItem | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ReservationItem | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  // Barcode detail modal
  const [barcodeModalItem, setBarcodeModalItem] = useState<ReservationItem | null>(null);

  const fetchReservations = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setIsLoading(true);
      let url = `/reservations/all?page=${page}&page_size=${pageSize}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (appliedSearch.trim()) url += `&search=${encodeURIComponent(appliedSearch.trim())}`;

      const res = await api.get(url);
      setReservations(res.data?.data || []);
      setTotalRecords(res.data?.meta?.total || 0);
      setTotalPages(res.data?.meta?.total_pages || 1);
    } catch (err) {
      if (!isBackground) {
        console.error('Failed to fetch admin reservations', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, statusFilter, appliedSearch]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Realtime synchronization: updates live when holds/reservations change
  useRealtimeSync('reservations', () => fetchReservations(true), 5000);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(search);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch('');
    setAppliedSearch('');
    setPage(1);
  };

  const handleAdvance = async (resId: number) => {
    try {
      setAdvancingId(resId);
      await api.post(`/reservations/${resId}/advance`);
      toast.success('Đã ưu tiên chuyển yêu cầu lên vị trí #1 hàng chờ.');
      fetchReservations(true);
      broadcastRealtimeSync('reservations');
      broadcastRealtimeSync('notifications');
      broadcastRealtimeSync('dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Không thể điều chỉnh vị trí hàng chờ.');
    } finally {
      setAdvancingId(null);
    }
  };

  const handleConfirmCheckout = async () => {
    if (!checkoutTarget) return;
    const barcode = checkoutTarget.copy?.barcode || checkoutTarget.copy_barcode;
    if (!barcode) {
      toast.error('Yêu cầu giữ chỗ này chưa có mã vạch bản sao để xuất mượn.');
      return;
    }

    try {
      setIsActionLoading(true);
      await api.post('/loans/from-reservation', {
        reservation_id: checkoutTarget.id,
        barcode: barcode.trim(),
      });
      const patronName = checkoutTarget.user?.full_name || checkoutTarget.patron_name || 'bạn đọc';
      const bookTitle = checkoutTarget.book?.title || checkoutTarget.book_title || 'sách';
      toast.success(`Đã xuất mượn thành công sách "${bookTitle}" cho ${patronName}!`);
      setCheckoutTarget(null);
      fetchReservations(true);
      broadcastRealtimeSync('loans');
      broadcastRealtimeSync('reservations');
      broadcastRealtimeSync('books');
      broadcastRealtimeSync('notifications');
      broadcastRealtimeSync('dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Không thể xuất mượn từ yêu cầu giữ chỗ này.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      setIsActionLoading(true);
      await api.delete(`/reservations/${cancelTarget.id}`);
      toast.success('Đã hủy yêu cầu giữ chỗ. Bản sao đã được chuyển cho bạn đọc tiếp theo (nếu có)!');
      setCancelTarget(null);
      fetchReservations(true);
      broadcastRealtimeSync('reservations');
      broadcastRealtimeSync('notifications');
      broadcastRealtimeSync('dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Không thể hủy yêu cầu đặt trước.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCopyBarcode = (barcode: string) => {
    navigator.clipboard.writeText(barcode);
    toast.success(`Đã sao chép mã vạch: ${barcode}`);
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
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>Hàng chờ Đặt trước (Reservations)</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Theo dõi sách đang giữ tại quầy (quy định 3 ngày) và điều phối thứ tự hàng chờ của bạn đọc
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => fetchReservations()}
            disabled={isLoading}
            className="text-xs h-9 px-3.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl bg-white transition-colors inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50 font-medium"
            title="Tải lại dữ liệu"
          >
            <RotateCw className={cn('w-3.5 h-3.5 text-gray-500', isLoading && 'animate-spin')} />
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
                setStatusFilter('ready');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === 'ready'
                  ? 'bg-teal-100 text-teal-900 border-teal-300 ring-2 ring-brand/40 shadow-2xs'
                  : 'bg-teal-50/60 text-brand border-teal-200/80 hover:bg-teal-100/70'
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Đang giữ chỗ (Ready)</span>
            </button>

            <button
              onClick={() => {
                setStatusFilter('pending');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === 'pending'
                  ? 'bg-amber-100 text-amber-800 border-amber-300 ring-2 ring-amber-400 shadow-2xs'
                  : 'bg-amber-50/60 text-amber-700 border-amber-200/80 hover:bg-amber-100/70'
              )}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Hàng chờ (Pending)</span>
            </button>

            <button
              onClick={() => {
                setStatusFilter('fulfilled');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === 'fulfilled'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400 shadow-2xs'
                  : 'bg-emerald-50/60 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70'
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đã nhận sách</span>
            </button>

            <button
              onClick={() => {
                setStatusFilter('expired');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === 'expired'
                  ? 'bg-red-100 text-red-700 border-red-300 ring-2 ring-red-400 shadow-2xs'
                  : 'bg-red-50/60 text-red-600 border-red-200/80 hover:bg-red-100/70'
              )}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Hết hạn giữ</span>
            </button>

            <button
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
                  placeholder="Tìm theo mã thẻ, bạn đọc, tên tài liệu, mã vạch..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-8 w-full text-xs h-9 rounded-xl border-gray-200 focus:border-brand bg-white"
                />
                {search && (
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
      {isLoading ? (
        <div className="p-16 text-center text-xs text-gray-500 bg-white border border-gray-200/80 rounded-2xl shadow-xs space-y-2">
          <RotateCw className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
          <p className="font-semibold text-gray-700">Đang tải danh sách đặt trước...</p>
          <p className="text-[11px] text-gray-400">Đang đồng bộ tình trạng giữ chỗ tại quầy</p>
        </div>
      ) : reservations.length === 0 ? (
        <EmptyState
          title="Không có yêu cầu đặt trước nào"
          description={appliedSearch ? `Không có bản ghi nào khớp với từ khóa "${appliedSearch}".` : 'Hiện không có yêu cầu đặt trước nào trong mục này.'}
        />
      ) : (
        <Card className="shadow-xs border-gray-200/80">
          <div className="overflow-x-auto min-h-[320px]">
            <Table containerClassName="border-0 shadow-none rounded-none">
              <TableHeader>
                <TableRow className="bg-gray-50/90 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                  <TableHead className="w-16">Mã</TableHead>
                  <TableHead className="w-56">Bạn đọc</TableHead>
                  <TableHead>Tài liệu</TableHead>
                  <TableHead className="w-28 text-center">Mã vạch</TableHead>
                  <TableHead className="w-36 text-center">Hạn giữ / Vị trí</TableHead>
                  <TableHead className="w-32 text-center">Trạng thái</TableHead>
                  <TableHead className="w-20 text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((r, index) => {
                  const bookTitle = r.book?.title || r.book_title || 'Tài liệu Thư viện';
                  const patronName = r.user?.full_name || r.patron_name || 'Bạn đọc UTH';
                  const patronCard = r.user?.card_code || r.patron_card_code || '—';
                  const patronRole = r.user?.role || r.patron_role || 'student';
                  const roleAbbr = getRoleAbbr(patronRole);
                  const firstChar = patronName.trim().charAt(0).toUpperCase() || 'U';
                  const copyBarcode = r.copy?.barcode || r.copy_barcode;

                  return (
                    <TableRow key={r.id} className="hover:bg-teal-50/15 transition-colors">
                      {/* ID */}
                      <TableCell className="font-mono text-gray-400 text-xs">
                        #{r.id}
                      </TableCell>

                      {/* Patron: Re-formatted with role badge at the outer edge */}
                      <TableCell>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-teal-50 text-brand font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200/70">
                              {firstChar}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 text-xs truncate" title={patronName}>
                                {patronName}
                              </p>
                              <p className="font-mono text-[11px] text-gray-500 mt-0.5">
                                {patronCard}
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

                      {/* Book: ONLY document title */}
                      <TableCell>
                        <p className="font-medium text-gray-800 text-xs line-clamp-2 max-w-md" title={bookTitle}>
                          {bookTitle}
                        </p>
                      </TableCell>

                      {/* Barcode: Outline Button "Xem" */}
                      <TableCell className="text-center">
                        {copyBarcode ? (
                          <button
                            onClick={() => setBarcodeModalItem(r)}
                            className="text-xs h-7 px-3 rounded-lg border border-teal-500 text-teal-600 hover:bg-teal-50 bg-white transition-colors font-medium inline-flex items-center gap-1.5 shadow-2xs"
                            title="Xem chi tiết tem nhãn mã vạch"
                          >
                            <BarcodeIcon className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>Xem</span>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Chờ xếp bản</span>
                        )}
                      </TableCell>

                      {/* Expiry / Hold */}
                      <TableCell className="text-center">
                        {r.status === 'ready' ? (
                          <div className="space-y-0.5 inline-block text-center">
                            <span className="font-semibold text-red-600 text-xs block">
                              Hạn: {r.hold_expires_at ? formatDateVN(r.hold_expires_at) : '3 ngày'}
                            </span>
                            <span className="text-[11px] text-emerald-700 font-medium">Giữ tại quầy</span>
                          </div>
                        ) : r.status === 'pending' ? (
                          <span className="font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 text-xs">
                            Hàng chờ #{r.queue_position || 1}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Hoàn tất</span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        <Badge
                          variant={r.status === 'ready' ? 'ready' : r.status === 'pending' ? 'pending' : 'neutral'}
                          size="sm"
                          hasDot
                        >
                          {r.status_display}
                        </Badge>
                      </TableCell>

                      {/* Actions: ActionMenu Component */}
                      <TableCell className="text-center relative">
                        {r.status === 'ready' ? (
                          <ActionMenu
                            title={`Thao tác #${r.id}`}
                            statusDot="success"
                            isNearBottom={index >= reservations.length - 2 && reservations.length > 2}
                            items={[
                              {
                                label: 'Phát sách cho bạn đọc',
                                icon: <BookOpen className="w-3.5 h-3.5" />,
                                variant: 'primary',
                                onClick: () => setCheckoutTarget(r),
                              },
                              {
                                label: 'Hủy giữ chỗ',
                                icon: <XCircle className="w-3.5 h-3.5" />,
                                variant: 'danger',
                                isDividerBefore: true,
                                onClick: () => setCancelTarget(r),
                              },
                            ]}
                          />
                        ) : r.status === 'pending' ? (
                          <ActionMenu
                            title={`Thao tác #${r.id}`}
                            statusDot="warning"
                            isNearBottom={index >= reservations.length - 2 && reservations.length > 2}
                            items={[
                              {
                                label: 'Ưu tiên lên vị trí #1',
                                icon: <ArrowUpCircle className="w-3.5 h-3.5" />,
                                variant: 'primary',
                                disabled: advancingId === r.id,
                                onClick: () => handleAdvance(r.id),
                              },
                              {
                                label: 'Hủy đặt trước',
                                icon: <XCircle className="w-3.5 h-3.5" />,
                                variant: 'danger',
                                isDividerBefore: true,
                                onClick: () => setCancelTarget(r),
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
              Hiển thị trang <strong>{page}</strong> / <strong>{totalPages}</strong> (Tổng <strong>{totalRecords}</strong> yêu cầu đặt trước, giới hạn <strong>{pageSize}</strong>/trang)
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

      {/* Barcode Detail Modal */}
      <Modal
        isOpen={Boolean(barcodeModalItem)}
        onClose={() => setBarcodeModalItem(null)}
        title="Tem nhãn Mã vạch Bản sao Sách UTH"
        description="Mã vạch chuẩn Code128 phục vụ nhận sách đặt trước tại Quầy lưu thông"
        size="md"
      >
        {barcodeModalItem && (
          <>
            <ModalBody className="p-5">
              <div
                id="barcode-print-modal-area"
                className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-xl space-y-3 text-center shadow-2xs"
              >
                <div className="flex items-center justify-center space-x-2 border-b border-gray-200 pb-2">
                  <img src="/uth-logo.png" alt="UTH Logo" className="h-5 object-contain" />
                  <span className="text-[11px] uppercase font-semibold text-brand tracking-wide">
                    Thư viện ĐH Giao thông vận tải TP.HCM
                  </span>
                </div>

                <div className="py-2 flex justify-center overflow-hidden">
                  <Barcode
                    value={barcodeModalItem.copy?.barcode || barcodeModalItem.copy_barcode || ''}
                    height={55}
                    barWidth={1.6}
                    showText={true}
                    className="w-full max-w-full"
                  />
                </div>

                <div className="border-t border-gray-200 pt-2.5 text-left space-y-1.5 text-xs">
                  <p className="font-semibold text-gray-800 truncate" title={barcodeModalItem.book?.title || barcodeModalItem.book_title}>
                    {barcodeModalItem.book?.title || barcodeModalItem.book_title}
                  </p>
                  <div className="text-[11px] text-gray-500 space-y-0.5">
                    <p className="flex justify-between">
                      <span>Vị trí giữ: <strong className="text-gray-700">{barcodeModalItem.copy?.shelf_location || barcodeModalItem.shelf_location || 'Quầy lưu thông A'}</strong></span>
                      <span className="font-mono text-brand font-bold">{barcodeModalItem.copy?.barcode || barcodeModalItem.copy_barcode}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Bạn đọc đặt: <strong className="text-gray-700">{barcodeModalItem.user?.full_name || barcodeModalItem.patron_name}</strong></span>
                      <span>Hạn nhận: <strong className="text-red-600">{barcodeModalItem.hold_expires_at ? formatDateVN(barcodeModalItem.hold_expires_at) : '3 ngày'}</strong></span>
                    </p>
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <button
                onClick={() => handleCopyBarcode(barcodeModalItem.copy?.barcode || barcodeModalItem.copy_barcode || '')}
                className="h-8 px-3 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center shadow-2xs"
              >
                <Copy className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                Sao chép mã
              </button>
              <button
                onClick={() => setBarcodeModalItem(null)}
                className="h-8 px-3.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center shadow-2xs"
              >
                Đóng
              </button>
            </ModalFooter>
          </>
        )}
      </Modal>

      {/* Confirm Checkout Dialog */}
      <ConfirmDialog
        isOpen={Boolean(checkoutTarget)}
        title="Xác nhận phát sách giữ chỗ"
        message={
          checkoutTarget
            ? `Bạn có muốn hoàn tất thủ tục xuất mượn sách "${checkoutTarget.book?.title || checkoutTarget.book_title}" (Mã vạch: ${checkoutTarget.copy?.barcode || checkoutTarget.copy_barcode}) cho bạn đọc ${checkoutTarget.user?.full_name || checkoutTarget.patron_name} (${checkoutTarget.user?.card_code || checkoutTarget.patron_card_code})?`
            : ''
        }
        confirmText="Xác nhận phát sách"
        cancelText="Đóng"
        variant="primary"
        isLoading={isActionLoading}
        onConfirm={handleConfirmCheckout}
        onClose={() => setCheckoutTarget(null)}
      />

      {/* Confirm Cancel Dialog */}
      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        title="Xác nhận hủy yêu cầu giữ chỗ / đặt trước"
        message={
          cancelTarget
            ? `Hủy yêu cầu #${cancelTarget.id} của bạn đọc ${cancelTarget.user?.full_name || cancelTarget.patron_name}? Sách sẽ tự động được chuyển cho bạn đọc tiếp theo trong hàng chờ (nếu có) hoặc trả về kệ sẵn sàng.`
            : ''
        }
        confirmText="Xác nhận hủy"
        cancelText="Không"
        variant="danger"
        isLoading={isActionLoading}
        onConfirm={handleConfirmCancel}
        onClose={() => setCancelTarget(null)}
      />
    </div>
  );
};
