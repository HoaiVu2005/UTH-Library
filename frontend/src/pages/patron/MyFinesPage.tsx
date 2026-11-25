import React, { useEffect, useState, useCallback } from 'react';
import {
  Receipt,
  AlertCircle,
  CheckCircle2,
  Info,
  DollarSign,
  QrCode,
  CreditCard,
  Building,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Printer,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { QRFinePaymentModal } from '@/components/ui/QRFinePaymentModal';
import { ReceiptPrintModal, ReceiptData } from '@/pages/admin/students/ReceiptPrintModal';
import { formatDateVN, formatCurrencyVND } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { useRealtimeSync } from '@/lib/realtime';

interface FineItem {
  id: number;
  type: string;
  type_display?: string;
  book_title?: string;
  book_cover_image?: string;
  copy_barcode?: string;
  amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: string;
  status_display?: string;
  damage_level?: string;
  note?: string;
  waive_reason?: string;
  created_at: string;
  loan?: any;
}

export const MyFinesPage: React.FC = () => {
  const { user } = useAuth();
  const [fines, setFines] = useState<FineItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showQRGuide, setShowQRGuide] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const PAGE_SIZE = 5;

  const handleOpenReceipt = (fine: FineItem) => {
    const bookTitle = fine.book_title || (typeof fine.loan === 'object' && fine.loan?.book_title) || '';
    const barcode = fine.copy_barcode || (typeof fine.loan === 'object' && fine.loan?.barcode) || '';
    const typeDisplay =
      fine.type_display ||
      (fine.type === 'overdue'
        ? 'Phạt quá hạn trả tài liệu'
        : fine.type === 'damage'
        ? 'Bồi thường hư hỏng tài liệu'
        : fine.type === 'lost'
        ? 'Bồi thường làm mất tài liệu'
        : 'Khoản phạt vi phạm lưu thông');

    const data: ReceiptData = {
      receipt_code: `BL-PHAT-${String(fine.id).padStart(6, '0')}`,
      transaction_code: `GD-FINE-${fine.id}-${new Date(fine.created_at).getTime().toString().slice(-4)}`,
      amount: fine.paid_amount > 0 ? fine.paid_amount : fine.amount,
      payment_method: 'transfer',
      payment_method_display: 'Chuyển khoản VietQR Napas 24/7 (Sacombank)',
      payer_name: user?.full_name || 'Bạn đọc Thư viện UTH',
      student_code: user?.card_code || user?.username || 'SV20260001',
      department: user?.department || 'Trường Đại học Giao thông Vận tải TP.HCM',
      collected_by_name: 'Cổng thanh toán tự động VietQR / SePay UTH',
      collected_at: fine.created_at || new Date().toISOString(),
      title: 'BIÊN LAI THU TIỀN PHẠT THƯ VIỆN ĐIỆN TỬ',
      fee_item_name: typeDisplay,
      fee_item_detail: bookTitle
        ? `Tài liệu: ${bookTitle}${barcode ? ` (${barcode})` : ''}`
        : 'Vi phạm quy chế lưu thông Thư viện UTH',
    };
    setSelectedReceipt(data);
  };

  // QR Modal state for paying online from home
  const [qrModalData, setQrModalData] = useState<{
    isOpen: boolean;
    isPayAll: boolean;
    fineId?: number | null;
    amount: number;
    fineTypeDisplay?: string;
    bookTitle?: string;
  }>({
    isOpen: false,
    isPayAll: false,
    amount: 0,
  });

  const fetchFines = useCallback(async (showSpinner = false, isBackground = false) => {
    try {
      if (showSpinner) setIsRefreshing(true);
      else if (!isBackground) setIsLoading(true);

      const res = await api.get('/fines/me');
      const data = (res.data?.data || []).map((f: any) => ({
        ...f,
        remaining_amount: f.amount - (f.paid_amount || 0),
      }));
      setFines(data);
    } catch (err) {
      if (!isBackground) {
        console.error('Failed to fetch fines', err);
        toast.error('Không thể tải dữ liệu công nợ. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFines();
  }, [fetchFines]);

  // Realtime synchronization: updates live when fine is paid or waived by librarian
  useRealtimeSync('fines', () => fetchFines(false, true), 5000);

  const totalDebt = fines
    .filter((f) => f.status === 'unpaid' || f.status === 'partial')
    .reduce((sum, f) => sum + f.remaining_amount, 0);

  const totalPaid = fines.reduce((sum, f) => sum + f.paid_amount, 0);
  const totalPages = Math.ceil(fines.length / PAGE_SIZE) || 1;
  const paginatedFines = fines.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5 w-full pb-16 animate-page-enter">
      {/* Page Header Banner */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#008B8B] tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>Tiền phạt & Công nợ</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Theo dõi các khoản phí quá hạn, bồi thường hư hại hoặc làm mất tài liệu theo quy định
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchFines(true)}
            disabled={isRefreshing || isLoading}
            className="text-xs h-9 px-3.5 border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5 text-gray-500', isRefreshing && 'animate-spin')} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Tổng nợ */}
        <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
              <span>TỔNG NỢ CẦN THANH TOÁN</span>
              <DollarSign className="w-4 h-4 text-gray-400" />
            </div>
            <div className="my-2">
              <span
                className={cn(
                  'text-2xl sm:text-3xl font-extrabold font-mono',
                  totalDebt > 0 ? 'text-red-600' : 'text-gray-800'
                )}
              >
                {formatCurrencyVND(totalDebt)}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-snug">
              {totalDebt > 0
                ? 'Vui lòng thanh toán để tránh bị tạm khóa quyền mượn sách.'
                : 'Tài khoản sạch, không có công nợ nào cần thanh toán.'}
            </p>
          </div>

          {totalDebt > 0 && (
            <Button
              size="sm"
              variant="primary"
              onClick={() =>
                setQrModalData({
                  isOpen: true,
                  isPayAll: true,
                  amount: totalDebt,
                  fineTypeDisplay: 'Nộp phạt toàn bộ công nợ',
                })
              }
              className="mt-3 w-full bg-[#008B8B] hover:bg-[#007A7A] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
            >
              <QrCode className="w-4 h-4" />
              <span>Nộp phạt tại nhà qua VietQR</span>
            </Button>
          )}
        </div>

        {/* Card 2: Đã nộp */}
        <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-700">
            <span>TỔNG TIỀN ĐÃ NỘP PHẠT</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600">
              {formatCurrencyVND(totalPaid)}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 leading-snug">
            Mọi khoản nộp phạt đều được cấp biên lai minh bạch tại Quầy thủ thư UTH.
          </p>
        </div>

        {/* Card 3: Biểu phí UTH */}
        <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-200/80 shadow-2xs flex flex-col justify-between text-xs">
          <div className="flex items-center justify-between font-bold text-brand">
            <span>BIỂU PHÍ LƯU THÔNG UTH</span>
            <Building className="w-4 h-4 text-brand" />
          </div>
          <div className="my-2 space-y-1 text-[11.5px] text-gray-700">
            <div className="flex justify-between">
              <span>Quá hạn trả sách:</span>
              <strong className="text-brand">1.000 đ / ngày</strong>
            </div>
            <div className="flex justify-between">
              <span>Làm hỏng / mất sách:</span>
              <strong className="text-gray-800">100% giá bìa + 20k phí</strong>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 italic">
            Theo Quyết định ban hành Quy chế Thư viện số UTH.
          </p>
        </div>
      </div>

      {/* Payment Guide Box */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <Info className="w-5 h-5 text-brand" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm font-bold text-gray-800">
              Hướng dẫn thanh toán công nợ Thư viện UTH:
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
              Bạn đọc mang mã số Thẻ sinh viên / Thẻ bạn đọc đến trực tiếp{' '}
              <strong className="text-brand font-bold">Quầy lưu thông Thư viện UTH (Tầng 1 - Khu A)</strong>{' '}
              để nộp tiền mặt hoặc quét mã QR ngân hàng tại quầy. Hệ thống sẽ mở khóa mượn sách tức thì.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowQRGuide(!showQRGuide)}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-teal-50 text-brand border border-teal-200 flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
        >
          <QrCode className="w-4 h-4 text-brand" />
          <span>{showQRGuide ? 'Ẩn thông tin CK' : 'Thông tin Chuyển khoản'}</span>
        </button>
      </div>

      {/* Expandable Bank Transfer Box */}
      {showQRGuide && (
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs animate-in fade-in duration-150 text-xs">
          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-brand" />
            <span>Thông tin tiếp nhận nộp phạt qua tài khoản Sacombank:</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-gray-700">
            <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
              <span className="text-[11px] text-gray-500 block">Ngân hàng thụ hưởng:</span>
              <strong className="text-xs text-slate-800">Sacombank (STB)</strong>
            </div>
            <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
              <span className="text-[11px] text-gray-500 block">Số tài khoản:</span>
              <strong className="text-xs font-mono text-slate-900">040117536833</strong>
            </div>
            <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
              <span className="text-[11px] text-gray-500 block">Chủ tài khoản:</span>
              <strong className="text-xs font-mono text-slate-900">LE HOAI VU</strong>
            </div>
            <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
              <span className="text-[11px] text-gray-500 block">Cú pháp chuyển khoản:</span>
              <strong className="text-xs font-mono text-[#008B8B]">UTH [Mã_Thẻ] NOP PHAT</strong>
            </div>
          </div>
        </div>
      )}

      {/* Fines Table Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-800 tracking-tight flex items-center">
          <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
          <span>Danh sách các khoản phạt</span>
          <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-brand border border-teal-200">
            {fines.length}
          </span>
        </h2>

        {isLoading ? (
          <div className="p-16 text-center text-xs text-gray-500 bg-white border border-gray-200/80 rounded-2xl shadow-xs space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
            <p className="font-semibold text-gray-700">Đang tải dữ liệu công nợ...</p>
          </div>
        ) : fines.length === 0 ? (
          <EmptyState
            title="Không có khoản phạt nào"
            description="Bạn luôn hoàn trả sách đúng hạn và giữ gìn tài liệu rất tốt. Cảm ơn ý thức bảo quản tài liệu của bạn đọc!"
          />
        ) : (
          <Card className="shadow-xs overflow-hidden border-gray-200/80">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/90 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                  <TableHead>Lý do phạt / Tài liệu</TableHead>
                  <TableHead className="w-32 text-center">Ngày phát sinh</TableHead>
                  <TableHead className="w-28 text-right">Mức phạt</TableHead>
                  <TableHead className="w-28 text-right">Đã nộp</TableHead>
                  <TableHead className="w-28 text-right">Còn nợ</TableHead>
                  <TableHead className="w-28 text-center">Trạng thái</TableHead>
                  <TableHead className="w-40">Ghi chú / Biên lai</TableHead>
                  <TableHead className="w-28 text-center">Nộp phạt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFines.map((fine) => {
                  const bookTitle = fine.book_title || (typeof fine.loan === 'object' && fine.loan?.book_title) || '';
                  const barcode = fine.copy_barcode || (typeof fine.loan === 'object' && fine.loan?.barcode) || '';
                  const typeDisplay =
                    fine.type_display ||
                    (fine.type === 'overdue'
                      ? 'Quá hạn trả tài liệu'
                      : fine.type === 'damage'
                      ? 'Hư hỏng tài liệu'
                      : fine.type === 'lost'
                      ? 'Làm mất tài liệu'
                      : 'Khoản phạt vi phạm');
                  const statusDisplay =
                    fine.status_display ||
                    (fine.status === 'paid'
                      ? 'Đã thanh toán'
                      : fine.status === 'partial'
                      ? 'Thanh toán một phần'
                      : fine.status === 'waived'
                      ? 'Được miễn giảm'
                      : 'Chưa thanh toán');

                  return (
                    <TableRow key={fine.id} className="hover:bg-teal-50/15 transition-colors">
                      {/* Reason & Book Title */}
                      <TableCell className="max-w-[320px]">
                        <div className="flex items-start space-x-3">
                          {bookTitle && (
                            <div className="w-9 h-12 rounded bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                              {fine.book_cover_image || fine.loan?.book?.cover_image ? (
                                <img
                                  src={fine.book_cover_image || fine.loan?.book?.cover_image}
                                  alt={bookTitle}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <BookOpen className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-800 text-xs">
                              {typeDisplay}
                            </p>
                            {bookTitle ? (
                              <p className="text-[11.5px] text-gray-600 mt-0.5 line-clamp-1" title={bookTitle}>
                                Sách: <span className="font-medium text-gray-800">{bookTitle}</span>{' '}
                                {barcode && (
                                  <span className="font-mono text-gray-400">
                                    ({barcode})
                                  </span>
                                )}
                              </p>
                            ) : (
                              <p className="text-[10.5px] text-gray-400 mt-0.5 italic">
                                Phạt vi phạm quy chế lưu thông Thư viện
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-xs text-gray-500 text-center whitespace-nowrap">
                        {formatDateVN(fine.created_at)}
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="font-mono font-medium text-gray-800 text-xs text-right whitespace-nowrap">
                        {formatCurrencyVND(fine.amount)}
                      </TableCell>

                      {/* Paid Amount */}
                      <TableCell className="font-mono font-medium text-emerald-600 text-xs text-right whitespace-nowrap">
                        {formatCurrencyVND(fine.paid_amount || 0)}
                      </TableCell>

                      {/* Remaining */}
                      <TableCell className="font-mono font-bold text-xs text-right whitespace-nowrap">
                        {fine.remaining_amount > 0 ? (
                          <span className="text-red-600">{formatCurrencyVND(fine.remaining_amount)}</span>
                        ) : (
                          <span className="text-emerald-600">0 đ</span>
                        )}
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="text-center">
                        <Badge status={fine.status} size="sm">
                          {statusDisplay}
                        </Badge>
                      </TableCell>

                      {/* Notes & Receipt */}
                      <TableCell className="text-xs text-gray-500">
                        <div className="space-y-1">
                          {fine.waive_reason ? (
                            <span className="text-purple-700 italic block">Miễn giảm: {fine.waive_reason}</span>
                          ) : (
                            fine.note && <span className="block">{fine.note}</span>
                          )}
                          {(fine.status === 'paid' || fine.paid_amount > 0) && (
                            <button
                              type="button"
                              onClick={() => handleOpenReceipt(fine)}
                              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#008B8B] hover:text-[#006F70] bg-teal-50 hover:bg-teal-100/80 px-2.5 py-1 rounded-lg border border-teal-200 transition-colors shadow-2xs whitespace-nowrap"
                              title="Bấm để xem và in biên lai thu tiền phạt"
                            >
                              <Printer className="w-3.5 h-3.5 text-[#008B8B] shrink-0" />
                              <span className="whitespace-nowrap">In biên lai</span>
                            </button>
                          )}
                        </div>
                      </TableCell>

                      {/* Pay Button via VietQR */}
                      <TableCell className="text-center whitespace-nowrap">
                        {fine.remaining_amount > 0 ? (
                          <Button
                            size="xs"
                            variant="primary"
                            onClick={() =>
                              setQrModalData({
                                isOpen: true,
                                isPayAll: false,
                                fineId: fine.id,
                                amount: fine.remaining_amount,
                                fineTypeDisplay: typeDisplay,
                                bookTitle: bookTitle,
                              })
                            }
                            className="h-7 px-2.5 text-[11px] font-semibold bg-teal-50 hover:bg-[#008B8B] text-teal-800 hover:text-white border border-teal-200 transition-all rounded-lg flex items-center gap-1 mx-auto shadow-2xs"
                            title="Nộp phạt khoản này qua VietQR"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Quét mã</span>
                          </Button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenReceipt(fine)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors shadow-2xs"
                            title="Đã thanh toán - Bấm để in biên lai"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Đã nộp</span>
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Hiển thị {(page - 1) * PAGE_SIZE + 1} -{' '}
                  {Math.min(page * PAGE_SIZE, fines.length)} trong tổng số {fines.length} khoản phạt
                </span>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalRecords={fines.length}
                />
              </div>
            )}
          </Card>
        )}
      </div>

      {/* VietQR Payment Modal */}
      <QRFinePaymentModal
        isOpen={qrModalData.isOpen}
        onClose={() => setQrModalData((prev) => ({ ...prev, isOpen: false }))}
        isPayAll={qrModalData.isPayAll}
        fineId={qrModalData.fineId}
        amount={qrModalData.amount}
        fineTypeDisplay={qrModalData.fineTypeDisplay}
        bookTitle={qrModalData.bookTitle}
        patronCardCode={user?.card_code || 'SV20260001'}
        patronName={user?.full_name}
        onSuccess={() => fetchFines(true)}
      />

      {/* Official Fine Receipt Printable Modal */}
      <ReceiptPrintModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        receipt={selectedReceipt}
      />
    </div>
  );
};

