import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Layers,
  MapPin,
  Bookmark,
  ArrowLeft,
  Clock,
  Sparkles,
  Barcode as BarcodeIcon,
  Printer,
  Check,
  ChevronRight,
  Ban,
} from 'lucide-react';
import { api, formatApiError } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BookCard, BookHorizontalCard, BookCardItem } from '@/components/ui/BookCard';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/Table';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { Barcode } from '@/components/ui/Barcode';
import { formatCurrencyVND } from '@/lib/utils';
import { useRealtimeSync, broadcastRealtimeSync } from '@/lib/realtime';

interface CopyItem {
  id: number;
  barcode: string;
  shelf_location: string;
  status: string;
  status_display: string;
  reading_room_only: boolean;
  held_for_user_code?: string;
  hold_expires_at?: string;
  purchase_price?: number;
}

interface BookDetail {
  id: number;
  isbn?: string;
  title: string;
  publisher?: string;
  year?: number;
  category: { id: number; code: string; name: string };
  authors: Array<{ id: number; name: string; bio?: string }>;
  description?: string;
  cover_image?: string;
  language?: string;
  page_count?: number;
  edition?: string;
  price: number;
  processing_fee: number;
  keywords?: string;
  copies: CopyItem[];
  available_copies_count: number;
  can_borrow_home: boolean;
  only_reading_room: boolean;
  is_reserved_by_user?: boolean;
  user_reservation?: {
    id: number;
    status: string;
    queue_position?: number;
    hold_expires_at?: string;
  } | null;
}

export const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [book, setBook] = useState<BookDetail | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<BookCardItem[]>([]);
  const [barcodeModalCopy, setBarcodeModalCopy] = useState<CopyItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [hasJustReserved, setHasJustReserved] = useState(false);
  const [justReservedStatus, setJustReservedStatus] = useState<string | null>(null);

  const loadBookDetail = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      const [bookRes, relatedRes] = await Promise.all([
        api.get<{ data: BookDetail }>(`/books/${id}`),
        api.get<{ data: BookCardItem[] }>(`/books/${id}/related`),
      ]);
      setBook(bookRes.data.data);
      if (bookRes.data.data.is_reserved_by_user) {
        setHasJustReserved(true);
        setJustReservedStatus(bookRes.data.data.user_reservation?.status || null);
      } else {
        setHasJustReserved(false);
        setJustReservedStatus(null);
      }
      setRelatedBooks(relatedRes.data.data);
    } catch (err) {
      if (isInitial) setError(formatApiError(err));
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setHasJustReserved(false);
    setJustReservedStatus(null);
    loadBookDetail(true);
    setActionSuccess(null);
    setActionError(null);
  }, [id, loadBookDetail]);

  // Re-fetch book detail once authentication is resolved to show reservation status
  useEffect(() => {
    if (isAuthenticated) {
      loadBookDetail(false);
    }
  }, [isAuthenticated, loadBookDetail]);

  // Realtime synchronization: updates copy availability live when borrowed or returned
  useRealtimeSync(['books', 'loans', 'reservations'], () => loadBookDetail(false), 5000);

  const handleReserve = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/books/${id}` } } });
      return;
    }

    setActionLoading(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await api.post<{ detail?: string; data: any }>('/reservations', {
        book_id: book?.id,
      });

      const isReady = res.data?.data?.status === 'ready';
      setHasJustReserved(true);
      setJustReservedStatus(isReady ? 'ready' : 'pending');

      if (isReady) {
        toast.success('Giữ chỗ thành công! Sách được giữ tại quầy trong 3 ngày.', {
          action: {
            label: 'Xem đặt chỗ',
            onClick: () => navigate('/reservations'),
          },
        });
      } else {
        toast.success('Đặt trước thành công! Bạn đã được xếp vào hàng chờ ưu tiên.', {
          action: {
            label: 'Xem hàng chờ',
            onClick: () => navigate('/reservations'),
          },
        });
      }
      loadBookDetail(false);
      broadcastRealtimeSync('reservations');
      broadcastRealtimeSync('books');
      broadcastRealtimeSync('notifications');
      broadcastRealtimeSync('dashboard');
      window.dispatchEvent(new CustomEvent('uth-refresh-notifications'));
    } catch (err: any) {
      // If user already reserved, also reflect this in the UI
      const errCode = err?.response?.data?.code || err?.response?.data?.error;
      const errDetail = err?.response?.data?.detail || '';
      if (
        errCode === 'RESERVATION_DUPLICATE' ||
        errDetail.includes('đã có một yêu cầu đặt trước') ||
        errDetail.includes('giữ chỗ cho đầu sách này')
      ) {
        setHasJustReserved(true);
        toast.info('Bạn đã đặt trước đầu sách này rồi.');
      } else {
        toast.error(formatApiError(err));
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <Skeleton className="h-6 w-32 rounded-lg" />
        <Card className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 flex justify-center">
            <Skeleton className="w-56 aspect-[3/4] rounded-xl" />
          </div>
          <div className="md:col-span-8 space-y-4">
            <Skeleton className="h-8 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/3 rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-10 w-48 rounded-lg" />
          </div>
        </Card>
      </div>
    );
  }

  if (error || !book) {
    return <ErrorState message={error || 'Không tìm thấy thông tin tài liệu'} onRetry={loadBookDetail} />;
  }

  const authorsText = book.authors.map((a) => a.name).join(', ') || 'Nhiều tác giả';

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

  const isAlreadyReserved = Boolean(
    hasJustReserved ||
    book?.is_reserved_by_user ||
    book?.user_reservation
  );
  const currentReservationStatus =
    justReservedStatus ||
    book?.user_reservation?.status ||
    (hasJustReserved ? 'pending' : null);

  return (
    <div className="space-y-8 pb-12 animate-page-enter">
      {/* Back button */}
      <div>
        <Link
          to="/search"
          className="inline-flex items-center text-xs font-bold text-primary hover:text-primary-dark transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Quay lại danh mục tài liệu
        </Link>
      </div>

      {/* Book Detail Hero Card */}
      <Card variant="elevated" className="p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Cover Column */}
          <div className="md:col-span-4 flex flex-col items-center">
            <div className="w-full max-w-[240px] aspect-[3/4] bg-slate-50 rounded-xl border border-border overflow-hidden shadow-card flex items-center justify-center relative">
              {book.cover_image ? (
                <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <BookOpen className="w-16 h-16 text-primary/40 mb-2" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    UTH Library
                  </span>
                </div>
              )}
              {book.only_reading_room && (
                <span className="absolute top-2.5 right-2.5 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  Chỉ đọc tại chỗ
                </span>
              )}
            </div>

            {/* Price reference */}
            <div className="mt-4 text-center text-xs text-textSecondary">
              Giá bìa niêm yết: <strong className="text-textPrimary font-bold font-mono">{formatCurrencyVND(book.price)}</strong>
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-8 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary-light text-primary-dark font-bold text-xs uppercase tracking-wider border border-primary/20">
                  [{book.category.code}] {book.category.name}
                </span>
                {book.available_copies_count > 0 ? (
                  <Badge variant="available" hasDot>
                    Sẵn sàng ({book.available_copies_count} cuốn)
                  </Badge>
                ) : (
                  <Badge variant="danger" hasDot>
                    Đã hết
                  </Badge>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-textPrimary leading-tight tracking-tight">
                {book.title}
              </h1>

              <p className="text-xs text-primary font-bold">
                Tác giả: <span className="text-textPrimary font-medium">{authorsText}</span>
              </p>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 py-3.5 border-y border-border text-xs">
                <div>
                  <span className="text-textSecondary block text-[11px]">Nhà xuất bản:</span>
                  <span className="font-semibold text-textPrimary">{book.publisher || '—'}</span>
                </div>
                <div>
                  <span className="text-textSecondary block text-[11px]">Năm xuất bản:</span>
                  <span className="font-semibold text-textPrimary">{book.year || '—'}</span>
                </div>
                <div>
                  <span className="text-textSecondary block text-[11px]">Mã ISBN:</span>
                  <span className="font-mono font-semibold text-textPrimary">{book.isbn || '—'}</span>
                </div>
                <div>
                  <span className="text-textSecondary block text-[11px]">Ngôn ngữ:</span>
                  <span className="font-semibold text-textPrimary">{book.language || 'Tiếng Việt'}</span>
                </div>
                <div>
                  <span className="text-textSecondary block text-[11px]">Số trang:</span>
                  <span className="font-semibold text-textPrimary">{book.page_count ? `${book.page_count} trang` : '—'}</span>
                </div>
                <div>
                  <span className="text-textSecondary block text-[11px]">Phí xử lý hư hao/mất:</span>
                  <span className="font-mono font-semibold text-danger">{formatCurrencyVND(book.processing_fee)}</span>
                </div>
              </div>

              {/* Description */}
              {book.description && (
                <div className="space-y-1.5 pt-1">
                  <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Tóm tắt nội dung</h3>
                  <p className="text-xs text-textSecondary leading-relaxed">{book.description}</p>
                </div>
              )}
            </div>

            {/* Action Area: Reserve / Hold button */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                {book.only_reading_room ? (
                  <Alert variant="warning">
                    Tài liệu chuyên khảo / Giáo trình quý hiếm chỉ phục vụ bạn đọc nghiên cứu tại chỗ ở Thư viện.
                  </Alert>
                ) : isAlreadyReserved ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Button
                      variant="secondary"
                      size="lg"
                      disabled
                      className="bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold cursor-default hover:bg-emerald-50 opacity-100"
                      leftIcon={<Check className="w-4 h-4 text-emerald-600" />}
                    >
                      Đã đặt trước
                    </Button>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-700">
                      <span>
                        {currentReservationStatus === 'ready'
                          ? '✓ Sách đã được giữ sẵn sàng cho bạn tại quầy thư viện.'
                          : '✓ Bạn đã đặt trước đầu sách này (Hàng chờ ưu tiên).'}
                      </span>
                      <Link
                        to="/reservations"
                        className="font-semibold underline underline-offset-2 text-brand hover:text-teal-700 inline-flex items-center gap-0.5 ml-1"
                      >
                        <span>Xem đặt chỗ</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ) : book.can_borrow_home ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleReserve}
                      isLoading={actionLoading}
                      leftIcon={<Bookmark className="w-4 h-4" />}
                    >
                      Đặt trước
                    </Button>
                    <span className="text-xs text-success font-medium">
                      ✓ Đang có sách sẵn sàng tại quầy, bấm để đặt giữ trong 3 ngày.
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Button
                      variant="secondary"
                      size="lg"
                      disabled
                      className="bg-rose-50 text-rose-700 border-rose-200 font-semibold cursor-not-allowed hover:bg-rose-50 opacity-100"
                      leftIcon={<Ban className="w-4 h-4 text-rose-500" />}
                    >
                      Đã hết
                    </Button>
                    <span className="text-xs text-textSecondary">
                      Hiện tại tất cả bản sao đã được mượn hết. Vui lòng quay lại sau khi có bạn đọc trả sách.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Copies Table using Table primitive */}
      <section className="space-y-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-brand" />
          <h3 className="text-base font-bold text-gray-800 tracking-tight flex items-center">
            <span className="text-orange-500 font-bold mr-1.5 select-none">&gt;</span>
            <span>Danh sách các bản sao lưu kho ({book.copies.length})</span>
          </h3>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/90 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                <TableHead>Mã vạch (Barcode)</TableHead>
                <TableHead>Vị trí lưu kho</TableHead>
                <TableHead>Hình thức phục vụ</TableHead>
                <TableHead>Trạng thái bản sao</TableHead>
                <TableHead>Ghi chú giữ chỗ</TableHead>
                <TableHead className="w-32 text-center whitespace-nowrap">Tem mã vạch</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {book.copies.length === 0 ? (
                <TableEmpty colSpan={6} message="Chưa có bản sao vật lý nào cho đầu sách này." />
              ) : (
                book.copies.map((copy) => (
                  <TableRow key={copy.id} className="hover:bg-teal-50/15 transition-colors">
                    <TableCell className="font-mono font-bold text-brand">
                      {copy.barcode}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1.5 text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
                        <span>{copy.shelf_location || 'Kho sách chính'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {copy.reading_room_only ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200 text-[11px]">
                          Chỉ đọc tại chỗ
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200 text-[11px]">
                          Mượn về nhà
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge status={copy.status} hasDot>
                        {copy.status_display}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs">
                      {copy.held_for_user_code ? (
                        <span className="text-brand font-medium">
                          Giữ cho bạn đọc: {copy.held_for_user_code}
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => setBarcodeModalCopy(copy)}
                        className="text-[11px] h-7 px-3 shadow-2xs whitespace-nowrap inline-flex items-center gap-1.5 border border-teal-200 text-brand bg-teal-50/80 hover:bg-teal-100 rounded-lg transition-colors font-semibold"
                        title="Xem tem nhãn mã vạch để quét"
                      >
                        <BarcodeIcon className="w-3.5 h-3.5 text-brand shrink-0" />
                        <span>Xem</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-textPrimary uppercase tracking-wider">
              Tài liệu cùng chuyên ngành ({book.category.name})
            </h3>
            <Link
              to={`/search?category_id=${book.category.id}`}
              className="text-xs text-primary font-bold hover:underline"
            >
              Xem tất cả &rarr;
            </Link>
          </div>
          {/* Desktop: Grid Card đa cột (sm:grid) */}
          <div className="hidden sm:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {relatedBooks.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>

          {/* Mobile: Thẻ ngang theo yêu cầu (sm:hidden) */}
          <div className="sm:hidden space-y-3">
            {relatedBooks.map((b) => (
              <BookHorizontalCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}

      {/* Barcode Preview & Print Modal */}
      <Modal
        isOpen={Boolean(barcodeModalCopy)}
        onClose={() => setBarcodeModalCopy(null)}
        title="Tem nhãn Mã vạch Bản sao Sách UTH"
        description="Mã vạch chuẩn Code128 phục vụ quét mượn trả tại Quầy lưu thông"
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
                  <p className="text-xs font-semibold text-textPrimary truncate" title={book?.title}>
                    {book?.title}
                  </p>
                  <p className="text-[11px] text-textSecondary flex items-center justify-between">
                    <span>Vị trí: <strong className="text-slate-700">{barcodeModalCopy.shelf_location || 'Kho sách chính'}</strong></span>
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
    </div>
  );
};
