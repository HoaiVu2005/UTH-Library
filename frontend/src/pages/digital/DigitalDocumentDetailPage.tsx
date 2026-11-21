import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Calendar,
  Building2,
  User,
  ShieldCheck,
  Lock,
  Layers,
  FileText,
  Clock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  History,
  Tag,
  Check,
  ChevronRight,
  Download,
  Printer,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
const DigitalPdfReaderModal = lazy(() => import('@/features/ebook/DigitalPdfReaderModal'));

interface VersionItem {
  id: number;
  version_number: number;
  file_size_formatted: string;
  page_count: number;
  change_log?: string;
  is_current: boolean;
  uploaded_by_name: string;
  created_at: string;
}

interface DocumentDetail {
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
  isbn?: string;
  source_license?: string;
  abstract?: string;
  keywords?: string;
  language?: string;
  metadata?: Record<string, any>;
  access_scope: string;
  access_scope_display: string;
  allowed_departments?: string[];
  allowed_majors?: string[];
  access_start_date?: string;
  access_end_date?: string;
  require_active_card: boolean;
  allow_download: boolean;
  allow_print: boolean;
  campus_only: boolean;
  has_access: boolean;
  access_denial_reason?: string;
  total_views: number;
  total_reading_seconds: number;
  current_version_number: number;
  page_count: number;
  file_size_formatted: string;
  versions: VersionItem[];
  user_reading_session?: {
    current_page: number;
    max_page_reached: number;
    total_seconds_spent: number;
    progress_percent: number;
    last_active_at?: string;
  } | null;
}

export const DigitalDocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/digital-library/documents/${id}`);
      setDoc(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Không tìm thấy tài liệu số.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 pb-12 animate-page-enter">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Card variant="elevated" className="p-8 space-y-4">
          <Skeleton className="h-8 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-1/2 rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </Card>
      </div>
    );
  }

  if (error || !doc) {
    return <ErrorState message={error || 'Không tìm thấy tài liệu số'} onRetry={fetchDetail} />;
  }

  const session = doc.user_reading_session;
  const hasReadingProgress = session && session.current_page > 1;

  return (
    <div className="space-y-5 pb-16 animate-page-enter">
      {/* 1. Breadcrumbs Matching BookDetailPage */}
      <div className="flex items-center text-xs text-gray-500 flex-wrap gap-y-1">
        <Link to="/" className="hover:text-brand transition-colors">
          Trang chủ
        </Link>
        <span className="text-orange-500 font-bold mx-2 select-none">&gt;</span>
        <Link to="/digital-library" className="hover:text-brand transition-colors">
          Thư viện số
        </Link>
        <span className="text-orange-500 font-bold mx-2 select-none">&gt;</span>
        <span className="text-gray-800 font-semibold truncate max-w-xs sm:max-w-md">
          {doc.title}
        </span>
      </div>

      {/* 2. Main Document Hero Card */}
      <Card variant="elevated" className="p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Academic Cover Thumbnail & DRM Box */}
          <div className="md:col-span-4 flex flex-col items-center">
            <div className="w-full max-w-[240px] aspect-[3/4] bg-gradient-to-b from-teal-50/80 to-slate-100 rounded-2xl border border-gray-200/90 overflow-hidden shadow-card flex flex-col items-center justify-between p-5 relative text-center">
              {doc.cover_image ? (
                <img src={doc.cover_image} alt={doc.title} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <>
                  <div className="space-y-1 w-full">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#008B8B] block">
                      ĐH GIAO THÔNG VẬN TẢI TP.HCM
                    </span>
                    <div className="w-8 h-0.5 bg-[#ED6C02] mx-auto rounded-full" />
                  </div>

                  <div className="flex flex-col items-center my-auto px-2">
                    <div className="w-14 h-14 rounded-2xl bg-white text-brand shadow-xs flex items-center justify-center mb-3">
                      <GraduationCap className="w-8 h-8 text-[#008B8B]" />
                    </div>
                    <span className="text-xs font-bold text-gray-800 line-clamp-3 leading-snug">
                      {doc.title}
                    </span>
                  </div>

                  <div className="w-full pt-2 border-t border-teal-200/60 text-[10px] font-semibold text-gray-500 truncate">
                    {doc.author_names || 'Tài liệu học thuật UTH'}
                  </div>
                </>
              )}

              <span className="absolute top-2.5 right-2.5 bg-[#008B8B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                v{doc.current_version_number}
              </span>
            </div>

            {/* Quick Specs under cover */}
            <div className="mt-4 w-full max-w-[240px] space-y-2 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span>{doc.page_count} trang</span>
                <span>•</span>
                <span>{doc.file_size_formatted}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-brand text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-brand" />
                <span>Dynamic Watermark DRM</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Metadata, Abstract & Access Rights */}
          <div className="md:col-span-8 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              {/* Type pill & Year */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-brand font-bold text-xs uppercase tracking-wider border border-teal-200">
                  {doc.document_type_display}
                </span>
                {doc.year && (
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                    Năm {doc.year}
                  </span>
                )}
                {doc.has_access ? (
                  <Badge variant="teal" size="sm">
                    ✓ Có quyền đọc
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm">
                    Giới hạn phạm vi
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight tracking-tight">
                {doc.title}
              </h1>

              {/* Authors & Advisor */}
              <div className="space-y-1 text-xs">
                {doc.author_names && (
                  <p className="text-gray-700">
                    <span className="text-gray-400 font-medium">Tác giả / Sinh viên thực hiện:</span>{' '}
                    <strong className="text-gray-900 font-bold">{doc.author_names}</strong>
                  </p>
                )}
                {doc.advisor_names && (
                  <p className="text-gray-700">
                    <span className="text-gray-400 font-medium">Giảng viên hướng dẫn:</span>{' '}
                    <strong className="text-brand font-bold">{doc.advisor_names}</strong>
                  </p>
                )}
              </div>

              {/* Structured Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 py-3.5 border-y border-gray-200/80 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Khoa / Viện:</span>
                  <span className="font-semibold text-gray-800">{doc.department || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Chuyên ngành:</span>
                  <span className="font-semibold text-gray-800">{doc.major || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Năm công bố:</span>
                  <span className="font-semibold text-gray-800">{doc.year || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Ngôn ngữ:</span>
                  <span className="font-semibold text-gray-800">{doc.language || 'Tiếng Việt'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Nguồn / Giấy phép:</span>
                  <span className="font-semibold text-gray-800">{doc.source_license || 'Bản quyền UTH'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Lượt nghiên cứu:</span>
                  <span className="font-semibold text-brand">{doc.total_views} lượt đọc</span>
                </div>
              </div>

              {/* Abstract */}
              {doc.abstract && (
                <div className="space-y-1.5 pt-1">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Tóm tắt nội dung
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/70 p-3.5 rounded-xl border border-gray-200/80">
                    {doc.abstract}
                  </p>
                </div>
              )}

              {/* Keywords */}
              {doc.keywords && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs font-bold text-gray-500 mr-1 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-gray-400" /> Từ khóa:
                  </span>
                  {doc.keywords.split(',').map((kw, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-md"
                    >
                      {kw.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Access Rights Card & Call to Action */}
            <div className="pt-4 border-t border-gray-200">
              <div className="bg-teal-50/60 border border-teal-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#008B8B]">
                      Quyền truy cập: {doc.access_scope_display}
                    </span>
                    {doc.has_access ? (
                      <Badge variant="teal" size="sm">
                        ✓ Đủ điều kiện đọc
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm">
                        Giới hạn phạm vi
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    {doc.has_access
                      ? 'Bạn đọc có quyền mở đọc tài liệu toàn văn trực tuyến với ma trận Watermark bản quyền UTH.'
                      : doc.access_denial_reason}
                  </p>
                  {hasReadingProgress && (
                    <div className="pt-1 text-[11px] font-semibold text-[#008B8B]">
                      Lần trước bạn đang đọc đến Trang {session.current_page}/{doc.page_count} ({session.progress_percent}%)
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto">
                  {doc.has_access ? (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setIsReaderOpen(true)}
                      className="bg-[#008B8B] hover:bg-[#006F70] text-white font-bold w-full sm:w-auto px-6 shadow-md shadow-teal-700/20"
                      leftIcon={<BookOpen className="w-4 h-4 text-white" />}
                    >
                      {hasReadingProgress ? `Đọc tiếp (Trang ${session.current_page})` : 'Đọc Trực Tuyến Ngay'}
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="lg"
                      disabled
                      className="w-full sm:w-auto opacity-80 cursor-not-allowed"
                      leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
                    >
                      Chưa được cấp quyền
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Version History Table */}
      {doc.versions && doc.versions.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-[#008B8B]" />
            <h3 className="text-sm font-bold text-gray-800 tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-1.5 select-none">&gt;</span>
              <span>Lịch sử các phiên bản tài liệu ({doc.versions.length})</span>
            </h3>
          </div>

          <Card className="shadow-xs border-gray-200/80 rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <TableHead className="w-24">Phiên bản</TableHead>
                  <TableHead>Nội dung cập nhật / Ghi chú</TableHead>
                  <TableHead className="w-32 text-center">Quy cách</TableHead>
                  <TableHead className="w-48">Người đăng tải</TableHead>
                  <TableHead className="w-36 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doc.versions.map((ver) => (
                  <TableRow key={ver.id} className="hover:bg-teal-50/30 transition-colors">
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold font-mono text-xs ${
                          ver.is_current ? 'bg-teal-100 text-[#008B8B]' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        v{ver.version_number}
                        {ver.is_current && <span className="ml-1 text-[10px] text-emerald-600">★</span>}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-gray-800 font-medium">
                      {ver.change_log || 'Phiên bản tài liệu ban đầu'}
                      {ver.is_current && (
                        <span className="ml-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Hiện hành
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500 text-center font-mono">
                      {ver.page_count} trang • {ver.file_size_formatted}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {ver.uploaded_by_name}
                    </TableCell>
                    <TableCell className="text-right">
                      {ver.is_current && doc.has_access && (
                        <button
                          type="button"
                          onClick={() => setIsReaderOpen(true)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg border border-teal-200 text-[#008B8B] hover:bg-teal-50 transition-colors cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Mở đọc v{ver.version_number}</span>
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>
      )}

      {/* 4. In-App Dynamic Watermark PDF Reader Modal */}
      {isReaderOpen && doc.id && (
        <Suspense fallback={null}>
          <DigitalPdfReaderModal
            documentId={doc.id}
            isOpen={isReaderOpen}
            onClose={() => {
              setIsReaderOpen(false);
              fetchDetail();
            }}
            onProgressUpdated={() => {
              fetchDetail();
            }}
          />
        </Suspense>
      )}
    </div>
  );
};
