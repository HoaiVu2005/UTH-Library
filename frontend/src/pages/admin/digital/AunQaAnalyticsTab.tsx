import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  PieChart as PieIcon,
  BookOpen,
  Clock,
  Award,
  ShieldCheck,
  RotateCcw,
  TrendingUp,
  Building,
  Layers,
  FileText,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { toast } from '@/components/ui/Toast';

const TEAL_PALETTE = ['#008B8B', '#0097A7', '#00796B', '#00ACC1', '#26A69A', '#4DB6AC', '#80CBC4', '#B2DFDB'];

export const AunQaAnalyticsTab: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/digital-library/admin/stats');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch digital library stats', err);
      toast.error('Không thể tải dữ liệu thống kê thư viện số.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-gray-400 flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-gray-200/80">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Đang tổng hợp dữ liệu báo cáo AUN-QA & kiểm định chất lượng đào tạo...</p>
      </div>
    );
  }

  if (!data) return null;

  const overview = data.overview || {};
  const typeDistribution = data.type_distribution || [];
  const topDocuments = data.top_documents || [];
  const readsByDept = data.reads_by_department || [];
  const recentLogs = data.recent_approval_logs || [];

  return (
    <div className="space-y-5 animate-page-enter">
      {/* 1. Accreditation Banner Note */}
      <div className="bg-teal-50/60 border border-teal-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            Kiểm định chất lượng giáo dục AUN-QA & MOET
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-800">
            Báo cáo Thống kê Học liệu số & Thời lượng Nghiên cứu
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Hệ thống cung cấp số liệu thực tế về quy mô số hóa học liệu, tỷ lệ đáp ứng tài liệu
            cho các chương trình đào tạo và thống kê thời lượng tự học của sinh viên UTH theo từng Khoa.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchStats}
          className="gap-2 shrink-0 self-start sm:self-center border-teal-300 text-brand hover:bg-teal-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Làm mới số liệu</span>
        </Button>
      </div>

      {/* 2. Overview Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tổng tài liệu</p>
          <p className="text-xl font-black text-gray-800 mt-1">{overview.total_documents || 0}</p>
          <span className="text-[10px] text-brand font-medium">Toàn bộ kho số</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Đã xuất bản</p>
          <p className="text-xl font-black text-emerald-600 mt-1">{overview.published_documents || 0}</p>
          <span className="text-[10px] text-gray-400">Đang phục vụ bạn đọc</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Chờ phê duyệt</p>
          <p className="text-xl font-black text-amber-600 mt-1">{overview.pending_approval_documents || 0}</p>
          <span className="text-[10px] text-gray-400">Đang chờ Admin duyệt</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Bản nháp</p>
          <p className="text-xl font-black text-gray-700 mt-1">{overview.draft_documents || 0}</p>
          <span className="text-[10px] text-gray-400">Thủ thư biên tập</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand">Tổng phiên đọc</p>
          <p className="text-xl font-black text-brand mt-1">{overview.total_reading_sessions || 0}</p>
          <span className="text-[10px] text-gray-400">Watermark bảo mật</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Thời lượng đọc</p>
          <p className="text-xl font-black text-indigo-600 mt-1">
            {overview.total_reading_hours || 0} <span className="text-xs font-normal">giờ</span>
          </p>
          <span className="text-[10px] text-gray-400">Tự học & nghiên cứu</span>
        </div>
      </div>

      {/* 3. Two Column Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Distribution by Document Type */}
        <Card className="shadow-xs border-gray-200/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand" />
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Quy mô Học liệu theo 10 Loại tài liệu
              </h3>
            </div>
            <span className="text-[11px] text-gray-400 font-medium">Đơn vị: Tài liệu</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="label" type="category" width={140} tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#008B8B" radius={[0, 4, 4, 0]}>
                  {typeDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={TEAL_PALETTE[index % TEAL_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Reads by Department */}
        <Card className="shadow-xs border-gray-200/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Lượt truy cập đọc số phân bố theo Khoa
              </h3>
            </div>
            <span className="text-[11px] text-gray-400 font-medium">Đơn vị: Phiên đọc</span>
          </div>

          <div className="h-64">
            {readsByDept.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={readsByDept} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="user_department"
                    tick={{ fontSize: 9, fill: '#475569' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="reads" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Chưa có đủ dữ liệu phiên đọc theo khoa để biểu diễn đồ thị.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 4. Top 10 Most Read Documents */}
      <Card className="shadow-xs border-gray-200/80 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand" />
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Top 10 Học liệu số được Bạn đọc nghiên cứu nhiều nhất
            </h3>
          </div>
          <span className="text-[11px] text-gray-400 font-medium">Theo số lượt đọc và thời lượng tích lũy</span>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <TableHead className="w-20 text-center">Thứ hạng</TableHead>
              <TableHead>Tên tài liệu / Luận văn</TableHead>
              <TableHead className="w-48">Loại học liệu</TableHead>
              <TableHead className="w-48">Khoa / Đơn vị</TableHead>
              <TableHead className="w-28 text-right">Lượt đọc</TableHead>
              <TableHead className="w-36 text-right">Tổng thời lượng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topDocuments.map((doc: any, index: number) => (
              <TableRow key={doc.id} className="hover:bg-teal-50/20 transition-colors">
                <TableCell className="text-center">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-xs ${
                      index === 0
                        ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300'
                        : index === 1
                        ? 'bg-gray-200 text-gray-700'
                        : index === 2
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </span>
                </TableCell>
                <TableCell className="font-bold text-xs text-gray-800 max-w-md line-clamp-1">
                  {doc.title}
                </TableCell>
                <TableCell className="text-xs text-brand font-medium">
                  {doc.document_type_display}
                </TableCell>
                <TableCell className="text-xs text-gray-600">
                  {doc.department || 'Toàn trường'}
                </TableCell>
                <TableCell className="text-right font-bold text-xs text-gray-800">
                  {doc.total_views}
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-xs text-brand">
                  {doc.reading_hours} giờ
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* 5. Audit Log of Approvals, Rejections, Revocations */}
      <Card className="shadow-xs border-gray-200/80 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Nhật ký Kiểm duyệt & Quản trị Học liệu số
            </h3>
          </div>
          <span className="text-[11px] text-gray-400 font-medium">15 thao tác kiểm duyệt gần nhất</span>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <TableHead className="w-40">Thời gian</TableHead>
              <TableHead className="w-48">Người thực hiện</TableHead>
              <TableHead className="w-36 text-center">Thao tác</TableHead>
              <TableHead>Tài liệu</TableHead>
              <TableHead>Lý do / Ghi chú kiểm toán</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentLogs.map((log: any) => (
              <TableRow key={log.id} className="hover:bg-teal-50/20 transition-colors">
                <TableCell className="text-gray-400 font-mono text-[11px]">
                  {new Date(log.created_at).toLocaleString('vi-VN')}
                </TableCell>
                <TableCell className="font-bold text-xs text-gray-800">
                  {log.actor_full_name}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      log.action === 'approve'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.action === 'reject'
                        ? 'bg-rose-100 text-rose-800'
                        : log.action === 'disable'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {log.action_display}
                  </span>
                </TableCell>
                <TableCell className="font-medium text-xs text-gray-800 max-w-sm line-clamp-1">
                  {log.document_title}
                </TableCell>
                <TableCell className="text-xs text-gray-500 italic max-w-xs">
                  {log.note || '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
