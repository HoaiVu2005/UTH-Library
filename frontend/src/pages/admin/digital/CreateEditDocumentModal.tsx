import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Upload,
  FileText,
  Shield,
  Calendar,
  Lock,
  Layers,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Trash2,
  Link as LinkIcon,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { toast } from '@/components/ui/Toast';

export interface DocumentFormData {
  id?: number;
  title: string;
  document_type: string;
  department: string;
  major: string;
  author_names: string;
  advisor_names: string;
  publisher: string;
  isbn: string;
  source_license: string;
  year: number;
  language: string;
  abstract: string;
  keywords: string;
  access_scope: 'all_university' | 'by_department' | 'by_major' | 'specific_users';
  allowed_departments: string[];
  allowed_majors: string[];
  access_start_date?: string;
  access_end_date?: string;
  require_active_card: boolean;
  allow_download: boolean;
  allow_print: boolean;
  campus_only: boolean;
  cover_image?: string;
  file?: File | null;
  change_log?: string;
}

interface CreateEditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  documentToEdit?: any | null;
  isNewVersion?: boolean;
}

const DOCUMENT_TYPES = [
  { value: 'thesis', label: 'Khóa luận tốt nghiệp' },
  { value: 'capstone', label: 'Đồ án tốt nghiệp' },
  { value: 'project', label: 'Đồ án môn học' },
  { value: 'internship_report', label: 'Báo cáo thực tập' },
  { value: 'textbook', label: 'Giáo trình trường' },
  { value: 'ebook', label: 'Sách điện tử (E-book)' },
  { value: 'research', label: 'Công trình NCKH' },
  { value: 'paper', label: 'Bài báo khoa học' },
  { value: 'lecture_slide', label: 'Slide bài giảng' },
  { value: 'learning_material', label: 'Tài liệu tham khảo / Học liệu' },
];

const DEPARTMENTS = [
  'Khoa Công nghệ thông tin',
  'Khoa Hàng hải',
  'Khoa Kinh tế vận tải',
  'Khoa Điện - Điện tử viễn thông',
  'Khoa Công trình giao thông',
  'Khoa Cơ khí',
  'Khoa Lý luận chính trị',
  'Viện Đào tạo Quốc tế (IEC)',
];

const MAJORS_BY_DEPT: Record<string, string[]> = {
  'Khoa Công nghệ thông tin': [
    'Kỹ thuật phần mềm',
    'Hệ thống thông tin',
    'Mạng máy tính & Truyền thông dữ liệu',
    'Khoa học dữ liệu & Trí tuệ nhân tạo',
  ],
  'Khoa Hàng hải': [
    'Điều khiển tàu biển',
    'Khai thác máy tàu biển',
    'Quản lý hàng hải',
  ],
  'Khoa Kinh tế vận tải': [
    'Logistics & Quản lý chuỗi cung ứng',
    'Kinh tế vận tải biển',
    'Kinh tế xây dựng',
  ],
  'Khoa Điện - Điện tử viễn thông': [
    'Kỹ thuật Điện',
    'Kỹ thuật Điều khiển & Tự động hóa',
    'Kỹ thuật Điện tử - Viễn thông',
  ],
  'Khoa Công trình giao thông': [
    'Kỹ thuật xây dựng công trình giao thông',
    'Kỹ thuật cầu đường',
    'Địa kỹ thuật công trình',
  ],
  'Khoa Cơ khí': [
    'Kỹ thuật Ô tô',
    'Cơ khí chế tạo máy',
    'Kỹ thuật Tàu thủy',
  ],
};

export const CreateEditDocumentModal: React.FC<CreateEditDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  documentToEdit,
  isNewVersion = false,
}) => {
  const [formData, setFormData] = useState<DocumentFormData>({
    title: '',
    document_type: 'thesis',
    department: 'Khoa Công nghệ thông tin',
    major: 'Kỹ thuật phần mềm',
    author_names: '',
    advisor_names: '',
    publisher: '',
    isbn: '',
    source_license: 'Bản quyền Đại học Giao thông Vận tải TP.HCM (UTH)',
    year: new Date().getFullYear(),
    language: 'Tiếng Việt',
    abstract: '',
    keywords: '',
    access_scope: 'all_university',
    allowed_departments: [],
    allowed_majors: [],
    require_active_card: false,
    allow_download: false,
    allow_print: false,
    campus_only: false,
    file: null,
    change_log: '',
  });

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState<'info' | 'file' | 'policy'>('info');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const [coverInputMode, setCoverInputMode] = useState<'upload' | 'url'>('upload');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    setActiveTab('info');
    if (documentToEdit) {
      setFormData({
        id: documentToEdit.id,
        title: documentToEdit.title || '',
        document_type: documentToEdit.document_type || 'thesis',
        department: documentToEdit.department || '',
        major: documentToEdit.major || '',
        author_names: documentToEdit.author_names || '',
        advisor_names: documentToEdit.advisor_names || '',
        publisher: documentToEdit.publisher || '',
        isbn: documentToEdit.isbn || '',
        source_license: documentToEdit.source_license || '',
        year: documentToEdit.year || new Date().getFullYear(),
        language: documentToEdit.language || 'Tiếng Việt',
        abstract: documentToEdit.abstract || '',
        keywords: documentToEdit.keywords || '',
        access_scope: documentToEdit.access_scope || 'all_university',
        allowed_departments: documentToEdit.allowed_departments || [],
        allowed_majors: documentToEdit.allowed_majors || [],
        access_start_date: documentToEdit.access_start_date || '',
        access_end_date: documentToEdit.access_end_date || '',
        require_active_card: Boolean(documentToEdit.require_active_card),
        allow_download: Boolean(documentToEdit.allow_download),
        allow_print: Boolean(documentToEdit.allow_print),
        campus_only: Boolean(documentToEdit.campus_only),
        cover_image: documentToEdit.cover_image || '',
        file: null,
        change_log: isNewVersion ? 'Cập nhật phiên bản nội dung mới' : '',
      });
      setSelectedFile(null);
      setCoverImagePreview(documentToEdit.cover_image || null);
      setCoverImageUrl(documentToEdit.cover_image || '');
      setSelectedCoverFile(null);
    } else {
      setFormData({
        title: '',
        document_type: 'thesis',
        department: 'Khoa Công nghệ thông tin',
        major: 'Kỹ thuật phần mềm',
        author_names: '',
        advisor_names: '',
        publisher: '',
        isbn: '',
        source_license: 'Bản quyền ĐH Giao thông Vận tải TP.HCM (UTH)',
        year: new Date().getFullYear(),
        language: 'Tiếng Việt',
        abstract: '',
        keywords: '',
        access_scope: 'all_university',
        allowed_departments: [],
        allowed_majors: [],
        require_active_card: false,
        allow_download: false,
        allow_print: false,
        campus_only: false,
        cover_image: '',
        file: null,
        change_log: '',
      });
      setSelectedFile(null);
      setCoverImagePreview(null);
      setCoverImageUrl('');
      setSelectedCoverFile(null);
    }
  }, [documentToEdit, isNewVersion, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
        toast.error('Chỉ chấp nhận file định dạng PDF.');
        return;
      }
      if (f.size > 100 * 1024 * 1024) {
        toast.error('Dung lượng file tối đa là 100MB.');
        return;
      }
      setSelectedFile(f);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (!f.type.startsWith('image/')) {
        toast.error('Chỉ chấp nhận file hình ảnh (JPG, PNG, WEBP).');
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error('Dung lượng ảnh bìa tối đa là 5MB.');
        return;
      }
      setSelectedCoverFile(f);
      const previewUrl = URL.createObjectURL(f);
      setCoverImagePreview(previewUrl);
    }
  };

  const handleRemoveCover = () => {
    setSelectedCoverFile(null);
    setCoverImagePreview(null);
    setCoverImageUrl('');
    if (coverFileInputRef.current) {
      coverFileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (sendToApproval: boolean) => {
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tên tài liệu / đề tài.');
      return;
    }
    if (!formData.author_names.trim()) {
      toast.error('Vui lòng nhập tác giả hoặc sinh viên thực hiện.');
      return;
    }
    if (!documentToEdit && !selectedFile) {
      toast.error('Vui lòng tải lên file PDF của tài liệu.');
      return;
    }
    if (isNewVersion && !selectedFile) {
      toast.error('Vui lòng chọn file PDF cho phiên bản mới.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('document_type', formData.document_type);
      payload.append('department', formData.department);
      payload.append('major', formData.major);
      payload.append('author_names', formData.author_names.trim());
      payload.append('advisor_names', formData.advisor_names.trim());
      payload.append('publisher', formData.publisher.trim());
      payload.append('isbn', formData.isbn.trim());
      payload.append('source_license', formData.source_license.trim());
      payload.append('year', String(formData.year));
      payload.append('language', formData.language);
      payload.append('abstract', formData.abstract.trim());
      payload.append('keywords', formData.keywords.trim());
      payload.append('access_scope', formData.access_scope);
      payload.append('require_active_card', String(formData.require_active_card));
      payload.append('allow_download', String(formData.allow_download));
      payload.append('allow_print', String(formData.allow_print));
      payload.append('campus_only', String(formData.campus_only));

      if (formData.access_start_date) payload.append('access_start_date', formData.access_start_date);
      if (formData.access_end_date) payload.append('access_end_date', formData.access_end_date);

      formData.allowed_departments.forEach((dept) => payload.append('allowed_departments', dept));
      formData.allowed_majors.forEach((m) => payload.append('allowed_majors', m));

      if (selectedFile) {
        payload.append('file', selectedFile);
      }
      if (selectedCoverFile) {
        payload.append('cover_image', selectedCoverFile);
      } else if (coverImageUrl.trim()) {
        payload.append('cover_image', coverImageUrl.trim());
      } else if (documentToEdit && !coverImagePreview) {
        payload.append('cover_image', '');
      }
      if (formData.change_log) {
        payload.append('change_log', formData.change_log);
      }

      // Quyền Admin: cho phép xuất bản ngay (auto_publish = true)
      if (isAdmin && sendToApproval) {
        payload.append('auto_publish', 'true');
      } else {
        payload.append('auto_publish', 'false');
      }

      let targetDocId = documentToEdit?.id;

      if (documentToEdit && !isNewVersion) {
        // Cập nhật metadata
        await api.patch(`/digital-library/documents/${documentToEdit.id}/update`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(
          isAdmin && sendToApproval
            ? 'Đã cập nhật và xuất bản học liệu số thành công.'
            : 'Đã cập nhật thông tin học liệu số thành công.'
        );
      } else if (documentToEdit && isNewVersion) {
        // Tạo phiên bản mới (v2, v3...)
        await api.patch(`/digital-library/documents/${documentToEdit.id}/update`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Đã thêm phiên bản mới của học liệu thành công.');
      } else {
        // Tạo mới tài liệu
        const res = await api.post('/digital-library/documents/create', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        targetDocId = res.data?.data?.id || res.data?.id;
        toast.success(
          isAdmin && sendToApproval
            ? 'Đã tiếp nhận và xuất bản trực tiếp học liệu số lên Thư viện số UTH.'
            : 'Đã lưu bản nháp học liệu số thành công.'
        );
      }

      // Nếu là Thủ thư (không phải admin) và chọn Gửi duyệt ngay -> chuyển sang Pending Approval
      if (!isAdmin && sendToApproval && targetDocId) {
        try {
          await api.post(`/digital-library/documents/${targetDocId}/workflow`, {
            action: 'submit',
            note: 'Gửi yêu cầu kiểm duyệt xuất bản lên Admin Thư viện UTH',
          });
          toast.success('Đã chuyển tài liệu sang trạng thái Chờ duyệt (Pending Approval).');
        } catch {
          // ignore workflow submit error if already submitted
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to save document', err);
      toast.error(err.response?.data?.detail || 'Đã xảy ra lỗi khi lưu học liệu số.');
    } finally {
      setSubmitting(false);
    }
  };

  const isThesisType = ['thesis', 'capstone', 'project', 'internship_report'].includes(formData.document_type);
  const isBookType = ['ebook', 'textbook'].includes(formData.document_type);
  const isResearchType = ['research', 'paper'].includes(formData.document_type);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 md:p-8 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[86vh] flex flex-col overflow-hidden relative my-auto">
        {/* Modal Header */}
        <div className="px-6 sm:px-8 pt-6 pb-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 relative z-20">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#008B8B] flex items-center justify-center border border-teal-100 shadow-xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-800 leading-tight">
                {isNewVersion
                  ? `Thêm phiên bản mới: ${documentToEdit?.title}`
                  : documentToEdit
                  ? 'Chỉnh sửa Học liệu số'
                  : 'Tiếp nhận & Biên mục Học liệu số mới'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Lưu trữ học liệu, thiết lập phạm vi truy cập và Dynamic Watermark bảo vệ bản quyền
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Đóng (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 sm:px-8 bg-slate-50 border-b border-slate-200 flex items-center gap-2 shrink-0 relative z-20 pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'info'
                ? 'border-[#008B8B] text-[#008B8B] bg-white -mb-px rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Thông tin & Metadata</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'file'
                ? 'border-[#008B8B] text-[#008B8B] bg-white -mb-px rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>2. Tệp PDF & Phiên bản</span>
            {selectedFile && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Đã chọn tệp PDF" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('policy')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'policy'
                ? 'border-[#008B8B] text-[#008B8B] bg-white -mb-px rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>3. Phân quyền & Bảo mật</span>
          </button>
        </div>

        {/* Modal Body: Scrollable with balanced padding and soft background */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6 text-xs text-slate-700 bg-slate-50/60">
          {activeTab === 'info' && (
            <>
              {/* Card 1: Phân loại Học liệu số */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <Layers className="w-4 h-4 text-[#008B8B]" />
                    <span>1. Phân loại Học liệu số</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Bắt buộc &bull; Xác định phạm vi lưu trữ</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Loại tài liệu *</label>
                    <select
                      disabled={Boolean(documentToEdit && !isNewVersion)}
                      value={formData.document_type}
                      onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#008B8B] focus:border-transparent font-medium"
                    >
                      {DOCUMENT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Khoa phụ trách</label>
                    <select
                      value={formData.department}
                      onChange={(e) => {
                        const dept = e.target.value;
                        const majors = MAJORS_BY_DEPT[dept] || [];
                        setFormData({
                          ...formData,
                          department: dept,
                          major: majors[0] || '',
                        });
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#008B8B] focus:border-transparent font-medium"
                    >
                      <option value="">-- Dành cho toàn trường --</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Chuyên ngành</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Kỹ thuật phần mềm"
                      value={formData.major}
                      onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#008B8B] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Cover Image */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <ImageIcon className="w-4 h-4 text-[#008B8B]" />
                    <span>2. Ảnh bìa / Biểu trưng học liệu</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Tùy chọn &bull; Hiển thị trên thẻ tra cứu</span>
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-5 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                  {/* Preview 3:4 Box */}
                  <div className="w-28 sm:w-32 aspect-[3/4] rounded-xl overflow-hidden shadow-xs border border-slate-200 bg-white relative shrink-0 flex items-center justify-center">
                    {coverImagePreview ? (
                      <>
                        <img
                          src={coverImagePreview}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveCover}
                          className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 hover:bg-red-600 text-white transition-colors cursor-pointer"
                          title="Xóa ảnh bìa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-slate-400 select-none bg-gradient-to-b from-slate-50 to-teal-50/40">
                        <ImageIcon className="w-8 h-8 text-slate-300 mb-1" />
                        <span className="text-[10px] font-semibold text-slate-500">Chưa có ảnh bìa</span>
                        <span className="text-[9px] text-slate-400 mt-0.5">Mặc định dùng bìa UTH</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Inputs */}
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCoverInputMode('upload')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          coverInputMode === 'upload'
                            ? 'bg-[#008B8B] text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5 inline mr-1" /> Tải tệp từ máy
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverInputMode('url')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          coverInputMode === 'url'
                            ? 'bg-[#008B8B] text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <LinkIcon className="w-3.5 h-3.5 inline mr-1" /> Nhập URL ảnh
                      </button>
                    </div>

                    {coverInputMode === 'upload' ? (
                      <div className="space-y-2">
                        <input
                          ref={coverFileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleCoverFileChange}
                          className="hidden"
                          id="cover-file-input"
                        />
                        <label
                          htmlFor="cover-file-input"
                          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-[#008B8B]/40 bg-teal-50/50 hover:bg-teal-50 text-[#008B8B] font-bold text-xs cursor-pointer transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          <span>{selectedCoverFile ? selectedCoverFile.name : 'Chọn ảnh bìa (JPG, PNG, WEBP)'}</span>
                        </label>
                        <p className="text-[11px] text-slate-500">
                          Định dạng hỗ trợ: JPG, PNG, WEBP. Tỉ lệ khuyến nghị 3:4 (chuẩn bìa sách), tối đa 5MB.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          placeholder="Dán đường dẫn ảnh bìa (https://...)"
                          value={coverImageUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCoverImageUrl(val);
                            if (val.trim()) {
                              setCoverImagePreview(val.trim());
                              setSelectedCoverFile(null);
                            } else {
                              setCoverImagePreview(null);
                            }
                          }}
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#008B8B] focus:border-transparent font-medium"
                        />
                        <p className="text-[11px] text-slate-500">
                          Nhập link ảnh bìa từ nguồn lưu trữ web hoặc hệ thống CDN.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 3: Metadata Details */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <FileText className="w-4 h-4 text-[#008B8B]" />
                    <span>3. Thông tin Metadata chi tiết</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Tiêu chuẩn thư viện số UTH</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isThesisType ? 'Tên đề tài Khóa luận / Đồ án *' : 'Tên tài liệu / Tiêu đề sách *'}
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập tên chính xác của học liệu số..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#008B8B] focus:border-transparent font-semibold text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {isThesisType
                          ? 'Sinh viên thực hiện (MSSV) *'
                          : isResearchType
                          ? 'Tác giả nghiên cứu / Nhà khoa học *'
                          : 'Tác giả chính *'}
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Lê Hoài Vũ (052205006504), Nguyễn Văn A"
                        value={formData.author_names}
                        onChange={(e) => setFormData({ ...formData, author_names: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#008B8B] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {isThesisType
                          ? 'Giảng viên hướng dẫn'
                          : isResearchType
                          ? 'Tạp chí / Hội nghị khoa học công bố'
                          : 'Chủ biên / Đồng tác giả'}
                      </label>
                      <input
                        type="text"
                        placeholder={
                          isThesisType
                            ? 'Ví dụ: TS. Nguyễn Văn B'
                            : isResearchType
                            ? 'Tạp chí Khoa học GTVT'
                            : 'Ví dụ: Bộ môn Hệ thống thông tin'
                        }
                        value={formData.advisor_names}
                        onChange={(e) => setFormData({ ...formData, advisor_names: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#008B8B] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {isThesisType ? 'Năm bảo vệ *' : 'Năm xuất bản / Công bố *'}
                      </label>
                      <input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#008B8B] focus:border-transparent font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {isBookType ? 'Nhà xuất bản' : 'Đơn vị lưu chiểu / Nghiệm thu'}
                      </label>
                      <input
                        type="text"
                        placeholder="NXB Giao thông vận tải..."
                        value={formData.publisher}
                        onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#008B8B] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {isBookType ? 'Mã ISBN' : 'Mã định danh / ISSN / DOI'}
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: 978-604-76-2026-1"
                        value={formData.isbn}
                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#008B8B] focus:border-transparent font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tóm tắt nội dung (Abstract)</label>
                    <textarea
                      rows={3}
                      placeholder="Tóm tắt ngắn gọn mục tiêu, phạm vi và kết quả đạt được của tài liệu..."
                      value={formData.abstract}
                      onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#008B8B] focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Từ khóa tra cứu (Keywords)</label>
                      <input
                        type="text"
                        placeholder="Cách nhau bởi dấu phẩy, ví dụ: AI, Logistics, Tân Cảng..."
                        value={formData.keywords}
                        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#008B8B] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nguồn & Bản quyền công bố *</label>
                      <input
                        type="text"
                        value={formData.source_license}
                        onChange={(e) => setFormData({ ...formData, source_license: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#008B8B] focus:border-transparent font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('file')}
                    className="text-[#008B8B] border-teal-200 hover:bg-teal-50 font-bold gap-1 cursor-pointer"
                  >
                    <span>Tiếp theo: Tệp PDF & Phiên bản</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'file' && (
            <>
              {/* Card: File Upload & Versioning */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <Upload className="w-4 h-4 text-[#008B8B]" />
                    <span>Tệp tài liệu PDF & Phiên bản lưu trữ</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Định dạng PDF &bull; Dung lượng tối đa 100MB</span>
                </div>

                <input
                  type="file"
                  id="digital-pdf-input"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="border border-emerald-300 bg-emerald-50/60 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800 text-sm truncate max-w-md">{selectedFile.name}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 font-bold">
                            Đã chọn
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Dung lượng: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Định dạng: PDF tiêu chuẩn
                        </p>
                      </div>
                    </div>
                    <label
                      htmlFor="digital-pdf-input"
                      className="px-3.5 py-1.5 rounded-lg border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-bold cursor-pointer transition-colors shadow-2xs shrink-0"
                    >
                      Thay đổi tệp
                    </label>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 hover:border-[#008B8B] rounded-2xl p-8 text-center transition-colors bg-slate-50/50">
                    <label
                      htmlFor="digital-pdf-input"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-2.5"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#008B8B] flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          {documentToEdit && !isNewVersion
                            ? 'Chọn file mới nếu muốn thay thế tệp PDF hiện tại'
                            : 'Nhấp để chọn tệp PDF hoặc kéo thả vào đây'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Định dạng PDF tiêu chuẩn, dung lượng tối đa 100MB
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {isNewVersion && (
                  <div className="pt-2">
                    <label className="block font-bold text-slate-700 mb-1">Ghi chú thay đổi phiên bản (Changelog) *</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Hiệu chỉnh phụ lục số liệu theo yêu cầu của Hội đồng đánh giá"
                      value={formData.change_log}
                      onChange={(e) => setFormData({ ...formData, change_log: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#008B8B] focus:border-transparent font-medium"
                    />
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('info')}
                    className="text-slate-600 gap-1 cursor-pointer hover:bg-slate-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Quay lại Metadata</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('policy')}
                    className="text-[#008B8B] border-teal-200 hover:bg-teal-50 font-bold gap-1 cursor-pointer"
                  >
                    <span>Tiếp theo: Phân quyền & Bảo mật</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'policy' && (
            <>
              {/* Card: Access Rights & Security Policy */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <Shield className="w-4 h-4 text-[#008B8B]" />
                    <span>Phân quyền Truy cập & Chính sách Bảo mật</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Bảo vệ DRM & Bản quyền Thư viện số UTH</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phạm vi truy cập đọc *</label>
                    <select
                      value={formData.access_scope}
                      onChange={(e: any) => setFormData({ ...formData, access_scope: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#008B8B] focus:border-transparent font-medium"
                    >
                      <option value="all_university">Toàn trường (Tất cả sinh viên & giảng viên UTH)</option>
                      <option value="by_department">Theo Khoa (Chỉ sinh viên & GV thuộc Khoa chỉ định)</option>
                      <option value="by_major">Theo Ngành đào tạo (Chỉ sinh viên chuyên ngành)</option>
                      <option value="specific_users">Chỉ định cụ thể (Cấp quyền theo danh sách)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Bắt đầu mở</label>
                      <input
                        type="date"
                        value={formData.access_start_date || ''}
                        onChange={(e) => setFormData({ ...formData, access_start_date: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#008B8B] focus:border-transparent font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Hết hạn truy cập</label>
                      <input
                        type="date"
                        value={formData.access_end_date || ''}
                        onChange={(e) => setFormData({ ...formData, access_end_date: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#008B8B] focus:border-transparent font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Security checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.require_active_card}
                      onChange={(e) => setFormData({ ...formData, require_active_card: e.target.checked })}
                      className="rounded text-[#008B8B] focus:ring-[#008B8B] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800 text-xs">Yêu cầu thẻ thư viện còn hạn</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Chỉ bạn đọc có thẻ chưa bị khóa mới được đọc</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.campus_only}
                      onChange={(e) => setFormData({ ...formData, campus_only: e.target.checked })}
                      className="rounded text-[#008B8B] focus:ring-[#008B8B] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800 text-xs">Chỉ đọc trong mạng Thư viện</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Giới hạn IP nội bộ tại phòng đọc UTH</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.allow_download}
                      onChange={(e) => setFormData({ ...formData, allow_download: e.target.checked })}
                      className="rounded text-[#008B8B] focus:ring-[#008B8B] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800 text-xs">Cho phép Tải xuống file PDF</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Mặc định tắt để tránh rò rỉ nguyên bản</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.allow_print}
                      onChange={(e) => setFormData({ ...formData, allow_print: e.target.checked })}
                      className="rounded text-[#008B8B] focus:ring-[#008B8B] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800 text-xs">Cho phép In ấn</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Cho phép lệnh in từ giao diện đọc</p>
                    </div>
                  </label>
                </div>

                <div className="flex justify-start pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('file')}
                    className="text-slate-600 gap-1 cursor-pointer hover:bg-slate-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Quay lại Tệp PDF</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 relative z-20">
          <div className="flex items-center gap-2 text-slate-500 text-xs w-full sm:w-auto">
            <Info className="w-4 h-4 text-[#008B8B] shrink-0" />
            <span>Mỗi phiên đọc sẽ được tự động đóng dấu 5 dòng Watermark nhận diện bạn đọc.</span>
          </div>

          <div className="flex items-center justify-end gap-3 shrink-0 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="h-10 px-5 cursor-pointer bg-white hover:bg-slate-50 border-slate-300 text-slate-700"
            >
              Hủy
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="h-10 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold border border-slate-300/80 cursor-pointer"
            >
              Lưu bản nháp (Draft)
            </Button>
            <Button
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="h-10 px-6 bg-[#008B8B] hover:bg-[#007272] text-white font-bold gap-2 shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Đang xử lý...'
                  : isAdmin
                  ? 'Xuất bản ngay'
                  : 'Gửi Admin phê duyệt ngay'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
