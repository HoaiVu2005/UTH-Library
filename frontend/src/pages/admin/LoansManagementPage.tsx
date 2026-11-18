import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  AlertTriangle,
  Layers,
  XCircle,
  Copy,
  ScanLine,
  X,
  User,
  Barcode as BarcodeIcon,
  Printer,
} from 'lucide-react';
import { api, formatApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { useRealtimeSync, broadcastRealtimeSync } from '@/lib/realtime';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Barcode } from '@/components/ui/Barcode';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { toast } from '@/components/ui/Toast';
import { DateFilter, DatePreset } from '@/components/ui/DateFilter';
import { cn, formatDateVN, isDateToday, getRemainingDays } from '@/lib/utils';

interface LoanRecord {
  id: number;
  book?: number;
  patron_name: string;
  patron_card_code: string;
  patron_role: string;
  patron_avatar?: string;
  book_title: string;
  cover_image?: string;
  category_name?: string;
  copy_barcode: string;
  shelf_location: string;
  borrowed_at: string;
  due_at: string;
  returned_at?: string;
  renewal_count: number;
  renewal_limit_snapshot?: number;
  status: string;
  is_overdue: boolean;
  days_late: number;
}

type TabType = 'all' | 'active' | 'overdue' | 'returned' | 'lost';

interface SummaryCounts {
  total: number;
  active: number;
  overdue: number;
  returned: number;
  lost: number;
}

export const LoansManagementPage: React.FC = () => {
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [counts, setCounts] = useState<SummaryCounts>({
    total: 0,
    active: 0,
    overdue: 0,
    returned: 0,
    lost: 0,
  });

  // Date Filter state
  const [dateFilter, setDateFilter] = useState<{ preset: DatePreset; customDate?: string }>({
    preset: 'all',
  });

  // Action states
  const [selectedLoan, setSelectedLoan] = useState<LoanRecord | null>(null);
  const [actionType, setActionType] = useState<'renew' | 'lost' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Barcode detail modal state
  const [barcodeModalLoan, setBarcodeModalLoan] = useState<LoanRecord | null>(null);

  const fetchLoans = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();

      if (activeTab === 'active') {
        params.append('status', 'active');
      } else if (activeTab === 'overdue') {
        params.append('status', 'overdue');
      } else if (activeTab === 'returned') {
        params.append('status', 'returned');
      } else if (activeTab === 'lost') {
        params.append('status', 'lost');
      }

      if (appliedSearch.trim()) {
        params.append('search', appliedSearch.trim());
      }

      // Date Filtering
      if (dateFilter.preset !== 'all') {
        params.append('date_preset', dateFilter.preset);
      }
      if (dateFilter.customDate) {
        params.append('date', dateFilter.customDate);
      }

      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());

      const res = await api.get<{
        data: LoanRecord[];
        meta: {
          total: number;
          total_pages: number;
          counts?: SummaryCounts;
        };
      }>(`/loans?${params.toString()}`);

      setLoans(res.data.data);
      setTotalRecords(res.data.meta.total);
      setTotalPages(res.data.meta.total_pages);

      if (res.data.meta.counts) {
        setCounts(res.data.meta.counts);
      }
    } catch (err) {
      if (!isBackground) {
        setError(formatApiError(err));
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, appliedSearch, dateFilter, page, pageSize]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleDateFilterChange = (newVal: { preset: DatePreset; customDate?: string }) => {
    setDateFilter(newVal);
    setPage(1);
  };

  // Realtime synchronization: updates live when checkout, return, or renew happens
  useRealtimeSync('loans', () => fetchLoans(true), 5000);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchQuery);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setAppliedSearch('');
    setPage(1);
  };

  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
    setPage(1);
  };

  const handleCopyBarcode = (barcode: string) => {
    navigator.clipboard.writeText(barcode);
    toast.success(`Đã sao chép mã vạch: ${barcode}`);
  };

  const handlePrintBarcode = () => {
    if (!barcodeModalLoan) return;
    const printContent = document.getElementById('barcode-print-modal-area');
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=520,height=420');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tem Mã Vạch - ${barcodeModalLoan.copy_barcode}</title>
          <style>
            @page { size: auto; margin: 5mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              padding: 10px;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .print-box {
              border: 2px dashed #94a3b8;
              border-radius: 8px;
              padding: 16px;
              width: 100%;
              max-width: 380px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="print-box">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleConfirmAction = async () => {
    if (!selectedLoan || !actionType) return;
    setActionLoading(true);

    try {
      if (actionType === 'renew') {
        const res = await api.post<{ detail: string }>(`/loans/${selectedLoan.id}/renew`);
        toast.success(res.data.detail || 'Gia hạn sách thành công thêm 7 ngày!');
      } else if (actionType === 'lost') {
        const res = await api.post<{ detail: string }>(`/loans/${selectedLoan.id}/mark-lost`);
        toast.success(res.data.detail || 'Đã lập biên bản báo mất sách và tạo khoản bồi thường!');
      }
      setSelectedLoan(null);
      setActionType(null);
      fetchLoans();
      broadcastRealtimeSync('loans');
      broadcastRealtimeSync('dashboard');
      broadcastRealtimeSync('fines');
      window.dispatchEvent(new CustomEvent('uth-refresh-notifications'));
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setActionLoading(false);
    }
  };

  const getDaysRemaining = (dueAt: string) => {
    return getRemainingDays(dueAt);
  };

  // Convert patron role to compact abbreviation: SV, GV, AD
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
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>Danh sách Phiếu mượn</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Theo dõi tất cả lượt mượn sách, hạn trả, gia hạn và tình trạng quá hạn lưu thông
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => fetchLoans()}
            disabled={loading}
            className="text-xs h-9 px-3.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl bg-white transition-colors inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50 font-medium cursor-pointer"
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
            <span>Mở Quầy lưu thông</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-xs border-gray-200/80">
        <CardContent className="p-4 space-y-3">
          {/* Segmented Filter Tabs & Date Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Tất cả */}
              <button
                onClick={() => handleTabChange('all')}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                  activeTab === 'all'
                    ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
                    : 'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-slate-100/80'
                )}
              >
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Tất cả ({counts.total})</span>
              </button>

              {/* Đang mượn */}
              <button
                onClick={() => handleTabChange('active')}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                  activeTab === 'active'
                    ? 'bg-teal-50 text-brand border-brand shadow-2xs'
                    : 'bg-teal-50/60 text-brand border-teal-200/80 hover:bg-teal-100/70'
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Đang mượn ({counts.active})</span>
              </button>

              {/* Sách quá hạn */}
              <button
                onClick={() => handleTabChange('overdue')}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                  activeTab === 'overdue'
                    ? 'bg-red-50 text-red-600 border-red-300 shadow-2xs'
                    : 'bg-red-50/60 text-red-600 border-red-200/80 hover:bg-red-100/70'
                )}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Sách quá hạn ({counts.overdue})</span>
              </button>

              {/* Đã trả */}
              <button
                onClick={() => handleTabChange('returned')}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                  activeTab === 'returned'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                    : 'bg-emerald-50/60 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70'
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã trả ({counts.returned})</span>
              </button>

              {/* Báo mất */}
              <button
                onClick={() => handleTabChange('lost')}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                  activeTab === 'lost'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                    : 'bg-amber-50/60 text-amber-700 border-amber-200/80 hover:bg-amber-100/70'
                )}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Báo mất ({counts.lost})</span>
              </button>
            </div>

            {/* Date Filter: Presets (Hôm nay, 7 ngày qua, Tháng này) + Date Picker */}
            <DateFilter value={dateFilter} onChange={handleDateFilterChange} />
          </div>

          {/* Search Controls & Pagination Limit */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xl flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  placeholder="Tìm bạn đọc (tên, MSSV/MGV), tên tài liệu hoặc mã vạch UTH-..."
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

      {/* Main Table */}
      {loading ? (
        <div className="p-16 text-center text-xs text-gray-500 bg-white border border-gray-200/80 rounded-2xl shadow-xs space-y-2">
          <RotateCw className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
          <p className="font-semibold text-gray-700">Đang tải danh sách phiếu mượn...</p>
          <p className="text-[11px] text-gray-400">Đang kiểm tra thời hạn mượn và phân loại sách</p>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLoans} />
      ) : loans.length === 0 ? (
        <EmptyState
          title={
            activeTab === 'overdue'
              ? 'Không có sách quá hạn'
              : 'Không tìm thấy phiếu mượn nào'
          }
          description={
            activeTab === 'overdue'
              ? 'Tất cả bạn đọc đang chấp hành đúng thời hạn mượn tài liệu. Rất tốt!'
              : appliedSearch
                ? `Không có bản ghi nào khớp với từ khóa "${appliedSearch}". Thử từ khóa khác.`
                : 'Hiện không có phiếu mượn nào trong danh mục này.'
          }
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
                  <TableHead className="w-28 text-center">Ngày mượn</TableHead>
                  <TableHead className="w-36 text-center">Hạn trả</TableHead>
                  <TableHead className="w-32 text-center">Trạng thái</TableHead>
                  <TableHead className="w-20 text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((l, index) => {
                  const daysRemaining = getDaysRemaining(l.due_at);
                  const firstChar = l.patron_name?.trim()?.charAt(0)?.toUpperCase() || 'U';
                  const roleAbbr = getRoleAbbr(l.patron_role);

                  return (
                    <TableRow
                      key={l.id}
                      className={cn(
                        'hover:bg-teal-50/15 transition-colors',
                        l.is_overdue && 'bg-red-50/20'
                      )}
                    >
                      {/* ID */}
                      <TableCell className="font-mono text-gray-400 text-xs">
                        #{l.id}
                      </TableCell>

                      {/* Patron: Re-formatted with role badge at the outer edge */}
                      <TableCell>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-teal-50 text-brand font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200/70 overflow-hidden">
                              {l.patron_avatar ? (
                                <img
                                  src={l.patron_avatar}
                                  alt={l.patron_name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : null}
                              <span className={l.patron_avatar ? 'hidden' : ''}>{firstChar}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 text-xs truncate" title={l.patron_name}>
                                {l.patron_name}
                              </p>
                              <p className="font-mono text-[11px] text-gray-500 mt-0.5">
                                {l.patron_card_code}
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

                      {/* Book: Document title & cover image */}
                      <TableCell className="max-w-md">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-11 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs relative">
                            {l.cover_image ? (
                              <img
                                src={l.cover_image}
                                alt={l.book_title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.onerror = null;
                                  target.style.display = 'none';
                                  const fallback = target.parentElement?.querySelector('.book-fallback-icon');
                                  if (fallback) fallback.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={cn('book-fallback-icon flex items-center justify-center', l.cover_image ? 'hidden' : '')}>
                              <BookOpen className="w-3.5 h-3.5 text-slate-300" />
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            {l.book ? (
                              <Link
                                to={`/books/${l.book}`}
                                className="font-medium text-gray-800 hover:text-brand transition-colors text-xs line-clamp-2 leading-snug block"
                                title={l.book_title}
                              >
                                {l.book_title}
                              </Link>
                            ) : (
                              <p className="font-medium text-gray-800 text-xs line-clamp-2 leading-snug" title={l.book_title}>
                                {l.book_title}
                              </p>
                            )}
                            {l.category_name && (
                              <p className="text-[10.5px] text-gray-400 mt-0.5">
                                {l.category_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Barcode: ONLY the "Xem" button (removed UTH string) */}
                      <TableCell className="text-center">
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => setBarcodeModalLoan(l)}
                          className="text-[11px] h-7 px-3 shadow-2xs whitespace-nowrap inline-flex items-center gap-1.5 border border-teal-200 text-brand bg-teal-50/80 hover:bg-teal-100 rounded-lg transition-colors font-semibold"
                          title="Xem chi tiết tem nhãn mã vạch"
                        >
                          <BarcodeIcon className="w-3.5 h-3.5 text-brand shrink-0" />
                          <span>Xem</span>
                        </Button>
                      </TableCell>

                      {/* Borrow Date */}
                      <TableCell className="text-gray-500 text-xs text-center whitespace-nowrap">
                        {formatDateVN(l.borrowed_at)}
                      </TableCell>

                      {/* Due Date: Clean header "Hạn trả" */}
                      <TableCell className="text-center">
                        {l.status === 'returned' ? (
                          <div className="space-y-0.5 inline-block text-center">
                            <span className="text-gray-500 text-xs block whitespace-nowrap">
                              {formatDateVN(l.due_at)}
                            </span>
                            <div className="text-[11px] text-emerald-700 font-medium flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Trả: {formatDateVN(l.returned_at)}</span>
                            </div>
                          </div>
                        ) : l.is_overdue ? (
                          <div className="space-y-1 inline-block text-center">
                            <span className="text-gray-500 text-xs block whitespace-nowrap">
                              {formatDateVN(l.due_at)}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                              Quá hạn {l.days_late} ngày
                            </span>
                          </div>
                        ) : l.status === 'active' ? (
                          <div className="space-y-1 inline-block text-center">
                            <span className="text-gray-500 text-xs block whitespace-nowrap">
                              {formatDateVN(l.due_at)}
                            </span>
                            <div>
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border',
                                  daysRemaining <= 2
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-teal-50 text-brand border-teal-200'
                                )}
                              >
                                {daysRemaining <= 0
                                  ? 'Hết hạn hôm nay'
                                  : `Còn ${daysRemaining} ngày`}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs block whitespace-nowrap">
                            {formatDateVN(l.due_at)}
                          </span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            l.is_overdue
                              ? 'danger'
                              : l.status === 'active'
                                ? 'active'
                                : l.status === 'returned'
                                  ? 'success'
                                  : 'default'
                          }
                          size="sm"
                          hasDot
                        >
                          {l.is_overdue
                            ? 'Quá hạn'
                            : l.status === 'active'
                              ? 'Đang mượn'
                              : l.status === 'returned'
                                ? 'Đã trả'
                                : 'Báo mất'}
                        </Badge>
                      </TableCell>

                      {/* Actions: ActionMenu */}
                      <TableCell className="text-center relative">
                        {l.status === 'active' ? (
                          <ActionMenu
                            title={`Phiếu mượn #${l.id}`}
                            statusDot={l.is_overdue ? 'danger' : 'success'}
                            isNearBottom={index >= loans.length - 2 && loans.length > 2}
                            items={[
                              {
                                label: `Gia hạn sách (Lần ${l.renewal_count || 0})`,
                                icon: <RotateCw className="w-3.5 h-3.5" />,
                                variant: 'primary',
                                onClick: () => {
                                  setSelectedLoan(l);
                                  setActionType('renew');
                                },
                              },
                              {
                                label: 'Báo mất sách (Biên bản)',
                                icon: <AlertCircle className="w-3.5 h-3.5" />,
                                variant: 'danger',
                                isDividerBefore: true,
                                onClick: () => {
                                  setSelectedLoan(l);
                                  setActionType('lost');
                                },
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
              Hiển thị trang <strong>{page}</strong> / <strong>{totalPages}</strong> (Tổng <strong>{totalRecords}</strong> phiếu mượn, giới hạn <strong>{pageSize}</strong>/trang)
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
        isOpen={Boolean(barcodeModalLoan)}
        onClose={() => setBarcodeModalLoan(null)}
        title="Tem nhãn Mã vạch Bản sao Sách UTH"
        description="Mã vạch chuẩn Code128 phục vụ quét mượn trả tại Quầy lưu thông"
        size="md"
      >
        {barcodeModalLoan && (
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
                    value={barcodeModalLoan.copy_barcode}
                    height={55}
                    barWidth={1.6}
                    showText={true}
                    className="w-full max-w-full"
                  />
                </div>

                <div className="border-t border-gray-200 pt-2.5 text-left space-y-1.5 text-xs">
                  <p className="font-semibold text-gray-800 truncate" title={barcodeModalLoan.book_title}>
                    {barcodeModalLoan.book_title}
                  </p>
                  <div className="text-[11px] text-gray-500 space-y-0.5">
                    <p className="flex justify-between">
                      <span>Vị trí: <strong className="text-gray-700">{barcodeModalLoan.shelf_location || 'Kho sách chính'}</strong></span>
                      <span className="font-mono text-brand font-bold">{barcodeModalLoan.copy_barcode}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Bạn đọc: <strong className="text-gray-700">{barcodeModalLoan.patron_name} ({barcodeModalLoan.patron_card_code})</strong></span>
                      <span>Hạn trả: <strong className={barcodeModalLoan.is_overdue ? 'text-red-600' : 'text-gray-700'}>{formatDateVN(barcodeModalLoan.due_at)}</strong></span>
                    </p>
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCopyBarcode(barcodeModalLoan.copy_barcode)}
              >
                <Copy className="w-3.5 h-3.5 mr-1.5 text-gray-600" />
                Sao chép mã
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrintBarcode}
              >
                <Printer className="w-3.5 h-3.5 mr-1.5 text-gray-600" />
                In tem nhãn
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setBarcodeModalLoan(null)}
              >
                Đóng
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!selectedLoan && !!actionType}
        title={actionType === 'renew' ? 'Xác nhận gia hạn phiếu mượn' : 'Lập biên bản báo mất sách'}
        message={
          actionType === 'renew'
            ? `Bạn có chắc muốn gia hạn sách "${selectedLoan?.book_title}" cho bạn đọc ${selectedLoan?.patron_name} (+7 ngày)?`
            : `Xác nhận báo mất sách "${selectedLoan?.book_title}" (Mã vạch: ${selectedLoan?.copy_barcode}). Hệ thống sẽ tạo khoản phạt đền bù theo quy định Thư viện UTH.`
        }
        confirmText={actionType === 'renew' ? 'Gia hạn (+7 ngày)' : 'Xác nhận báo mất'}
        variant={actionType === 'lost' ? 'danger' : 'primary'}
        isLoading={actionLoading}
        onConfirm={handleConfirmAction}
        onCancel={() => {
          setSelectedLoan(null);
          setActionType(null);
        }}
      />
    </div>
  );
};
