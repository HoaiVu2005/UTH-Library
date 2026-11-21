import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  Coffee,
  ShieldCheck,
  Clock,
  BookOpen,
  RotateCw,
  AlertTriangle,
  Lock,
  Layers,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import DigitalPdfReaderModal from './DigitalPdfReaderModal';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

export interface DigitalResourceItem {
  id: number;
  book_id: number;
  book_title: string;
  title: string;
  file?: string;
  file_size_bytes?: number;
  file_size_formatted?: string;
  page_count: number;
  allow_download?: boolean;
  access_level: string;
  access_level_display?: string;
  view_count?: number;
  description?: string;
  has_access?: boolean;
  user_reading_session?: {
    current_page: number;
    max_page_reached: number;
    total_seconds_spent: number;
    progress_percent: number;
    last_accessed: string | null;
  } | null;
}

interface PdfReaderModalProps {
  resource: DigitalResourceItem;
  isOpen: boolean;
  onClose: () => void;
  onProgressUpdated?: (page: number, percent: number) => void;
}

type ReaderTheme = 'light' | 'sepia' | 'dark';

export const PdfReaderModal: React.FC<PdfReaderModalProps> = ({
  resource,
  isOpen,
  onClose,
  onProgressUpdated,
}) => {
  const { user } = useAuth();

  // Tự động đồng bộ sang trình đọc hiện đại DigitalPdfReaderModal nếu sách có trong Thư viện số
  const [digitalDocId, setDigitalDocId] = useState<number | null>(() => {
    if (resource.book_id === 295) return 11;
    if (resource.book_id === 294) return 12;
    return null;
  });

  useEffect(() => {
    if (isOpen && resource.book_id && !digitalDocId) {
      if (resource.book_id === 295) {
        setDigitalDocId(11);
      } else if (resource.book_id === 294) {
        setDigitalDocId(12);
      } else {
        api
          .get('/digital-library/documents', {
            params: { catalog_book_id: resource.book_id },
          })
          .then((res) => {
            const doc = (res.data?.data || res.data?.results || [])[0];
            if (doc) setDigitalDocId(doc.id);
          })
          .catch(() => {});
      }
    }
  }, [isOpen, resource.book_id, digitalDocId]);

  if (digitalDocId) {
    return (
      <DigitalPdfReaderModal
        documentId={digitalDocId}
        isOpen={isOpen}
        onClose={onClose}
        onProgressUpdated={onProgressUpdated}
      />
    );
  }

  // PDF Document & Page States
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(resource.page_count || 1);
  const [pageInput, setPageInput] = useState<string>('1');
  const [scale, setScale] = useState<number>(1.15);
  const [theme, setTheme] = useState<ReaderTheme>('light');
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Time & Progress Tracking
  const [secondsSpent, setSecondsSpent] = useState<number>(0);
  const sessionSecondsRef = useRef<number>(0);
  const currentPageRef = useRef<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync state with refs
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // Load PDF Stream via Authenticated API
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setErrorMsg(null);

    const fetchAndLoadPdf = async () => {
      try {
        const response = await api.get(`/digital-resources/${resource.id}/stream`, {
          responseType: 'arraybuffer',
        });

        if (!isMounted) return;

        const loadingTask = pdfjsLib.getDocument({
          data: response.data,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!isMounted) return;

        setPdfDoc(doc);
        setNumPages(doc.numPages);

        // Resume reading progress if available
        const savedPage = resource.user_reading_session?.current_page;
        const initialPage = savedPage && savedPage > 0 && savedPage <= doc.numPages ? savedPage : 1;
        setCurrentPage(initialPage);
        setPageInput(String(initialPage));

        if (initialPage > 1) {
          toast.info(`Chào bạn! Đang mở tiếp tục từ trang ${initialPage}`);
        }

        setLoading(false);
      } catch (err: unknown) {
        if (!isMounted) return;
        setLoading(false);

        const axiosErr = err as { response?: { status?: number; data?: { detail?: string; code?: string } } };
        if (axiosErr.response?.status === 403) {
          setErrorMsg(
            axiosErr.response.data?.detail ||
              'Bạn cần có Thẻ thư viện UTH còn hiệu lực để mở đọc giáo trình số này.'
          );
        } else if (axiosErr.response?.status === 404) {
          setErrorMsg('Tập tin giáo trình chưa sẵn sàng trên hệ thống lưu trữ số.');
        } else {
          setErrorMsg('Không thể tải giáo trình số. Vui lòng kiểm tra lại kết nối.');
        }
      }
    };

    fetchAndLoadPdf();

    return () => {
      isMounted = false;
    };
  }, [isOpen, resource.id, resource.user_reading_session?.current_page]);

  // Reading stopwatch timer
  useEffect(() => {
    if (!isOpen || loading || errorMsg) return;

    const interval = setInterval(() => {
      setSecondsSpent((prev) => {
        const next = prev + 1;
        sessionSecondsRef.current += 1;
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, loading, errorMsg]);

  // Periodic progress sync to server every 15 seconds
  const syncProgressToServer = useCallback(
    async (page: number, secondsDelta: number) => {
      if (!resource.id || page < 1) return;
      try {
        await api.post(`/digital-resources/${resource.id}/progress`, {
          current_page: page,
          seconds_increment: secondsDelta,
        });
        if (numPages > 0 && onProgressUpdated) {
          const pct = Math.min(100, Math.round((page / numPages) * 100));
          onProgressUpdated(page, pct);
        }
      } catch {
        // silent sync failure
      }
    },
    [resource.id, numPages, onProgressUpdated]
  );

  useEffect(() => {
    if (!isOpen || loading || errorMsg) return;

    const syncInterval = setInterval(() => {
      if (sessionSecondsRef.current > 0) {
        const delta = sessionSecondsRef.current;
        sessionSecondsRef.current = 0;
        syncProgressToServer(currentPageRef.current, delta);
      }
    }, 15000);

    return () => {
      clearInterval(syncInterval);
      if (sessionSecondsRef.current > 0) {
        syncProgressToServer(currentPageRef.current, sessionSecondsRef.current);
        sessionSecondsRef.current = 0;
      }
    };
  }, [isOpen, loading, errorMsg, syncProgressToServer]);

  // Render Page onto Canvas with Dynamic DRM Watermark Baked In
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc || !canvasRef.current) return;

      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page
        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        // ==========================================================
        // DYNAMIC DRM WATERMARK MATRIX - Baked directly into canvas
        // ==========================================================
        ctx.save();
        const watermarkColor =
          theme === 'dark'
            ? 'rgba(0, 139, 139, 0.28)'
            : 'rgba(0, 139, 139, 0.16)';
        const patronName = user?.full_name || 'BẠN ĐỌC UTH';
        const patronCode = user?.username || user?.card_code || 'SINH VIEN';
        const nowStr = new Date().toLocaleDateString('vi-VN');

        ctx.font = 'bold 15px "Be Vietnam Pro", sans-serif';
        ctx.fillStyle = watermarkColor;
        ctx.textAlign = 'center';

        const stepX = 320;
        const stepY = 240;

        for (let x = -viewport.width; x < viewport.width * 2; x += stepX) {
          for (let y = -viewport.height; y < viewport.height * 2; y += stepY) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((-28 * Math.PI) / 180);

            ctx.fillText('TRƯỜNG ĐH GIAO THÔNG VẬN TẢI TP.HCM — THƯ VIỆN UTH', 0, 0);
            ctx.font = '12px "Be Vietnam Pro", sans-serif';
            ctx.fillText(`BẢN QUYỀN SỐ: ${patronName} (${patronCode})`, 0, 18);
            ctx.font = '11px "Be Vietnam Pro", sans-serif';
            ctx.fillText(`NGÀY TRUY CẬP: ${nowStr} — NGHIÊM CẤM SAO CHÉP`, 0, 34);
            ctx.restore();
          }
        }
        ctx.restore();
      } catch {
        // page render interrupted by fast page turn
      }
    },
    [pdfDoc, scale, theme, user?.full_name, user?.username, user?.card_code]
  );

  useEffect(() => {
    if (pdfDoc && currentPage > 0 && currentPage <= numPages) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale, theme, renderPage, numPages]);

  // Page Turn Actions
  const handlePrevPage = () => {
    if (currentPage > 1) {
      const next = currentPage - 1;
      setCurrentPage(next);
      setPageInput(String(next));
      syncProgressToServer(next, sessionSecondsRef.current);
      sessionSecondsRef.current = 0;
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      setPageInput(String(next));
      syncProgressToServer(next, sessionSecondsRef.current);
      sessionSecondsRef.current = 0;
    }
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= numPages) {
      setCurrentPage(parsed);
      syncProgressToServer(parsed, sessionSecondsRef.current);
      sessionSecondsRef.current = 0;
    } else {
      setPageInput(String(currentPage));
    }
  };

  // Keyboard Navigation & DRM Shortcuts Interception
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Intercept and prevent Print / Save shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        toast.warning('Tài liệu giáo trình UTH được bảo vệ bản quyền số, không hỗ trợ in ấn trực tiếp.');
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        toast.warning('Giáo trình được bảo mật DRM, chỉ cho phép đọc trực tuyến trên cổng thư viện.');
        return;
      }

      // Page Navigation Shortcuts
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevPage();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, numPages, isFullscreen]);

  // Toggle Full-screen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  // Formatting helpers
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    if (mins === 0) return `${remainder} giây`;
    return `${mins} phút ${remainder}s`;
  };

  const progressPercent = Math.min(100, Math.round((currentPage / Math.max(1, numPages)) * 100));

  // Theme style classes
  const themeStyles = {
    light: {
      bg: 'bg-slate-100',
      canvasContainer: 'bg-slate-200/70',
      header: 'bg-white border-slate-200 text-slate-800',
      sidebar: 'bg-white border-slate-200 text-slate-700',
      activeThumbnail: 'border-[#008B8B] bg-teal-50',
    },
    sepia: {
      bg: 'bg-[#F4ECD8]',
      canvasContainer: 'bg-[#EAE0C8]',
      header: 'bg-[#FAF4E6] border-[#E2D6BC] text-[#5F4B32]',
      sidebar: 'bg-[#FAF4E6] border-[#E2D6BC] text-[#5F4B32]',
      activeThumbnail: 'border-[#8C6D3F] bg-[#EFE5D0]',
    },
    dark: {
      bg: 'bg-slate-950',
      canvasContainer: 'bg-slate-900',
      header: 'bg-slate-900 border-slate-800 text-slate-100',
      sidebar: 'bg-slate-900 border-slate-800 text-slate-300',
      activeThumbnail: 'border-[#008B8B] bg-teal-950/40 text-teal-300',
    },
  }[theme];

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col ${themeStyles.bg} select-none`}
      onContextMenu={(e) => {
        e.preventDefault();
        toast.info('Tài liệu số UTH được bảo vệ bản quyền. Không hỗ trợ sao chép nội dung.');
      }}
    >
      {/* =========================================================================
          TOP ACTION BAR & HEADER
      ========================================================================= */}
      <header
        className={`h-16 px-4 flex items-center justify-between border-b shadow-sm z-20 shrink-0 ${themeStyles.header}`}
      >
        {/* Left: Close button & Book title */}
        <div className="flex items-center gap-3 min-w-0 max-w-sm sm:max-w-md lg:max-w-xl">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-300"
            title="Đóng trình đọc giáo trình"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-2 rounded-lg transition-colors ${
              showSidebar
                ? 'bg-[#008B8B]/10 text-[#008B8B]'
                : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'
            }`}
            title="Bật / Tắt danh sách trang"
          >
            {showSidebar ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#008B8B] flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                Giáo trình số UTH
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-teal-100/70 text-[#008B8B] font-semibold dark:bg-teal-950/70">
                <ShieldCheck className="w-3 h-3 text-[#008B8B]" />
                DRM Bản quyền
              </span>
            </div>
            <h2 className="text-sm font-semibold truncate text-slate-900 dark:text-white" title={resource.title}>
              {resource.title}
            </h2>
          </div>
        </div>

        {/* Center: Page Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || loading}
            className="h-8 px-2 border-slate-300 dark:border-slate-700"
            title="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1.5 text-xs font-medium">
            <span className="text-slate-500 dark:text-slate-400">Trang</span>
            <input
              type="text"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              className="w-12 h-8 text-center text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#008B8B]"
            />
            <span className="text-slate-500 dark:text-slate-400">/ {numPages}</span>
          </form>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= numPages || loading}
            className="h-8 px-2 border-slate-300 dark:border-slate-700"
            title="Trang kế tiếp"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Right: Zoom, Theme, Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Reading Time Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-xs font-medium text-slate-600 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-[#008B8B]" />
            <span>Đã đọc: {formatTime(secondsSpent)}</span>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 p-0.5">
            <button
              onClick={() => setScale((s) => Math.max(0.7, parseFloat((s - 0.15).toFixed(2))))}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded text-slate-600 dark:text-slate-300"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-[48px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(2.2, parseFloat((s + 0.15).toFixed(2))))}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded text-slate-600 dark:text-slate-300"
              title="Phóng to"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Theme switcher (Circular buttons) */}
          <div className="flex items-center rounded-full border border-slate-300 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800 gap-0.5">
            <button
              onClick={() => setTheme('light')}
              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all cursor-pointer ${theme === 'light' ? 'bg-[#008B8B] text-white shadow-xs font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-white/60'}`}
              title="Chế độ Ngày (Nền trắng)"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all cursor-pointer ${theme === 'sepia' ? 'bg-[#8C6D3F] text-white shadow-xs' : 'text-[#8C6D3F] hover:bg-white/60'}`}
              title="Chế độ Ấm dịu mắt (Sepia)"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all cursor-pointer ${theme === 'dark' ? 'bg-[#008B8B] text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-white/60'}`}
              title="Chế độ Đêm (Nền tối)"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-300"
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Reading Progress Indicator */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1">
        <div
          className="bg-[#008B8B] h-1 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* =========================================================================
          BODY AREA: SIDEBAR THUMBNAILS + CANVAS READER VIEW
      ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Thumbnails Sidebar */}
        {showSidebar && (
          <aside
            className={`w-64 border-r shrink-0 flex flex-col z-10 transition-all ${themeStyles.sidebar}`}
          >
            <div className="p-3 border-b border-inherit flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Mục lục & Trang</span>
              <span className="text-xs font-semibold text-[#008B8B]">{numPages} trang</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {Array.from({ length: numPages }, (_, idx) => idx + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setCurrentPage(p);
                    setPageInput(String(p));
                    syncProgressToServer(p, sessionSecondsRef.current);
                    sessionSecondsRef.current = 0;
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    p === currentPage
                      ? `${themeStyles.activeThumbnail} border-2 font-bold shadow-sm`
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/40 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                      {p}
                    </span>
                    <span className="text-xs truncate">Trang {p}</span>
                  </div>
                  {p === currentPage && (
                    <span className="w-2 h-2 rounded-full bg-[#008B8B]" />
                  )}
                </button>
              ))}
            </div>

            {/* Patron DRM Watermark Notice Card */}
            <div className="p-3 border-t border-inherit text-[11px] leading-relaxed text-slate-500">
              <div className="flex items-center gap-1.5 font-bold text-[#008B8B] mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Bảo vệ DRM Sinh viên
              </div>
              <p>
                Tài liệu được đóng dấu số định danh:{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {user?.full_name} ({user?.username})
                </strong>
                . Mọi hành vi chụp hoặc phát tán sẽ được ghi nhận.
              </p>
            </div>
          </aside>
        )}

        {/* Main Canvas Scroll Area */}
        <main
          className={`flex-1 overflow-auto flex flex-col items-center justify-start p-4 sm:p-8 relative ${themeStyles.canvasContainer}`}
        >
          {loading ? (
            <div className="my-auto flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-12 h-12 border-4 border-[#008B8B] border-t-transparent rounded-full animate-spin" />
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Đang khởi tạo phiên đọc bảo mật...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Đang kiểm tra thẻ thư viện và tải trang giáo trình số.
                </p>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="my-auto max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-red-200 dark:border-red-900/40 p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Truy cập bị từ chối</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {errorMsg}
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Quay lại
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setLoading(true);
                    setErrorMsg(null);
                    window.location.reload();
                  }}
                >
                  Thử lại
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative shadow-2xl rounded-sm overflow-hidden border border-slate-300/60 dark:border-slate-800 bg-white">
              {/* Canvas where PDF.js paints pixels + baked watermark */}
              <canvas ref={canvasRef} className="block max-w-none" />

              {/* Overlaid Vector Watermark Layer for 100% viewport security */}
              <div
                className="absolute inset-0 pointer-events-none overflow-hidden flex flex-wrap items-center justify-around opacity-15"
                style={{ mixBlendMode: 'multiply' }}
              >
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="transform -rotate-[28deg] text-center select-none m-8 leading-tight font-bold text-slate-800"
                  >
                    <div className="text-sm tracking-wider text-[#008B8B]">
                      TRƯỜNG ĐH GIAO THÔNG VẬN TẢI TP.HCM
                    </div>
                    <div className="text-xs text-slate-700">
                      BẠN ĐỌC: {user?.full_name} ({user?.username})
                    </div>
                    <div className="text-[10px] text-slate-500">
                      BẢN QUYỀN SỐ UTH — {new Date().toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          BOTTOM QUICK STATUS BAR
      ========================================================================= */}
      <footer className="h-9 px-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[#008B8B] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Đã kích hoạt Watermark DRM Sinh viên
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Phím tắt: [Mũi tên trái/phải] Lật trang</span>
        </div>

        <div className="flex items-center gap-3">
          <span>
            Tiến độ:{' '}
            <strong className="text-[#008B8B]">
              {currentPage}/{numPages} ({progressPercent}%)
            </strong>
          </span>
          <span>•</span>
          <span>
            Thời gian đọc: <strong>{formatTime(secondsSpent)}</strong>
          </span>
        </div>
      </footer>
    </div>
  );
};

