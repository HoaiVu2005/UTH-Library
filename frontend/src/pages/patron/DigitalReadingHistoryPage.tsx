import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Compass,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
const DigitalPdfReaderModal = lazy(() => import('@/features/ebook/DigitalPdfReaderModal'));

interface ReadingSessionItem {
  id: number;
  session_id: string;
  session_code: string;
  document: number;
  document_title: string;
  document_type: string;
  document_type_display: string;
  document_cover_image?: string;
  version_number: number;
  total_pages: number;
  current_page: number;
  max_page_reached: number;
  total_seconds_spent: number;
  progress_percent: number;
  started_at: string;
  last_active_at: string;
  expires_at: string;
  status: 'active' | 'expired' | 'closed';
}

const formatSeconds = (sec: number): string => {
  if (!sec || sec <= 0) return 'Dưới 1 phút';
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}p`;
  }
  return `${minutes} phút`;
};

const formatTimeAgo = (isoDate: string): string => {
  try {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return new Date(isoDate).toLocaleDateString('vi-VN');
  } catch {
    return isoDate;
  }
};

export const DigitalReadingHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ReadingSessionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchHistory = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get('/digital-library/my-history', {
        params: { page, page_size: 10 },
      });
      const data = res.data?.data || res.data?.results || [];
      const total = res.data?.meta?.total ?? res.data?.total ?? res.data?.count ?? data.length;
      setSessions(Array.isArray(data) ? data : []);
      setTotalCount(total);
      setTotalPages(res.data?.meta?.total_pages ?? res.data?.total_pages ?? Math.max(1, Math.ceil(total / 10)));
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to fetch reading history', err);
      toast.error('Không thể tải lịch sử đọc số. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã phiên: ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.document_title.toLowerCase().includes(q) ||
      s.session_code.toLowerCase().includes(q) ||
      s.document_type_display.toLowerCase().includes(q)
    );
  });

  const totalSeconds = sessions.reduce((acc, curr) => acc + (curr.total_seconds_spent || 0), 0);
  const uniqueDocs = new Set(sessions.map((s) => s.document)).size;
  const avgProgress = sessions.length
    ? Math.round(sessions.reduce((acc, curr) => acc + (curr.progress_percent || 0), 0) / sessions.length)
    : 0;

  return (
    <div className="space-y-5 pb-16 animate-page-enter">
      {/* 1. Page Header Banner - UTH Portal Style */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <Clock className="w-5 h-5 text-[#008B8B]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#008B8B] tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>Lịch sử Đọc & Nghiên cứu Tài liệu số</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Ghi nhận minh bạch từng phiên mở đọc trực tuyến, bảo lưu số trang đang đọc và mã phiên Watermark truy vết
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/digital-library"
            className="inline-flex items-center justify-center text-xs font-bold h-9 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white transition-all shadow-xs shrink-0"
          >
            <BookOpen className="w-4 h-4 mr-1.5 text-white" />
            <span>Kho tài liệu số UTH</span>
          </Link>
          <button
            type="button"
            onClick={() => fetchHistory(currentPage)}
            className="inline-flex items-center justify-center text-xs font-semibold h-9 px-3.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all bg-white shadow-2xs shrink-0 cursor-pointer"
            title="Làm mới dữ liệu lịch sử"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* 2. Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Học liệu đã đọc"
          value={uniqueDocs}
          subtext="Tài liệu số đã tiếp cận"
          icon={<BookOpen className="w-5 h-5 text-brand" />}
        />
        <StatCard
          title="Tổng thời lượng"
          value={formatSeconds(totalSeconds)}
          subtext="Thời gian nghiên cứu số"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
        />
        <StatCard
          title="Phiên đọc đã tạo"
          value={totalCount}
          subtext="Phiên định danh Watermark"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Tiến độ trung bình"
          value={`${avgProgress}%`}
          subtext="Mức độ hoàn thành trang"
          icon={<CheckCircle2 className="w-5 h-5 text-blue-600" />}
        />
      </div>

      {/* 3. Search Bar Card */}
      <Card className="shadow-xs border-gray-200/80">
        <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo tên tài liệu, mã phiên đọc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 text-xs h-9 rounded-xl border border-gray-200 focus:outline-none focus:border-brand bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-gray-500 self-end sm:self-center">
            Hiển thị <strong className="text-gray-800">{filteredSessions.length}</strong> phiên đọc gần nhất
          </div>
        </CardContent>
      </Card>

      {/* 4. Reading History Table */}
      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-gray-200/80">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <p>Đang tải nhật ký phiên đọc có Watermark...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <EmptyState
          title="Chưa có phiên đọc tài liệu nào"
          description={
            searchQuery
              ? 'Không tìm thấy phiên đọc phù hợp với từ khóa tra cứu.'
              : 'Hãy khám phá Kho học liệu số UTH và mở tài liệu để bắt đầu phiên đọc trực tuyến.'
          }
          actionText={searchQuery ? 'Xóa từ khóa tìm kiếm' : 'Khám phá Thư viện số'}
          onAction={() => {
            if (searchQuery) setSearchQuery('');
            else navigate('/digital-library');
          }}
        />
      ) : (
        <Card className="shadow-xs border-gray-200/80 rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <TableHead className="w-32">Mã phiên</TableHead>
                <TableHead>Tài liệu số</TableHead>
                <TableHead className="w-36 text-center">Hoạt động</TableHead>
                <TableHead className="w-28 text-center">Thời lượng</TableHead>
                <TableHead className="w-48">Tiến độ đọc</TableHead>
                <TableHead className="w-32 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((s) => (
                <TableRow key={s.id} className="hover:bg-teal-50/30 transition-colors">
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(s.session_code)}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 hover:bg-teal-100 text-gray-700 hover:text-brand font-mono text-[11px] font-semibold transition-colors cursor-pointer"
                      title="Bấm để sao chép mã phiên"
                    >
                      <span>{s.session_code}</span>
                      {copiedCode === s.session_code ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-400" />
                      )}
                    </button>
                  </TableCell>

                  <TableCell>
                    <Link
                      to={`/digital-library/${s.document}`}
                      className="font-bold text-xs text-gray-800 hover:text-brand transition-colors block line-clamp-1"
                    >
                      {s.document_title}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                      <span className="font-medium text-brand">{s.document_type_display}</span>
                      <span>•</span>
                      <span>v{s.version_number}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-center text-xs text-gray-600">
                    <span className="block font-medium">{formatTimeAgo(s.last_active_at)}</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(s.last_active_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </TableCell>

                  <TableCell className="text-center text-xs font-semibold text-gray-700 font-mono">
                    {formatSeconds(s.total_seconds_spent)}
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-gray-700">
                          Trang {s.current_page}/{s.total_pages}
                        </span>
                        <span className="font-bold text-brand">{s.progress_percent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-brand h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, s.progress_percent)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedDocId(s.document)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg bg-primary hover:bg-primary-hover text-white transition-all shadow-2xs cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Đọc tiếp</span>
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* 5. Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => fetchHistory(p)}
          />
        </div>
      )}

      {/* 6. Dynamic Watermark PDF Reader Modal */}
      {selectedDocId && (
        <Suspense fallback={null}>
          <DigitalPdfReaderModal
            documentId={selectedDocId}
            isOpen={Boolean(selectedDocId)}
            onClose={() => {
              setSelectedDocId(null);
              fetchHistory(currentPage);
            }}
            onProgressUpdated={() => {
              fetchHistory(currentPage);
            }}
          />
        </Suspense>
      )}
    </div>
  );
};
