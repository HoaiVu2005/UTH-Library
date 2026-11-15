import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Download,
  Upload,
  FileSpreadsheet,
  ExternalLink,
  Layers,
  RotateCcw,
  BookCopy,
  Info,
  CheckCircle2,
  AlertCircle,
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  Camera,
  Sparkles,
  Zap,
  Barcode,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { Card, CardContent } from '@/components/ui/Card';
import { CameraBarcodeScannerModal } from '@/components/ui/CameraBarcodeScannerModal';
import { formatCurrencyVND, cn } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';

export interface BookItem {
  id: number;
  isbn?: string;
  title: string;
  publisher?: string;
  year?: number;
  price: number;
  category?: number | { id: number; name: string; code: string };
  category_name?: string;
  category_code?: string;
  category_detail?: { id: number; name: string; code: string };
  authors?: Array<{ id: number; name: string }>;
  authors_names?: string[];
  cover_image?: string;
  total_copies?: number;
  total_copies_count?: number;
  available_copies?: number;
  available_copies_count?: number;
}

interface CategoryOption {
  id: number;
  name: string;
  code: string;
}

export const BooksManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<BookItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBook, setEditingBook] = useState<BookItem | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formAuthorNames, setFormAuthorNames] = useState<string>('');
  const [formIsbn, setFormIsbn] = useState<string>('');
  const [formCategoryId, setFormCategoryId] = useState<number>(0);
  const [formYear, setFormYear] = useState<string>('2024');
  const [formPrice, setFormPrice] = useState<string>('150000');
  const [formPublisher, setFormPublisher] = useState<string>('NXB Giao thông Vận tải');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formInitialCopies, setFormInitialCopies] = useState<number>(3);
  const [formShelfLocation, setFormShelfLocation] = useState<string>('');
  const [formCoverImage, setFormCoverImage] = useState<string>('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Camera & ISBN Auto-Lookup State
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState<boolean>(false);
  const [isLookingUpIsbn, setIsLookingUpIsbn] = useState<boolean>(false);
  const [isbnLookupSuccessInfo, setIsbnLookupSuccessInfo] = useState<{
    title: string;
    author: string;
    source: string;
  } | null>(null);

  // Delete State
  const [deletingBook, setDeletingBook] = useState<BookItem | null>(null);

  // CSV Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [csvText, setCsvText] = useState<string>('');
  const [importLoading, setImportLoading] = useState<boolean>(false);

  const handleDownloadTemplate = async () => {
    try {
      const res = await api.get('/books/template-csv', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'mau_nhap_sach_uth.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download template', err);
      window.open('/api/v1/books/template-csv', '_blank');
    }
  };

  const handleExportCsv = async () => {
    try {
      const res = await api.get('/books/export-csv', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'danh_muc_sach_uth.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV', err);
      window.open('/api/v1/books/export-csv', '_blank');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvText((event.target?.result as string) || '');
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmImport = async () => {
    if (!csvText.trim()) {
      toast.warning('Vui lòng chọn file CSV hoặc dán nội dung CSV.');
      return;
    }
    try {
      setImportLoading(true);
      const res = await api.post('/books/import-csv', { csv_data: csvText });
      const data = res.data?.data;
      toast.success(`Đã nhập thành công ${data.imported_books} đầu sách!`);
      setIsImportModalOpen(false);
      setCsvText('');
      fetchBooks();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Lỗi khi nhập dữ liệu từ file CSV.');
    } finally {
      setImportLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
      if (appliedSearch.trim()) params.append('q', appliedSearch.trim());
      if (selectedCategory) {
        params.append('category_id', selectedCategory);
        params.append('category', selectedCategory);
      }

      const res = await api.get(`/books?${params.toString()}`);
      setBooks(res.data?.data || []);
      setTotalRecords(res.data?.meta?.total || 0);
      setTotalPages(res.data?.meta?.total_pages || 1);
    } catch (err) {
      console.error('Failed to fetch books', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      const cats: CategoryOption[] = res.data?.data || [];
      setCategories(cats);
      if (cats.length > 0 && formCategoryId === 0) {
        setFormCategoryId(cats[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [page, pageSize, appliedSearch, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchQuery.trim());
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setAppliedSearch('');
    setPage(1);
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning('Dung lượng ảnh bìa tối đa 5MB.');
        return;
      }
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setFormCoverImage('');
  };

  const handleOpenAddModal = () => {
    setEditingBook(null);
    setFormTitle('');
    setFormAuthorNames('');
    setFormIsbn('');
    setFormYear('2024');
    setFormPrice('150000');
    setFormPublisher('NXB Giao thông Vận tải');
    setFormDescription('');
    setFormInitialCopies(3);
    setFormShelfLocation('Cơ sở 1 (Bình Thạnh) - Kệ GTVT-01 - Tầng 2');
    setFormCoverImage('');
    setCoverFile(null);
    setCoverPreview(null);
    setIsbnLookupSuccessInfo(null);
    if (categories.length > 0) setFormCategoryId(categories[0].id);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book: BookItem) => {
    setEditingBook(book);
    setFormTitle(book.title);
    const authorsStr = book.authors_names?.length
      ? book.authors_names.join(', ')
      : book.authors?.map((a) => a.name).join(', ') || '';
    setFormAuthorNames(authorsStr);
    setFormIsbn(book.isbn || '');
    setFormYear(book.year ? String(book.year) : '2024');
    setFormPrice(String(book.price || 150000));
    setFormPublisher(book.publisher || '');
    const catId =
      typeof book.category === 'object'
        ? book.category?.id
        : book.category || (categories.length > 0 ? categories[0].id : 0);
    setFormCategoryId(Number(catId) || (categories.length > 0 ? categories[0].id : 0));
    setFormDescription('');
    setFormInitialCopies(0);
    setFormCoverImage(book.cover_image || '');
    setCoverFile(null);
    setCoverPreview(book.cover_image || null);
    setIsbnLookupSuccessInfo(null);
    setIsModalOpen(true);
  };

  const handleLookupIsbn = async (isbnToLookup?: string) => {
    const targetIsbn = (isbnToLookup || formIsbn).trim();
    if (!targetIsbn) {
      toast.warning('Vui lòng nhập hoặc quét mã ISBN cần tra cứu.');
      return;
    }

    try {
      setIsLookingUpIsbn(true);
      const res = await api.get(`/catalog/lookup-isbn?isbn=${encodeURIComponent(targetIsbn)}`);
      const meta = res.data?.data;
      if (meta && meta.success) {
        if (meta.title) setFormTitle(meta.title);
        if (meta.author_names) setFormAuthorNames(meta.author_names);
        if (meta.publisher) setFormPublisher(meta.publisher);
        if (meta.year) setFormYear(String(meta.year));
        if (meta.price) setFormPrice(String(meta.price));
        if (meta.description) setFormDescription(meta.description);
        if (meta.isbn) setFormIsbn(meta.isbn);
        if (meta.cover_image) {
          setFormCoverImage(meta.cover_image);
          setCoverPreview(meta.cover_image);
          setCoverFile(null);
        }

        // Match category
        if (meta.suggested_category_id) {
          setFormCategoryId(meta.suggested_category_id);
        } else if (meta.suggested_category_code) {
          const found = categories.find((c) => c.code === meta.suggested_category_code);
          if (found) setFormCategoryId(found.id);
        }

        setIsbnLookupSuccessInfo({
          title: meta.title,
          author: meta.author_names,
          source: meta.source || 'Tra cứu tự động',
        });

        toast.success(`Đã tự động nhận diện: "${meta.title}"!`);
      } else {
        if (meta?.isbn) setFormIsbn(meta.isbn);
        setIsbnLookupSuccessInfo(null);
        toast.warning(meta?.message || 'Chưa tìm thấy dữ liệu tự động cho mã ISBN này. Vui lòng điền thông tin thủ công.');
      }
    } catch (err: any) {
      console.error('Failed to lookup ISBN', err);
      toast.error('Lỗi khi tra cứu mã ISBN. Vui lòng kiểm tra lại kết nối.');
    } finally {
      setIsLookingUpIsbn(false);
    }
  };

  const handleCameraScanSuccess = (scannedCode: string) => {
    if (!isModalOpen) {
      handleOpenAddModal();
    }
    setFormIsbn(scannedCode);
    handleLookupIsbn(scannedCode);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    try {
      setIsSubmitting(true);

      const authorsList = formAuthorNames
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const payload: any = {
        title: formTitle.trim(),
        isbn: formIsbn.trim() || undefined,
        category: formCategoryId,
        category_id: formCategoryId,
        year: formYear ? parseInt(formYear, 10) : undefined,
        price: parseInt(formPrice, 10) || 150000,
        publisher: formPublisher.trim() || undefined,
        description: formDescription.trim() || undefined,
        author_names: authorsList,
        cover_image: formCoverImage.trim() || undefined,
      };

      let bookId: number | undefined = editingBook?.id;

      if (editingBook) {
        await api.put(`/books/${editingBook.id}`, payload);
        bookId = editingBook.id;
        toast.success(`Cập nhật đầu sách "${formTitle}" thành công!`);
      } else {
        if (formInitialCopies > 0) {
          payload.initial_copies = formInitialCopies;
          payload.shelf_location = formShelfLocation.trim();
        }
        const res = await api.post('/books', payload);
        bookId = res.data?.data?.id;
        toast.success(`Thêm đầu sách "${formTitle}" thành công!`);
      }

      // If user selected a cover image file, upload it to the server
      if (coverFile && bookId) {
        try {
          const formData = new FormData();
          formData.append('cover', coverFile);
          await api.post(`/books/${bookId}/cover`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch (uploadErr) {
          console.error('Failed to upload book cover image', uploadErr);
        }
      }

      setIsModalOpen(false);
      fetchBooks();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Thao tác lưu đầu sách thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBook) return;

    try {
      setIsSubmitting(true);
      await api.delete(`/books/${deletingBook.id}`);
      toast.success(`Đã xóa đầu sách "${deletingBook.title}".`);
      setDeletingBook(null);
      fetchBooks();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Không thể xóa đầu sách do còn bản sao hoặc ràng buộc nghiệp vụ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryCode = (book: BookItem): string => {
    if (book.category_code) return book.category_code;
    if (typeof book.category === 'object' && book.category?.code) return book.category.code;
    if (book.category_detail?.code) return book.category_detail.code;
    const cat = categories.find((c) => c.id === (typeof book.category === 'number' ? book.category : 0));
    return cat ? cat.code : 'UTH';
  };

  const getCategoryName = (book: BookItem): string => {
    if (book.category_name) return book.category_name;
    if (typeof book.category === 'object' && book.category?.name) return book.category.name;
    if (book.category_detail?.name) return book.category_detail.name;
    const cat = categories.find((c) => c.id === (typeof book.category === 'number' ? book.category : 0));
    return cat ? cat.name : 'Chung';
  };

  const getAuthorsText = (book: BookItem): string => {
    if (book.authors_names && book.authors_names.length > 0) {
      return book.authors_names.join(', ');
    }
    if (book.authors && book.authors.length > 0) {
      return book.authors.map((a) => a.name).join(', ');
    }
    return 'Chưa cập nhật tác giả';
  };

  const getTotalCopies = (book: BookItem): number => {
    return book.total_copies_count ?? book.total_copies ?? 0;
  };

  const getAvailableCopies = (book: BookItem): number => {
    return book.available_copies_count ?? book.available_copies ?? 0;
  };

  return (
    <div className="space-y-5 pb-12 animate-page-enter">
      {/* Top Header & Action Toolbar */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>Quản lý Đầu sách</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Quản trị ấn phẩm giáo trình, liên kết bản sao vật lý và phát hành mã vạch lưu kho
            </p>
          </div>
        </div>

        {/* Action Buttons: Clean & Outlined */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleOpenAddModal}
            className="text-xs font-semibold h-9 px-3.5 rounded-xl bg-brand text-white hover:bg-brand-dark transition-all shadow-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Thêm đầu sách</span>
          </Button>

          <Button
            onClick={() => {
              handleOpenAddModal();
              setIsCameraScannerOpen(true);
            }}
            className="text-xs font-semibold h-9 px-3.5 rounded-xl bg-teal-700 text-white hover:bg-teal-800 transition-all shadow-xs shrink-0 flex items-center"
            title="Quét mã vạch ISBN trên bìa sách bằng Camera để điền thông tin tự động"
          >
            <Camera className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
            <span>📷 Quét nhanh ISBN</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="text-xs h-9 px-3 border border-gray-200 text-gray-700 hover:text-gray-900 rounded-xl"
            title="Nhập danh mục từ Excel/CSV"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5 text-brand" />
            <span>Nhập CSV</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportCsv}
            className="text-xs h-9 px-3 border border-gray-200 text-gray-700 hover:text-gray-900 rounded-xl"
            title="Xuất danh mục sách ra file CSV"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            <span>Xuất CSV</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadTemplate}
            className="text-xs h-9 px-3 border border-gray-200 text-gray-700 hover:text-gray-900 rounded-xl"
            title="Tải file mẫu Excel/CSV chuẩn UTH"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            <span>Mẫu CSV</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Card */}
      <Card className="shadow-xs border-gray-200/80">
        <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xl flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                placeholder="Tìm theo tên sách, tác giả, mã ISBN, nhà xuất bản..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 w-full text-xs h-9 rounded-xl border-gray-200 focus:border-brand bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Outline style Search Button */}
            <button
              type="submit"
              className="h-9 px-3.5 rounded-xl text-xs font-semibold shrink-0 border border-brand text-brand hover:bg-teal-50 bg-white transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-brand" />
              <span>Tìm kiếm</span>
            </button>
          </form>

          <div className="flex items-center gap-2.5 shrink-0 text-xs text-gray-500">
            <div className="w-48 sm:w-56">
              <Select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="text-xs h-9 rounded-xl border-gray-200"
              >
                <option value="">Tất cả chuyên ngành ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.name}
                  </option>
                ))}
              </Select>
            </div>

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

            {appliedSearch && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                <span>"{appliedSearch}"</span>
                <button
                  onClick={handleClearSearch}
                  className="text-gray-400 hover:text-gray-700 font-bold ml-1"
                  title="Bỏ lọc tìm kiếm"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Books Table */}
      {isLoading ? (
        <div className="p-16 text-center text-xs text-gray-500 bg-white border border-gray-200/80 rounded-2xl shadow-xs space-y-2">
          <RotateCcw className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
          <p className="font-semibold text-gray-700">Đang tải danh mục đầu sách...</p>
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          title="Không tìm thấy đầu sách nào"
          description={
            appliedSearch
              ? `Không có ấn phẩm nào khớp với từ khóa "${appliedSearch}".`
              : 'Không có ấn phẩm nào khớp với chuyên ngành đã chọn.'
          }
          actionText="Thêm đầu sách mới"
          onAction={handleOpenAddModal}
        />
      ) : (
        <Card className="shadow-xs border-gray-200/80">
          <div className="overflow-x-auto min-h-[320px]">
            <Table containerClassName="border-0 shadow-none rounded-none">
              <TableHeader>
                <TableRow className="bg-gray-50/90 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                  <TableHead className="w-16">Mã</TableHead>
                  <TableHead>Tài liệu & Tác giả</TableHead>
                  <TableHead className="w-44">Chuyên ngành</TableHead>
                  <TableHead className="w-36">ISBN</TableHead>
                  <TableHead className="w-28 text-right">Giá bìa</TableHead>
                  <TableHead className="w-40 text-center">Bản sao (Sẵn sàng / Tổng)</TableHead>
                  <TableHead className="w-20 text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((book, index) => {
                  const catCode = getCategoryCode(book);
                  const catName = getCategoryName(book);
                  const authorText = getAuthorsText(book);
                  const total = getTotalCopies(book);
                  const avail = getAvailableCopies(book);

                  return (
                    <TableRow key={book.id} className="hover:bg-teal-50/15 transition-colors">
                      {/* ID */}
                      <TableCell className="font-mono text-gray-400 text-xs">
                        #{book.id}
                      </TableCell>

                      {/* Title & Author */}
                      <TableCell className="max-w-md">
                        <div className="flex items-start gap-3">
                          {/* Book Cover Thumbnail */}
                          <div className="w-9 h-12 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                            {book.cover_image ? (
                              <img
                                src={book.cover_image}
                                alt={book.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <BookOpen className="w-4 h-4 text-slate-300" />
                            )}
                          </div>

                          {/* Title & Info */}
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/books/${book.id}`}
                              className="font-medium text-gray-800 hover:text-brand transition-colors text-xs line-clamp-1 block leading-snug"
                              title={book.title}
                            >
                              {book.title}
                            </Link>
                            <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5" title={authorText}>
                              {authorText}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {book.publisher || 'NXB Đại học'} &bull; Năm {book.year || '2024'}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="bg-teal-50 text-brand px-1.5 py-0.2 rounded font-semibold font-mono text-[10px] border border-teal-200">
                            {catCode}
                          </span>
                          <span className="text-xs text-gray-600 truncate max-w-[120px]" title={catName}>
                            {catName}
                          </span>
                        </div>
                      </TableCell>

                      {/* ISBN */}
                      <TableCell>
                        <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 inline-block">
                          {book.isbn || '—'}
                        </span>
                      </TableCell>

                      {/* Price */}
                      <TableCell className="text-right font-medium text-gray-800 font-mono text-xs">
                        {formatCurrencyVND(book.price || 0)}
                      </TableCell>

                      {/* Copies Count */}
                      <TableCell className="text-center">
                        <Link
                          to={`/admin/copies?book_id=${book.id}`}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all shadow-2xs',
                            total === 0
                              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              : avail > 0
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          )}
                          title="Bấm để xem và quản lý danh sách bản sao"
                        >
                          <BookCopy className="w-3 h-3" />
                          <span>
                            {avail} / {total} cuốn
                          </span>
                        </Link>
                      </TableCell>

                      {/* Actions: ActionMenu */}
                      <TableCell className="text-center relative">
                        <ActionMenu
                          title={`Đầu sách #${book.id}`}
                          statusDot={avail > 0 ? 'success' : 'warning'}
                          isNearBottom={index >= books.length - 2 && books.length > 2}
                          items={[
                            {
                              label: 'Chỉnh sửa thông tin',
                              icon: <Edit2 className="w-3.5 h-3.5" />,
                              variant: 'primary',
                              onClick: () => handleOpenEditModal(book),
                            },
                            {
                              label: `Quản lý bản sao (${avail}/${total})`,
                              icon: <BookCopy className="w-3.5 h-3.5" />,
                              variant: 'info',
                              onClick: () => navigate(`/admin/copies?book_id=${book.id}`),
                            },
                            {
                              label: 'Xem trang OPAC',
                              icon: <ExternalLink className="w-3.5 h-3.5" />,
                              variant: 'default',
                              onClick: () => navigate(`/books/${book.id}`),
                            },
                            {
                              label: 'Xóa đầu sách',
                              icon: <Trash2 className="w-3.5 h-3.5" />,
                              variant: 'danger',
                              isDividerBefore: true,
                              onClick: () => setDeletingBook(book),
                            },
                          ]}
                        />
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
              Hiển thị <strong>{books.length}</strong> / <strong>{totalRecords}</strong> đầu sách
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

      {/* Add / Edit Book Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBook ? `Chỉnh sửa đầu sách #${editingBook.id}` : 'Thêm đầu sách mới'}
        description="Nhập thông tin ấn phẩm để cập nhật vào cơ sở dữ liệu Thư viện UTH"
        size="2xl"
      >
        <form onSubmit={handleSaveBook} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <ModalBody className="overflow-y-auto flex-1 min-h-0 p-6 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: Cover Image & Summary (4 cols) */}
              <div className="lg:col-span-4 space-y-3.5">
                {/* Book Cover Upload Section */}
                <div className="p-3.5 bg-slate-50 border border-border rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-textPrimary flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-primary" />
                      <span>Ảnh bìa sách</span>
                    </label>
                    {coverPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveCover}
                        className="text-[11px] text-danger hover:underline flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>Xóa ảnh</span>
                      </button>
                    )}
                  </div>

                  {/* Cover Preview Box */}
                  <div className="w-full h-48 bg-white border border-border rounded-lg shadow-2xs overflow-hidden flex items-center justify-center">
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt="Xem trước ảnh bìa"
                        className="w-full h-full object-contain bg-slate-100/50"
                      />
                    ) : (
                      <div className="text-center p-3 text-textSecondary/60">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                        <span className="text-xs block font-medium">Chưa có ảnh bìa</span>
                        <span className="text-[11px] text-textSecondary/70 block mt-0.5">Tự động nạp khi quét ISBN</span>
                      </div>
                    )}
                  </div>

                  {/* File upload & URL input */}
                  <div className="space-y-1.5">
                    <label className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white border border-border hover:border-primary/50 text-textPrimary hover:text-primary text-xs font-medium rounded-lg cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-primary" />
                      <span>Tải ảnh từ máy tính</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleCoverFileChange}
                        className="hidden"
                      />
                    </label>
                    <div className="relative">
                      <LinkIcon className="w-3 h-3 text-textSecondary absolute left-2.5 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        value={formCoverImage}
                        onChange={(e) => {
                          setFormCoverImage(e.target.value);
                          if (!coverFile) setCoverPreview(e.target.value || null);
                        }}
                        placeholder="Hoặc dán URL ảnh trực tiếp..."
                        className="w-full pl-7 pr-2.5 py-1.5 text-xs rounded-lg border border-border bg-white text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-textPrimary mb-1">
                    Tóm tắt nội dung tài liệu
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={3}
                    placeholder="Tóm tắt ngắn gọn nội dung tài liệu phục vụ giảng dạy và nghiên cứu..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-white text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </div>
              </div>

              {/* RIGHT COLUMN: Metadata Form (8 cols) */}
              <div className="lg:col-span-8 space-y-3.5">
                {/* 1. Integrated ISBN Quick-Fill Field */}
                <div className="p-3 bg-teal-50/50 border border-teal-200/80 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-teal-900 flex items-center gap-1.5">
                      <Barcode className="w-3.5 h-3.5 text-brand" />
                      <span>Mã ISBN / Mã vạch bìa sách</span>
                      <span className="text-[11px] font-normal text-teal-700/80">(Tự động điền dữ liệu)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCameraScannerOpen(true)}
                      className="text-xs font-medium text-brand hover:text-brand-dark flex items-center gap-1 px-2 py-0.5 rounded hover:bg-teal-100/70 transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Quét Camera</span>
                    </button>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={formIsbn}
                      onChange={(e) => setFormIsbn(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleLookupIsbn();
                        }
                      }}
                      placeholder="Nhập hoặc quét mã ISBN (VD: 9780132350884)..."
                      className="w-full pl-3 pr-28 py-2 text-xs rounded-lg border border-teal-200 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleLookupIsbn()}
                      disabled={isLookingUpIsbn || !formIsbn.trim()}
                      className="absolute right-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-brand text-white hover:bg-brand-dark disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      {isLookingUpIsbn ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Zap className="w-3 h-3 text-amber-300" />
                      )}
                      <span>Tự động điền</span>
                    </button>
                  </div>

                  {isbnLookupSuccessInfo ? (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-2.5 py-1 flex items-center justify-between animate-fade-in">
                      <span className="truncate">
                        ✓ Đã nhận diện: <strong>{isbnLookupSuccessInfo.title}</strong> — <em>{isbnLookupSuccessInfo.author}</em>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsbnLookupSuccessInfo(null)}
                        className="text-emerald-700 hover:text-emerald-900 ml-1.5 shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-teal-800/70 pt-0.5">
                      <span className="font-medium text-teal-900/60">Thử nhanh:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormIsbn('9780132350884');
                          handleLookupIsbn('9780132350884');
                        }}
                        className="hover:underline text-brand font-medium"
                      >
                        Clean Code
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormIsbn('9786040100028');
                          handleLookupIsbn('9786040100028');
                        }}
                        className="hover:underline text-brand font-medium"
                      >
                        Đường cao tốc UTH
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormIsbn('9780134685991');
                          handleLookupIsbn('9780134685991');
                        }}
                        className="hover:underline text-brand font-medium"
                      >
                        Effective Java
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Title */}
                <Input
                  label="Tên đầu sách"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="VD: Thiết kế hình học đường ô tô và nút giao thông"
                  required
                />

                {/* 3. Author */}
                <Input
                  label="Tác giả / Nhóm tác giả"
                  value={formAuthorNames}
                  onChange={(e) => setFormAuthorNames(e.target.value)}
                  placeholder="VD: GS.TS. Nguyễn Xuân Trục, PGS.TS. Khuất Việt Hùng (cách nhau bởi dấu phẩy)"
                  helperText="Hệ thống tự động liên kết hoặc tạo hồ sơ tác giả mới"
                  required
                />

                {/* 4. Category & Publisher */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select
                    label="Chuyên ngành (Khoa)"
                    value={String(formCategoryId)}
                    onChange={(e) => setFormCategoryId(Number(e.target.value))}
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.code}] {c.name}
                      </option>
                    ))}
                  </Select>

                  <Input
                    label="Nhà xuất bản"
                    value={formPublisher}
                    onChange={(e) => setFormPublisher(e.target.value)}
                    placeholder="VD: NXB Giao thông Vận tải"
                  />
                </div>

                {/* 5. Year & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Năm XB"
                    type="number"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    placeholder="2024"
                  />

                  <Input
                    label="Giá bìa (VNĐ)"
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="150000"
                  />
                </div>

                {/* 6. Initial Copies (Only when creating) */}
                {!editingBook && (
                  <div className="p-3.5 bg-teal-50/40 border border-teal-100 rounded-xl space-y-2.5">
                    <div className="flex items-center space-x-2 text-xs font-bold text-primary">
                      <Layers className="w-3.5 h-3.5 text-primary" />
                      <span>Khởi tạo bản sao lưu kho ngay (Tùy chọn)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Số lượng bản sao"
                        type="number"
                        min="0"
                        max="20"
                        value={formInitialCopies}
                        onChange={(e) => setFormInitialCopies(Number(e.target.value))}
                        helperText="Tự động sinh mã vạch UTH Code128"
                      />
                      <Input
                        label="Vị trí giá sách mặc định"
                        value={formShelfLocation}
                        onChange={(e) => setFormShelfLocation(e.target.value)}
                        placeholder="VD: Kệ GTVT-01 - Tầng 2"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
            >
              {editingBook ? 'Lưu thay đổi' : 'Tạo đầu sách'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* CSV Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Nhập hàng loạt đầu sách từ CSV / Excel"
        description="Tải lên file CSV chứa danh mục sách chuẩn Thư viện UTH"
        size="lg"
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <ModalBody className="overflow-y-auto flex-1 min-h-0 p-5 space-y-3.5">
            <div className="p-3 bg-slate-50 border border-border rounded-xl text-xs space-y-1.5 text-textSecondary">
              <p className="font-semibold text-textPrimary flex items-center">
                <Info className="w-3.5 h-3.5 mr-1 text-primary" />
                Cấu trúc các cột chuẩn trong file CSV:
              </p>
              <p className="font-mono text-[11px] bg-white p-2 rounded border border-border overflow-x-auto text-primary">
                Tên sách, Tác giả, ISBN, Mã khoa, Nhà xuất bản, Năm XB, Giá bìa, Số bản sao, Vị trí kệ
              </p>
              <div className="pt-1 flex items-center justify-between">
                <span>Chưa có file mẫu?</span>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-primary hover:underline font-semibold flex items-center"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Tải file mẫu chuẩn (.csv)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textPrimary mb-1.5">
                Chọn file CSV từ máy tính
              </label>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="w-full text-xs text-textSecondary file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer border border-border rounded-lg p-1.5 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textPrimary mb-1">
                Hoặc dán trực tiếp nội dung CSV vào đây:
              </label>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={6}
                placeholder="Tên sách,Tác giả,ISBN,Mã khoa,Nhà xuất bản,Năm XB,Giá bìa,Số bản sao,Vị trí kệ..."
                className="w-full p-2.5 font-mono text-xs rounded-lg border border-border bg-white text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setIsImportModalOpen(false)}
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              isLoading={importLoading}
              onClick={handleConfirmImport}
            >
              <Upload className="w-4 h-4 mr-1.5" />
              <span>Bắt đầu nhập dữ liệu</span>
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingBook)}
        title="Xác nhận xóa đầu sách"
        message={`Bạn có chắc chắn muốn xóa đầu sách "${deletingBook?.title}"? Thao tác này chỉ thực hiện được khi không có bản sao nào đang được mượn hoặc giữ chỗ.`}
        confirmText="Xóa đầu sách"
        cancelText="Hủy bỏ"
        variant="danger"
        isLoading={isSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingBook(null)}
      />

      {/* Camera Barcode / ISBN Scanner Modal */}
      <CameraBarcodeScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScanSuccess={handleCameraScanSuccess}
        title="Quét mã vạch ISBN trên bìa sau cuốn sách"
        description="Hướng Camera vào mã vạch EAN-13 / ISBN trên bìa sau của sách để nhận diện tự động"
      />
    </div>
  );
};
