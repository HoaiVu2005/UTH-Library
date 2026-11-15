import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Copy,
  Plus,
  Search,
  Barcode as BarcodeIcon,
  Trash2,
  Printer,
  RotateCcw,
  BookOpen,
  MapPin,
  ExternalLink,
  Layers,
  X,
  FileCheck2,
  Camera,
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
import { Card, CardContent } from '@/components/ui/Card';
import { Barcode } from '@/components/ui/Barcode';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { CameraBarcodeScannerModal } from '@/components/ui/CameraBarcodeScannerModal';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

export interface CopyItem {
  id: number;
  barcode: string;
  shelf_location?: string;
  status: string;
  status_display: string;
  reading_room_only?: boolean;
  book_id?: number;
  book_title?: string;
  book_isbn?: string;
  category_name?: string;
  category_code?: string;
  book?: {
    id: number;
    title: string;
    isbn?: string;
    publisher?: string;
    category?: { id?: number; code: string; name: string };
    authors_names?: string[];
  };
}

export const CopiesManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialBookId = searchParams.get('book_id') || '';

  const [copies, setCopies] = useState<CopyItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [filterBookId, setFilterBookId] = useState<string>(initialBookId);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Batch Create Modal State
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(3);
  const [shelfLocation, setShelfLocation] = useState<string>('Cơ sở 1 (Bình Thạnh) - Kệ GTVT-01 - Tầng 2');
  const [isReadingRoomOnly, setIsReadingRoomOnly] = useState<boolean>(false);
  const [booksList, setBooksList] = useState<Array<{ id: number; title: string; category_code?: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Barcode Modal
  const [barcodeModalCopy, setBarcodeModalCopy] = useState<CopyItem | null>(null);

  // Camera Scanner Modal
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);

  // Withdraw Modal
  const [withdrawingCopy, setWithdrawingCopy] = useState<CopyItem | null>(null);

  const fetchCopies = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
      if (appliedSearch.trim()) params.append('barcode', appliedSearch.trim());
      if (statusFilter) params.append('status', statusFilter);
      if (filterBookId) params.append('book_id', filterBookId);

      const res = await api.get(`/copies?${params.toString()}`);
      setCopies(res.data?.data || []);
      setTotalRecords(res.data?.meta?.total || 0);
      setTotalPages(res.data?.meta?.total_pages || 1);
    } catch (err) {
      console.error('Failed to fetch copies', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBooksForSelect = async () => {
    try {
      const res = await api.get('/books?page_size=100');
      const list = (res.data?.data || []).map((b: any) => ({
        id: b.id,
        title: b.title,
        category_code: b.category_code || b.category?.code || 'UTH',
      }));
      setBooksList(list);
      if (list.length > 0 && !selectedBookId) {
        setSelectedBookId(String(list[0].id));
      }
    } catch (err) {
      console.error('Failed to fetch books for dropdown', err);
    }
  };

  useEffect(() => {
    fetchBooksForSelect();
  }, []);

  useEffect(() => {
    fetchCopies();
  }, [page, pageSize, appliedSearch, statusFilter, filterBookId]);

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

  const handleBatchCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/copies/batch', {
        book_id: parseInt(selectedBookId, 10),
        quantity: Number(quantity),
        shelf_location: shelfLocation.trim(),
        reading_room_only: isReadingRoomOnly,
      });
      const count = res.data?.data?.length || quantity;
      toast.success(`Đã sinh ${count} bản sao mã vạch thành công!`);
      setIsBatchModalOpen(false);
      fetchCopies();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Không thể tạo bản sao theo lô.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawConfirm = async () => {
    if (!withdrawingCopy) return;

    try {
      setIsSubmitting(true);
      await api.post(`/copies/${withdrawingCopy.id}/withdraw`, {
        reason: 'Thanh lý định kỳ sách rách/hỏng theo quy định thư viện',
      });
      toast.success(`Đã chuyển bản sao "${withdrawingCopy.barcode}" sang thanh lý.`);
      setWithdrawingCopy(null);
      fetchCopies();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Không thể thanh lý bản sao do ràng buộc mượn.');
      setWithdrawingCopy(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCopyBookTitle = (copy: CopyItem): string => {
    if (copy.book_title) return copy.book_title;
    if (copy.book?.title) return copy.book.title;
    return 'Chưa rõ tiêu đề đầu sách';
  };

  const getCopyCategoryCode = (copy: CopyItem): string => {
    if (copy.category_code) return copy.category_code;
    if (copy.book?.category?.code) return copy.book.category.code;
    return 'UTH';
  };

  const handlePrintBarcode = () => {
    if (!barcodeModalCopy) return;
    const printContent = document.getElementById('barcode-print-area');
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=500,height=400');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tem Mã Vạch - ${barcodeModalCopy.barcode}</title>
          <style>
            @page { size: auto; margin: 5mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 0;
              padding: 20px;
              background: #fff;
            }
            .label-card {
              width: 320px;
              padding: 14px;
              border: 1.5px dashed #263238;
              border-radius: 8px;
              text-align: center;
              background: #fff;
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getCopyCategoryName = (copy: CopyItem): string => {
    if (copy.category_name) return copy.category_name;
    if (copy.book?.category?.name) return copy.book.category.name;
    return 'Chung';
  };

  const getCopyAuthors = (copy: CopyItem): string => {
    if (copy.book?.authors_names && copy.book.authors_names.length > 0) {
      return copy.book.authors_names.join(', ');
    }
    return '';
  };

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'danger' | 'neutral' | 'info' => {
    switch (status) {
      case 'available':
        return 'success';
      case 'borrowed':
        return 'warning';
      case 'reserved':
        return 'info';
      case 'damaged':
      case 'lost':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-5 pb-12 animate-page-enter">
      {/* Hero Header */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
            <Copy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center">
              <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
              <span>Quản lý Bản sao & Mã vạch</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Quản trị từng cuốn sách thực tế trên kệ, kiểm tra trạng thái lưu thông và in tem mã vạch Code128
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={fetchCopies}
            disabled={isLoading}
            className="text-xs h-9 px-3.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl bg-white transition-colors inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50 font-medium cursor-pointer"
            title="Tải lại dữ liệu"
          >
            <RotateCcw className={cn('w-3.5 h-3.5 text-gray-500', isLoading && 'animate-spin')} />
            <span>Làm mới</span>
          </button>
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="inline-flex items-center justify-center text-xs font-semibold h-9 px-4 rounded-xl border border-brand text-brand hover:bg-teal-50/70 transition-all bg-white shadow-2xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5 text-brand" />
            <span>Sinh bản sao theo lô</span>
          </button>
        </div>
      </div>

      {/* Filter by Book Banner if active */}
      {filterBookId && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs text-brand font-medium">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-brand" />
            <span>
              Đang lọc theo đầu sách ID: <strong>#{filterBookId}</strong>
            </span>
          </div>
          <button
            onClick={() => {
              setFilterBookId('');
              setSearchParams({});
              setPage(1);
            }}
            className="text-gray-500 hover:text-red-600 flex items-center gap-1 font-semibold"
          >
            <X className="w-3.5 h-3.5" />
            Xóa lọc đầu sách
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="shadow-xs border-gray-200/80">
        <CardContent className="p-4 space-y-3">
          {/* Segmented Filter Tabs: Soft Colored Pills */}
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3">
            {/* Tất cả */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === ''
                  ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
                  : 'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-slate-100/80'
              )}
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Tất cả trạng thái</span>
            </button>

            {/* Sẵn sàng */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('available');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === 'available'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                  : 'bg-emerald-50/60 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70'
              )}
            >
              <span>Sẵn sàng (Available)</span>
            </button>

            {/* Đang mượn */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('borrowed');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === 'borrowed'
                  ? 'bg-teal-50 text-brand border-brand shadow-2xs'
                  : 'bg-teal-50/60 text-brand border-teal-200/80 hover:bg-teal-100/70'
              )}
            >
              <span>Đang mượn (Borrowed)</span>
            </button>

            {/* Đang giữ chỗ */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('reserved');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === 'reserved'
                  ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-2xs'
                  : 'bg-blue-50/60 text-blue-700 border-blue-200/80 hover:bg-blue-100/70'
              )}
            >
              <span>Đang giữ chỗ (Reserved)</span>
            </button>

            {/* Hư hỏng */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('damaged');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === 'damaged'
                  ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                  : 'bg-amber-50/60 text-amber-700 border-amber-200/80 hover:bg-amber-100/70'
              )}
            >
              <span>Hư hỏng / Bảo trì</span>
            </button>

            {/* Báo mất */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('lost');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === 'lost'
                  ? 'bg-red-50 text-red-600 border-red-300 shadow-2xs'
                  : 'bg-red-50/60 text-red-600 border-red-200/80 hover:bg-red-100/70'
              )}
            >
              <span>Báo mất (Lost)</span>
            </button>

            {/* Đã thanh lý */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('withdrawn');
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5',
                statusFilter === 'withdrawn'
                  ? 'bg-gray-100 text-gray-800 border-gray-300 shadow-2xs'
                  : 'bg-gray-50 text-gray-600 border-gray-200/80 hover:bg-gray-100'
              )}
            >
              <span>Đã thanh lý (Withdrawn)</span>
            </button>
          </div>

          {/* Search Controls & Pagination Limit */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xl flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  placeholder="Tìm theo mã vạch barcode (VD: UTH-CK-000022)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 w-full text-xs h-9 rounded-xl border-gray-200 focus:border-brand bg-white font-mono"
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

              {/* Outline Camera Scan Button */}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsCameraOpen(true)}
                className="h-9 px-3 rounded-xl text-xs font-semibold border border-teal-200 text-brand bg-teal-50/80 hover:bg-teal-100 shrink-0 flex items-center gap-1.5 shadow-2xs"
                title="Bật Camera để quét mã vạch trên gáy hoặc bìa sách"
              >
                <Camera className="w-3.5 h-3.5 text-brand" />
                <span className="hidden sm:inline">Quét Camera</span>
              </Button>
            </form>

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
          </div>
        </CardContent>
      </Card>

      {/* Copies Table */}
      {isLoading ? (
        <div className="p-16 text-center text-xs text-gray-500 bg-white border border-gray-200/80 rounded-2xl shadow-xs space-y-2">
          <RotateCcw className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
          <p className="font-semibold text-gray-700">Đang tải danh sách bản sao lưu kho...</p>
        </div>
      ) : copies.length === 0 ? (
        <EmptyState
          title="Không tìm thấy bản sao nào"
          description={
            appliedSearch
              ? `Không có bản ghi nào khớp với mã vạch "${appliedSearch}".`
              : 'Không có cuốn sách nào khớp với bộ lọc trạng thái đã chọn.'
          }
          actionText="Sinh bản sao theo lô"
          onAction={() => setIsBatchModalOpen(true)}
        />
      ) : (
        <Card className="shadow-xs border-gray-200/80">
          <div className="overflow-x-auto min-h-[320px]">
            <Table containerClassName="border-0 shadow-none rounded-none">
              <TableHeader>
                <TableRow className="bg-gray-50/90 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                  <TableHead className="w-44">Mã vạch (Barcode)</TableHead>
                  <TableHead>Tài liệu</TableHead>
                  <TableHead className="w-56">Vị trí lưu kho</TableHead>
                  <TableHead className="w-36 text-center">Hình thức</TableHead>
                  <TableHead className="w-36 text-center">Trạng thái</TableHead>
                  <TableHead className="w-28 text-center whitespace-nowrap">Tem nhãn</TableHead>
                  <TableHead className="w-20 text-center whitespace-nowrap">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {copies.map((copy, index) => {
                  const bookTitle = getCopyBookTitle(copy);
                  const catCode = getCopyCategoryCode(copy);
                  const catName = getCopyCategoryName(copy);
                  const authors = getCopyAuthors(copy);
                  const bookId = copy.book_id || copy.book?.id;

                  return (
                    <TableRow key={copy.id} className="hover:bg-teal-50/15 transition-colors">
                      {/* Barcode */}
                      <TableCell className="font-mono font-bold text-brand text-xs">
                        <div className="flex items-center space-x-1.5">
                          <BarcodeIcon className="w-4 h-4 text-brand shrink-0" />
                          <span>{copy.barcode}</span>
                        </div>
                      </TableCell>

                      {/* Book & Category Info */}
                      <TableCell className="max-w-md">
                        {bookId ? (
                          <Link
                            to={`/books/${bookId}`}
                            className="font-medium text-gray-800 hover:text-brand transition-colors text-xs line-clamp-1 block leading-snug"
                            title={bookTitle}
                          >
                            {bookTitle}
                          </Link>
                        ) : (
                          <span className="font-medium text-gray-800 text-xs line-clamp-1 block leading-snug">
                            {bookTitle}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-500">
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold font-mono text-[10px]">
                            {catCode}
                          </span>
                          <span>&bull;</span>
                          <span className="truncate">{catName}</span>
                          {authors && (
                            <>
                              <span>&bull;</span>
                              <span className="truncate text-gray-400">{authors}</span>
                            </>
                          )}
                        </div>
                      </TableCell>

                      {/* Shelf Location */}
                      <TableCell className="text-gray-500 text-xs">
                        <div className="flex items-start space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{copy.shelf_location || 'Quầy lưu trữ trung tâm'}</span>
                        </div>
                      </TableCell>

                      {/* Service Mode */}
                      <TableCell className="text-center">
                        {copy.reading_room_only ? (
                          <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            Chỉ đọc tại chỗ
                          </span>
                        ) : (
                          <span className="inline-block bg-teal-50 text-brand border border-teal-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            Mượn về nhà
                          </span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        <Badge variant={getStatusBadgeVariant(copy.status)} size="sm">
                          {copy.status_display}
                        </Badge>
                      </TableCell>

                      {/* Print Barcode */}
                      <TableCell className="text-center whitespace-nowrap">
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => setBarcodeModalCopy(copy)}
                          className="text-[11px] h-7 px-3 shadow-2xs whitespace-nowrap inline-flex items-center gap-1.5 border border-teal-200 text-brand bg-teal-50/80 hover:bg-teal-100 rounded-lg transition-colors font-semibold"
                          title="Xem chi tiết tem nhãn mã vạch"
                        >
                          <BarcodeIcon className="w-3.5 h-3.5 text-brand shrink-0" />
                          <span>Xem</span>
                        </Button>
                      </TableCell>

                      {/* Actions: ActionMenu */}
                      <TableCell className="text-center relative">
                        <ActionMenu
                          title={`Bản sao #${copy.id}`}
                          statusDot={copy.status === 'available' ? 'success' : copy.status === 'borrowed' ? 'warning' : 'default'}
                          isNearBottom={index >= copies.length - 2 && copies.length > 2}
                          items={[
                            {
                              label: 'Xem tem nhãn mã vạch',
                              icon: <BarcodeIcon className="w-3.5 h-3.5" />,
                              variant: 'primary',
                              onClick: () => setBarcodeModalCopy(copy),
                            },
                            ...(bookId
                              ? [
                                  {
                                    label: 'Xem trang sách OPAC',
                                    icon: <ExternalLink className="w-3.5 h-3.5" />,
                                    variant: 'default' as const,
                                    onClick: () => navigate(`/books/${bookId}`),
                                  },
                                ]
                              : []),
                            ...(copy.status !== 'withdrawn' && copy.status !== 'borrowed'
                              ? [
                                  {
                                    label: 'Thanh lý bản sao',
                                    icon: <Trash2 className="w-3.5 h-3.5" />,
                                    variant: 'danger' as const,
                                    isDividerBefore: true,
                                    onClick: () => setWithdrawingCopy(copy),
                                  },
                                ]
                              : []),
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
              Hiển thị <strong>{copies.length}</strong> / <strong>{totalRecords}</strong> bản sao
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

      {/* Batch Create Copies Modal */}
      <Modal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        title="Tạo bản sao lưu kho theo lô (Batch Generation)"
        description="Hệ thống sẽ tự động sinh mã vạch chuẩn Code128 theo mã chuyên ngành UTH"
        size="lg"
      >
        <form onSubmit={handleBatchCreate} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <ModalBody className="overflow-y-auto flex-1 min-h-0 p-5 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-textPrimary mb-1">
                Chọn đầu sách cần cấp bản sao *
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-white text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              >
                {booksList.map((b) => (
                  <option key={b.id} value={b.id}>
                    [{b.category_code}] {b.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Số lượng bản sao cần tạo (1 - 50)"
                type="number"
                min="1"
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                helperText="Mã vạch sinh tự động: UTH-{KHOA}-{6 SỐ}"
                required
              />

              <Input
                label="Vị trí giá sách mặc định"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="VD: Cơ sở 1 - Kệ GTVT-02 - Tầng 2"
              />
            </div>

            <div className="pt-1">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isReadingRoomOnly}
                  onChange={(e) => setIsReadingRoomOnly(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                />
                <span className="text-xs font-semibold text-textPrimary">
                  Quy định bản sao này chỉ đọc tại phòng đọc (không cho mượn về nhà)
                </span>
              </label>
            </div>
          </ModalBody>

          <ModalFooter className="shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setIsBatchModalOpen(false)}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>{isSubmitting ? 'Đang tạo...' : `Sinh ${quantity} bản sao`}</span>
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Barcode Preview & Print Modal */}
      <Modal
        isOpen={Boolean(barcodeModalCopy)}
        onClose={() => setBarcodeModalCopy(null)}
        title="Tem nhãn Mã vạch Thư viện UTH"
        description="Mã vạch chuẩn Code128 dán trên gáy và bìa sách phục vụ quét barcode"
        size="md"
      >
        {barcodeModalCopy && (
          <>
            <ModalBody className="p-5">
              <div
                id="barcode-print-area"
                className="p-4 bg-white border-2 border-dashed border-slate-300 rounded-xl space-y-3 text-center shadow-2xs"
              >
                <div className="flex items-center justify-center space-x-2 border-b border-slate-200 pb-2">
                  <img src="/uth-logo.png" alt="UTH Logo" className="h-5 object-contain" />
                  <span className="text-[11px] uppercase font-semibold text-primary tracking-wide">
                    Thư viện ĐH Giao thông vận tải TP.HCM
                  </span>
                </div>

                <div className="py-2 flex justify-center overflow-hidden">
                  <Barcode
                    value={barcodeModalCopy.barcode}
                    height={50}
                    barWidth={1.5}
                    showText={true}
                    className="w-full max-w-full"
                  />
                </div>

                <div className="border-t border-slate-200 pt-2 text-left space-y-1">
                  <p className="text-xs font-semibold text-textPrimary truncate" title={getCopyBookTitle(barcodeModalCopy)}>
                    {getCopyBookTitle(barcodeModalCopy)}
                  </p>
                  <p className="text-[11px] text-textSecondary flex items-center justify-between">
                    <span>Vị trí: <strong className="text-slate-700">{barcodeModalCopy.shelf_location || 'Quầy kho'}</strong></span>
                    <span className="font-medium text-slate-700">
                      {barcodeModalCopy.reading_room_only ? 'Chỉ đọc tại chỗ' : 'Mượn về nhà'}
                    </span>
                  </p>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrintBarcode}
              >
                <Printer className="w-4 h-4 mr-1.5" />
                In tem nhãn
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setBarcodeModalCopy(null)}
              >
                Đóng
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>

      {/* Withdraw Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(withdrawingCopy)}
        title="Xác nhận thanh lý bản sao"
        message={`Bạn có chắc muốn thanh lý bản sao mã vạch "${withdrawingCopy?.barcode}" của sách "${withdrawingCopy ? getCopyBookTitle(withdrawingCopy) : ''}"? Bản sao sẽ chuyển sang trạng thái đã thanh lý và không thể cho mượn.`}
        confirmText="Xác nhận thanh lý"
        cancelText="Hủy bỏ"
        variant="danger"
        isLoading={isSubmitting}
        onConfirm={handleWithdrawConfirm}
        onCancel={() => setWithdrawingCopy(null)}
      />

      {/* Camera Barcode Scanner Modal */}
      <CameraBarcodeScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScanSuccess={(code) => {
          setSearchQuery(code);
          setAppliedSearch(code);
          setPage(1);
        }}
        title="Quét mã vạch Bản sao sách"
        description="Hướng camera vào tem mã vạch trên gáy sách hoặc bìa sau của tài liệu để tra cứu nhanh thông tin bản sao."
      />
    </div>
  );
};

