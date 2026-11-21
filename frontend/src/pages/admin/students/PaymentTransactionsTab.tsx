import React, { useEffect, useState } from 'react';
import {
  Receipt,
  Search,
  Download,
  Printer,
  Banknote,
  QrCode,
  DollarSign,
  Calendar,
  RotateCcw,
  CheckCircle2,
  FileSpreadsheet,
  X,
  CreditCard,
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import { formatCurrencyVND, cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ReceiptPrintModal, ReceiptData } from './ReceiptPrintModal';

interface TransactionItem {
  id: number;
  transaction_code: string;
  receipt_code: string;
  transaction_type: string;
  transaction_type_display: string;
  user: number;
  student_code: string;
  payer_name: string;
  amount: number;
  payment_method: string;
  payment_method_display: string;
  status: string;
  status_display: string;
  collected_by: number;
  collected_by_name: string;
  collected_at: string;
  card_code?: string;
  department?: string;
  note?: string;
}

interface TransactionsSummary {
  total_revenue: number;
  cash_revenue: number;
  transfer_revenue: number;
  total_count: number;
}

interface PaymentTransactionsTabProps {
  isAdmin: boolean;
  refreshKey?: number;
}

export const PaymentTransactionsTab: React.FC<PaymentTransactionsTabProps> = ({ isAdmin, refreshKey }) => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [summary, setSummary] = useState<TransactionsSummary>({
    total_revenue: 0,
    cash_revenue: 0,
    transfer_revenue: 0,
    total_count: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Print modal state
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
      if (appliedSearch.trim()) params.append('search', appliedSearch.trim());
      if (paymentMethod) params.append('payment_method', paymentMethod);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const res = await api.get(`/transactions?${params.toString()}`);
      setTransactions(res.data?.data || []);
      setTotalRecords(res.data?.meta?.total || 0);
      setTotalPages(res.data?.meta?.total_pages || 1);
      if (res.data?.summary) {
        setSummary(res.data.summary);
      }
    } catch (err: any) {
      toast.error('Không thể tải danh sách giao dịch thu phí.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, pageSize, appliedSearch, paymentMethod, dateFrom, dateTo, refreshKey]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(search);
    setPage(1);
  };

  const handleExportCsv = async () => {
    try {
      const params = new URLSearchParams();
      if (appliedSearch.trim()) params.append('search', appliedSearch.trim());
      if (paymentMethod) params.append('payment_method', paymentMethod);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const res = await api.get(`/transactions/export?${params.toString()}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `uth_doi_soat_thu_phi_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Đã xuất file CSV đối soát thu phí thành công.');
    } catch (err) {
      toast.error('Lỗi khi xuất file đối soát.');
    }
  };

  const handleOpenReceiptPrint = (item: TransactionItem) => {
    const data: ReceiptData = {
      transaction_code: item.transaction_code,
      receipt_code: item.receipt_code,
      amount: item.amount,
      payment_method: item.payment_method,
      payment_method_display: item.payment_method_display,
      payer_name: item.payer_name,
      student_code: item.student_code,
      department: item.department,
      collected_by_name: item.collected_by_name,
      collected_at: item.collected_at,
      card_code: item.card_code || item.student_code,
      note: item.note,
    };
    setSelectedReceipt(data);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 4 Revenue Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-tight block">Tổng Thu Phí</span>
            <div className="text-lg font-black text-gray-900 tracking-tight">
              {formatCurrencyVND(summary.total_revenue)}
            </div>
            <span className="text-[10px] text-teal-700 font-medium">Toàn bộ biên lai hợp lệ</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-tight block">Thu Tiền Mặt</span>
            <div className="text-lg font-black text-emerald-800 tracking-tight">
              {formatCurrencyVND(summary.cash_revenue)}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">Tiền mặt tại quầy lưu thông</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-tight block">Thu Chuyển Khoản</span>
            <div className="text-lg font-black text-purple-900 tracking-tight">
              {formatCurrencyVND(summary.transfer_revenue)}
            </div>
            <span className="text-[10px] text-purple-600 font-medium">VietQR Ngân hàng MB</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-tight block">Số Lượng Giao Dịch</span>
            <div className="text-lg font-black text-orange-700 tracking-tight">
              {summary.total_count} <span className="text-xs font-normal text-gray-500">biên lai</span>
            </div>
            <span className="text-[10px] text-orange-600 font-medium">Đã kích hoạt cấp thẻ</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-xs border-gray-200/80">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
            {/* Payment Method Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('');
                  setPage(1);
                }}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all flex items-center gap-1.5 cursor-pointer',
                  paymentMethod === ''
                    ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
                    : 'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-slate-100/80'
                )}
              >
                <span>Tất cả phương thức</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('cash');
                  setPage(1);
                }}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all flex items-center gap-1.5 cursor-pointer',
                  paymentMethod === 'cash'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs font-bold'
                    : 'bg-emerald-50/60 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70'
                )}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Tiền mặt</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('transfer');
                  setPage(1);
                }}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all flex items-center gap-1.5 cursor-pointer',
                  paymentMethod === 'transfer'
                    ? 'bg-purple-50 text-purple-800 border-purple-300 shadow-2xs font-bold'
                    : 'bg-purple-50/60 text-purple-700 border-purple-200/80 hover:bg-purple-100/70'
                )}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Chuyển khoản VietQR</span>
              </button>
            </div>

            {/* Export CSV Action for Admin */}
            {isAdmin && (
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center text-xs font-semibold h-8 px-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white transition-all shadow-2xs cursor-pointer"
                title="Tải bảng đối soát tài chính CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                <span>Xuất file đối soát (CSV)</span>
              </button>
            )}
          </div>

          {/* Search form & Date Range */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm theo Mã biên lai (RC-...), Mã giao dịch (PAY-...), MSSV, Họ tên..."
                  className="pl-9 pr-8 w-full text-xs h-9 rounded-xl border-gray-200 focus:border-brand bg-white font-mono"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setAppliedSearch('');
                      setPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="h-9 px-3.5 rounded-xl text-xs font-semibold shrink-0 border border-brand text-brand hover:bg-teal-50 bg-white transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-brand" />
                <span>Tìm kiếm</span>
              </button>
            </form>

            {/* Date Range Picker */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 text-[11px] shrink-0">Từ ngày:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="h-9 px-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-700"
              />
              <span className="text-gray-500 text-[11px] shrink-0">Đến:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="h-9 px-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-700"
              />
              {(dateFrom || dateTo) && (
                <button
                  type="button"
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                    setPage(1);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500"
                  title="Xóa lọc ngày"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Data Table */}
      <Card className="shadow-xs border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead className="whitespace-nowrap min-w-[130px]">Mã biên lai</TableHead>
                <TableHead className="whitespace-nowrap min-w-[130px]">Mã GD (PAY)</TableHead>
                <TableHead className="min-w-[200px]">Người nộp tiền (Bạn đọc)</TableHead>
                <TableHead className="text-right whitespace-nowrap min-w-[120px]">Số tiền (VND)</TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[110px]">Phương thức</TableHead>
                <TableHead className="whitespace-nowrap min-w-[150px]">Thủ thư thu tiền</TableHead>
                <TableHead className="whitespace-nowrap min-w-[130px]">Thời gian thu</TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[130px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-xs text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                      <span>Đang tải dữ liệu giao dịch thu phí...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-8">
                    <EmptyState
                      title="Chưa có giao dịch thu phí nào"
                      description="Các khoản thu phí cấp thẻ bạn đọc, gia hạn thẻ và phí bồi hoàn sẽ được ghi nhận và hiển thị tại đây."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-teal-50/25 transition-colors">
                    {/* Mã Biên Lai */}
                    <TableCell className="whitespace-nowrap">
                      <strong className="font-mono text-xs text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200 whitespace-nowrap inline-block">
                        {tx.receipt_code}
                      </strong>
                    </TableCell>

                    {/* Mã Giao Dịch */}
                    <TableCell className="whitespace-nowrap">
                      <span className="font-mono text-xs text-gray-600 whitespace-nowrap inline-block">{tx.transaction_code}</span>
                    </TableCell>

                    {/* Bạn đọc */}
                    <TableCell>
                      <div className="text-xs">
                        <strong className="text-gray-900 block font-semibold">{tx.payer_name}</strong>
                        <span className="text-[11px] font-mono text-teal-700">MSSV: {tx.student_code}</span>
                        {tx.department && <span className="text-[10px] text-gray-500 block truncate">{tx.department}</span>}
                      </div>
                    </TableCell>

                    {/* Số tiền */}
                    <TableCell className="text-right whitespace-nowrap">
                      <strong className="text-xs font-bold text-orange-600 font-mono whitespace-nowrap inline-block">
                        {formatCurrencyVND(tx.amount)}
                      </strong>
                    </TableCell>

                    {/* Phương thức */}
                    <TableCell className="text-center whitespace-nowrap">
                      {tx.payment_method === 'transfer' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
                          <QrCode className="w-3 h-3 text-purple-600 shrink-0" />
                          <span>VietQR</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                          <Banknote className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Tiền mặt</span>
                        </span>
                      )}
                    </TableCell>

                    {/* Thủ thư thu */}
                    <TableCell className="whitespace-nowrap">
                      <span className="text-xs text-gray-700 font-medium whitespace-nowrap inline-block">{tx.collected_by_name}</span>
                    </TableCell>

                    {/* Thời gian */}
                    <TableCell className="whitespace-nowrap">
                      <span className="text-[11px] text-gray-500 block whitespace-nowrap">
                        {new Date(tx.collected_at).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap">
                        {new Date(tx.collected_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </TableCell>

                    {/* Thao tác In Biên Lai */}
                    <TableCell className="text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenReceiptPrint(tx)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border border-teal-200 text-brand bg-teal-50/70 hover:bg-teal-100 hover:border-brand/40 transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                        title="In lại biên lai chứng từ thu tiền"
                      >
                        <Printer className="w-3.5 h-3.5 shrink-0" />
                        <span className="whitespace-nowrap">In biên lai</span>
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            Hiển thị <strong>{transactions.length}</strong> / <strong>{totalRecords}</strong> giao dịch thu phí
          </div>
          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
          )}
        </div>
      </Card>

      {/* Printable Receipt Modal */}
      <ReceiptPrintModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        receipt={selectedReceipt}
      />
    </div>
  );
};

