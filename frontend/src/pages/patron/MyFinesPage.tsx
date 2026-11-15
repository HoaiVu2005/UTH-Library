import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { formatDateVN, formatCurrencyVND } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface FineItem {
  id: number;
  type: string;
  type_display: string;
  amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: string;
  status_display: string;
  damage_level?: string;
  note?: string;
  waive_reason?: string;
  created_at: string;
  loan?: {
    id: number;
    book_title: string;
    barcode: string;
  };
}

export const MyFinesPage: React.FC = () => {
  const [fines, setFines] = useState<FineItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showQRGuide, setShowQRGuide] = useState<boolean>(false);

  const fetchFines = async (showSpinner = false) => {
    try {
      if (showSpinner) setIsRefreshing(true);
      else setIsLoading(true);

      const res = await api.get('/fines/me');
      const data = (res.data?.data || []).map((f: any) => ({
        ...f,
        remaining_amount: f.amount - (f.paid_amount || 0),
      }));
      setFines(data);
    } catch (err) {
      console.error('Failed to fetch fines', err);
      toast.error('Không thể tải dữ liệu công nợ. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const totalDebt = fines
    .filter((f) => f.status === 'unpaid' || f.status === 'partial')
    .reduce((sum, f) => sum + f.remaining_amount, 0);

  const totalPaid = fines.reduce((sum, f) => sum + f.paid_amount, 0);

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-16 animate-page-enter">
      {/* Page Header Banner */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center">
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
              ? 'Vui lòng thanh toán để tránh bị tạm khóa quyền mượn/đặt trước sách.'
              : 'Tài khoản sạch, không có công nợ nào cần thanh toán.'}
          </p>
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
        <div className="bg-gradient-to-r from-teal-50/80 via-white to-slate-50 border border-teal-200 rounded-2xl p-5 shadow-xs animate-in fade-in zoom-in-95 duration-150 text-xs">
          <h4 className="font-bold text-brand mb-2 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-brand" />
            <span>Tài khoản tiếp nhận nộp phạt Thư viện UTH:</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-gray-700">
            <div className="p-3 bg-white border border-gray-200/80 rounded-xl shadow-2xs">
              <span className="text-[11px] text-gray-500 block">Ngân hàng thụ hưởng:</span>
              <strong className="text-xs">Agribank / Vietcombank - CN TP.HCM</strong>
            </div>
            <div className="p-3 bg-white border border-gray-200/80 rounded-xl shadow-2xs">
              <span className="text-[11px] text-gray-500 block">Số tài khoản:</span>
              <strong className="text-xs font-mono text-brand">1023 8888 9999</strong>
            </div>
            <div className="p-3 bg-white border border-gray-200/80 rounded-xl shadow-2xs">
              <span className="text-[11px] text-gray-500 block">Cú pháp chuyển khoản:</span>
              <strong className="text-xs font-mono text-gray-900">UTH [Mã_Số_Thẻ] NOP PHAT</strong>
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
                  <TableHead className="w-36 text-center">Ngày phát sinh</TableHead>
                  <TableHead className="w-32 text-right">Mức phạt</TableHead>
                  <TableHead className="w-32 text-right">Đã nộp</TableHead>
                  <TableHead className="w-32 text-right">Còn nợ</TableHead>
                  <TableHead className="w-32 text-center">Trạng thái</TableHead>
                  <TableHead className="w-48">Ghi chú / Biên lai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fines.map((fine) => (
                  <TableRow key={fine.id} className="hover:bg-teal-50/15 transition-colors">
                    {/* Reason & Book Title */}
                    <TableCell className="max-w-[260px]">
                      <p className="font-medium text-gray-800 text-xs">
                        {fine.type_display}
                      </p>
                      {fine.loan && (
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                          Sách: {fine.loan.book_title}{' '}
                          <span className="font-mono text-gray-400">
                            ({fine.loan.barcode})
                          </span>
                        </p>
                      )}
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
                        {fine.status_display}
                      </Badge>
                    </TableCell>

                    {/* Notes */}
                    <TableCell className="text-xs text-gray-500">
                      {fine.waive_reason ? (
                        <span className="text-purple-700 italic">Miễn giảm: {fine.waive_reason}</span>
                      ) : (
                        fine.note || '—'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
};
