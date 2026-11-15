import React, { useEffect, useState, useCallback } from 'react';
import {
  BookOpen,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Barcode as BarcodeIcon,
  Sparkles,
  ArrowRight,
  History,
  Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { toast } from '@/components/ui/Toast';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { formatDateVN } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useRealtimeSync, broadcastRealtimeSync } from '@/lib/realtime';

interface LoanItem {
  id: number;
  book_title: string;
  barcode: string;
  cover_image?: string;
  category_name?: string;
  borrowed_at: string;
  due_at: string;
  returned_at?: string;
  renewal_count: number;
  renewal_limit_snapshot: number;
  days_late: number;
  is_overdue: boolean;
  return_condition?: string;
  status: string;
}

export const MyLoansPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'returned'>('active');
  const [loans, setLoans] = useState<LoanItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [renewingId, setRenewingId] = useState<number | null>(null);

  const fetchLoans = useCallback(async (showSpinner = false, isBackground = false) => {
    try {
      if (showSpinner) setIsRefreshing(true);
      else if (!isBackground) setIsLoading(true);

      const res = await api.get(`/loans/me?status=${activeTab}&page=${page}&page_size=8`);
      const data = res.data?.data || [];
      const mapped: LoanItem[] = data.map((l: any) => ({
        id: l.id,
        book_title: l.copy?.book?.title || l.book?.title || l.book_title || 'Tài liệu Thư viện',
        barcode: l.copy?.barcode || l.copy_barcode || l.barcode || '—',
        cover_image: l.copy?.book?.cover_image || l.book?.cover_image || l.cover_image,
        category_name: l.copy?.book?.category?.name || l.book?.category?.name,
        borrowed_at: l.borrowed_at,
        due_at: l.due_at,
        returned_at: l.returned_at,
        renewal_count: l.renewal_count || 0,
        renewal_limit_snapshot: l.renewal_limit_snapshot || 1,
        days_late: l.days_late || 0,
        is_overdue: Boolean((l.days_late || 0) > 0 || (l.due_at && new Date(l.due_at) < new Date())),
        return_condition: l.return_condition,
        status: l.status,
      }));

      setLoans(mapped);
      setTotalPages(res.data?.meta?.total_pages || 1);
      setTotalCount(res.data?.meta?.total || mapped.length);
    } catch (err) {
      if (!isBackground) {
        console.error('Failed to fetch patron loans', err);
        toast.error('Không thể tải danh sách sách mượn. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  // Realtime synchronization: updates live when checkout or return happens at desk
  useRealtimeSync('loans', () => fetchLoans(false, true), 5000);

  const handleRenew = async (loanId: number) => {
    try {
      setRenewingId(loanId);
      await api.post(`/loans/${loanId}/renew`);
      toast.success('Gia hạn mượn sách thành công thêm 7 ngày!');
      fetchLoans(false, true);
      broadcastRealtimeSync('loans');
      broadcastRealtimeSync('dashboard');
      // Trigger header unread sync
      window.dispatchEvent(new CustomEvent('uth-refresh-notifications'));
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Không thể gia hạn sách vào lúc này.');
    } finally {
      setRenewingId(null);
    }
  };

  const getDaysLeft = (dueDateStr: string) => {
    try {
      const due = new Date(dueDateStr);
      if (isNaN(due.getTime())) return 0;
      const now = new Date();
      const diffMs = due.getTime() - now.getTime();
      return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  const overdueCount = loans.filter((l) => l.is_overdue).length;

  return (
    <div className="space-y-5 pb-16 animate-page-enter">
      {/* Page Header Banner */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>Sách của tôi</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Quản lý danh sách sách đang mượn, theo dõi thời hạn trả và gia hạn trực tuyến 1-click
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchLoans(true)}
            disabled={isRefreshing || isLoading}
            className="text-xs h-9 px-3.5 border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl"
            title="Tải lại danh sách"
          >
            <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5 text-gray-500', isRefreshing && 'animate-spin')} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Navigation Pills Bar */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Đang mượn */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('active');
              setPage(1);
            }}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
              activeTab === 'active'
                ? 'bg-teal-100 text-teal-900 border-teal-300 ring-2 ring-brand/40 shadow-2xs'
                : 'bg-teal-50/60 text-brand border-teal-200/80 hover:bg-teal-100/70'
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Đang mượn</span>
            {activeTab === 'active' && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-brand font-bold border border-teal-200">
                {totalCount}
              </span>
            )}
          </button>

          {/* Lịch sử đã trả */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('returned');
              setPage(1);
            }}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
              activeTab === 'returned'
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 ring-2 ring-emerald-400 shadow-2xs'
                : 'bg-emerald-50/60 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70'
            )}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch sử đã trả</span>
            {activeTab === 'returned' && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-emerald-700 font-bold border border-emerald-200">
                {totalCount}
              </span>
            )}
          </button>
        </div>

        <div className="text-xs text-gray-500 flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] text-gray-500">Quy định gia hạn:</span>
          <span className="font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-lg text-[11px]">
            Tối đa 1 lần (+7 ngày)
          </span>
        </div>
      </div>

      {/* Overdue Warning Alert */}
      {activeTab === 'active' && overdueCount > 0 && (
        <Alert variant="danger" title="Cảnh báo sách quá hạn lưu thông:">
          Bạn có <strong>{overdueCount} cuốn sách</strong> đã quá hạn trả quy định. Vui lòng mang sách
          đến <strong>Quầy lưu thông Thư viện UTH</strong> để hoàn trả hoặc liên hệ thủ thư nhằm tránh
          phát sinh thêm phí phạt quá hạn (1.000đ/ngày).
        </Alert>
      )}

      {/* Loans Table */}
      {isLoading ? (
        <div className="p-16 text-center text-xs text-gray-500 bg-white border border-gray-200/80 rounded-2xl shadow-xs space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
          <p className="font-semibold text-gray-700">Đang tải danh sách tài liệu...</p>
        </div>
      ) : loans.length === 0 ? (
        <EmptyState
          title={
            activeTab === 'active'
              ? 'Bạn không có sách nào đang mượn'
              : 'Chưa có lịch sử trả sách'
          }
          description={
            activeTab === 'active'
              ? 'Khám phá hơn 50.000 giáo trình và tài liệu chuẩn đại học tại Kho tri thức Thư viện Số UTH.'
              : 'Lịch sử mượn trả của bạn sẽ xuất hiện tại đây sau khi hoàn tất trả sách tại Quầy thủ thư.'
          }
          actionText={activeTab === 'active' ? 'Tra cứu giáo trình ngay' : undefined}
          onAction={activeTab === 'active' ? () => window.location.assign('/search') : undefined}
        />
      ) : (
        <Card className="shadow-xs overflow-hidden border-gray-200/80">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/90 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                <TableHead>Tài liệu & Mã vạch</TableHead>
                <TableHead className="w-36 text-center">Ngày mượn</TableHead>
                <TableHead className="w-40 text-center">
                  {activeTab === 'active' ? 'Hạn trả' : 'Ngày hoàn trả'}
                </TableHead>
                <TableHead className="w-32 text-center">Tình trạng</TableHead>
                <TableHead className="w-28 text-center">Lần gia hạn</TableHead>
                <TableHead className="w-36 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan) => {
                const daysLeft = getDaysLeft(loan.due_at);
                const canRenew =
                  (loan.renewal_count || 0) < loan.renewal_limit_snapshot && !loan.is_overdue;

                return (
                  <TableRow key={loan.id} className="hover:bg-teal-50/15 transition-colors">
                    {/* Book & Barcode */}
                    <TableCell className="max-w-md">
                      <div className="flex items-start space-x-3">
                        <div className="w-9 h-12 rounded bg-teal-50 border border-teal-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                          {loan.cover_image ? (
                            <img
                              src={loan.cover_image}
                              alt={loan.book_title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="w-4 h-4 text-brand" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          {loan.category_name && (
                            <span className="text-[10px] font-bold text-brand block leading-tight">
                              {loan.category_name}
                            </span>
                          )}
                          <p className="font-medium text-gray-800 text-xs line-clamp-2 leading-snug">
                            {loan.book_title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-gray-500">
                              Mã vạch: {loan.barcode}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Borrowed Date */}
                    <TableCell className="text-xs text-gray-500 text-center whitespace-nowrap">
                      {formatDateVN(loan.borrowed_at)}
                    </TableCell>

                    {/* Due Date & Remaining days */}
                    <TableCell className="text-xs text-center whitespace-nowrap">
                      {activeTab === 'active' ? (
                        <div className="space-y-0.5 inline-block text-center">
                          <span className={cn('block text-xs', loan.is_overdue ? 'font-bold text-red-600' : 'font-medium text-gray-700')}>
                            {formatDateVN(loan.due_at)}
                          </span>
                          <div>
                            {loan.is_overdue ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                                Quá hạn {loan.days_late || Math.abs(daysLeft)} ngày
                              </span>
                            ) : daysLeft <= 2 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                Còn {daysLeft} ngày
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-50 text-brand border border-teal-200">
                                Còn {daysLeft} ngày
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 font-medium">
                          {formatDateVN(loan.returned_at)}
                        </span>
                      )}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="text-center">
                      {activeTab === 'active' ? (
                        loan.is_overdue ? (
                          <Badge variant="overdue" size="sm" hasDot>
                            Quá hạn
                          </Badge>
                        ) : (
                          <Badge variant="active" size="sm" hasDot>
                            Đang mượn
                          </Badge>
                        )
                      ) : (
                        <Badge variant="returned" size="sm">
                          Đã trả sách
                        </Badge>
                      )}
                    </TableCell>

                    {/* Renewal Count */}
                    <TableCell className="text-xs text-center whitespace-nowrap">
                      <span className="font-mono font-bold text-gray-800">
                        {loan.renewal_count}
                      </span>
                      <span className="text-gray-400"> / {loan.renewal_limit_snapshot}</span>
                    </TableCell>

                    {/* Action: Clean outline button */}
                    <TableCell className="text-right whitespace-nowrap">
                      {activeTab === 'active' ? (
                        <Button
                          variant="ghost"
                          size="xs"
                          disabled={!canRenew || renewingId === loan.id}
                          onClick={() => handleRenew(loan.id)}
                          isLoading={renewingId === loan.id}
                          className="h-7 px-3 text-xs border border-teal-200/90 hover:bg-teal-50 text-brand font-medium rounded-lg shadow-2xs"
                        >
                          {loan.renewal_count >= loan.renewal_limit_snapshot
                            ? 'Hết lượt gia hạn'
                            : loan.is_overdue
                            ? 'Đã quá hạn'
                            : 'Gia hạn +7d'}
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          {loan.return_condition === 'damaged'
                            ? 'Hư hỏng'
                            : loan.return_condition === 'lost'
                            ? 'Báo mất'
                            : 'Bình thường'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalRecords={totalCount}
          onPageChange={(p) => setPage(p)}
        />
      )}
    </div>
  );
};
