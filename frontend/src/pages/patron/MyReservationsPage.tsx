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
import { formatDateVN } from '@/lib/utils';
import { useRealtimeSync, broadcastRealtimeSync } from '@/lib/realtime';
import { cn } from '@/lib/utils';

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
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 3;
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  } catch {
    return 3;
  }
};

export const MyReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [cancellingItem, setCancellingItem] = useState<ReservationItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-page-enter">
      {/* Page Header Banner */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center">
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

      {/* Metric Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-teal-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-gray-500 font-medium block">Sẵn sàng nhận tại quầy</span>
            <span className="text-xl font-bold text-brand">{activeReady.length}</span>
            <span className="text-[11px] text-gray-400 block">Sách đang giữ chỗ</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <BookmarkCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-gray-500 font-medium block">Hàng chờ đặt trước</span>
            <span className="text-xl font-bold text-amber-600">{activePending.length}</span>
            <span className="text-[11px] text-gray-400 block">Đang đợi hoàn trả</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
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

      {/* Section 1: Sách sẵn sàng nhận tại quầy (Ready Passes) */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <BookmarkCheck className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-bold text-gray-800 tracking-tight flex items-center">
            <span className="text-orange-500 font-bold mr-1.5 select-none">&gt;</span>
            <span>Sách sẵn sàng nhận tại quầy ({activeReady.length})</span>
          </h2>
        </div>

        {activeReady.length === 0 ? (
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 text-center shadow-xs">
            <EmptyState
              title="Hiện không có sách nào đang chờ nhận tại quầy"
              description="Khi sách bạn đặt trước được hoàn trả về thư viện, hệ thống sẽ tự động gán bản sao, giữ tại quầy 3 ngày và gửi thông báo cho bạn."
            />
          </div>
        ) : (
          <div className="space-y-4">
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
                  className="bg-white border border-teal-300 rounded-2xl shadow-card overflow-hidden hover:shadow-lg transition-all"
                >
                  {/* Digital Pass Header Strip */}
                  <div className="bg-gradient-to-r from-teal-50 via-teal-100/40 to-slate-50 px-5 py-3 border-b border-teal-100 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
                        Sẵn sàng nhận tại quầy (Giữ 3 ngày)
                      </span>

                      <span className="text-[11px] font-semibold text-slate-600 bg-white/80 px-2 py-0.5 rounded border border-teal-200/80">
                        Quầy thủ thư UTH
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {daysLeft <= 1 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          Hạn chót hôm nay!
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100/70 text-brand border border-teal-200">
                          <Clock className="w-3 h-3 text-brand" />
                          Còn {daysLeft} ngày giữ
                        </span>
                      )}

                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setCancellingItem(res)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold border border-transparent hover:border-rose-200"
                      >
                        Hủy giữ chỗ
                      </Button>
                    </div>
                  </div>

                  {/* Digital Pass Body */}
                  <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Left: Book Information & Logistics */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex items-start space-x-4">
                        {/* Book Thumbnail */}
                        <div className="w-16 h-22 sm:w-20 sm:h-26 rounded-xl bg-slate-100 border border-border shadow-xs overflow-hidden shrink-0 flex items-center justify-center">
                          {bookCover ? (
                            <img
                              src={bookCover}
                              alt={bookTitle}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="w-8 h-8 text-slate-400" />
                          )}
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          {bookCategory && (
                            <span className="inline-block px-2 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {bookCategory}
                            </span>
                          )}

                          <h3 className="text-base sm:text-lg font-bold text-textPrimary leading-snug line-clamp-2">
                            {bookTitle}
                          </h3>

                          <div className="flex items-center gap-2 text-xs text-textSecondary">
                            <span>Mã bản sao:</span>
                            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                              {copyBarcode || 'Chưa gán'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Location & Deadline Box */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 block text-[11px]">Vị trí lưu kho & Nhận sách:</span>
                            <strong className="text-brand text-xs sm:text-sm font-bold">
                              {shelfLoc}
                            </strong>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 pt-1.5 border-t border-slate-200/70">
                          <Calendar className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 block text-[11px]">Hạn chót đến lấy sách:</span>
                            <strong className="text-slate-800 text-xs sm:text-sm font-bold">
                              {formatHoldExpiry(res.hold_expires_at)}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Barcode Voucher Box */}
                    <div className="lg:col-span-5 bg-gradient-to-b from-teal-50/50 to-white border border-teal-200 rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-brand mb-2">
                        <BarcodeIcon className="w-4 h-4 text-brand" />
                        <span>PHIẾU QUÉT NHẬN SÁCH TẠI QUẦY</span>
                      </div>

                      {copyBarcode ? (
                        <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-2xs inline-flex justify-center w-full max-w-[280px]">
                          <Barcode
                            value={copyBarcode}
                            height={50}
                            barWidth={1.8}
                            showText={true}
                          />
                        </div>
                      ) : (
                        <div className="p-4 bg-white border border-slate-200 rounded-lg text-xs text-textSecondary">
                          Mã vạch đang được đồng bộ...
                        </div>
                      )}

                      <p className="text-[11px] text-textSecondary mt-2.5 leading-relaxed max-w-xs">
                        Xuất trình mã vạch này cho Thủ thư quầy để quét bàn giao sách ngay tức thì.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Hàng chờ đặt trước (Pending Queue) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-bold text-gray-800 tracking-tight flex items-center">
            <span className="text-orange-500 font-bold mr-1.5 select-none">&gt;</span>
            <span>Hàng chờ đặt trước ({activePending.length})</span>
          </h2>
        </div>

        {activePending.length === 0 ? (
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 text-center shadow-xs">
            <EmptyState
              title="Không có tài liệu nào đang trong hàng chờ"
              description="Khi cuốn giáo trình bạn cần đã được độc giả khác mượn hết, hãy nhấn 'Đặt trước' để được tự động xếp chỗ ưu tiên."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePending.map((res) => (
              <div
                key={res.id}
                className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="warning" size="sm" hasDot>
                      Vị trí #{res.queue_position || 1} trong hàng chờ
                    </Badge>
                    <span className="text-[11px] text-gray-500">
                      Đặt lúc: {formatDateVN(res.created_at)}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-gray-800 line-clamp-2">
                    {res.book?.title || res.book_title || 'Tài liệu Thư viện'}
                  </h3>

                  <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    💡 Khi có bạn đọc hoàn trả sách, hệ thống sẽ tự động gán bản sao này cho bạn đầu
                    tiên và gửi thông báo chuông.
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 flex justify-end">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setCancellingItem(res)}
                    className="h-7 px-2.5 text-xs border border-gray-200 text-gray-600 hover:text-danger hover:border-danger/40 rounded-lg font-medium transition-colors shadow-2xs"
                  >
                    Rút khỏi hàng chờ
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Lịch sử đặt trước trước đây */}
      {pastReservations.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-bold text-gray-800 tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-1.5 select-none">&gt;</span>
              <span>Lịch sử đặt trước &amp; giữ chỗ trước đây ({pastReservations.length})</span>
            </h2>
          </div>

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
                {pastReservations.map((res) => {
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
                      <TableCell className="py-3.5 max-w-[320px]">
                        <div className="flex items-start space-x-3">
                          <div className="w-9 h-12 rounded-lg bg-teal-50 border border-teal-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
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
                            <p className="font-bold text-textPrimary text-xs sm:text-sm line-clamp-2 leading-snug">
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
                      <TableCell className="text-xs text-textSecondary py-3.5 whitespace-nowrap">
                        {formatDateVN(res.created_at)}
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="py-3.5 whitespace-nowrap">
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
                      <TableCell className="text-xs text-slate-600 py-3.5">
                        <span className={cn(res.no_show_counted && 'text-danger font-semibold')}>
                          {noteDisplay}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
