import React, { useEffect, useState, useCallback } from 'react';
import {
  BookmarkCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  Barcode as BarcodeIcon,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  BookOpen,
  Info,
  Check,
  X,
  History,
  Layers,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Barcode } from '@/components/ui/Barcode';
import { Pagination } from '@/components/ui/Pagination';
import { formatDateVN, getRemainingDays, cn } from '@/lib/utils';
import { useRealtimeSync, broadcastRealtimeSync } from '@/lib/realtime';

interface ReservationItem {
  id: number;
  book?: {
    id: number;
    title: string;
    cover_image?: string;
    isbn?: string;
    category?: { name: string; code?: string };
  };
  book_title?: string;
  book_cover?: string;
  book_isbn?: string;
  copy?: {
    id?: number;
    barcode: string;
    shelf_location?: string;
    reading_room_only?: boolean;
  };
  copy_barcode?: string;
  shelf_location?: string;
  status: 'ready' | 'pending' | 'fulfilled' | 'expired' | 'cancelled';
  status_display: string;
  queue_position?: number;
  created_at: string;
  ready_at?: string;
  hold_expires_at?: string;
  cancel_reason?: string;
  no_show_counted?: boolean;
}

const formatHoldExpiry = (dateStr?: string) => {
  if (!dateStr) return 'Trong vòng 3 ngày làm việc';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} lúc ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
};

const getDaysLeft = (dateStr?: string) => {
  if (!dateStr) return 3;
  return Math.max(0, getRemainingDays(dateStr));
};

export const MyReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [cancellingItem, setCancellingItem] = useState<ReservationItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'ready' | 'pending' | 'history'>('ready');
  const HISTORY_PAGE_SIZE = 5;

  const fetchReservations = useCallback(async (showSpinner = false, isBackground = false) => {
    try {
      if (showSpinner) setIsRefreshing(true);
      else if (!isBackground) setIsLoading(true);

      const res = await api.get('/reservations/me');
      setReservations(res.data?.data || []);
    } catch (err) {
      if (!isBackground) {
        console.error('Failed to fetch reservations', err);
        toast.error('Không thể tải danh sách đặt trước. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Realtime synchronization: updates live when a hold becomes ready or expires
  useRealtimeSync('reservations', () => fetchReservations(false, true), 5000);

  const handleConfirmCancel = async () => {
    if (!cancellingItem) return;
    try {
      setIsSubmitting(true);
      await api.delete(`/reservations/${cancellingItem.id}`);
      if (cancellingItem.status === 'ready') {
        toast.warning('Đã hủy giữ chỗ sách tại quầy.');
      } else {
        toast.success('Đã hủy yêu cầu đặt trước.');
      }
      setCancellingItem(null);
      fetchReservations(false, true);

      // Trigger realtime refresh for Header and Notifications & Admin
      broadcastRealtimeSync('reservations');
      broadcastRealtimeSync('notifications');
      broadcastRealtimeSync('dashboard');
      window.dispatchEvent(new CustomEvent('uth-refresh-notifications'));
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Không thể hủy yêu cầu đặt trước.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeReady = reservations.filter((r) => r.status === 'ready');
  const activePending = reservations.filter((r) => r.status === 'pending');
  const pastReservations = reservations.filter(
    (r) => r.status === 'fulfilled' || r.status === 'expired' || r.status === 'cancelled'
  );
  const totalHistoryPages = Math.ceil(pastReservations.length / HISTORY_PAGE_SIZE) || 1;
  const paginatedHistory = pastReservations.slice(
    (historyPage - 1) * HISTORY_PAGE_SIZE,
    historyPage * HISTORY_PAGE_SIZE
  );

  return (
    <div className="space-y-6 w-full pb-16 animate-page-enter">
      {/* Page Header Banner */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#008B8B] tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>Đặt trước &amp; Giữ chỗ sách</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Theo dõi hàng chờ đặt trước và nhận sách giữ chỗ tại quầy thủ thư UTH trong vòng 3 ngày làm việc
            </p>
          </div>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchReservations(true)}
            disabled={isRefreshing || isLoading}
            leftIcon={
              <RefreshCw
                className={cn('w-3.5 h-3.5 text-gray-500', isRefreshing && 'animate-spin')}
              />
            }
            className="h-9 px-3.5 border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl font-semibold text-xs shadow-2xs"
            title="Tải lại danh sách"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Metric Summary Cards / Tab Switchers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          onClick={() => setActiveTab('ready')}
          className={cn(
            'bg-white rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all border',
            activeTab === 'ready'
              ? 'border-brand ring-2 ring-brand/20 bg-teal-50/20 shadow-sm'
              : 'border-teal-200/80 hover:border-brand/60'
          )}
        >
          <div className="space-y-0.5">
            <span className="text-[11px] text-gray-500 font-medium block">Sẵn sàng nhận tại quầy</span>
            <span className="text-xl font-bold text-brand">{activeReady.length}</span>
            <span className="text-[11px] text-gray-400 block">Sách đang giữ chỗ 3 ngày</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <BookmarkCheck className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('pending')}
          className={cn(
            'bg-white rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all border',
            activeTab === 'pending'
              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20 shadow-sm'
              : 'border-gray-200/80 hover:border-amber-300'
          )}
        >
          <div className="space-y-0.5">
            <span className="text-[11px] text-gray-500 font-medium block">Hàng chờ đặt trước</span>
            <span className="text-xl font-bold text-amber-600">{activePending.length}</span>
            <span className="text-[11px] text-gray-400 block">Đang đợi hoàn trả</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('history')}
          className={cn(
            'bg-white rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all border',
            activeTab === 'history'
              ? 'border-slate-500 ring-2 ring-slate-500/20 bg-slate-50/20 shadow-sm'
              : 'border-gray-200/80 hover:border-slate-300'
          )}
        >
          <div className="space-y-0.5">
            <span className="text-[11px] text-gray-500 font-medium block">Lịch sử đặt trước</span>
            <span className="text-xl font-bold text-gray-700">{pastReservations.length}</span>
            <span className="text-[11px] text-gray-400 block">Lượt đã hoàn tất</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center shrink-0 shadow-2xs">
            <History className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Segmented Navigation Tab Bar */}
      <div className="flex border-b border-gray-200 bg-white rounded-xl px-2 shadow-2xs">
        <button
          onClick={() => setActiveTab('ready')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-4 sm:px-6 py-3 text-xs font-semibold transition-all cursor-pointer',
            activeTab === 'ready'
              ? 'border-brand text-brand font-bold bg-teal-50/40'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
        >
          <BookmarkCheck className="w-4 h-4 text-brand" />
          <span>Sẵn sàng nhận tại quầy</span>
          <span className={cn(
            'ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold',
            activeTab === 'ready' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'
          )}>
            {activeReady.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-4 sm:px-6 py-3 text-xs font-semibold transition-all cursor-pointer',
            activeTab === 'pending'
              ? 'border-amber-600 text-amber-700 font-bold bg-amber-50/40'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Hàng chờ đặt trước</span>
          <span className={cn(
            'ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold',
            activeTab === 'pending' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600'
          )}>
            {activePending.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-4 sm:px-6 py-3 text-xs font-semibold transition-all cursor-pointer',
            activeTab === 'history'
              ? 'border-gray-700 text-gray-800 font-bold bg-gray-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
        >
          <History className="w-4 h-4 text-gray-500" />
          <span>Lịch sử đặt trước</span>
          <span className={cn(
            'ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold',
            activeTab === 'history' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'
          )}>
            {pastReservations.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Sách sẵn sàng nhận tại quầy (Compact Cards) */}
      {activeTab === 'ready' && (
        <div className="space-y-3">
          {activeReady.length === 0 ? (
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 text-center shadow-xs">
              <EmptyState
                title="Hiện không có sách nào đang chờ nhận tại quầy"
                description="Khi sách bạn đặt trước được hoàn trả về thư viện, hệ thống sẽ tự động gán bản sao, giữ tại quầy 3 ngày và gửi thông báo cho bạn."
              />
            </div>
          ) : (
            <div className="space-y-3">
              {activeReady.map((res) => {
                const daysLeft = getDaysLeft(res.hold_expires_at);
                const bookTitle = res.book?.title || res.book_title || 'Tài liệu Thư viện';
                const bookCover = res.book?.cover_image || res.book_cover;
                const bookCategory = res.book?.category?.name;
                const copyBarcode = res.copy?.barcode || res.copy_barcode;
                const shelfLoc =
                  res.copy?.shelf_location || res.shelf_location || 'Quầy thủ thư Cơ sở 1';

                return (
                  <div
                    key={res.id}
                    className="bg-white border border-teal-200/90 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row gap-4 items-center justify-between"
                  >
                    {/* Left: Cover & Details */}
                    <div className="flex items-start space-x-3.5 flex-1 min-w-0 w-full">
                      {/* Compact Book Cover */}
                      <div className="w-16 h-22 sm:w-20 sm:h-26 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                        {bookCover ? (
                          <img
                            src={bookCover}
                            alt={bookTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen className="w-7 h-7 text-slate-400" />
                        )}
                      </div>

                      {/* Info & Shelf Location */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
                            Sẵn sàng nhận tại quầy (Giữ 3 ngày)
                          </span>
                          {daysLeft <= 1 ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Hạn chót hôm nay!
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-brand border border-teal-200">
                              <Clock className="w-3 h-3 text-brand" />
                              Còn {daysLeft} ngày
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-gray-800 line-clamp-1" title={bookTitle}>
                          {bookTitle}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                          {bookCategory && (
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                              {bookCategory}
                            </span>
                          )}
                          <span>
                            Mã bản sao: <strong className="font-mono text-slate-800">{copyBarcode || 'Chưa gán'}</strong>
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs pt-0.5 text-gray-600">
                          <div className="flex items-center gap-1 text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
                            <span>Vị trí: <strong className="text-brand font-semibold">{shelfLoc}</strong></span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Hạn lấy: <strong className="text-gray-800">{formatHoldExpiry(res.hold_expires_at)}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Barcode Pass Voucher & Cancel Action */}
                    <div className="flex md:flex-col items-center justify-between md:justify-center gap-2.5 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                      {copyBarcode ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex flex-col items-center">
                          <span className="text-[10px] font-bold text-brand uppercase tracking-wider mb-1">
                            Phiếu nhận sách
                          </span>
                          <Barcode
                            value={copyBarcode}
                            height={34}
                            barWidth={1.5}
                            showText={true}
                          />
                        </div>
                      ) : null}

                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setCancellingItem(res)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-[11px] font-bold"
                      >
                        Hủy giữ chỗ
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Hàng chờ đặt trước (Compact Cards) */}
      {activeTab === 'pending' && (
        <div className="space-y-3">
          {activePending.length === 0 ? (
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 text-center shadow-xs">
              <EmptyState
                title="Không có tài liệu nào đang trong hàng chờ"
                description="Khi cuốn giáo trình bạn cần đã được độc giả khác mượn hết, hãy nhấn 'Đặt trước' để được tự động xếp chỗ ưu tiên."
              />
            </div>
          ) : (
            <div className="space-y-3">
              {activePending.map((res) => {
                const bookTitle = res.book?.title || res.book_title || 'Tài liệu Thư viện';
                const bookCover = res.book?.cover_image || res.book_cover;
                const bookCategory = res.book?.category?.name;

                return (
                  <div
                    key={res.id}
                    className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row gap-4 items-center justify-between"
                  >
                    <div className="flex items-start space-x-3.5 flex-1 min-w-0 w-full">
                      {/* Compact Book Cover */}
                      <div className="w-16 h-22 sm:w-20 sm:h-26 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                        {bookCover ? (
                          <img
                            src={bookCover}
                            alt={bookTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen className="w-7 h-7 text-slate-400" />
                        )}
                      </div>

                      {/* Details & Queue status */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Badge variant="warning" size="sm" hasDot>
                            Vị trí #{res.queue_position || 1} trong hàng chờ
                          </Badge>
                          <span className="text-[11px] text-gray-400">
                            Đặt lúc: {formatDateVN(res.created_at)}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-gray-800 line-clamp-1" title={bookTitle}>
                          {bookTitle}
                        </h3>

                        {bookCategory && (
                          <span className="inline-block text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                            {bookCategory}
                          </span>
                        )}

                        <p className="text-[11px] text-amber-800 bg-amber-50/70 border border-amber-200/70 p-2 rounded-lg leading-relaxed">
                          💡 Khi có sách hoàn trả, hệ thống sẽ tự động gán bản sao này cho bạn đầu tiên, chuyển sang mục <strong>"Sẵn sàng nhận tại quầy"</strong> và giữ sách trong 3 ngày.
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 w-full md:w-auto flex justify-end pt-2 md:pt-0">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setCancellingItem(res)}
                        className="h-7 px-3 text-xs border border-gray-200 text-gray-600 hover:text-danger hover:border-danger/40 rounded-lg font-medium shadow-2xs"
                      >
                        Rút khỏi hàng chờ
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Lịch sử đặt trước trước đây */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/90 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                  <TableHead className="py-3.5 font-bold text-gray-600">Tài liệu đã đặt</TableHead>
                  <TableHead className="py-3.5 font-bold text-gray-600">Ngày yêu cầu</TableHead>
                  <TableHead className="py-3.5 font-bold text-gray-600">Trạng thái xử lý</TableHead>
                  <TableHead className="py-3.5 font-bold text-gray-600">Ghi chú &amp; Chi tiết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedHistory.map((res) => {
                  const bookTitle = res.book?.title || res.book_title || 'Tài liệu Thư viện';
                  const bookCover = res.book?.cover_image || res.book_cover;
                  const categoryName = res.book?.category?.name;

                  // Clean humanized cancel note
                  let noteDisplay = '—';
                  if (res.status === 'fulfilled') {
                    noteDisplay = 'Đã bàn giao sách tại quầy lưu thông';
                  } else if (res.no_show_counted) {
                    noteDisplay = 'Quá hạn 3 ngày (Không đến lấy sách)';
                  } else if (res.cancel_reason) {
                    if (
                      res.cancel_reason.toLowerCase().includes('hủy bởi') ||
                      res.cancel_reason.toLowerCase().includes('huy boi')
                    ) {
                      noteDisplay = 'Bạn đọc chủ động hủy yêu cầu';
                    } else {
                      noteDisplay = res.cancel_reason;
                    }
                  } else if (res.status === 'expired') {
                    noteDisplay = 'Hết hạn giữ chỗ tại quầy (3 ngày)';
                  } else if (res.status === 'cancelled') {
                    noteDisplay = 'Yêu cầu đặt trước đã hủy';
                  }

                  return (
                    <TableRow key={res.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Book info with thumbnail */}
                      <TableCell className="py-3 max-w-[320px]">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-11 rounded bg-teal-50 border border-teal-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                            {bookCover ? (
                              <img
                                src={bookCover}
                                alt={bookTitle}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BookOpen className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            {categoryName && (
                              <span className="text-[10px] font-bold text-primary block leading-tight">
                                {categoryName}
                              </span>
                            )}
                            <p className="font-bold text-textPrimary text-xs sm:text-sm line-clamp-1 leading-snug">
                              {bookTitle}
                            </p>
                            {res.copy_barcode && (
                              <span className="font-mono text-[10px] text-slate-500 font-semibold">
                                Bản sao: {res.copy_barcode}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Request Date */}
                      <TableCell className="text-xs text-textSecondary py-3 whitespace-nowrap">
                        {formatDateVN(res.created_at)}
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="py-3 whitespace-nowrap">
                        {res.status === 'fulfilled' ? (
                          <Badge variant="fulfilled" size="sm" hasDot>
                            Đã nhận sách
                          </Badge>
                        ) : res.status === 'expired' ? (
                          <Badge variant="expired" size="sm">
                            Hết hạn giữ
                          </Badge>
                        ) : (
                          <Badge variant="cancelled" size="sm">
                            Đã hủy
                          </Badge>
                        )}
                      </TableCell>

                      {/* Clean Note */}
                      <TableCell className="text-xs text-slate-600 py-3">
                        <span className={cn(res.no_show_counted && 'text-danger font-semibold')}>
                          {noteDisplay}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {totalHistoryPages > 1 && (
              <div className="p-3.5 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Hiển thị {(historyPage - 1) * HISTORY_PAGE_SIZE + 1} -{' '}
                  {Math.min(historyPage * HISTORY_PAGE_SIZE, pastReservations.length)} trong tổng số{' '}
                  {pastReservations.length} lượt
                </span>
                <Pagination
                  currentPage={historyPage}
                  totalPages={totalHistoryPages}
                  onPageChange={setHistoryPage}
                  totalRecords={pastReservations.length}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(cancellingItem)}
        title={cancellingItem?.status === 'ready' ? 'Hủy giữ sách tại quầy?' : 'Hủy xếp hàng chờ?'}
        message={
          cancellingItem?.status === 'ready'
            ? `Sách "${cancellingItem.book?.title || cancellingItem.book_title || 'Tài liệu Thư viện'}" đang được giữ cho bạn tại quầy. Nếu hủy lúc này, lượt này sẽ bị ghi nhận 1 lần vi phạm do không đến nhận sách. Bạn có chắc chắn muốn hủy không?`
            : `Bạn có chắc muốn rút khỏi hàng chờ cuốn "${cancellingItem?.book?.title || cancellingItem?.book_title || 'Tài liệu Thư viện'}" không?`
        }
        variant={cancellingItem?.status === 'ready' ? 'danger' : 'primary'}
        confirmText="Xác nhận hủy"
        cancelText="Đóng"
        isLoading={isSubmitting}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancellingItem(null)}
      />
    </div>
  );
};
