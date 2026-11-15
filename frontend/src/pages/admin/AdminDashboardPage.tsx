import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Copy as CopyIcon,
  Users,
  AlertTriangle,
  Receipt,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  BookmarkCheck,
  Lightbulb,
  ScanLine,
  Layers,
  Settings,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { api } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

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

interface ActionItemsData {
  pending_suggestions: Array<{ id: number; book_title: string; user__full_name: string; created_at: string }>;
  expiring_holds: Array<{ id: number; book__title: string; user__full_name: string; copy__barcode: string; hold_expires_at: string }>;
  severe_overdue: Array<{ id: number; copy__book__title: string; user__full_name: string; user__card_code: string; due_at: string }>;
}

export const AdminDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [actionItems, setActionItems] = useState<ActionItemsData | null>(null);
  const [borrowTrends, setBorrowTrends] = useState<Array<{ date: string; borrows: number; returns: number }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [sumRes, actRes, trendRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/action-items'),
          api.get('/reports/borrow-trends?days=7'),
        ]);
        setSummary(sumRes.data?.data);
        setActionItems(actRes.data?.data);
        setBorrowTrends(trendRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load admin dashboard', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading || !summary) {
    return (
      <div className="py-20 text-center text-xs text-textSecondary animate-pulse">
        Đang tải dữ liệu tổng quan quản trị thư viện...
      </div>
    );
  }

  const currentDateFormatted = format(new Date(), "EEEE, 'ngày' dd 'tháng' MM 'năm' yyyy", { locale: vi });

  return (
    <div className="space-y-6">
      {/* Khu vực 1: Welcome Section */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>Bảng điều khiển quản trị (Admin Dashboard)</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {currentDateFormatted} &bull; Tổng quan vận hành Thư viện UTH, công việc cần xử lý và xu hướng lưu thông
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Link
            to="/admin/circulation"
            className="inline-flex items-center justify-center text-xs font-semibold h-9 px-4 rounded-xl bg-brand text-white hover:bg-brand-dark transition-all shadow-xs shrink-0"
          >
            <ScanLine className="w-3.5 h-3.5 mr-1.5" />
            <span>Mở Quầy lưu thông</span>
          </Link>
        </div>
      </div>

      {/* Khu vực 2: Overview - 4 Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Sách đang mượn"
          value={summary.active_loans}
          icon={<BookOpen className="w-5 h-5 text-primary" />}
          subtext={`${summary.available_copies} bản sao sẵn sàng`}
          variant="teal"
          detailLink="/admin/loans"
        />

        <StatCard
          title="Sách quá hạn"
          value={summary.overdue_loans}
          icon={<AlertTriangle className="w-5 h-5 text-danger" />}
          subtext="Cần thông báo / thu hồi"
          variant="white"
          detailLink="/admin/loans?status=overdue"
        />

        <StatCard
          title="Công nợ tiền phạt"
          value={`${summary.total_unpaid_fines.toLocaleString('vi-VN')} đ`}
          icon={<Receipt className="w-5 h-5 text-warning" />}
          subtext="Khoản phạt chưa thu"
          variant="white"
          detailLink="/admin/fines"
        />

        <StatCard
          title="Bạn đọc thư viện"
          value={summary.total_users}
          icon={<Users className="w-5 h-5 text-info" />}
          subtext={`${summary.locked_users} tài khoản đang bị khóa`}
          variant="white"
          detailLink="/admin/users"
        />
      </div>

      {/* Khu vực 3 & 4: Analytics Chart & Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Circulation Trends Area Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-brand" />
              <h2 className="text-sm font-bold text-gray-800">Xu hướng lưu thông sách 7 ngày qua</h2>
            </div>
            <Link to="/admin/reports" className="text-xs text-brand hover:underline font-semibold">
              Chi tiết &rarr;
            </Link>
          </div>

          <div className="flex-1 w-full min-h-[220px] min-w-0 flex items-center justify-center my-2">
            {borrowTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={240} minWidth={0} minHeight={200}>
                <AreaChart data={borrowTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#008B8B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#008B8B" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '11px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="borrows"
                    name="Lượt mượn"
                    stroke="#008B8B"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorBorrows)"
                  />
                  <Area
                    type="monotone"
                    dataKey="returns"
                    name="Lượt trả"
                    stroke="#16A34A"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorReturns)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-textSecondary">
                Chưa có dữ liệu lưu thông trong tuần này
              </div>
            )}
          </div>

          <div className="flex items-center justify-center space-x-6 pt-3 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand" />
              <span>Lượt mượn sách</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Lượt trả sách</span>
            </div>
          </div>
        </div>

        {/* Action Items ("Cần xử lý hôm nay") (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
          <div>
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-warning" />
                <h2 className="text-sm font-bold text-gray-800">Cần xử lý hôm nay (Action Items)</h2>
              </div>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Thời gian thực</span>
            </div>

            <div className="space-y-3 flex flex-col justify-between">
              {/* Item 1: Pending Suggestions */}
              <div className="p-3 rounded-xl border border-gray-200/80 bg-gray-50/60 hover:bg-gray-50 transition-colors shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-800 flex items-center space-x-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
                    <span>Đề xuất mua sách mới</span>
                  </span>
                  <Badge variant="warning" size="sm">{summary.pending_suggestions} chờ</Badge>
                </div>
                {actionItems?.pending_suggestions?.length ? (
                  <p className="text-[11px] text-gray-500 truncate">
                    Gần nhất: {actionItems.pending_suggestions[0].book_title} ({actionItems.pending_suggestions[0].user__full_name})
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-400">Không có đề xuất tồn đọng.</p>
                )}
                <Link to="/admin/suggestions" className="text-[11px] text-brand font-semibold hover:underline mt-1 inline-flex items-center gap-0.5">
                  Duyệt ngay <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Item 2: Expiring Holds */}
              <div className="p-3 rounded-xl border border-gray-200/80 bg-gray-50/60 hover:bg-gray-50 transition-colors shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-800 flex items-center space-x-1.5">
                    <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Giữ chỗ sắp hết hạn (3 ngày)</span>
                  </span>
                  <Badge variant="danger" size="sm">{actionItems?.expiring_holds?.length || 0} bản</Badge>
                </div>
                {actionItems?.expiring_holds?.length ? (
                  <p className="text-[11px] text-gray-500 truncate">
                    {actionItems.expiring_holds[0].book__title} - {actionItems.expiring_holds[0].user__full_name}
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-400">Không có sách giữ sắp hết hạn.</p>
                )}
                <Link to="/admin/reservations" className="text-[11px] text-brand font-semibold hover:underline mt-1 inline-flex items-center gap-0.5">
                  Quản lý giữ chỗ <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Item 3: Severe Overdue */}
              <div className="p-3 rounded-xl border border-gray-200/80 bg-gray-50/60 hover:bg-gray-50 transition-colors shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-800 flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>Quá hạn nghiêm trọng (&gt;7 ngày)</span>
                  </span>
                  <Badge variant="danger" size="sm">{actionItems?.severe_overdue?.length || 0} phiếu</Badge>
                </div>
                {actionItems?.severe_overdue?.length ? (
                  <p className="text-[11px] text-gray-500 truncate">
                    {actionItems.severe_overdue[0].copy__book__title} ({actionItems.severe_overdue[0].user__card_code})
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-400">Không có phiếu mượn trễ hạn nặng.</p>
                )}
                <Link to="/admin/loans?status=overdue" className="text-[11px] text-brand font-semibold hover:underline mt-1 inline-flex items-center gap-0.5">
                  Xử lý phiếu phạt <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Khu vực 5: Quick Management Links & Warehouse Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Management Shortcuts (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-border rounded-xl p-5 shadow-card">
          <h2 className="text-sm font-bold text-textPrimary mb-3">Chức năng quản trị nghiệp vụ nhanh</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { title: 'Quầy mượn trả', desc: 'Scan barcode tức thì', icon: ScanLine, to: '/admin/circulation', color: 'text-primary bg-primary-light' },
              { title: 'Biên mục sách', desc: 'Thêm & sửa đầu sách', icon: BookOpen, to: '/admin/books', color: 'text-blue-600 bg-blue-50' },
              { title: 'Quản lý bản sao', desc: 'In mã vạch & xếp giá', icon: Layers, to: '/admin/copies', color: 'text-indigo-600 bg-indigo-50' },
              { title: 'Hàng chờ giữ chỗ', desc: 'Điều phối đặt trước', icon: BookmarkCheck, to: '/admin/reservations', color: 'text-amber-600 bg-amber-50' },
              { title: 'Quản lý bạn đọc', desc: 'Thẻ & tài khoản', icon: Users, to: '/admin/users', color: 'text-emerald-600 bg-emerald-50' },
              { title: 'Thu tiền phạt', desc: 'Biên lai & miễn phạt', icon: Receipt, to: '/admin/fines', color: 'text-red-600 bg-red-50' },
              { title: 'Báo cáo thống kê', desc: 'Xuất Excel & CSV', icon: TrendingUp, to: '/admin/reports', color: 'text-orange-600 bg-orange-50' },
              { title: 'Chính sách mượn', desc: 'Cấu hình thời hạn', icon: Settings, to: '/admin/settings', color: 'text-slate-700 bg-slate-100' },
            ].map((item, idx) => (
              <Link
                key={idx}
                to={item.to}
                className="p-3 border border-border/80 rounded-xl hover:border-primary/40 hover:shadow-card transition-all flex flex-col items-center text-center group card-hover"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-textPrimary line-clamp-1">{item.title}</span>
                <span className="text-[10px] text-textSecondary line-clamp-1 mt-0.5">{item.desc}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Warehouse Quick Summary (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-border rounded-xl p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="border-b border-border/80 pb-3 mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-textPrimary flex items-center space-x-1.5">
                <CopyIcon className="w-4 h-4 text-primary" />
                <span>Kho sách thư viện</span>
              </h2>
              <span className="text-xs font-bold text-textPrimary">{summary.total_copies} bản sao</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-textSecondary flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-success mr-2" />
                  Sẵn sàng cho mượn:
                </span>
                <span className="font-bold text-success">{summary.available_copies}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-textSecondary flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-info mr-2" />
                  Đang được mượn:
                </span>
                <span className="font-bold text-info">{summary.borrowed_copies}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-textSecondary flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary mr-2" />
                  Đang giữ chỗ tại quầy:
                </span>
                <span className="font-bold text-primary">{summary.reserved_copies}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-textSecondary flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-danger mr-2" />
                  Hư hỏng / Báo mất:
                </span>
                <span className="font-bold text-danger">{summary.damaged_lost_copies}</span>
              </div>
            </div>
          </div>

          <Link
            to="/admin/copies"
            className="mt-4 block text-center text-xs text-primary font-semibold border border-primary/30 py-2 rounded-lg hover:bg-primary-light transition-colors"
          >
            Quản lý mã vạch bản sao &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};


