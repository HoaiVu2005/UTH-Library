import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  Package,
  Download,
  RefreshCw,
  BookOpen,
  AlertTriangle,
  Receipt,
  Layers,
  PieChart as PieIcon,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { formatCurrencyVND, formatDateVN, cn, exportToCsv } from '@/lib/utils';
import { useRealtimeSync } from '@/lib/realtime';

interface SummaryData {
  total_books: number;
  total_copies: number;
  available_copies: number;
  borrowed_copies: number;
  reserved_copies: number;
  damaged_lost_copies: number;
  active_loans: number;
  overdue_loans: number;
  total_unpaid_fines: number;
  pending_reservations: number;
  ready_reservations: number;
  pending_suggestions: number;
  total_users: number;
  locked_users: number;
}

interface BorrowTrendItem {
  date: string;
  borrows: number;
  returns: number;
}

interface TopBorrowedBook {
  book_id: number;
  title: string;
  isbn: string;
  category: string;
  total_borrows: number;
}

interface OverdueItem {
  loan_id: number;
  book_title: string;
  barcode: string;
  user_name: string;
  card_code: string;
  borrowed_at: string;
  due_at: string;
  days_late: number;
  estimated_fine: number;
}

interface InventoryItem {
  category_id: number;
  category_name: string;
  category_code: string;
  total_copies: number;
  available: number;
  borrowed: number;
  reserved: number;
  damaged: number;
  lost: number;
  withdrawn: number;
}

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'top_borrowed' | 'overdue' | 'inventory'>('overview');
  const [trendDays, setTrendDays] = useState<number>(7);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [trends, setTrends] = useState<BorrowTrendItem[]>([]);
  const [topBorrowed, setTopBorrowed] = useState<TopBorrowedBook[]>([]);
  const [overdueList, setOverdueList] = useState<OverdueItem[]>([]);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch all necessary reporting data
  const fetchAllData = useCallback(async (showFullLoading = true) => {
    try {
      if (showFullLoading) setIsLoading(true);
      else setIsRefreshing(true);

      const [sumRes, trendRes, topRes, overRes, invRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get(`/reports/borrow-trends?days=${trendDays}`),
        api.get('/reports/top-borrowed?limit=20'),
        api.get('/reports/overdue'),
        api.get('/reports/inventory'),
      ]);

      setSummary(sumRes.data?.data || null);
      setTrends(trendRes.data?.data || []);
      setTopBorrowed(topRes.data?.data || []);
      setOverdueList(overRes.data?.data || []);
      setInventoryList(invRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load comprehensive report data', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [trendDays]);

  useEffect(() => {
    fetchAllData(true);
  }, [fetchAllData]);

  // Realtime synchronization: updates live when loans/fines/returns occur
  useRealtimeSync(['loans', 'reservations', 'fines', 'dashboard'], () => fetchAllData(false), 8000);

  // Handle Export CSV based on current active tab
  const handleExportCsv = () => {
    const today = new Date().toISOString().substring(0, 10);
    if (activeTab === 'overview' || activeTab === 'top_borrowed') {
      const headers = ['Thứ hạng', 'Tên đầu sách', 'Chuyên ngành', 'ISBN', 'Tổng lượt mượn'];
      const rows = topBorrowed.map((b, idx) => [
        idx + 1,
        b.title || '',
        b.category || '',
        b.isbn || '',
        b.total_borrows || 0,
      ]);
      exportToCsv(`UTH_BaoCao_TopMuon_${today}`, headers, rows);
    } else if (activeTab === 'overdue') {
      const headers = [
        'Mã phiếu',
        'Tên sách',
        'Mã vạch',
        'Tên bạn đọc',
        'Mã thẻ bạn đọc',
        'Hạn trả',
        'Số ngày trễ',
        'Tiền phạt ước tính (VND)',
      ];
      const rows = overdueList.map((l) => [
        `#${l.loan_id}`,
        l.book_title || '',
        l.barcode || '',
        l.user_name || '',
        l.card_code || '',
        formatDateVN(l.due_at),
        l.days_late || 0,
        l.estimated_fine || 0,
      ]);
      exportToCsv(`UTH_BaoCao_SachQuaHan_${today}`, headers, rows);
    } else if (activeTab === 'inventory') {
      const headers = [
        'Mã khoa',
        'Chuyên ngành',
        'Tổng bản sao',
        'Sẵn sàng',
        'Đang mượn',
        'Đang giữ chỗ',
        'Hỏng/Mất',
        'Đã thanh lý',
      ];
      const rows = inventoryList.map((c) => [
        c.category_code || '',
        c.category_name || '',
        c.total_copies || 0,
        c.available || 0,
        c.borrowed || 0,
        c.reserved || 0,
        (c.damaged || 0) + (c.lost || 0),
        c.withdrawn || 0,
      ]);
      exportToCsv(`UTH_KiemKe_BanSao_${today}`, headers, rows);
    }
  };

  // Pie chart data for copy status breakdown
  const copyDistributionData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: 'Sẵn sàng mượn', value: summary.available_copies || 0, color: '#008B8B' },
      { name: 'Đang lưu thông', value: summary.borrowed_copies || 0, color: '#3B82F6' },
      { name: 'Đang giữ chỗ', value: summary.reserved_copies || 0, color: '#F59E0B' },
      { name: 'Hỏng / Báo mất', value: summary.damaged_lost_copies || 0, color: '#EF4444' },
    ].filter((item) => item.value > 0);
  }, [summary]);

  // Horizontal bar data for Top 5 books
  const top5BooksData = useMemo(() => {
    return topBorrowed.slice(0, 5).map((b) => ({
      shortTitle: b.title.length > 22 ? `${b.title.substring(0, 22)}...` : b.title,
      fullTitle: b.title,
      category: b.category,
      borrows: b.total_borrows,
    }));
  }, [topBorrowed]);

  // Category breakdown data
  const categoryBarData = useMemo(() => {
    return inventoryList.map((cat) => ({
      name: cat.category_name.length > 16 ? `${cat.category_name.substring(0, 16)}...` : cat.category_name,
      fullName: cat.category_name,
      available: cat.available,
      borrowed: cat.borrowed,
      reserved: cat.reserved,
      damaged: cat.damaged + cat.lost,
      total: cat.total_copies,
    }));
  }, [inventoryList]);

  // Trend aggregates
  const trendAggregates = useMemo(() => {
    const totalBorrows = trends.reduce((acc, t) => acc + (t.borrows || 0), 0);
    const totalReturns = trends.reduce((acc, t) => acc + (t.returns || 0), 0);
    const returnRate = totalBorrows > 0 ? Math.round((totalReturns / totalBorrows) * 100) : 100;
    return { totalBorrows, totalReturns, returnRate };
  }, [trends]);

  const availableRatio = summary?.total_copies
    ? Math.round((summary.available_copies / summary.total_copies) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-12 animate-page-enter">
      {/* 1. Header & Navigation Controls */}
      <div className="bg-white border border-border rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0 shadow-2xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-textPrimary tracking-tight flex items-center">
              <span className="text-accent font-bold mr-2 select-none">&gt;</span>
              <span>Báo cáo & Thống kê Lưu thông (Reports & Analytics)</span>
            </h1>
            <p className="text-xs text-textSecondary mt-0.5">
              Hệ thống sơ đồ phân tích trực quan xu hướng mượn trả, cơ cấu kho sách và thống kê vi phạm quá hạn UTH
            </p>
          </div>
        </div>

        {/* Tab Selector as Soft Outline Pills */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
              activeTab === 'overview'
                ? 'bg-teal-100 text-teal-900 border-teal-300 ring-2 ring-primary/40 shadow-2xs font-bold'
                : 'bg-teal-50/60 text-primary border-teal-200/80 hover:bg-teal-100/70'
            )}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Sơ đồ Tổng quan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('top_borrowed')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
              activeTab === 'top_borrowed'
                ? 'bg-teal-100 text-teal-900 border-teal-300 ring-2 ring-primary/40 shadow-2xs font-bold'
                : 'bg-teal-50/60 text-primary border-teal-200/80 hover:bg-teal-100/70'
            )}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Top mượn nhiều</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overdue')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
              activeTab === 'overdue'
                ? 'bg-red-100 text-red-900 border-red-300 ring-2 ring-red-400 shadow-2xs font-bold'
                : 'bg-red-50/60 text-red-600 border-red-200/80 hover:bg-red-100/70'
            )}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Sách quá hạn ({overdueList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
              activeTab === 'inventory'
                ? 'bg-blue-100 text-blue-900 border-blue-300 ring-2 ring-blue-400 shadow-2xs font-bold'
                : 'bg-blue-50/60 text-blue-700 border-blue-200/80 hover:bg-blue-100/70'
            )}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Kiểm kê kho</span>
          </button>

          <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

          {/* Action buttons */}
          <button
            type="button"
            onClick={() => fetchAllData(false)}
            disabled={isRefreshing}
            className="p-1.5 text-textSecondary hover:text-primary rounded-xl border border-border bg-white hover:bg-gray-50 transition-colors shadow-2xs"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin text-primary')} />
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-border bg-white hover:bg-gray-50 text-textPrimary transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Xuất dữ liệu tab hiện tại sang file CSV mở trên Excel"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Top KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Sách đang lưu thông"
          value={isLoading ? '—' : `${summary?.active_loans || 0} cuốn`}
          subtext="Lượt mượn đang phục vụ toàn trường"
          variant="teal"
          icon={<BookOpen className="w-5 h-5 text-white/90" />}
        />

        <StatCard
          title="Sách trễ hạn thu hồi"
          value={isLoading ? '—' : `${summary?.overdue_loans || 0} cuốn`}
          subtext={
            summary?.overdue_loans && summary.overdue_loans > 0
              ? 'Cần phát thông báo nhắc nhở & xử phạt'
              : 'Không có sách trễ hạn vi phạm'
          }
          className={summary?.overdue_loans && summary.overdue_loans > 0 ? 'border-red-300 bg-red-50/30' : ''}
          icon={
            <AlertTriangle
              className={cn(
                'w-5 h-5',
                summary?.overdue_loans && summary.overdue_loans > 0 ? 'text-red-500' : 'text-textSecondary'
              )}
            />
          }
        />

        <StatCard
          title="Tỷ lệ sách sẵn sàng"
          value={isLoading ? '—' : `${availableRatio}%`}
          subtext={`${summary?.available_copies || 0} / ${summary?.total_copies || 0} bản sao khả dụng`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        />

        <StatCard
          title="Công nợ phạt phát sinh"
          value={isLoading ? '—' : formatCurrencyVND(summary?.total_unpaid_fines || 0)}
          subtext="Nộp phạt tức thì qua VietQR Sacombank"
          icon={<Receipt className="w-5 h-5 text-accent" />}
        />
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-xs text-textSecondary bg-white border border-border rounded-2xl shadow-xs animate-pulse">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Đang kết xuất hệ thống sơ đồ và báo cáo thống kê...</span>
        </div>
      ) : activeTab === 'overview' ? (
        /* 3. FULL DIAGRAMS & CHARTS DASHBOARD */
        <div className="space-y-6">
          {/* Row 1: Circulation Trends (7 cols) + Copy Status Donut (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 1: Circulation Borrow/Return Trends */}
            <Card className="lg:col-span-7 p-5 shadow-xs border-border flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span>Xu hướng Mượn & Trả sách theo thời gian</span>
                    </h3>
                    <p className="text-[11px] text-textSecondary mt-0.5">
                      Theo dõi lưu lượng bạn đọc đến quầy và gia hạn trực tuyến
                    </p>
                  </div>

                  {/* Period Filter Buttons */}
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                    {[7, 14, 30].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setTrendDays(d)}
                        className={cn(
                          'px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors',
                          trendDays === d
                            ? 'bg-white text-primary shadow-xs font-bold'
                            : 'text-textSecondary hover:text-textPrimary'
                        )}
                      >
                        {d} ngày
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recharts Area Chart */}
                <div className="h-64 sm:h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#008B8B" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#008B8B" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ED6C02" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#ED6C02" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E2E8F0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          fontSize: '12px',
                        }}
                        formatter={(val: any, name: any) => [
                          `${val} lượt`,
                          name === 'borrows' ? 'Lượt mượn mới' : 'Lượt trả sách',
                        ]}
                        labelFormatter={(lbl) => `Ngày ${lbl}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="borrows"
                        name="borrows"
                        stroke="#008B8B"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorBorrows)"
                      />
                      <Area
                        type="monotone"
                        dataKey="returns"
                        name="returns"
                        stroke="#ED6C02"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        fillOpacity={1}
                        fill="url(#colorReturns)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom aggregates */}
              <div className="grid grid-cols-3 gap-2 pt-4 mt-2 border-t border-gray-100 text-center">
                <div className="bg-teal-50/50 p-2 rounded-xl border border-teal-100">
                  <span className="text-[10px] text-textSecondary uppercase font-medium block">Tổng lượt mượn</span>
                  <span className="text-sm font-bold text-primary font-mono">{trendAggregates.totalBorrows} lượt</span>
                </div>
                <div className="bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                  <span className="text-[10px] text-textSecondary uppercase font-medium block">Tổng lượt trả</span>
                  <span className="text-sm font-bold text-accent font-mono">{trendAggregates.totalReturns} lượt</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-border">
                  <span className="text-[10px] text-textSecondary uppercase font-medium block">Tỷ lệ hoàn trả</span>
                  <span className="text-sm font-bold text-textPrimary font-mono">{trendAggregates.returnRate}%</span>
                </div>
              </div>
            </Card>

            {/* Chart 2: Copy Status Donut Chart */}
            <Card className="lg:col-span-5 p-5 shadow-xs border-border flex flex-col justify-between">
              <div>
                <div className="pb-4 border-b border-gray-100">
                  <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-primary" />
                    <span>Cơ cấu Tình trạng Bản sao Kho sách</span>
                  </h3>
                  <p className="text-[11px] text-textSecondary mt-0.5">
                    Tổng số {summary?.total_copies || 0} bản sao mã vạch được quản lý
                  </p>
                </div>

                {/* Donut Chart */}
                <div className="h-56 sm:h-60 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={copyDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {copyDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any) => [
                          `${val} bản sao (${Math.round((Number(val) / (summary?.total_copies || 1)) * 100)}%)`,
                          name,
                        ]}
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E2E8F0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Stat */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold font-mono text-textPrimary">{summary?.total_copies || 0}</span>
                    <span className="text-[10px] text-textSecondary uppercase tracking-wider font-medium">Bản sao</span>
                  </div>
                </div>
              </div>

              {/* Status Breakdown Legend */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                {copyDistributionData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2 p-1.5 rounded-lg bg-gray-50/70 border border-border">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] text-textSecondary truncate">{item.name}</div>
                      <div className="text-xs font-bold text-textPrimary font-mono">
                        {item.value} <span className="text-[10px] text-textSecondary font-normal">({Math.round((item.value / (summary?.total_copies || 1)) * 100)}%)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Row 2: Top 5 Books Bar Chart (6 cols) + Category Distribution (6 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 3: Top 5 Borrowed Books Horizontal Bar Chart */}
            <Card className="lg:col-span-6 p-5 shadow-xs border-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span>Top 5 Sách được mượn nhiều nhất</span>
                    </h3>
                    <p className="text-[11px] text-textSecondary mt-0.5">
                      Giáo trình & tài liệu tham khảo có nhu cầu cao nhất
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('top_borrowed')}
                    className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Xem Top 20</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="h-64 sm:h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={top5BooksData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                      <YAxis
                        type="category"
                        dataKey="shortTitle"
                        tick={{ fontSize: 11, fill: '#263238' }}
                        width={140}
                        stroke="#CBD5E1"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E2E8F0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          fontSize: '12px',
                        }}
                        formatter={(val: any) => [`${val} lượt mượn`, 'Tổng lượt mượn']}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.fullTitle || ''}
                      />
                      <Bar dataKey="borrows" fill="#008B8B" radius={[0, 6, 6, 0]} barSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-textSecondary">
                <span>Dẫn đầu: <strong className="text-textPrimary">{topBorrowed[0]?.title || 'Chưa có'}</strong></span>
                <span className="font-mono font-bold text-primary">{topBorrowed[0]?.total_borrows || 0} lượt</span>
              </div>
            </Card>

            {/* Chart 4: Department Inventory Breakdown */}
            <Card className="lg:col-span-6 p-5 shadow-xs border-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" />
                      <span>Phân bổ Bản sao theo Chuyên ngành UTH</span>
                    </h3>
                    <p className="text-[11px] text-textSecondary mt-0.5">
                      So sánh bản sao sẵn sàng vs đang mượn theo từng khoa
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('inventory')}
                    className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Kiểm kê chi tiết</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="h-64 sm:h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryBarData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        angle={-15}
                        textAnchor="end"
                        stroke="#CBD5E1"
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E2E8F0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          fontSize: '12px',
                        }}
                        formatter={(val: any, name: any) => [
                          `${val} bản`,
                          name === 'available' ? 'Sẵn sàng' : 'Đang mượn',
                        ]}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                      />
                      <Bar dataKey="available" name="Sẵn sàng" fill="#008B8B" radius={[4, 4, 0, 0]} barSize={16} />
                      <Bar dataKey="borrowed" name="Đang mượn" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-textSecondary">
                <span>Khoa nhiều sách nhất: <strong className="text-textPrimary">{inventoryList[0]?.category_name || 'Chung'}</strong></span>
                <span className="font-mono font-bold text-textPrimary">{inventoryList[0]?.total_copies || 0} bản</span>
              </div>
            </Card>
          </div>
        </div>
      ) : activeTab === 'top_borrowed' ? (
        /* 4. TAB: TOP BORROWED BOOKS (Chart + Full Table) */
        <div className="space-y-6">
          {/* Top 10 Visual Bar Chart */}
          <Card className="p-5 shadow-xs border-border">
            <div className="pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>Biểu đồ Xếp hạng Tần suất Mượn (Top 10 Sách)</span>
              </h3>
              <p className="text-[11px] text-textSecondary mt-0.5">
                Trực quan hóa số lượt mượn tích lũy của các đầu sách được yêu thích nhất
              </p>
            </div>
            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topBorrowed.slice(0, 10).map((b) => ({
                    shortTitle: b.title.length > 20 ? `${b.title.substring(0, 20)}...` : b.title,
                    fullTitle: b.title,
                    borrows: b.total_borrows,
                    category: b.category,
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                  <YAxis type="category" dataKey="shortTitle" tick={{ fontSize: 11, fill: '#263238' }} width={160} stroke="#CBD5E1" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val} lượt mượn`, 'Tổng lượt']}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullTitle || ''}
                  />
                  <Bar dataKey="borrows" fill="#008B8B" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Detailed Top 20 Table */}
          <Card className="shadow-xs overflow-hidden border-border">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-textPrimary">Bảng xếp hạng Top 20 Đầu sách mượn nhiều nhất</h3>
              <span className="text-xs text-textSecondary">Thống kê toàn thời gian</span>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/90 text-textSecondary text-[11px] font-semibold uppercase tracking-wider">
                    <TableHead className="w-20 text-center">Thứ hạng</TableHead>
                    <TableHead>Tên đầu sách</TableHead>
                    <TableHead className="w-48">Chuyên ngành</TableHead>
                    <TableHead className="w-40 font-mono">ISBN</TableHead>
                    <TableHead className="w-36 text-right">Tổng lượt mượn</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topBorrowed.map((b, idx) => (
                    <TableRow key={b.book_id} className="hover:bg-teal-50/20 transition-colors">
                      <TableCell className="text-center font-bold">
                        {idx === 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs shadow-2xs">1</span>
                        ) : idx === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-800 font-bold text-xs shadow-2xs">2</span>
                        ) : idx === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-800 font-bold text-xs shadow-2xs">3</span>
                        ) : (
                          <span className="text-textSecondary">{idx + 1}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-textPrimary text-xs">{b.title}</TableCell>
                      <TableCell className="text-textSecondary text-xs">{b.category}</TableCell>
                      <TableCell className="font-mono text-textSecondary text-xs">{b.isbn || '—'}</TableCell>
                      <TableCell className="text-right">
                        <span className="px-2.5 py-1 rounded-full bg-teal-50 text-primary font-bold text-xs border border-teal-200">
                          {b.total_borrows} lượt
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      ) : activeTab === 'overdue' ? (
        /* 5. TAB: OVERDUE RECOVERY (Alert Banner + Full Table) */
        <div className="space-y-6">
          {/* Overdue alert summary banner */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-900">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Cảnh báo Thu hồi Sách quá hạn ({overdueList.length} phiếu mượn)</h4>
                <p className="text-xs text-red-700 mt-0.5">
                  Theo quy chế UTH, sách quá hạn trên 30 ngày sẽ tự động chuyển sang trạng thái báo mất và tính phí đền bù
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-red-700 block">Tổng phạt tạm tính:</span>
              <span className="text-base font-bold font-mono text-red-800">
                {formatCurrencyVND(overdueList.reduce((acc, l) => acc + (l.estimated_fine || 0), 0))}
              </span>
            </div>
          </div>

          <Card className="shadow-xs overflow-hidden border-border">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-textPrimary">Danh sách chi tiết Sách quá hạn</h3>
              <span className="text-xs text-textSecondary">Sắp xếp theo hạn trả cũ nhất</span>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/90 text-textSecondary text-[11px] font-semibold uppercase tracking-wider">
                    <TableHead className="w-24">Mã phiếu</TableHead>
                    <TableHead>Tên sách</TableHead>
                    <TableHead className="w-36">Mã vạch</TableHead>
                    <TableHead className="w-48">Bạn đọc</TableHead>
                    <TableHead className="w-32">Hạn trả</TableHead>
                    <TableHead className="w-32 text-center">Quá hạn</TableHead>
                    <TableHead className="w-36 text-right">Tiền phạt ước tính</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueList.map((loan) => (
                    <TableRow key={loan.loan_id} className="hover:bg-red-50/20 transition-colors">
                      <TableCell className="font-mono text-textSecondary text-xs">#{loan.loan_id}</TableCell>
                      <TableCell className="font-medium text-textPrimary text-xs max-w-xs truncate">{loan.book_title}</TableCell>
                      <TableCell className="font-mono text-primary font-bold text-xs">{loan.barcode}</TableCell>
                      <TableCell>
                        <p className="font-medium text-textPrimary text-xs">{loan.user_name}</p>
                        <p className="text-[11px] text-textSecondary font-mono">{loan.card_code}</p>
                      </TableCell>
                      <TableCell className="text-textSecondary text-xs">
                        {formatDateVN(loan.due_at)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="danger" size="sm">
                          {loan.days_late} ngày
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-red-600 font-mono text-xs">
                        {formatCurrencyVND(loan.estimated_fine || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      ) : (
        /* 6. TAB: INVENTORY (Mini Bar + Full Table) */
        <div className="space-y-6">
          <Card className="p-5 shadow-xs border-border">
            <div className="pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span>Biểu đồ Cơ cấu Tồn kho theo Chuyên ngành</span>
              </h3>
              <p className="text-[11px] text-textSecondary mt-0.5">
                Kiểm kê tỷ lệ sẵn sàng phục vụ và tình trạng hao hụt theo từng khoa
              </p>
            </div>
            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} angle={-15} textAnchor="end" stroke="#CBD5E1" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                    }}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />
                  <Bar dataKey="available" name="Sẵn sàng" fill="#008B8B" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="borrowed" name="Đang mượn" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="damaged" name="Hỏng/Mất" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="shadow-xs overflow-hidden border-border">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-textPrimary">Kiểm kê Bản sao theo Chuyên ngành</h3>
              <span className="text-xs text-textSecondary">Tổng hợp theo các nhóm ngành UTH</span>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/90 text-textSecondary text-[11px] font-semibold uppercase tracking-wider">
                    <TableHead className="w-28">Mã khoa</TableHead>
                    <TableHead>Chuyên ngành</TableHead>
                    <TableHead className="w-28 text-center">Tổng bản sao</TableHead>
                    <TableHead className="w-28 text-center">Sẵn sàng</TableHead>
                    <TableHead className="w-28 text-center">Đang mượn</TableHead>
                    <TableHead className="w-28 text-center">Đang giữ chỗ</TableHead>
                    <TableHead className="w-28 text-center">Hỏng / Mất</TableHead>
                    <TableHead className="w-28 text-center">Đã thanh lý</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryList.map((cat) => (
                    <TableRow key={cat.category_id} className="hover:bg-teal-50/20 transition-colors">
                      <TableCell className="font-mono font-bold text-primary text-xs">[{cat.category_code}]</TableCell>
                      <TableCell className="font-medium text-textPrimary text-xs">{cat.category_name}</TableCell>
                      <TableCell className="text-center font-bold text-textPrimary text-xs">{cat.total_copies}</TableCell>
                      <TableCell className="text-center text-emerald-700 font-semibold text-xs">{cat.available}</TableCell>
                      <TableCell className="text-center text-blue-700 font-semibold text-xs">{cat.borrowed}</TableCell>
                      <TableCell className="text-center text-teal-700 font-semibold text-xs">{cat.reserved}</TableCell>
                      <TableCell className="text-center text-red-600 font-semibold text-xs">{cat.damaged + cat.lost}</TableCell>
                      <TableCell className="text-center text-textSecondary text-xs">{cat.withdrawn}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
