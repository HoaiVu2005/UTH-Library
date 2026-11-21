import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
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
  Lock,
  KeyRound,
  Layers,
  FileText,
  AlertCircle,
  Scroll,
  FileSpreadsheet,
  RotateCw,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

export interface WatermarkPayload {
  institution: string;
  patron_name: string;
  patron_code: string;
  access_time: string;
  session_code: string;
}

export interface DigitalSessionResponse {
  session_id: string;
  session_code: string;
  document_id: number;
  document_title: string;
  document_type: string;
  document_type_display: string;
  version_number: number;
  page_count: number;
  current_page: number;
  total_seconds_spent: number;
  watermark: WatermarkPayload;
  allow_download: boolean;
  allow_print: boolean;
}

interface DigitalPdfReaderModalProps {
  documentId: number;
  isOpen: boolean;
  onClose: () => void;
  onProgressUpdated?: (page: number, percent: number) => void;
}

type ReaderTheme = 'light' | 'sepia' | 'dark';
type ViewMode = 'continuous' | 'single';

// Helper to draw 5-line Dynamic DRM Watermark matrix directly onto the 2D canvas
const drawDynamicWatermark = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  wm: WatermarkPayload,
  theme: ReaderTheme
) => {
  ctx.save();
  const watermarkColor =
    theme === 'dark'
      ? 'rgba(0, 139, 139, 0.28)'
      : 'rgba(0, 139, 139, 0.16)';

  ctx.fillStyle = watermarkColor;
  ctx.textAlign = 'center';

  const stepX = 360;
  const stepY = 280;

  for (let x = 80; x < width + stepX; x += stepX) {
    for (let y = 80; y < height + stepY; y += stepY) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((-28 * Math.PI) / 180);

      // Dòng 1: THƯ VIỆN UTH – BẢN QUYỀN ĐH GTVT TP.HCM
      ctx.font = 'bold 13px "Be Vietnam Pro", sans-serif';
      ctx.fillText(wm.institution || 'THƯ VIỆN UTH – BẢN QUYỀN ĐH GTVT TP.HCM', 0, 0);

      // Dòng 2: Bạn đọc: [Họ tên sinh viên]
      ctx.font = '12px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`Bạn đọc: ${wm.patron_name}`, 0, 18);

      // Dòng 3: MSSV: [MSSV]
      ctx.fillText(`MSSV: ${wm.patron_code}`, 0, 34);

      // Dòng 4: Thời gian đọc: [Ngày giờ]
      ctx.font = '11px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`Thời gian: ${wm.access_time}`, 0, 50);

      // Dòng 5: Mã phiên đọc: [Session Code]
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`Mã phiên: ${wm.session_code}`, 0, 65);

      ctx.restore();
    }
  }
  ctx.restore();
};

// Sub-component rendering an individual PDF page canvas with watermark and lazy viewport intersection
interface PdfPageRendererProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNum: number;
  scale: number;
  rotation: number;
  theme: ReaderTheme;
  watermark: WatermarkPayload;
  viewMode: ViewMode;
}

const PdfPageRenderer: React.FC<PdfPageRendererProps> = ({
  pdfDoc,
  pageNum,
  scale,
  rotation,
  theme,
  watermark,
  viewMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(viewMode === 'single');

  // Lazy render for continuous mode: only render when approaching viewport
  useEffect(() => {
    if (viewMode === 'single') {
      setIsVisible(true);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          // Unload canvas if scrolled far outside view (> 1200px) to save GPU memory and prevent lag
          const rect = entry.boundingClientRect;
          if (rect.bottom < -1200 || rect.top > window.innerHeight + 1200) {
            setIsVisible(false);
          }
        }
      },
      {
        rootMargin: '400px 0px 400px 0px',
        threshold: 0,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [viewMode]);

  useEffect(() => {
    if (!isVisible) return;

    let cancelled = false;

    const render = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (cancelled) return;

        // Apply intrinsic PDF rotation + user rotation
        const effectiveRotation = ((page.rotate || 0) + rotation) % 360;
        const viewport = page.getViewport({ scale, rotation: effectiveRotation });
        setDimensions({ width: viewport.width, height: viewport.height });

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: ctx,
          viewport: viewport,
        }).promise;

        if (cancelled) return;

        // Apply 5-line Watermark directly to canvas
        drawDynamicWatermark(ctx, viewport.width, viewport.height, watermark, theme);
      } catch {
        // Render cancelled
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, pageNum, scale, rotation, theme, watermark, isVisible]);

  const estimatedWidth = dimensions?.width || (rotation % 180 === 0 ? 820 * scale : 1160 * scale);
  const estimatedHeight = dimensions?.height || (rotation % 180 === 0 ? 1160 * scale : 820 * scale);

  return (
    <div
      ref={containerRef}
      id={`pdf-page-${pageNum}`}
      data-page-number={pageNum}
      className="relative shadow-2xl rounded-sm overflow-hidden border border-slate-300/60 bg-white mx-auto my-3 transition-all duration-200"
      style={{
        width: estimatedWidth,
        minHeight: estimatedHeight,
      }}
    >
      {isVisible ? (
        <>
          <canvas ref={canvasRef} className="block max-w-none" />

          {/* Vector Watermark Overlay (Viewport protection) */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden flex flex-wrap items-center justify-around opacity-15"
            style={{ mixBlendMode: 'multiply' }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="transform -rotate-[28deg] text-center select-none m-8 leading-tight font-bold text-slate-800"
              >
                <div className="text-xs tracking-wider text-[#008B8B]">
                  THƯ VIỆN UTH – BẢN QUYỀN ĐH GTVT TP.HCM
                </div>
                <div className="text-xs text-slate-700">
                  Bạn đọc: {watermark.patron_name}
                </div>
                <div className="text-[11px] text-slate-600">
                  MSSV: {watermark.patron_code}
                </div>
                <div className="text-[10px] text-slate-500">
                  Mã phiên: {watermark.session_code}
                </div>
              </div>
            ))}
          </div>

          {/* Page indicator pill hovering on top-left of page */}
          <div className="absolute top-2 left-2 bg-slate-900/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md pointer-events-none backdrop-blur-xs">
            Trang {pageNum}
          </div>
        </>
      ) : (
        /* Lightweight placeholder while not intersecting */
        <div
          className="w-full flex flex-col items-center justify-center gap-2 text-slate-400 bg-slate-50/80"
          style={{ minHeight: estimatedHeight }}
        >
          <div className="w-8 h-8 rounded-full border-2 border-[#008B8B] border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Đang tải trang {pageNum}...</span>
        </div>
      )}
    </div>
  );
};

export const DigitalPdfReaderModal: React.FC<DigitalPdfReaderModalProps> = ({
  documentId,
  isOpen,
  onClose,
  onProgressUpdated,
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Session & Watermark States from Backend
  const [sessionData, setSessionData] = useState<DigitalSessionResponse | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>('1');
  const [scale, setScale] = useState<number>(1.15);
  const [rotation, setRotation] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`digital_reader_rotation_${documentId}`);
      if (saved) return parseInt(saved, 10) || 0;
    } catch {}
    return 0;
  });
  const [theme, setTheme] = useState<ReaderTheme>('light');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem('digital_reader_view_mode') as ViewMode;
      if (saved === 'continuous' || saved === 'single') return saved;
    } catch {}
    return 'single';
  });
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'auth' | 'forbidden' | 'not_found' | 'generic'>('generic');

  // Time & Progress Tracking
  const [secondsSpent, setSecondsSpent] = useState<number>(0);
  const sessionSecondsRef = useRef<number>(0);
  const currentPageRef = useRef<number>(1);
  const sessionIdRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isStartingSessionRef = useRef<boolean>(false);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // Lock body scroll and isolate view when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('data-pdf-reader-open', 'true');
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.removeAttribute('data-pdf-reader-open');
      };
    } else {
      isStartingSessionRef.current = false;
    }
  }, [isOpen]);

  // 1. Khởi tạo phiên đọc bảo mật (Start Reading Session)
  const initSessionAndLoadPdf = useCallback(async () => {
    if (!documentId || isStartingSessionRef.current) return;
    isStartingSessionRef.current = true;

    setLoading(true);
    setErrorMsg(null);
    setErrorType('generic');

    try {
      // Step 1: Gọi backend để xác thực quyền & cấp session_id
      const sessionRes = await api.post<DigitalSessionResponse>(
        `/digital-library/documents/${documentId}/start-session`
      );

      const sData = sessionRes.data;
      setSessionData(sData);
      sessionIdRef.current = sData.session_id;
      setSecondsSpent(sData.total_seconds_spent || 0);

      // Step 2: Stream PDF bằng session_id
      const streamRes = await api.get(
        `/digital-library/sessions/${sData.session_id}/stream`,
        { responseType: 'arraybuffer' }
      );

      const loadingTask = pdfjsLib.getDocument({
        data: streamRes.data,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
      });

      const doc = await loadingTask.promise;

      setPdfDoc(doc);
      setNumPages(doc.numPages);

      // Default to single page mode for large documents (> 10 pages) to ensure zero lag
      if (doc.numPages > 10) {
        setViewMode('single');
      }

      const initPage = sData.current_page > 0 && sData.current_page <= doc.numPages ? sData.current_page : 1;
      setCurrentPage(initPage);
      setPageInput(String(initPage));

      if (initPage > 1) {
        toast.info(`Chào bạn! Đang mở tiếp tục từ trang ${initPage}`);
      }

      setLoading(false);
    } catch (err: any) {
      isStartingSessionRef.current = false;
      setLoading(false);
      let detail = err.response?.data?.detail;
      if (!detail && err.response?.data instanceof ArrayBuffer) {
        try {
          const text = new TextDecoder().decode(err.response.data);
          const parsed = JSON.parse(text);
          detail = parsed.detail || parsed.message;
        } catch {
          // not json
        }
      }

      const status = err.response?.status;
      if (status === 401 || !isAuthenticated) {
        setErrorType('auth');
        setErrorMsg('Bạn cần đăng nhập tài khoản Thư viện số UTH để khởi tạo phiên đọc bảo mật và ghi nhận thời lượng học tập.');
      } else if (status === 403) {
        setErrorType('forbidden');
        setErrorMsg(detail || 'Bạn không có quyền truy cập hoặc tài liệu này không trong phạm vi được phép đọc.');
      } else if (status === 404) {
        setErrorType('not_found');
        setErrorMsg(detail || 'Tập tin tài liệu số không tồn tại hoặc chưa sẵn sàng trên hệ thống lưu trữ.');
      } else {
        setErrorType('generic');
        setErrorMsg(detail || 'Không thể khởi tạo phiên đọc bảo mật. Vui lòng thử lại sau.');
      }
    }
  }, [documentId, isAuthenticated]);

  useEffect(() => {
    if (isOpen && documentId) {
      initSessionAndLoadPdf();
    }
  }, [isOpen, documentId, initSessionAndLoadPdf]);

  // 2. Stopwatch đếm thời gian
  useEffect(() => {
    if (!isOpen || loading || errorMsg || !sessionData) return;

    const interval = setInterval(() => {
      setSecondsSpent((prev) => {
        const next = prev + 1;
        sessionSecondsRef.current += 1;
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, loading, errorMsg, sessionData]);

  // 3. Heartbeat đồng bộ tiến độ và thời gian đọc lên Server (mỗi 20 giây)
  const sendHeartbeat = useCallback(
    async (page: number, deltaSeconds: number) => {
      if (!sessionIdRef.current || page < 1) return;
      try {
        await api.post(`/digital-library/sessions/${sessionIdRef.current}/heartbeat`, {
          current_page: page,
          seconds_increment: deltaSeconds,
        });
        if (numPages > 0 && onProgressUpdated) {
          const pct = Math.min(100, Math.round((page / numPages) * 100));
          onProgressUpdated(page, pct);
        }
      } catch {
        // silent fail
      }
    },
    [numPages, onProgressUpdated]
  );

  useEffect(() => {
    if (!isOpen || loading || errorMsg || !sessionData) return;

    const heartbeatInterval = setInterval(() => {
      if (sessionSecondsRef.current > 0) {
        const delta = sessionSecondsRef.current;
        sessionSecondsRef.current = 0;
        sendHeartbeat(currentPageRef.current, delta);
      }
    }, 20000);

    return () => {
      clearInterval(heartbeatInterval);
      if (sessionSecondsRef.current > 0) {
        sendHeartbeat(currentPageRef.current, sessionSecondsRef.current);
        sessionSecondsRef.current = 0;
      }
    };
  }, [isOpen, loading, errorMsg, sessionData, sendHeartbeat]);

  // 4. IntersectionObserver theo dõi trang hiện hành khi người đọc cuộn chuột (Continuous Scroll)
  useEffect(() => {
    if (!scrollContainerRef.current || !pdfDoc || numPages <= 0 || viewMode !== 'continuous') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = Number(entry.target.getAttribute('data-page-number'));
            if (pageNum && pageNum !== currentPageRef.current) {
              setCurrentPage(pageNum);
              setPageInput(String(pageNum));
            }
          }
        });
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.3,
      }
    );

    const pageElements = scrollContainerRef.current.querySelectorAll('[data-page-number]');
    pageElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [pdfDoc, numPages, scale, viewMode]);

  // Cuộn mượt đến trang mục tiêu
  const scrollToPage = (pageNum: number) => {
    if (pageNum < 1 || pageNum > numPages) return;
    setCurrentPage(pageNum);
    setPageInput(String(pageNum));
    sendHeartbeat(pageNum, sessionSecondsRef.current);
    sessionSecondsRef.current = 0;

    if (viewMode === 'continuous') {
      const el = document.getElementById(`pdf-page-${pageNum}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      scrollToPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      scrollToPage(currentPage + 1);
    }
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= numPages) {
      scrollToPage(parsed);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const handleRotate = () => {
    setRotation((prev) => {
      const next = (prev + 90) % 360;
      try {
        localStorage.setItem(`digital_reader_rotation_${documentId}`, String(next));
      } catch {}
      toast.info(`Đã xoay trang: ${next}°`);
      return next;
    });
  };

  // Keyboard navigation & Security protection
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        handleRotate();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        toast.warning('Tài liệu thư viện số được bảo hộ bản quyền, không hỗ trợ in ấn trực tiếp.');
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        toast.warning('Tài liệu được bảo mật DRM, chỉ hỗ trợ đọc trực tuyến trên cổng thư viện số.');
        return;
      }
      if (e.key === 'PageDown' || (e.altKey && e.key === 'ArrowRight')) {
        handleNextPage();
      } else if (e.key === 'PageUp' || (e.altKey && e.key === 'ArrowLeft')) {
        handlePrevPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, numPages]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleClose = () => {
    if (sessionSecondsRef.current > 0) {
      sendHeartbeat(currentPageRef.current, sessionSecondsRef.current);
      sessionSecondsRef.current = 0;
    }
    onClose();
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const rem = totalSec % 60;
    if (mins === 0) return `${rem}s`;
    return `${mins}m ${rem}s`;
  };

  const progressPercent = Math.min(100, Math.round((currentPage / Math.max(1, numPages)) * 100));

  const themeStyles = {
    light: {
      bg: 'bg-slate-100',
      canvasContainer: 'bg-slate-200',
      header: 'bg-white border-slate-200 text-slate-800',
      footer: 'bg-white border-slate-200 text-slate-600',
      sidebar: 'bg-white border-slate-200 text-slate-700',
      activeThumbnail: 'border-[#008B8B] bg-teal-50 font-bold text-[#008B8B]',
    },
    sepia: {
      bg: 'bg-[#F4ECD8]',
      canvasContainer: 'bg-[#EAE0C8]',
      header: 'bg-[#FAF4E6] border-[#E2D6BC] text-[#5F4B32]',
      footer: 'bg-[#FAF4E6] border-[#E2D6BC] text-[#5F4B32]',
      sidebar: 'bg-[#FAF4E6] border-[#E2D6BC] text-[#5F4B32]',
      activeThumbnail: 'border-[#8C6D3F] bg-[#EFE5D0] font-bold text-[#8C6D3F]',
    },
    dark: {
      bg: 'bg-slate-950',
      canvasContainer: 'bg-slate-900',
      header: 'bg-slate-900 border-slate-800 text-slate-100',
      footer: 'bg-slate-900 border-slate-800 text-slate-300',
      sidebar: 'bg-slate-900 border-slate-800 text-slate-300',
      activeThumbnail: 'border-[#008B8B] bg-teal-950/40 text-teal-300 font-bold',
    },
  }[theme];

  if (!isOpen) return null;

  // Mount directly to document.body via Portal to prevent any parent transforms or navbar peeking
  return createPortal(
    <div
      ref={containerRef}
      className={`fixed inset-0 top-0 left-0 right-0 bottom-0 z-[999999] w-screen h-screen flex flex-col ${themeStyles.bg} select-none`}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', zIndex: 999999 }}
      onContextMenu={(e) => {
        e.preventDefault();
        toast.info('Tài liệu số UTH được bảo vệ bản quyền. Không hỗ trợ sao chép nội dung.');
      }}
    >
      {/* 1. Top Header Action Bar */}
      <header
        className={`h-14 px-4 flex items-center justify-between border-b shadow-xs z-20 shrink-0 ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : theme === 'sepia'
            ? 'bg-[#FAF4E6] border-[#E2D6BC] text-[#5F4B32]'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Left: Close button, Sidebar Toggle, Document Title */}
        <div className="flex items-center gap-2 min-w-0 max-w-sm sm:max-w-md lg:max-w-xl">
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shrink-0 bg-white"
            title="Đóng trình đọc tài liệu số (Esc)"
          >
            <X className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors cursor-pointer shrink-0 ${
              showSidebar
                ? 'bg-teal-50 border-teal-300 text-[#008B8B] font-bold'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
            }`}
            title="Bật/Tắt Mục lục trang"
          >
            {showSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>

          <div className="h-5 w-px bg-slate-200 shrink-0 mx-1" />

          <div className="min-w-0 flex items-center gap-2 overflow-hidden">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-[#008B8B] bg-teal-50 border border-teal-200 leading-tight shrink-0">
              <BookOpen className="w-3.5 h-3.5 text-[#008B8B]" />
              {sessionData?.document_type_display || 'Thư viện số UTH'}
            </span>

            <h2
              className="text-xs sm:text-sm font-bold truncate text-slate-800 leading-tight"
              title={sessionData?.document_title}
            >
              {sessionData?.document_title || sessionData?.document_type_display || 'Đang tải tài liệu số UTH...'}
            </h2>

            {sessionData?.session_code && (
              <span className="hidden xl:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-mono font-medium shrink-0">
                <ShieldCheck className="w-3 h-3 text-[#008B8B]" />
                {sessionData.session_code}
              </span>
            )}
          </div>
        </div>

        {/* Center: Page Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || loading}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1.5 text-xs font-medium">
            <span className="text-slate-500 font-medium">Trang</span>
            <input
              type="text"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              className="w-12 h-8 text-center text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-[#008B8B] focus:ring-1 focus:ring-[#008B8B]"
            />
            <span className="text-slate-500 font-semibold">/ {numPages}</span>
          </form>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= numPages || loading}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Trang kế tiếp"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: View Mode Toggle, Zoom, Rotate, Timer, Themes, Fullscreen */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Continuous vs Single Page View Toggle */}
          <div className="hidden md:flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-100 h-8">
            <button
              onClick={() => {
                setViewMode('continuous');
                try { localStorage.setItem('digital_reader_view_mode', 'continuous'); } catch {}
              }}
              className={`h-7 px-2.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'continuous'
                  ? 'bg-[#008B8B] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
              title="Chế độ cuộn dọc liên tục"
            >
              Cuộn liên tục
            </button>
            <button
              onClick={() => {
                setViewMode('single');
                try { localStorage.setItem('digital_reader_view_mode', 'single'); } catch {}
              }}
              className={`h-7 px-2.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'single'
                  ? 'bg-[#008B8B] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
              title="Chế độ đọc từng trang"
            >
              Từng trang
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-100 h-8">
            <button
              onClick={() => setScale((s) => Math.max(0.7, parseFloat((s - 0.15).toFixed(2))))}
              className="w-7 h-7 flex items-center justify-center hover:bg-white rounded text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-bold text-slate-700 min-w-[44px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(2.2, parseFloat((s + 0.15).toFixed(2))))}
              className="w-7 h-7 flex items-center justify-center hover:bg-white rounded text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rotate 90 deg clockwise */}
          <button
            onClick={handleRotate}
            className={`h-8 px-2.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
              rotation > 0
                ? 'bg-teal-50 border-teal-300 text-[#008B8B] font-bold'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            title="Xoay trang 90° (Phím tắt: R)"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{rotation > 0 ? `Xoay ${rotation}°` : 'Xoay 90°'}</span>
          </button>

          {/* Reading Time Badge */}
          <div className="hidden lg:flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-teal-50/70 border border-teal-100 text-xs font-medium text-teal-800">
            <Clock className="w-3.5 h-3.5 text-[#008B8B]" />
            <span>Thời gian: {formatTime(secondsSpent)}</span>
          </div>

          {/* Eye Protection Theme Switcher (Circular Buttons) */}
          <div className="flex items-center rounded-full border border-slate-200 p-0.5 bg-slate-100 h-8 gap-0.5">
            <button
              onClick={() => setTheme('light')}
              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                theme === 'light' ? 'bg-white text-[#008B8B] shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
              }`}
              title="Chế độ Sáng (Ban ngày)"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                theme === 'sepia' ? 'bg-[#8C6D3F] text-white shadow-xs' : 'text-[#8C6D3F] hover:bg-white/60'
              }`}
              title="Chế độ Vàng nhạt (Bảo vệ mắt)"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                theme === 'dark' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
              }`}
              title="Chế độ Tối (Ban đêm)"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 transition-colors flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. Reading Progress Bar */}
      <div className="w-full bg-slate-200 h-1 shrink-0">
        <div
          className="bg-[#008B8B] h-1 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3. Main Workspace Area: Sidebar & Canvas */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Left Sidebar: Page Thumbnails */}
        {showSidebar && (
          <aside className={`w-64 border-r shrink-0 flex flex-col z-10 transition-all ${themeStyles.sidebar}`}>
            <div className="p-3 border-b border-inherit flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Mục lục trang</span>
              <span className="text-xs font-semibold text-[#008B8B]">{numPages} trang</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {Array.from({ length: numPages }, (_, idx) => idx + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => scrollToPage(p)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    p === currentPage
                      ? `${themeStyles.activeThumbnail} border-2 shadow-xs`
                      : 'border-slate-200 hover:border-slate-300 bg-white/60 hover:bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">
                      {p}
                    </span>
                    <span className="text-xs truncate">Trang {p}</span>
                  </div>
                  {p === currentPage && <span className="w-2 h-2 rounded-full bg-[#008B8B]" />}
                </button>
              ))}
            </div>

            {/* Disclaimer & Watermark Information */}
            <div className="p-3 border-t border-inherit text-[11px] leading-relaxed text-slate-500 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#008B8B]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Dynamic Watermark UTH
              </div>
              <p>
                Mã phiên: <strong className="font-mono text-slate-700">{sessionData?.session_code}</strong>
              </p>
              <p className="text-[10px] text-slate-400">
                * Dynamic Watermark giúp nhận diện và truy vết nguồn rò rỉ khi tài liệu được lưu hành ra ngoài hệ thống.
              </p>
            </div>
          </aside>
        )}

        {/* Center / Main Scroll Container */}
        <main
          ref={scrollContainerRef}
          className={`flex-1 min-h-0 overflow-y-auto overflow-x-auto flex flex-col items-center justify-start p-4 sm:p-8 pb-32 relative ${themeStyles.canvasContainer}`}
        >
          {loading ? (
            <div className="my-auto flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-12 h-12 border-4 border-[#008B8B] border-t-transparent rounded-full animate-spin" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Đang khởi tạo phiên đọc bảo mật...
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Đang kiểm tra quyền truy cập và giải mã luồng tài liệu số UTH.
                </p>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="my-auto max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-7 text-center space-y-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                errorType === 'auth'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-red-50 text-red-600'
              }`}>
                {errorType === 'auth' ? <KeyRound className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {errorType === 'auth'
                    ? 'Yêu cầu đăng nhập Thư viện UTH'
                    : errorType === 'forbidden'
                    ? 'Giới hạn quyền truy cập học liệu'
                    : errorType === 'not_found'
                    ? 'Tài liệu chưa sẵn sàng'
                    : 'Không thể khởi tạo phiên đọc'}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {errorMsg}
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-2">
                <Button variant="outline" size="sm" onClick={handleClose}>
                  Quay lại
                </Button>
                {errorType === 'auth' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      handleClose();
                      navigate('/login');
                    }}
                  >
                    Đăng nhập ngay
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => initSessionAndLoadPdf()}
                  >
                    Thử lại
                  </Button>
                )}
              </div>
            </div>
          ) : pdfDoc && sessionData ? (
            <div className="w-full flex flex-col items-center">
              {viewMode === 'continuous' ? (
                /* Continuous Scroll Mode: Render all pages with lazy IntersectionObserver */
                <div className="space-y-6 flex flex-col items-center w-full">
                  {Array.from({ length: numPages }, (_, idx) => idx + 1).map((p) => (
                    <PdfPageRenderer
                      key={`${p}-${scale}-${rotation}-${theme}`}
                      pdfDoc={pdfDoc}
                      pageNum={p}
                      scale={scale}
                      rotation={rotation}
                      theme={theme}
                      watermark={sessionData.watermark}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              ) : (
                /* Single Page Mode: Render current page only (Zero-lag) */
                <div className="flex flex-col items-center w-full">
                  <PdfPageRenderer
                    key={`${currentPage}-${scale}-${rotation}-${theme}`}
                    pdfDoc={pdfDoc}
                    pageNum={currentPage}
                    scale={scale}
                    rotation={rotation}
                    theme={theme}
                    watermark={sessionData.watermark}
                    viewMode={viewMode}
                  />
                </div>
              )}
            </div>
          ) : null}
        </main>
      </div>

      {/* 4. Footer Status Bar */}
      <footer className={`h-9 px-4 border-t flex items-center justify-between text-[11px] shrink-0 z-20 ${themeStyles.footer}`}>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[#008B8B] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Bảo vệ Dynamic Watermark phiên {sessionData?.session_code || ''}
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Phím tắt: [PageUp/Down / Mũi tên] Di chuyển trang • [R] Xoay 90° • [Esc] Đóng</span>
        </div>

        <div className="flex items-center gap-3">
          <span>
            Tiến độ: <strong className="text-[#008B8B]">{currentPage}/{numPages} ({progressPercent}%)</strong>
          </span>
          <span>•</span>
          <span>
            Thời gian: <strong>{formatTime(secondsSpent)}</strong>
          </span>
        </div>
      </footer>
    </div>,
    document.body
  );
};

export default DigitalPdfReaderModal;

