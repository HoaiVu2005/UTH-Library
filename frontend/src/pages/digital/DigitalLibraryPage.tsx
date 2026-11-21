import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  GraduationCap,
  BookOpen,
  FileText,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  User,
  RotateCcw,
  LayoutGrid,
  List as ListIcon,
  Eye,
  CheckCircle2,
  Lock,
  Clock,
  X,
  BookMarked,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatCard } from '@/components/ui/StatCard';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { cn } from '@/lib/utils';
const DigitalPdfReaderModal = lazy(() => import('@/features/ebook/DigitalPdfReaderModal'));

export interface DigitalDocItem {
  id: number;
  title: string;
  document_type: string;
  document_type_display: string;
  status: string;
  status_display: string;
  cover_image?: string;
  year?: number;
  department?: string;
  major?: string;
  author_names?: string;
  advisor_names?: string;
  publisher?: string;
  total_views: number;
  total_reading_seconds: number;
  access_scope: string;
  access_scope_display: string;
  has_access: boolean;
  access_denial_reason?: string;
  page_count: number;
  file_size_formatted: string;
  created_at: string;
}

const DOCUMENT_TYPES = [
  { key: '', label: 'Tất cả học liệu' },
  { key: 'thesis', label: 'Khóa luận tốt nghiệp' },
  { key: 'capstone', label: 'Đồ án tốt nghiệp' },
  { key: 'project', label: 'Đồ án môn học' },
  { key: 'research_project', label: 'Nghiên cứu khoa học' },
  { key: 'journal_paper', label: 'Bài báo khoa học' },
  { key: 'textbook', label: 'Giáo trình' },
  { key: 'lecture_slide', label: 'Slide bài giảng' },
  { key: 'internship_report', label: 'Báo cáo thực tập' },
  { key: 'ebook', label: 'Sách điện tử' },
  { key: 'learning_material', label: 'Tài liệu tham khảo' },
];

export const DigitalLibraryPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filters
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || '');
  const [major, setMajor] = useState(searchParams.get('major') || '');
  const [year, setYear] = useState(searchParams.get('year') || '');
  const [author, setAuthor] = useState(searchParams.get('author') || '');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(
    Boolean(searchParams.get('department') || searchParams.get('major') || searchParams.get('year') || searchParams.get('author'))
  );

  // Data states
  const [documents, setDocuments] = useState<DigitalDocItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Reader Modal
  const [readingDocId, setReadingDocId] = useState<number | null>(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        page_size: 12,
      };
      if (q.trim()) params.q = q.trim();
      if (selectedType) params.document_type = selectedType;
      if (department.trim()) params.department = department.trim();
      if (major.trim()) params.major = major.trim();
      if (year.trim()) params.year = year.trim();
      if (author.trim()) params.author = author.trim();

      const res = await api.get('/digital-library/documents', { params });
      const docs = res.data?.data || [];
      const total = res.data?.meta?.total ?? res.data?.total ?? docs.length;
      const totalPages = res.data?.meta?.total_pages ?? res.data?.total_pages ?? (Math.ceil(total / 12) || 1);
      setDocuments(docs);
      setTotalRecords(total);
      setTotalPages(totalPages);
    } catch {
      setDocuments([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, q, selectedType, department, major, year, author]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDocuments();
  };

  const handleResetFilters = () => {
    setQ('');
    setSelectedType('');
    setDepartment('');
    setMajor('');
    setYear('');
    setAuthor('');
    setPage(1);
  };

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'thesis':
      case 'capstone':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'research_project':
      case 'journal_paper':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'textbook':
        return 'bg-teal-50 text-[#008B8B] border-teal-200';
      case 'lecture_slide':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'internship_report':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const activeSecondaryFiltersCount =
    (department ? 1 : 0) +
    (major ? 1 : 0) +
    (year ? 1 : 0) +
    (author ? 1 : 0);

  const activeFiltersCount =
    (q ? 1 : 0) +
    (selectedType ? 1 : 0) +
    activeSecondaryFiltersCount;

  return (
    <div className="space-y-5 pb-16 animate-page-enter">
      {/* 1. Page Header Banner - UTH Portal Clean Style */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <GraduationCap className="w-5 h-5 text-[#008B8B]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#008B8B] tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>Thư viện Số & Học liệu UTH</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Kho học liệu điện tử, giáo trình số, khóa luận tốt nghiệp và đồ án nghiên cứu khoa học trường ĐH Giao thông Vận tải TP.HCM
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAuthenticated && (
            <Link
              to="/my-reading-history"
              className="inline-flex items-center justify-center text-xs font-semibold h-9 px-3.5 rounded-xl border border-brand text-brand hover:bg-teal-50/70 transition-all bg-white shadow-2xs shrink-0"
              title="Xem nhật ký các phiên đọc học liệu có Watermark bản quyền"
            >
              <Clock className="w-4 h-4 mr-1.5 text-brand" />
              <span>Lịch sử đọc của tôi</span>
            </Link>
          )}

          {(user?.role === 'admin' || user?.role === 'librarian') && (
            <Link
              to="/admin/digital-library"
              className="inline-flex items-center justify-center text-xs font-bold h-9 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white transition-all shadow-xs shrink-0"
              title="Quản trị danh mục học liệu số và hàng đợi kiểm duyệt"
            >
              <ShieldCheck className="w-4 h-4 mr-1.5 text-white" />
              <span>Quản lý thư viện số</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Search and Multi-Facet Filter Card */}
      <Card className="shadow-xs border-gray-200/80 bg-white">
        <CardContent className="p-4 sm:p-5 space-y-3.5">
          {/* Main Search & Primary Filter Row */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5">
            {/* Input tìm kiếm */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm theo tên đề tài, tác giả, sinh viên thực hiện, từ khóa..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9 pr-8 w-full text-xs h-10 rounded-xl border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => {
                    setQ('');
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Bộ lọc Loại hình học liệu (Thay thế dải 10 nút bấm tràn viền) */}
            <div className="relative shrink-0 sm:w-64">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
                className={cn(
                  'w-full text-xs h-10 px-3.5 rounded-xl border transition-colors cursor-pointer font-medium focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand',
                  selectedType
                    ? 'border-brand bg-teal-50/50 text-brand font-bold'
                    : 'border-gray-200 bg-gray-50/70 text-gray-700 hover:bg-gray-50'
                )}
              >
                <option value="">📁 Tất cả loại học liệu ({DOCUMENT_TYPES.length - 1} thể loại)</option>
                {DOCUMENT_TYPES.filter((t) => t.key !== '').map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Nút bật/tắt Bộ lọc nâng cao */}
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={cn(
                'inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shrink-0 shadow-2xs',
                showAdvancedFilters || activeSecondaryFiltersCount > 0
                  ? 'bg-teal-50 text-brand border-brand font-bold'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              )}
              title="Mở rộng / thu gọn bộ lọc chi tiết"
            >
              <Filter className="w-3.5 h-3.5 text-brand" />
              <span>Bộ lọc</span>
              {activeSecondaryFiltersCount > 0 && (
                <span className="w-4.5 h-4.5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                  {activeSecondaryFiltersCount}
                </span>
              )}
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-gray-400 transition-transform duration-200',
                  showAdvancedFilters && 'rotate-180 text-brand'
                )}
              />
            </button>

            <Button
              type="submit"
              variant="primary"
              className="h-10 px-5 text-xs font-bold rounded-xl shrink-0"
              leftIcon={<Search className="w-3.5 h-3.5 text-white" />}
            >
              Tìm kiếm
            </Button>
          </form>

          {/* Secondary Filter Grid - Khi mở rộng */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-brand" />
                  <span>Khoa / Viện đào tạo</span>
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Khoa CNTT, Kinh tế vận tải..."
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-brand bg-white"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 mb-1">
                  <GraduationCap className="w-3.5 h-3.5 text-brand" />
                  <span>Chuyên ngành</span>
                </label>
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="Kỹ thuật phần mềm, Logistics..."
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-brand bg-white"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-brand" />
                  <span>Năm bảo vệ / xuất bản</span>
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="VD: 2026, 2025..."
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-brand bg-white"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 mb-1">
                  <User className="w-3.5 h-3.5 text-brand" />
                  <span>Tác giả / Sinh viên thực hiện</span>
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Tên tác giả, GV hướng dẫn..."
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-brand bg-white"
                />
              </div>
            </div>
          )}

          {/* Active Filter Chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-2.5 bg-teal-50/60 border border-teal-200/70 rounded-xl text-xs">
              <span className="text-gray-500 font-medium text-[11px] mr-1">Đang lọc:</span>
              {q && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white text-teal-900 border border-teal-200 rounded-lg shadow-2xs text-[11px]">
                  <span>Từ khóa: <strong>{q}</strong></span>
                  <button onClick={() => setQ('')} className="text-teal-600 hover:text-red-600">×</button>
                </span>
              )}
              {selectedType && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white text-teal-900 border border-teal-200 rounded-lg shadow-2xs text-[11px]">
                  <span>Loại: <strong>{DOCUMENT_TYPES.find((t) => t.key === selectedType)?.label}</strong></span>
                  <button onClick={() => setSelectedType('')} className="text-teal-600 hover:text-red-600">×</button>
                </span>
              )}
              {department && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white text-teal-900 border border-teal-200 rounded-lg shadow-2xs text-[11px]">
                  <span>Khoa: <strong>{department}</strong></span>
                  <button onClick={() => setDepartment('')} className="text-teal-600 hover:text-red-600">×</button>
                </span>
              )}
              {major && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white text-teal-900 border border-teal-200 rounded-lg shadow-2xs text-[11px]">
                  <span>Ngành: <strong>{major}</strong></span>
                  <button onClick={() => setMajor('')} className="text-teal-600 hover:text-red-600">×</button>
                </span>
              )}
              {year && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white text-teal-900 border border-teal-200 rounded-lg shadow-2xs text-[11px]">
                  <span>Năm: <strong>{year}</strong></span>
                  <button onClick={() => setYear('')} className="text-teal-600 hover:text-red-600">×</button>
                </span>
              )}
              {author && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white text-teal-900 border border-teal-200 rounded-lg shadow-2xs text-[11px]">
                  <span>Tác giả: <strong>{author}</strong></span>
                  <button onClick={() => setAuthor('')} className="text-teal-600 hover:text-red-600">×</button>
                </span>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-red-600 hover:underline font-semibold ml-auto pl-2"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {/* Footer Bar: Total records, reset & view mode */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Tìm thấy <strong className="text-brand font-bold">{totalRecords}</strong> tài liệu số phù hợp
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 font-medium px-2 py-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>

              <div className="border-l border-gray-200 h-4 mx-1" />

              <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50/60">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-1.5 rounded-md transition-all',
                    viewMode === 'grid' ? 'bg-white text-brand shadow-2xs font-bold' : 'text-gray-400 hover:text-gray-600'
                  )}
                  title="Dạng lưới thẻ"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-1.5 rounded-md transition-all',
                    viewMode === 'list' ? 'bg-white text-brand shadow-2xs font-bold' : 'text-gray-400 hover:text-gray-600'
                  )}
                  title="Dạng danh sách bảng"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Document Grid / List Content */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-gray-200/80">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <p>Đang tải danh mục tài liệu số UTH...</p>
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          title="Không tìm thấy tài liệu phù hợp"
          description="Thử thay đổi từ khóa hoặc chọn thể loại tài liệu khác."
          actionText="Xóa tất cả bộ lọc"
          onAction={handleResetFilters}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-gray-200/80 hover:border-brand/60 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group space-y-3"
            >
              <div className="flex gap-3.5 items-start">
                {/* 1. Cover Thumbnail (3:4 aspect ratio) */}
                <Link
                  to={`/digital-library/${doc.id}`}
                  className="w-20 sm:w-24 shrink-0 aspect-[3/4] rounded-xl overflow-hidden shadow-2xs border border-gray-200/80 bg-slate-50 relative group-hover:shadow transition-all block select-none"
                >
                  {doc.cover_image ? (
                    <img
                      src={doc.cover_image}
                      alt={doc.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-50 via-teal-50/40 to-slate-100 flex flex-col items-center justify-between p-2 text-center border-l-2 border-l-[#008B8B]">
                      <div className="w-full text-right">
                        <span className="text-[9px] font-mono font-bold text-gray-400">{doc.year || 'UTH'}</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-white/90 shadow-2xs text-[#008B8B]">
                        <BookOpen className="w-5 h-5 text-[#008B8B]" />
                      </div>
                      <div className="w-full">
                        <span className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter truncate block">
                          {doc.document_type_display}
                        </span>
                      </div>
                    </div>
                  )}
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#008B8B] text-white shadow-2xs">
                    PDF
                  </span>
                </Link>

                {/* 2. Metadata Column */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold ${getTypeBadgeStyle(
                        doc.document_type
                      )}`}
                    >
                      {doc.document_type_display}
                    </span>
                    {doc.year && (
                      <span className="text-[10px] text-gray-400 font-semibold shrink-0">
                        Năm {doc.year}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/digital-library/${doc.id}`}
                    className="font-bold text-xs sm:text-sm text-gray-800 group-hover:text-brand transition-colors line-clamp-2 leading-snug block"
                    title={doc.title}
                  >
                    {doc.title}
                  </Link>

                  <div className="space-y-1 text-[11px] text-gray-600">
                    {doc.author_names && (
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{doc.author_names}</span>
                      </div>
                    )}

                    {doc.department && (
                      <div className="flex items-center gap-1.5 truncate text-[11px] text-gray-500">
                        <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{doc.department}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Access Indicator & Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <div className="text-[11px]">
                  {doc.has_access ? (
                    <span className="inline-flex items-center text-emerald-600 font-bold gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {doc.access_scope_display}
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center text-amber-600 font-medium gap-1"
                      title={doc.access_denial_reason}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Giới hạn
                    </span>
                  )}
                  <span className="text-gray-400 block text-[10px] mt-0.5">
                    {doc.total_views} lượt mở đọc
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/digital-library/${doc.id}`}
                    className="inline-flex items-center justify-center text-xs font-semibold h-8 px-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Chi tiết
                  </Link>

                  {doc.has_access ? (
                    <button
                      type="button"
                      onClick={() => setReadingDocId(doc.id)}
                      className="inline-flex items-center justify-center text-xs font-bold h-8 px-3.5 rounded-lg bg-primary hover:bg-primary-hover text-white transition-all shadow-2xs gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Đọc online</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center justify-center text-xs font-medium h-8 px-2.5 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
                      title={doc.access_denial_reason || 'Không có quyền truy cập'}
                    >
                      <Lock className="w-3 h-3 mr-1" />
                      Khóa
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Mode - Semantic Table */
        <Card className="shadow-xs border-gray-200/80 rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <TableHead className="w-12">#</TableHead>
                <TableHead>Tên tài liệu / Luận văn</TableHead>
                <TableHead className="w-44">Loại hình</TableHead>
                <TableHead className="w-48">Khoa / Đơn vị</TableHead>
                <TableHead className="w-24 text-center">Năm</TableHead>
                <TableHead className="w-36 text-center">Phạm vi truy cập</TableHead>
                <TableHead className="w-36 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc, idx) => (
                <TableRow key={doc.id} className="hover:bg-teal-50/30 transition-colors">
                  <TableCell className="text-xs text-gray-400 font-mono">
                    {(page - 1) * 12 + idx + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-2xs">
                        {doc.cover_image ? (
                          <img src={doc.cover_image} alt={doc.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-teal-50 text-[#008B8B]">
                            <BookOpen className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/digital-library/${doc.id}`}
                          className="font-bold text-xs text-gray-800 hover:text-brand transition-colors block truncate max-w-sm sm:max-w-md"
                        >
                          {doc.title}
                        </Link>
                        <span className="text-[11px] text-gray-500 block mt-0.5 truncate max-w-sm">
                          {doc.author_names || 'Chưa cập nhật tác giả'}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold ${getTypeBadgeStyle(
                        doc.document_type
                      )}`}
                    >
                      {doc.document_type_display}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {doc.department || '—'}
                  </TableCell>
                  <TableCell className="text-xs text-gray-700 text-center font-semibold">
                    {doc.year || '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {doc.has_access ? (
                      <span className="inline-flex items-center text-xs font-bold text-emerald-600 gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {doc.access_scope_display}
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-medium text-amber-600 gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        Giới hạn
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <Link
                        to={`/digital-library/${doc.id}`}
                        className="p-1.5 text-gray-500 hover:text-brand hover:bg-gray-100 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {doc.has_access && (
                        <button
                          type="button"
                          onClick={() => setReadingDocId(doc.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-primary hover:bg-primary-hover text-white transition-all shadow-2xs cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Đọc</span>
                        </button>
                      )}
                    </div>
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
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* 6. Dynamic Watermark PDF Reader Modal */}
      {readingDocId && (
        <Suspense fallback={null}>
          <DigitalPdfReaderModal
            documentId={readingDocId}
            isOpen={Boolean(readingDocId)}
            onClose={() => {
              setReadingDocId(null);
              fetchDocuments();
            }}
            onProgressUpdated={() => {
              fetchDocuments();
            }}
          />
        </Suspense>
      )}
    </div>
  );
};
