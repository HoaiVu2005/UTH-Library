import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  BookOpen,
  ShieldCheck,
  Eye,
  Plus,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Layers,
  Calendar,
  Lock,
  Image as ImageIcon,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal, ModalBody } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';

const DigitalPdfReaderModal = lazy(() => import('@/features/ebook/DigitalPdfReaderModal'));

export interface UnifiedDigitalDoc {
  id: number;
  title: string;
  cover_image?: string;
  document_type: string;
  document_type_display: string;
  status: string;
  status_display: string;
  current_version_number: number;
  page_count: number;
  file_size_formatted: string;
  total_views: number;
  total_reading_seconds: number;
  author_names?: string;
  department?: string;
  major?: string;
  year?: number;
  source_license?: string;
  access_scope_display?: string;
  is_legacy?: boolean;
}

interface DigitalResourcesModalProps {
  bookId: number | null;
  bookTitle?: string;
  bookCoverImage?: string;
  isOpen: boolean;
  onClose: () => void;
  onPreviewResource?: (resource: any) => void;
}

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'textbook', label: 'Giáo trình trường UTH' },
  { value: 'ebook', label: 'Sách điện tử (E-Book)' },
  { value: 'lecture_slide', label: 'Slide bài giảng điện tử' },
  { value: 'learning_material', label: 'Tài liệu tham khảo / Học liệu số' },
];

const ACCESS_SCOPE_OPTIONS = [
  { value: 'all_university', label: 'Toàn trường (Tất cả bạn đọc có tài khoản)' },
  { value: 'by_department', label: 'Theo Khoa / Viện đào tạo' },
  { value: 'by_major', label: 'Theo Chuyên ngành' },
];

export const DigitalResourcesModal: React.FC<DigitalResourcesModalProps> = ({
  bookId,
  bookTitle,
  bookCoverImage,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [documents, setDocuments] = useState<UnifiedDigitalDoc[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [publishingId, setPublishingId] = useState<number | null>(null);

  // Reader state
  const [readingDocId, setReadingDocId] = useState<number | null>(null);

  // Form states (Aligned with Digital Library standards)
  const [title, setTitle] = useState<string>('');
  const [docType, setDocType] = useState<string>('textbook');
  const [sourceLicense, setSourceLicense] = useState<string>(
    'Bản quyền Trường ĐH Giao thông Vận tải TP.HCM (UTH)'
  );
  const [accessScope, setAccessScope] = useState<string>('all_university');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [abstract, setAbstract] = useState<string>('');

  // Cover image states
  const [coverMode, setCoverMode] = useState<'book' | 'custom'>('book');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const fetchDocuments = async () => {
    if (!bookId) return;
    setIsLoading(true);
    try {
      // 1. Fetch from main Digital Library (apps.digital_library)
      const res = await api.get('/digital-library/documents', {
        params: { catalog_book_id: bookId },
      });

      const docsList: UnifiedDigitalDoc[] = (res.data?.data || res.data?.results || []).map((d: any) => ({
        id: d.id,
        title: d.title,
        cover_image: d.cover_image,
        document_type: d.document_type,
        document_type_display: d.document_type_display || 'Giáo trình',
        status: d.status,
        status_display: d.status_display || (d.status === 'published' ? 'Đã xuất bản' : d.status === 'draft' ? 'Bản nháp' : d.status),
        current_version_number: d.current_version_number || 1,
        page_count: d.page_count || 0,
        file_size_formatted: d.file_size_formatted || '0 B',
        total_views: d.total_views || 0,
        total_reading_seconds: d.total_reading_seconds || 0,
        author_names: d.author_names,
        department: d.department,
        major: d.major,
        year: d.year,
        source_license: d.source_license || 'Bản quyền UTH',
        access_scope_display: d.access_scope_display || 'Toàn trường',
        is_legacy: false,
      }));

      // 2. Fetch legacy digital-resources if not yet migrated
      try {
        const legacyRes = await api.get<{ results: any[] }>(`/digital-resources?book_id=${bookId}`);
        const legacyDocs = legacyRes.data?.results || [];
        legacyDocs.forEach((leg) => {
          const exists = docsList.some((d) => d.title.trim().toLowerCase() === leg.title.trim().toLowerCase());
          if (!exists) {
            docsList.push({
              id: leg.id,
              title: leg.title,
              cover_image: leg.cover_image || bookCoverImage,
              document_type: 'textbook',
              document_type_display: 'Giáo trình số',
              status: 'published',
              status_display: 'Đã xuất bản',
              current_version_number: 1,
              page_count: leg.page_count || 0,
              file_size_formatted: leg.file_size_formatted || '12.5 MB',
              total_views: leg.view_count || 0,
              total_reading_seconds: 0,
              source_license: 'Bản quyền UTH',
              access_scope_display: leg.access_level === 'all_active' ? 'Toàn trường' : 'Sinh viên chính khóa',
              is_legacy: true,
            });
          }
        });
      } catch {
        // ignore legacy fetch error
      }

      setDocuments(docsList);
    } catch {
      toast.error('Không thể tải danh sách tài liệu số của đầu sách.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && bookId) {
      fetchDocuments();
      setShowUploadForm(false);
      setTitle(`Giáo trình chính thức: ${bookTitle || ''}`);
      setDocType('textbook');
      setSourceLicense('Bản quyền Trường ĐH Giao thông Vận tải TP.HCM (UTH)');
      setAccessScope('all_university');
      setSelectedFile(null);
      setAbstract('');

      // Default cover image to book cover if available
      if (bookCoverImage) {
        setCoverMode('book');
        setCoverPreview(bookCoverImage);
        setCoverFile(null);
      } else {
        setCoverMode('custom');
        setCoverPreview(null);
        setCoverFile(null);
      }
    }
  }, [isOpen, bookId, bookTitle, bookCoverImage]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId || !selectedFile) {
      toast.error('Vui lòng chọn tập tin PDF giáo trình / học liệu số.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim() || `Giáo trình ${bookTitle}`);
      formData.append('document_type', docType);
      formData.append('source_license', sourceLicense.trim());
      formData.append('access_scope', accessScope);
      formData.append('catalog_book_id', String(bookId));
      formData.append('file', selectedFile);
      formData.append('abstract', abstract.trim());
      formData.append('auto_publish', 'true');

      // Cover image logic
      if (coverMode === 'custom' && coverFile) {
        formData.append('cover_image', coverFile);
      } else if (coverMode === 'book' && bookCoverImage) {
        formData.append('cover_image', bookCoverImage);
      }

      // Post directly to Unified Digital Library
      await api.post('/digital-library/documents/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Đã tải lên và xuất bản giáo trình vào Thư viện số UTH thành công!');
      setShowUploadForm(false);
      setSelectedFile(null);
      setCoverFile(null);
      setAbstract('');
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Lỗi khi tải lên giáo trình vào Thư viện số.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublishDraft = async (doc: UnifiedDigitalDoc) => {
    setPublishingId(doc.id);
    try {
      await api.post(`/digital-library/documents/${doc.id}/workflow`, {
        action: 'approve',
        note: 'Thủ thư xuất bản trực tiếp lên Cổng Thư viện số & OPAC',
      });
      toast.success('Đã xuất bản tài liệu số thành công! Bạn đọc hiện đã có thể đọc trực tuyến.');
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Không thể xuất bản tài liệu số.');
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (doc: UnifiedDigitalDoc) => {
    const isDraft = doc.status === 'draft';
    const confirmMsg = isDraft
      ? `Bạn có chắc chắn muốn xóa bản nháp "${doc.title}"?`
      : `Bạn có chắc chắn muốn ngừng phục vụ tài liệu "${doc.title}"?`;
    if (!confirm(confirmMsg)) return;

    setDeletingId(doc.id);
    try {
      if (doc.is_legacy) {
        await api.delete(`/digital-resources/${doc.id}`);
      } else if (isDraft) {
        await api.delete(`/digital-library/documents/${doc.id}`);
      } else {
        await api.post(`/digital-library/documents/${doc.id}/workflow`, {
          action: 'disable',
          note: 'Ngừng phục vụ từ trang Quản lý Đầu sách OPAC',
        });
      }
      toast.success(isDraft ? 'Đã xóa bản nháp tài liệu số.' : 'Đã ngừng phục vụ tài liệu số.');
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Không thể xóa / ngừng phục vụ tài liệu số.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white rounded-2xl">
          {/* Header chuẩn Thư viện số UTH */}
          <div className="flex items-center justify-between border-b border-teal-100 bg-gradient-to-r from-teal-50/90 via-teal-50/50 to-slate-50 px-6 py-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white shadow-2xs shrink-0">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <span>Quản lý Giáo trình & Học liệu số UTH</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100/80 text-brand border border-teal-200">
                    DRM Bảo vệ bản quyền
                  </span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Đồng bộ tự động giữa Hệ thống OPAC và Kho học liệu Thư viện số UTH
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200/60 hover:text-gray-600 transition-colors cursor-pointer shrink-0"
              title="Đóng cửa sổ"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <ModalBody className="p-6 space-y-5 overflow-y-auto flex-1 min-h-0 bg-slate-50/30">
            {/* Thẻ thông tin Đầu sách in liên kết */}
            <div className="rounded-2xl border border-teal-200/80 bg-white p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-brand" />
                  Đầu sách in liên kết trong OPAC
                </span>
                <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{bookTitle}</h4>
                <p className="text-[11px] text-gray-500">
                  Tài liệu tải lên tại đây sẽ hiển thị đồng bộ trên Cổng tra cứu OPAC và Kho học liệu Thư viện số.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="teal" size="sm" className="font-mono">
                  Mã OPAC #{bookId}
                </Badge>
              </div>
            </div>

            {/* Thanh công cụ bảo mật & Nút thêm tài liệu mới */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-xs text-gray-600 bg-teal-50/70 border border-teal-200/70 px-3 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-brand shrink-0" />
                <span className="text-[11px] font-medium text-teal-900">
                  Bảo vệ DRM: In chìm Dynamic Watermark thông tin sinh viên & mã phiên đọc
                </span>
              </div>

              {!showUploadForm && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowUploadForm(true)}
                  className="bg-brand hover:bg-[#007070] text-xs font-semibold rounded-xl shadow-2xs shrink-0 cursor-pointer"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Tải lên PDF mới
                </Button>
              )}
            </div>

            {/* Form tiếp nhận học liệu chuẩn Thư viện số */}
            {showUploadForm && (
              <form
                onSubmit={handleUpload}
                className="bg-white border border-teal-300 rounded-2xl p-5 space-y-4 shadow-sm animate-scale-in"
              >
                <div className="flex items-center justify-between border-b border-teal-100 pb-2.5">
                  <span className="text-xs font-bold text-brand uppercase tracking-wider flex items-center gap-2">
                    <Upload className="w-4 h-4 text-brand" /> Đăng tải giáo trình vào Thư viện số
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    title="Đóng form tải lên"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Tên giáo trình / tài liệu số <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="VD: Giáo trình chính thức: MSheet tính toán thiết kế tường cừ và cọc"
                      className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 bg-white shadow-2xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Loại học liệu số <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 bg-white shadow-2xs"
                      >
                        {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Phạm vi quyền truy cập <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={accessScope}
                        onChange={(e) => setAccessScope(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 bg-white shadow-2xs"
                      >
                        {ACCESS_SCOPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nguồn tài liệu & Bản quyền (Thông tư 02/2020) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={sourceLicense}
                      onChange={(e) => setSourceLicense(e.target.value)}
                      placeholder="VD: Bản quyền Trường ĐH Giao thông Vận tải TP.HCM (UTH)"
                      className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 bg-white shadow-2xs"
                    />
                  </div>

                  {/* Mục thiết lập ảnh bìa học liệu số */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-brand" />
                        Ảnh bìa tài liệu số (Hiển thị tại Thư viện số UTH & OPAC)
                      </span>
                    </label>

                    <div className="flex flex-col sm:flex-row items-start gap-4 p-3.5 bg-slate-50 border border-gray-200 rounded-xl">
                      {/* Xem trước ảnh bìa */}
                      <div className="w-16 h-22 sm:w-20 sm:h-28 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-2xs shrink-0 flex items-center justify-center relative">
                        {coverPreview ? (
                          <img
                            src={coverPreview}
                            alt="Ảnh bìa xem trước"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                            <BookOpen className="w-6 h-6 mb-1 text-gray-300" />
                            <span className="text-[9px]">Chưa có ảnh</span>
                          </div>
                        )}
                      </div>

                      {/* Các tùy chọn thiết lập ảnh bìa */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {bookCoverImage && (
                            <button
                              type="button"
                              onClick={() => {
                                setCoverMode('book');
                                setCoverFile(null);
                                setCoverPreview(bookCoverImage);
                              }}
                              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                                coverMode === 'book'
                                  ? 'bg-teal-50 border-brand text-brand font-semibold shadow-2xs'
                                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              ✓ Dùng ảnh bìa sách in OPAC
                            </button>
                          )}

                          <label
                            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                              coverMode === 'custom'
                                ? 'bg-teal-50 border-brand text-brand font-semibold shadow-2xs'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Tải lên ảnh bìa riêng</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setCoverMode('custom');
                                  setCoverFile(file);
                                  setCoverPreview(URL.createObjectURL(file));
                                }
                              }}
                            />
                          </label>

                          {coverPreview && coverMode === 'custom' && (
                            <button
                              type="button"
                              onClick={() => {
                                setCoverFile(null);
                                if (bookCoverImage) {
                                  setCoverMode('book');
                                  setCoverPreview(bookCoverImage);
                                } else {
                                  setCoverPreview(null);
                                }
                              }}
                              className="text-[11px] text-red-500 hover:underline cursor-pointer"
                            >
                              Hủy ảnh tải lên
                            </button>
                          )}
                        </div>

                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          {coverMode === 'book' && bookCoverImage
                            ? 'Đang dùng ảnh bìa từ đầu sách in OPAC hiện hành. Học liệu số sẽ hiển thị đồng nhất giao diện.'
                            : 'Hỗ trợ định dạng PNG, JPG, WEBP dung lượng tối đa 5MB. Tỷ lệ chuẩn bìa sách (3:4 hoặc 2:3).'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Tập tin PDF tài liệu toàn văn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      required
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-brand hover:file:bg-teal-100 cursor-pointer border border-gray-200 rounded-xl p-1 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Tóm tắt nội dung tài liệu
                    </label>
                    <textarea
                      rows={2}
                      value={abstract}
                      onChange={(e) => setAbstract(e.target.value)}
                      placeholder="Tóm tắt ngắn gọn nội dung tài liệu phục vụ tra cứu học liệu số..."
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 bg-white shadow-2xs resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUploadForm(false)}
                    className="rounded-xl border-gray-300 text-xs cursor-pointer"
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isUploading}
                    className="bg-brand hover:bg-[#007070] text-xs font-semibold rounded-xl shadow-2xs cursor-pointer"
                    leftIcon={<Upload className="w-3.5 h-3.5" />}
                  >
                    Tải lên & Xuất bản ngay
                  </Button>
                </div>
              </form>
            )}

            {/* Danh sách học liệu số đồng bộ: CHỈ HIỂN THỊ KHI KHÔNG MỞ FORM TIẾP NHẬN */}
            {!showUploadForm && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-gray-200/80">
                  <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-brand rounded-full inline-block"></span>
                    <span>Danh sách học liệu số hiện có ({documents.length})</span>
                  </h5>
                  <span className="text-[11px] text-gray-400">Đồng bộ trực tiếp với Thư viện số UTH</span>
                </div>

                {isLoading ? (
                  <div className="py-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2 bg-white rounded-2xl border border-gray-100 shadow-2xs">
                    <Loader2 className="w-4 h-4 animate-spin text-brand" />
                    Đang tải danh sách tài liệu số...
                  </div>
                ) : documents.length === 0 ? (
                  <div className="py-10 text-center bg-white border border-dashed border-gray-200 rounded-2xl space-y-2.5 shadow-2xs">
                    <GraduationCap className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="text-xs text-gray-600 font-semibold">
                      Đầu sách này chưa có tài liệu giáo trình số nào.
                    </p>
                    <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                      Tải lên giáo trình PDF để phục vụ sinh viên đọc trực tuyến với hệ thống bản quyền DRM Watermark.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUploadForm(true)}
                      className="text-xs text-brand border-teal-300 bg-teal-50 hover:bg-teal-100 rounded-xl font-semibold cursor-pointer"
                    >
                      + Tải lên PDF ngay
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 bg-white border border-gray-200 hover:border-teal-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs transition-all hover:shadow-xs"
                      >
                        {/* Left: Thumbnail & Document Info */}
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          {/* Thumbnail phong cách Thư viện số */}
                          {doc.cover_image ? (
                            <div className="w-14 h-18 rounded-xl overflow-hidden border border-teal-200 shrink-0 shadow-2xs relative group bg-gray-50">
                              <img
                                src={doc.cover_image}
                                alt={doc.title}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 right-1 text-[7.5px] font-bold px-1 rounded bg-teal-900/80 text-white leading-tight">
                                v{doc.current_version_number}
                              </span>
                            </div>
                          ) : (
                            <div className="w-14 h-18 rounded-xl bg-gradient-to-b from-teal-50 to-slate-100 border border-teal-200 flex flex-col items-center justify-between p-1.5 shrink-0 relative text-center shadow-2xs">
                              <span className="text-[8px] font-bold text-brand uppercase tracking-tighter">UTH</span>
                              <GraduationCap className="w-5 h-5 text-brand my-auto" />
                              <span className="text-[7.5px] font-bold px-1 rounded-sm bg-teal-600 text-white leading-tight">
                                v{doc.current_version_number}
                              </span>
                            </div>
                          )}

                          {/* Metadata */}
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-teal-50 text-brand text-[10px] font-bold border border-teal-200/80 uppercase">
                                {doc.document_type_display}
                              </span>

                              {doc.status === 'published' ? (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                  ✓ {doc.status_display}
                                </span>
                              ) : doc.status === 'draft' ? (
                                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                                  ⏳ {doc.status_display}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-bold border border-gray-200">
                                  {doc.status_display}
                                </span>
                              )}

                              <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                {doc.access_scope_display}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-gray-900 line-clamp-1 leading-snug" title={doc.title}>
                              {doc.title}
                            </h4>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                              <span>{doc.page_count} trang</span>
                              <span>•</span>
                              <span>{doc.file_size_formatted}</span>
                              <span>•</span>
                              <span className="text-brand font-semibold">{doc.total_views} lượt đọc</span>
                              <span>•</span>
                              <span className="text-gray-400 truncate max-w-[160px]" title={doc.source_license}>
                                {doc.source_license}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {/* Nút xuất bản nhanh nếu đang ở bản nháp */}
                          {doc.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePublishDraft(doc)}
                              isLoading={publishingId === doc.id}
                              className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold px-3 h-8 rounded-xl cursor-pointer flex items-center gap-1.5"
                              title="Xuất bản chính thức để sinh viên đọc trực tuyến"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Xuất bản ngay</span>
                            </Button>
                          )}

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setReadingDocId(doc.id)}
                            className="bg-brand hover:bg-[#007070] text-white text-xs font-semibold px-3.5 h-8 rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5"
                            title="Đọc trực tuyến với bảo vệ bản quyền DRM Watermark"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Đọc trực tuyến</span>
                          </Button>

                          {!doc.is_legacy && (
                            <a
                              href={`/digital/documents/${doc.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl text-gray-400 hover:text-brand hover:bg-teal-50 border border-gray-200 transition-colors cursor-pointer"
                              title="Xem chi tiết bên Thư viện số UTH"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            type="button"
                            disabled={deletingId === doc.id}
                            onClick={() => handleDelete(doc)}
                            className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-colors cursor-pointer disabled:opacity-50"
                            title={doc.status === 'draft' ? 'Xóa bản nháp này' : 'Ngừng phục vụ tài liệu số'}
                          >
                            {deletingId === doc.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </ModalBody>

          <div className="border-t border-gray-200 bg-slate-50/80 px-6 py-3 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-gray-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>Học liệu số được bảo vệ bằng Watermark định danh người dùng UTH.</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl border-gray-300 text-xs px-4 font-semibold cursor-pointer"
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modern DRM Watermark Reader Modal of Digital Library */}
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
    </>
  );
};
