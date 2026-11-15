import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, AlertCircle, Package, Download } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/Table';
import { formatCurrencyVND, formatDateVN, cn, exportToCsv } from '@/lib/utils';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'top_borrowed' | 'overdue' | 'inventory'>('top_borrowed');
  const [topBorrowed, setTopBorrowed] = useState<any[]>([]);
  const [overdueList, setOverdueList] = useState<any[]>([]);
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      if (activeTab === 'top_borrowed') {
        const res = await api.get('/reports/top-borrowed?limit=20');
        setTopBorrowed(res.data?.data || []);
      } else if (activeTab === 'overdue') {
        const res = await api.get('/reports/overdue');
        setOverdueList(res.data?.data || []);
      } else if (activeTab === 'inventory') {
        const res = await api.get('/reports/inventory');
        setInventoryList(res.data?.data || []);
      }
    } catch (err) {
      console.error('Failed to load report data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeTab]);

  const handleExportCsv = () => {
    const today = new Date().toISOString().substring(0, 10);
    if (activeTab === 'top_borrowed') {
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
      const headers = ['Mã phiếu', 'Tên sách', 'Mã vạch', 'Tên bạn đọc', 'Mã thẻ bạn đọc', 'Hạn trả', 'Số ngày trễ', 'Tiền phạt ước tính (VND)'];
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
      const headers = ['Mã khoa', 'Chuyên ngành', 'Tổng bản sao', 'Sẵn sàng', 'Đang mượn', 'Đang giữ chỗ', 'Hỏng/Mất', 'Đã thanh lý'];
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

  return (
    <div className="space-y-5 pb-12 animate-page-enter">
      {/* Header */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>Báo cáo & Thống kê Lưu thông (Reports)</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Báo cáo tần suất mượn, kiểm kê tình trạng bản sao theo khoa và danh sách vi phạm quá hạn
            </p>
          </div>
        </div>

        {/* Tab Selector as Soft Outline Pills */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('top_borrowed')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
              activeTab === 'top_borrowed'
                ? 'bg-teal-100 text-teal-900 border-teal-300 ring-2 ring-brand/40 shadow-2xs'
                : 'bg-teal-50/60 text-brand border-teal-200/80 hover:bg-teal-100/70'
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
                ? 'bg-red-100 text-red-900 border-red-300 ring-2 ring-red-400 shadow-2xs'
                : 'bg-red-50/60 text-red-600 border-red-200/80 hover:bg-red-100/70'
            )}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Sách quá hạn</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
              activeTab === 'inventory'
                ? 'bg-blue-100 text-blue-900 border-blue-300 ring-2 ring-blue-400 shadow-2xs'
                : 'bg-blue-50/60 text-blue-700 border-blue-200/80 hover:bg-blue-100/70'
            )}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Kiểm kê kho</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-1.5 shadow-2xs ml-1"
            title="Xuất file CSV mở trên Excel"
          >
            <Download className="w-3.5 h-3.5 text-brand" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-xs text-gray-500 bg-white border border-gray-200/80 rounded-2xl shadow-xs">
          Đang kết xuất báo cáo thống kê...
        </div>
      ) : activeTab === 'top_borrowed' ? (
        /* Top Borrowed Table */
        <Card className="shadow-xs overflow-hidden border-gray-200/80">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-800">Top 20 Đầu sách mượn nhiều nhất</h3>
            <span className="text-xs text-gray-500">Thống kê toàn thời gian</span>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/90 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                  <TableHead className="w-20 text-center">Thứ hạng</TableHead>
                  <TableHead>Tên đầu sách</TableHead>
                  <TableHead className="w-48">Chuyên ngành</TableHead>
                  <TableHead className="w-40 font-mono">ISBN</TableHead>
                  <TableHead className="w-36 text-right">Tổng lượt mượn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topBorrowed.map((b, idx) => (
                  <TableRow key={b.book_id} className="hover:bg-teal-50/15 transition-colors">
                    <TableCell className="text-center font-bold">
                      {idx === 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs shadow-2xs">1</span>
                      ) : idx === 1 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-800 font-bold text-xs shadow-2xs">2</span>
                      ) : idx === 2 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-800 font-bold text-xs shadow-2xs">3</span>
                      ) : (
                        <span className="text-gray-500">{idx + 1}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-gray-800 text-xs">{b.title}</TableCell>
                    <TableCell className="text-gray-500 text-xs">{b.category}</TableCell>
                    <TableCell className="font-mono text-gray-400 text-xs">{b.isbn || '—'}</TableCell>
                    <TableCell className="text-right">
                      <span className="px-2.5 py-1 rounded-full bg-teal-50 text-brand font-bold text-xs border border-teal-200">
                        {b.total_borrows} lượt
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : activeTab === 'overdue' ? (
        /* Overdue List Table */
        <Card className="shadow-xs overflow-hidden border-gray-200/80">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-800">Danh sách Sách quá hạn cần thu hồi ({overdueList.length})</h3>
            <span className="text-xs text-red-600 font-semibold">Tự động chuyển thành mất nếu quá 30 ngày</span>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/90 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
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
                  <TableRow key={loan.loan_id} className="hover:bg-teal-50/15 transition-colors">
                    <TableCell className="font-mono text-gray-400 text-xs">#{loan.loan_id}</TableCell>
                    <TableCell className="font-medium text-gray-800 text-xs max-w-xs truncate">{loan.book_title}</TableCell>
                    <TableCell className="font-mono text-brand font-bold text-xs">{loan.barcode}</TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-800 text-xs">{loan.user_name}</p>
                      <p className="text-[11px] text-gray-500 font-mono">{loan.card_code}</p>
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs">
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
      ) : (
        /* Inventory Table */
        <Card className="shadow-xs overflow-hidden border-gray-200/80">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-800">Kiểm kê Bản sao theo Chuyên ngành</h3>
            <span className="text-xs text-gray-500">Tổng hợp theo các nhóm ngành UTH</span>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/90 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
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
                  <TableRow key={cat.category_id} className="hover:bg-teal-50/15 transition-colors">
                    <TableCell className="font-mono font-bold text-brand text-xs">[{cat.category_code}]</TableCell>
                    <TableCell className="font-medium text-gray-800 text-xs">{cat.category_name}</TableCell>
                    <TableCell className="text-center font-bold text-gray-800 text-xs">{cat.total_copies}</TableCell>
                    <TableCell className="text-center text-emerald-700 font-semibold text-xs">{cat.available}</TableCell>
                    <TableCell className="text-center text-blue-700 font-semibold text-xs">{cat.borrowed}</TableCell>
                    <TableCell className="text-center text-teal-700 font-semibold text-xs">{cat.reserved}</TableCell>
                    <TableCell className="text-center text-red-600 font-semibold text-xs">{cat.damaged + cat.lost}</TableCell>
                    <TableCell className="text-center text-gray-400 text-xs">{cat.withdrawn}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};