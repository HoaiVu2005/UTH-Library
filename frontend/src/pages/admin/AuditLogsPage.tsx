import React, { useEffect, useState } from 'react';
import { History, Eye, Terminal, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { DateFilter, DatePreset } from '@/components/ui/DateFilter';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface AuditLogItem {
  id: number;
  action: string;
  entity_type?: string;
  entity_id?: string;
  detail?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: {
    id: number;
    username: string;
    full_name: string;
    card_code: string;
  };
}

export const AuditLogsPage: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [actionFilter, setActionFilter] = useState<string>('');
  const [entityFilter, setEntityFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<{ preset: DatePreset; customDate?: string }>({
    preset: 'all',
  });
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewingDetail, setViewingDetail] = useState<AuditLogItem | null>(null);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      let url = `/audit-logs?page=${page}&page_size=${pageSize}`;
      if (actionFilter) url += `&action=${actionFilter}`;
      if (entityFilter) url += `&entity_type=${entityFilter}`;
      if (dateFilter.preset !== 'all') url += `&date_preset=${dateFilter.preset}`;
      if (dateFilter.customDate) url += `&date=${dateFilter.customDate}`;

      const res = await api.get(url);
      setLogs(res.data?.data || []);
      setTotalRecords(res.data?.meta?.total || res.data?.data?.length || 0);
      setTotalPages(res.data?.meta?.total_pages || 1);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, pageSize, actionFilter, entityFilter, dateFilter]);

  return (
    <div className="space-y-5 pb-12 animate-page-enter">
      {/* Hero Header */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#008B8B] tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>
                {user?.role === 'librarian' ? 'Nhật ký Thao tác của Tôi' : 'Nhật ký Kiểm toán Hệ thống'}
              </span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {user?.role === 'librarian'
                ? 'Theo dõi lịch sử các thao tác lưu thông, mượn trả, thu phạt do bạn thực hiện'
                : 'Ghi vết bất biến mọi thao tác lưu thông, mượn trả, thu phạt, thay đổi cấu hình và bảo mật tài khoản'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="text-xs h-9 px-3.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl bg-white transition-colors inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50 font-medium cursor-pointer"
            title="Tải lại dữ liệu"
          >
            <RotateCcw className={cn('w-3.5 h-3.5 text-gray-500', isLoading && 'animate-spin')} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Limit Bar */}
      <Card className="shadow-xs border-gray-200/80">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="flex-1 max-w-sm">
                <Select
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: '', label: 'Tất cả hành động' },
                    { value: 'BORROW_DIRECT', label: 'Mượn trực tiếp tại quầy' },
                    { value: 'RETURN_LOAN', label: 'Trả sách' },
                    { value: 'RENEW_LOAN', label: 'Gia hạn sách' },
                    { value: 'COLLECT_FINE', label: 'Thu tiền phạt' },
                    { value: 'WAIVE_FINE', label: 'Miễn giảm tiền phạt' },
                    { value: 'HOLD_RESERVATION_READY', label: 'Giữ chỗ sách' },
                    { value: 'CANCEL_RESERVATION', label: 'Hủy đặt trước' },
                    { value: 'SUGGESTION_APPROVE', label: 'Duyệt đề xuất mua' },
                    { value: 'AUTO_LOST_LOAN', label: 'Tự động chuyển mất' },
                    { value: 'ADMIN_LOCK_USER', label: 'Khóa bạn đọc' },
                    { value: 'ADMIN_UNLOCK_USER', label: 'Mở khóa bạn đọc' },
                    { value: 'UPDATE_SYSTEM_CONFIG', label: 'Cập nhật cấu hình' },
                  ]}
                  className="text-xs h-9 rounded-xl border-gray-200"
                />
              </div>

              <div className="w-full sm:w-64">
                <Select
                  value={entityFilter}
                  onChange={(e) => {
                    setEntityFilter(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: '', label: 'Tất cả đối tượng' },
                    { value: 'Loan', label: 'Phiếu mượn' },
                    { value: 'Fine', label: 'Khoản phạt' },
                    { value: 'Reservation', label: 'Đặt trước' },
                    { value: 'User', label: 'Bạn đọc' },
                    { value: 'Book', label: 'Đầu sách' },
                    { value: 'Copy', label: 'Bản sao' },
                    { value: 'SystemConfig', label: 'Cấu hình hệ thống' },
                  ]}
                  className="text-xs h-9 rounded-xl border-gray-200"
                />
              </div>
            </div>

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
            </div>
          </div>

          {/* Date Filter Row */}
          <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between">
            <DateFilter
              value={dateFilter}
              onChange={(newVal) => {
                setDateFilter(newVal);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      {isLoading ? (
        <div className="p-16 text-center text-xs text-gray-500 bg-white border border-gray-200/80 rounded-2xl shadow-xs space-y-2">
          <RotateCcw className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
          <p className="font-semibold text-gray-700">Đang tải nhật ký kiểm toán...</p>
        </div>
      ) : logs.length === 0 ? (
        <EmptyState title="Không tìm thấy bản ghi nhật ký nào" description="Không có sự kiện kiểm toán nào khớp với bộ lọc." />
      ) : (
        <Card className="shadow-xs overflow-hidden border-gray-200/80">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/90 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                  <TableHead className="w-40">Thời gian</TableHead>
                  <TableHead className="w-56">Người thực hiện</TableHead>
                  <TableHead>Hành động</TableHead>
                  <TableHead className="w-36">Đối tượng</TableHead>
                  <TableHead className="w-24">Mã ID</TableHead>
                  <TableHead className="w-32">Địa chỉ IP</TableHead>
                  <TableHead className="w-24 text-right">Chi tiết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const firstChar = log.user?.full_name?.trim()?.charAt(0)?.toUpperCase() || 'U';

                  return (
                    <TableRow key={log.id} className="hover:bg-teal-50/15 transition-colors">
                      <TableCell className="font-mono text-gray-500 text-xs">
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        {log.user ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-teal-50 text-brand font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200/70">
                              {firstChar}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 text-xs truncate">{log.user.full_name}</p>
                              <p className="text-[11px] text-gray-500 font-mono mt-0.5">{log.user.card_code}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Hệ thống (Cron/System)</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs inline-block">
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-gray-800 text-xs">{log.entity_type || '—'}</TableCell>
                      <TableCell className="font-mono text-gray-400 text-xs">#{log.entity_id || '—'}</TableCell>
                      <TableCell className="font-mono text-gray-500 text-xs">{log.ip_address || '127.0.0.1'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => setViewingDetail(log)}
                          className="h-7 px-2.5 text-xs border border-gray-200 hover:bg-teal-50 hover:border-brand/40 text-gray-700 hover:text-brand font-medium rounded-lg inline-flex items-center gap-1 shadow-2xs"
                          title="Xem chi tiết JSON"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="p-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div>
              Hiển thị <strong>{logs.length}</strong> / <strong>{totalRecords}</strong> bản ghi nhật ký
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </div>
        </Card>
      )}

      {/* JSON Detail Modal */}
      <Modal
        isOpen={Boolean(viewingDetail)}
        onClose={() => setViewingDetail(null)}
        title={viewingDetail ? `Chi tiết bản ghi kiểm toán #${viewingDetail.id}` : 'Chi tiết kiểm toán'}
        description={viewingDetail ? `Hành động: ${viewingDetail.action} | Đối tượng: ${viewingDetail.entity_type || '—'} #${viewingDetail.entity_id || '—'}` : undefined}
      >
        {viewingDetail && (
          <div>
            <ModalBody className="space-y-3">
              <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl border border-slate-800 font-mono text-[11px] max-h-72 overflow-y-auto">
                <div className="flex items-center space-x-2 text-slate-400 pb-2 mb-2 border-b border-slate-800">
                  <Terminal className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px]">PAYLOAD / AUDIT DATA</span>
                </div>
                <pre>{JSON.stringify(viewingDetail.detail || {}, null, 2)}</pre>
              </div>
              <p className="text-[11px] text-gray-500">
                User Agent: <span className="font-mono text-gray-700">{viewingDetail.user_agent || '—'}</span>
              </p>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="primary"
                size="md"
                onClick={() => setViewingDetail(null)}
              >
                Đóng
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  );
};