import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import {
  X,
  Send,
  User as UserIcon,
  BookOpen,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Minus,
  Sparkles,
  Maximize2,
  Minimize2,
  Bell,
  Check,
  AlertTriangle,
  AlertCircle,
  RotateCcw,
  Search,
  Copy as CopyIcon,
  CheckCheck,
  Layers,
  DollarSign,
  TrendingUp,
  ExternalLink,
  ShieldAlert,
  FileText,
  Flame,
  Wrench,
  PackageX,
  UserX,
  Unlock,
  ShieldCheck,
  Inbox,
  GraduationCap,
  MessageSquare,
  Plus,
  Trash2,
  PanelLeft,
  PanelLeftClose,
  PanelRight,
  PanelRightClose,
  Compass,
  Lightbulb,
  GripHorizontal,
} from 'lucide-react';
import { api, formatApiError } from '@/lib/api';
import { toast } from './Toast';
import { validateUnlockReviewReason } from '@/lib/unlockReview';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import uthieAvatarImg from '@/assets/uthie-avatar.jpg';
import uthChatBackgroundImg from '@/assets/uth-chat-background.jpg';
import { getChatStorageKey, prepareSessionsForStorage } from './aiChatStorage';
import {
  getChatGreeting,
  getChatCanvasTone,
  getAdminMetricLabel,
  AI_CHAT_REQUEST_CONFIG,
  getConversationWidthClass,
  getHistorySessionTone,
  normalizeChatAction,
  getRecentChatHistory,
  getSuggestedBookCardTone,
  shouldShowBookSuggestions,
  shouldRenderDockedComposer,
  type ChatRole,
  type ChatAction,
} from './aiChatPresentation';

interface SuggestedBook {
  id: number;
  title: string;
  authors: string;
  category: string;
  available_copies: number;
  total_copies: number;
  cover_image?: string;
  year?: number | string;
  description?: string;
}

interface OverdueStudent {
  loan_id: number;
  student_name?: string;
  student_id?: string;
  card_code?: string;
  book_title?: string;
  barcode?: string;
  due_at?: string;
  days_overdue?: number;
  overdue_days?: number;
  estimated_fine?: number;
  est_fine?: number;
}

interface UnpaidFineItem {
  id: number;
  student_name: string;
  card_code: string;
  amount: number;
  paid_amount: number;
  remaining_amount: number;
  type: string;
  book_title: string;
  created_at: string;
}

interface LowStockBook {
  id: number;
  title: string;
  available_copies: number;
  total_copies: number;
  category: string;
}

interface TopBorrowedBook {
  id: number;
  title: string;
  category: string;
  total_loans: number;
}

interface IssueCopyItem {
  id: number;
  barcode: string;
  book_title: string;
  status: string;
  status_code: string;
}

interface LecturerBorrowerItem {
  loan_id: number;
  user_id: number;
  name: string;
  card_code: string;
  department: string;
  book_title: string;
  barcode: string;
  borrowed_at: string;
  due_at: string;
  is_overdue: boolean;
  overdue_days: number;
  renew_count: number;
}

interface LockedBorrowerItem {
  user_id: number;
  student_name: string;
  card_code: string;
  department: string;
  lock_reason: string;
  lock_reason_label: string;
  active_loans_count: number;
  overdue_loans_count: number;
  unpaid_fines_count: number;
  unpaid_amount: number;
}

interface AdminStats {
  active_loans_count: number;
  overdue_loans_count: number;
  lecturer_active_loans_count?: number;
  student_active_loans_count?: number;
  lecturer_borrowers?: LecturerBorrowerItem[];
  total_copies: number;
  available_copies: number;
  borrowed_copies: number;
  reserved_copies: number;
  damaged_copies: number;
  lost_copies: number;
  unpaid_fines_count: number;
  total_unpaid_amount: number;
  pending_reservations: number;
  overdue_students?: OverdueStudent[];
  unpaid_fines_list?: UnpaidFineItem[];
  low_stock_books?: LowStockBook[];
  top_borrowed_books?: TopBorrowedBook[];
  issue_copies_list?: IssueCopyItem[];
  locked_users_count?: number;
  locked_users?: LockedBorrowerItem[];
  pending_suggestions_count?: number;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  suggested_books?: SuggestedBook[];
  overdue_students?: OverdueStudent[];
  admin_stats?: AdminStats;
  active_tab?: 'overdue' | 'locked_users' | 'lecturers' | 'inventory' | 'low_stock' | 'fines' | 'top_books' | 'damaged' | 'overview';
  action?: ChatAction;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  messages: Message[];
}

const createWelcomeMessage = (isAdminUser: boolean, isLecturerUser: boolean, userName?: string): Message => ({
  id: `welcome-${Date.now()}`,
  sender: 'ai',
  text: isAdminUser
    ? 'Xin chào Quản trị viên / Thủ thư! Tôi là **UTHie Copilot**, trợ lý điều phối nghiệp vụ Thư viện UTH.'
    : isLecturerUser
    ? 'Kính chào Thầy/Cô! Em là **UTHie**, trợ lý số Thư viện Trường ĐH Giao thông Vận tải TP.HCM. Thầy/Cô cần tra cứu tài liệu nghiên cứu hay quy định thư viện thì nhắn em nhé!'
    : `Chào ${userName ? userName : 'bạn'}! Mình là **UTHie** – trợ lý Thư viện Trường ĐH Giao thông Vận tải TP.HCM (UTH).\n\nMình có thể hỗ trợ bạn tìm giáo trình học tập, tra cứu sách trong kho, kiểm tra hạn trả và giải đáp mọi kiến thức bách khoa. Hãy chọn gợi ý bên dưới hoặc đặt câu hỏi nhé!`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
});

function cleanAndFormatMarkdown(text: string, hasOverdueCards: boolean = false): string {
  if (!text) return '';
  let cleaned = text
    .replace(/```(?:json)?\s*\{[\s\S]*?\}\s*```/gi, '')
    .replace(/\{[\s\r\n]*"(?:action|book_ids|suggested_books|command)"[\s\S]*?\}/gi, '')
    .replace(/\[\s*Gửi thông báo[^\]]*\]/gi, '')
    .trim();

  if (hasOverdueCards && (cleaned.includes('| STT') || cleaned.includes('|:---') || cleaned.includes('|---'))) {
    cleaned = cleaned.replace(/\|\s*STT\s*\|[\s\S]*?(?=\n\s*\n|\n\s*[A-ZÀ-Ỹ]|\s*$)/gi, '');
  } else if (cleaned.includes('|:---') || cleaned.includes('|---')) {
    cleaned = cleaned.replace(/\|\s*((?::?-{3,}:?\s*\|)+)/g, '|\n$1\n');
    cleaned = cleaned.replace(/\|\s*(\d+\s*\|)/g, '|\n| $1');
    cleaned = cleaned.replace(/([^\n])\s*\n(\s*\|[^\n]+\|)/g, '$1\n\n$2');
  }

  cleaned = cleaned.replace(/([^\n])\n(\*\*[A-ZÀ-Ỹ0-9\s]{4,}\*\*)/g, '$1\n\n$2');

  return cleaned.trim();
}

// ─── Custom Markdown Renderer ─────────────────────────────────────────────────
const markdownComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  h1: ({ children }) => (
    <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-4 mb-2 pb-1.5 border-b border-teal-100 flex items-center gap-2">
      <span className="w-1.5 h-4 bg-teal-600 rounded-full inline-block shrink-0" />
      <span>{children}</span>
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-sm sm:text-base font-bold text-teal-900 mt-3.5 mb-1.5 flex items-center gap-2">
      <span className="w-1.5 h-3.5 bg-teal-500 rounded-full inline-block shrink-0" />
      <span>{children}</span>
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xs sm:text-sm font-semibold text-teal-800 mt-3 mb-1 uppercase tracking-wider flex items-center gap-1.5">
      <span className="w-1 h-3 bg-teal-400 rounded-full inline-block shrink-0" />
      <span>{children}</span>
    </h3>
  ),
  p: ({ children }) => (
    <p className="leading-relaxed mb-2.5 last:mb-0 text-slate-800 text-[13.5px] sm:text-[14px]">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-950">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-slate-700">{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-5 space-y-1.5 my-2.5 text-slate-700 text-[13.5px] sm:text-[14px]">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-5 space-y-1.5 my-2.5 text-slate-700 text-[13.5px] sm:text-[14px]">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed pl-0.5 marker:text-teal-600">{children}</li>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <code className="block bg-slate-900 text-slate-100 text-[12px] font-mono rounded-xl p-3.5 my-3 overflow-x-auto whitespace-pre border border-slate-800 shadow-xs">
          {children}
        </code>
      );
    }
    return (
      <code className="bg-teal-50 text-teal-900 text-[12px] font-mono px-1.5 py-0.5 rounded-md border border-teal-200/70 font-semibold">{children}</code>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-teal-500 pl-3.5 pr-2 my-2.5 text-slate-700 italic bg-teal-50/50 py-2 rounded-r-xl text-[13px] sm:text-[14px]">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-slate-200 my-3" />,
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-xl border border-teal-200/80 shadow-xs bg-white">
      <table className="w-full text-[12px] border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gradient-to-r from-teal-700 to-teal-800 text-white font-semibold">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-slate-100">{children}</tbody>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-teal-50/40 transition-colors even:bg-slate-50/70">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-3.5 py-2.5 text-left font-bold text-[11px] tracking-wider whitespace-nowrap uppercase">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-3.5 py-2.5 text-slate-700 whitespace-nowrap">{children}</td>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-teal-600 underline hover:text-teal-800 font-medium transition-colors">
      {children}
    </a>
  ),
};

// ─── Component Chính ───────────────────────────────────────────────────────────
export const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingLoans, setSendingLoans] = useState<number[]>([]);
  const [notifiedLoanIds, setNotifiedLoanIds] = useState<number[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchOverdueQuery, setSearchOverdueQuery] = useState('');
  const [overdueSeverityFilter, setOverdueSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'new'>('all');
  const [lockedBorrowerSearch, setLockedBorrowerSearch] = useState('');
  const [reviewingLockedUserId, setReviewingLockedUserId] = useState<number | null>(null);
  const [unlockReviewReason, setUnlockReviewReason] = useState('');
  const [unlockReviewError, setUnlockReviewError] = useState<string | null>(null);
  const [unlockingUserId, setUnlockingUserId] = useState<number | null>(null);

  // Quản lý tab thống kê bên phải (mở rộng đầy đủ danh mục dữ liệu bao gồm Giảng viên)
  const [sideTab, setSideTab] = useState<'overdue' | 'locked_users' | 'lecturers' | 'inventory' | 'low_stock' | 'fines' | 'top_books' | 'damaged' | 'overview'>('overdue');
  const [latestAdminStats, setLatestAdminStats] = useState<AdminStats | null>(null);
  // Bảng điều phối nghiệp vụ bên phải cho thủ thư: mặc định ẩn để khung chat rộng rãi, thoáng đãng,
  // khi hỏi nghiệp vụ mới tự động mở lên hoặc chủ động bật tắt qua nút header.
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'librarian';
  const isLecturer = user?.role === 'lecturer';
  const chatRole: ChatRole = user?.role || 'student';
  const chatGreeting = getChatGreeting({
    role: chatRole,
    fullName: user?.full_name,
    username: user?.username,
  });
  const chatCanvasTone = getChatCanvasTone();
  const storageKey = getChatStorageKey(user);

  const getInitialSessions = (key: string = storageKey): ChatSession[] => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[UTHie Chat] Failed to load sessions:', e);
    }
    const defaultSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'Đoạn chat mới',
      createdAt: Date.now(),
      messages: [createWelcomeMessage(isAdmin, isLecturer, user?.full_name || user?.username)],
    };
    return [defaultSession];
  };

  const [sessions, setSessions] = useState<ChatSession[]>(getInitialSessions);
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => sessions[0]?.id || `session-${Date.now()}`);
  const activeStorageKeyRef = useRef(storageKey);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [showGreetingBubble, setShowGreetingBubble] = useState(true);

  // Trạng thái xử lý mượn sách 1-click
  const [isReservingBookId, setIsReservingBookId] = useState<number | null>(null);
  const [reservedBookIds, setReservedBookIds] = useState<Set<number>>(new Set());

  const handleConfirmReservation = async (bookId: number, bookTitle?: string, isReady?: boolean) => {
    if (!user) {
      navigate('/login');
      setIsFullscreen(false);
      setIsOpen(false);
      return;
    }
    if (isReservingBookId || reservedBookIds.has(bookId)) return;

    setIsReservingBookId(bookId);
    try {
      const res = await api.post('/reservations', { book_id: bookId });
      setReservedBookIds((prev) => new Set(prev).add(bookId));

      const isReadyResult = res.data?.status === 'ready' || isReady;
      const queuePos = res.data?.queue_position;
      const resId = res.data?.id;

      const confirmText = isReadyResult
        ? `🎉 **Mượn sách thành công!**\n\nCuốn **${bookTitle || 'sách'}** đã được giữ riêng cho bạn tại Quầy lưu thông trong **3 ngày**${resId ? ` (Mã yêu cầu: #${resId})` : ''}. Bạn có thể ghé thư viện nhận sách nhé!`
        : `🎉 **Mượn sách vào hàng chờ thành công!**\n\nBạn đang ở vị trí **#${queuePos || 1}** trong hàng chờ cuốn **${bookTitle || 'sách'}**${resId ? ` (Mã yêu cầu: #${resId})` : ''}. Thư viện sẽ gửi thông báo ngay khi có sách hoàn trả!`;

      const confirmMsg: Message = {
        id: `res-confirm-${Date.now()}`,
        sender: 'ai',
        text: confirmText,
        action: {
          label: 'Xem danh sách mượn / mượn sách',
          path: '/reservations',
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === currentSessionId ? { ...s, messages: [...s.messages, confirmMsg] } : s))
      );
    } catch (err: any) {
      const errorDetail =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Không thể mượn sách lúc này. Vui lòng kiểm tra lại điều kiện thẻ hoặc thử lại sau.';
      const errorMsg: Message = {
        id: `res-err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ **Không thể mượn sách**\n\n${errorDetail}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSessions((prev) =>
        prev.map((s) => (s.id === currentSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s))
      );
    } finally {
      setIsReservingBookId(null);
    }
  };

  // Cho phép người dùng kéo thả popup AI di chuyển trên màn hình
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; initOffsetX: number; initOffsetY: number }>({
    startX: 0,
    startY: 0,
    initOffsetX: 0,
    initOffsetY: 0,
  });

  const handleHeaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isFullscreen) return;
    if (e.button !== 0) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest('button, a, input, textarea, select')) return;

    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initOffsetX: dragOffset.x,
      initOffsetY: dragOffset.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleHeaderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || isFullscreen) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    let nextX = dragStartRef.current.initOffsetX + dx;
    let nextY = dragStartRef.current.initOffsetY + dy;

    if (chatWindowRef.current) {
      const rect = chatWindowRef.current.getBoundingClientRect();
      const baseLeft = rect.left - dragOffset.x;
      const baseTop = rect.top - dragOffset.y;
      const minX = 12 - baseLeft;
      const maxX = window.innerWidth - 12 - (baseLeft + rect.width);
      const minY = 12 - baseTop;
      const maxY = window.innerHeight - 12 - (baseTop + rect.height);
      nextX = Math.min(Math.max(nextX, minX), maxX);
      nextY = Math.min(Math.max(nextY, minY), maxY);
    }

    setDragOffset({ x: nextX, y: nextY });
  };

  const handleHeaderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Cho phép người dùng kéo thả avatar UTHie di chuyển trên màn hình khi thu nhỏ/đóng
  const [avatarOffset, setAvatarOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isAvatarDragging, setIsAvatarDragging] = useState(false);
  const isAvatarDraggingRef = useRef(false);
  const hasAvatarMovedRef = useRef(false);
  const avatarDragStartRef = useRef<{ startX: number; startY: number; initOffsetX: number; initOffsetY: number }>({
    startX: 0,
    startY: 0,
    initOffsetX: 0,
    initOffsetY: 0,
  });

  const handleAvatarPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    isAvatarDraggingRef.current = true;
    hasAvatarMovedRef.current = false;
    avatarDragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initOffsetX: avatarOffset.x,
      initOffsetY: avatarOffset.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleAvatarPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!isAvatarDraggingRef.current) return;
    const dx = e.clientX - avatarDragStartRef.current.startX;
    const dy = e.clientY - avatarDragStartRef.current.startY;

    if (!hasAvatarMovedRef.current) {
      if (Math.hypot(dx, dy) > 5) {
        hasAvatarMovedRef.current = true;
        setIsAvatarDragging(true);
      } else {
        return;
      }
    }

    const rawX = avatarDragStartRef.current.initOffsetX + dx;
    const rawY = avatarDragStartRef.current.initOffsetY + dy;

    // Avatar có kích thước ~68px, nằm trong container `bottom-6 right-6` (cách lề phải và đáy 24px)
    const baseLeft = window.innerWidth - 92;
    const baseTop = window.innerHeight - 92;
    const minX = 12 - baseLeft;
    const maxX = 12;
    const minY = 12 - baseTop;
    const maxY = 12;

    const clampedX = Math.min(Math.max(rawX, minX), maxX);
    const clampedY = Math.min(Math.max(rawY, minY), maxY);

    setAvatarOffset({ x: clampedX, y: clampedY });
  };

  const handleAvatarPointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (!isAvatarDraggingRef.current) return;
    isAvatarDraggingRef.current = false;
    const hadMoved = hasAvatarMovedRef.current;
    setIsAvatarDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    // Nếu không phải thao tác kéo (chỉ click chuột), mở khung chat
    if (!hadMoved) {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  // Tự động căn chỉnh lại vị trí khi kích thước màn hình thay đổi
  useEffect(() => {
    const handleResize = () => {
      if (chatWindowRef.current && !isFullscreen) {
        setDragOffset((prev) => {
          const rect = chatWindowRef.current?.getBoundingClientRect();
          if (!rect) return prev;
          const baseLeft = rect.left - prev.x;
          const baseTop = rect.top - prev.y;
          const minX = 12 - baseLeft;
          const maxX = window.innerWidth - 12 - (baseLeft + rect.width);
          const minY = 12 - baseTop;
          const maxY = window.innerHeight - 12 - (baseTop + rect.height);
          const clampedX = Math.min(Math.max(prev.x, minX), maxX);
          const clampedY = Math.min(Math.max(prev.y, minY), maxY);
          return { x: clampedX, y: clampedY };
        });
      }

      setAvatarOffset((prev) => {
        const baseLeft = window.innerWidth - 92;
        const baseTop = window.innerHeight - 92;
        const minX = 12 - baseLeft;
        const maxX = 12;
        const minY = 12 - baseTop;
        const maxY = 12;
        return {
          x: Math.min(Math.max(prev.x, minX), maxX),
          y: Math.min(Math.max(prev.y, minY), maxY),
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen]);

  // Tự động ẩn dòng thông báo chào của UTHie sau 6 giây để không gây vướng màn hình
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreetingBubble(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  // Lưu sessions vào localStorage mỗi khi có cập nhật
  useEffect(() => {
    if (activeStorageKeyRef.current !== storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(prepareSessionsForStorage(sessions)));
    } catch (e) {
      console.warn('[UTHie Chat] Failed to save sessions:', e);
    }
  }, [sessions, storageKey]);

  useEffect(() => {
    if (activeStorageKeyRef.current === storageKey) return;
    const nextSessions = getInitialSessions(storageKey);
    activeStorageKeyRef.current = storageKey;
    setSessions(nextSessions);
    setCurrentSessionId(nextSessions[0].id);
    setLatestAdminStats(null);
  }, [storageKey]);

  const currentSession = useMemo(() => {
    return sessions.find((s) => s.id === currentSessionId) || sessions[0];
  }, [sessions, currentSessionId]);

  const messages = currentSession?.messages || [];

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'Đoạn chat mới',
      createdAt: Date.now(),
      messages: [createWelcomeMessage(isAdmin, isLecturer, user?.full_name || user?.username)],
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== sessionId);
      if (next.length === 0) {
        const fresh: ChatSession = {
          id: `session-${Date.now()}`,
          title: 'Đoạn chat mới',
          createdAt: Date.now(),
          messages: [createWelcomeMessage(isAdmin, isLecturer, user?.full_name || user?.username)],
        };
        setCurrentSessionId(fresh.id);
        return [fresh];
      }
      if (currentSessionId === sessionId) {
        setCurrentSessionId(next[0].id);
      }
      return next;
    });
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUpRef = useRef(false);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const prevMessagesLengthRef = useRef(messages.length);
  const prevSessionIdRef = useRef(currentSessionId);
  const scrollRafRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const latestOverdueStudents = useMemo(() => {
    if (latestAdminStats?.overdue_students && latestAdminStats.overdue_students.length > 0) {
      return latestAdminStats.overdue_students;
    }
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].overdue_students && messages[i].overdue_students!.length > 0) {
        return messages[i].overdue_students!;
      }
    }
    return [];
  }, [messages, latestAdminStats]);

  const filteredOverdueStudents = useMemo(() => {
    return latestOverdueStudents.filter((s) => {
      const days = s.overdue_days ?? s.days_overdue ?? 1;
      const name = (s.student_name || '').toLowerCase();
      const code = (s.card_code || s.student_id || '').toLowerCase();
      const book = (s.book_title || '').toLowerCase();
      const q = searchOverdueQuery.toLowerCase().trim();

      const matchesSearch = !q || name.includes(q) || code.includes(q) || book.includes(q);
      if (!matchesSearch) return false;

      if (overdueSeverityFilter === 'critical') return days > 30;
      if (overdueSeverityFilter === 'warning') return days > 7 && days <= 30;
      if (overdueSeverityFilter === 'new') return days <= 7;
      return true;
    });
  }, [latestOverdueStudents, searchOverdueQuery, overdueSeverityFilter]);

  const filteredLockedBorrowers = useMemo(() => {
    const query = lockedBorrowerSearch.trim().toLocaleLowerCase('vi-VN');
    const lockedUsers = latestAdminStats?.locked_users ?? [];
    if (!query) return lockedUsers;
    return lockedUsers.filter((student) =>
      [student.student_name, student.card_code, student.department, student.lock_reason_label]
        .some((value) => value.toLocaleLowerCase('vi-VN').includes(query))
    );
  }, [latestAdminStats?.locked_users, lockedBorrowerSearch]);

  const handleUnlockBorrower = async (student: LockedBorrowerItem) => {
    const validationError = validateUnlockReviewReason(unlockReviewReason);
    if (validationError) {
      setUnlockReviewError(validationError);
      return;
    }

    setUnlockingUserId(student.user_id);
    try {
      await api.post(`/users/${student.user_id}/unlock`, {
        review_reason: unlockReviewReason.trim(),
      });
      setLatestAdminStats((previous) => {
        if (!previous) return previous;
        const lockedUsers = (previous.locked_users ?? []).filter(
          (item) => item.user_id !== student.user_id,
        );
        return {
          ...previous,
          locked_users: lockedUsers,
          locked_users_count: lockedUsers.length,
        };
      });
      setReviewingLockedUserId(null);
      setUnlockReviewReason('');
      setUnlockReviewError(null);
      toast.success(`Đã khôi phục quyền mượn trong 30 ngày cho ${student.student_name}.`);
    } catch (error) {
      toast.error(formatApiError(error));
    } finally {
      setUnlockingUserId(null);
    }
  };

  const handleChatScroll = useCallback(() => {
    if (scrollRafRef.current) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const el = chatScrollRef.current;
      if (!el) return;
      const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      const isScrolledUp = distanceToBottom > 120;
      isUserScrolledUpRef.current = isScrolledUp;
      setShowScrollBottomBtn((prev) => (prev !== isScrolledUp ? isScrolledUp : prev));
    });
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = chatScrollRef.current;
    if (!el) {
      messagesEndRef.current?.scrollIntoView({ behavior });
      return;
    }
    if (behavior === 'auto') {
      el.scrollTop = el.scrollHeight;
    } else {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
      });
    }
    isUserScrolledUpRef.current = false;
    setShowScrollBottomBtn(false);
  }, []);

  useEffect(() => {
    if (!isOpen || isMinimized) return;

    const isNewSession = prevSessionIdRef.current !== currentSessionId;
    const isInitialOpen = prevMessagesLengthRef.current === 0 && messages.length > 0;
    const lastMsg = messages[messages.length - 1];
    const isSentByUser = lastMsg?.sender === 'user';

    if (isNewSession || isInitialOpen) {
      scrollToBottom('auto');
      prevSessionIdRef.current = currentSessionId;
      prevMessagesLengthRef.current = messages.length;
      setTimeout(() => inputRef.current?.focus(), 150);
      return;
    }

    if (messages.length !== prevMessagesLengthRef.current) {
      prevMessagesLengthRef.current = messages.length;
      if (isSentByUser || !isUserScrolledUpRef.current) {
        scrollToBottom('smooth');
      }
    }
  }, [isOpen, isMinimized, messages, currentSessionId, scrollToBottom]);

  useEffect(() => {
    if (loading && !isUserScrolledUpRef.current) {
      scrollToBottom('smooth');
    }
  }, [loading, scrollToBottom]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  const handleResetChat = () => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [
              {
                id: `welcome-${Date.now()}`,
                sender: 'ai',
                text: 'Đã làm mới phiên trò chuyện! Mình là **UTHie**, sẵn sàng hỗ trợ bạn.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ],
          };
        }
        return s;
      })
    );
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          const isDefaultTitle = s.title === 'Đoạn chat mới' || s.title.startsWith('Phiên ');
          const smartTitle = isDefaultTitle ? (text.length > 28 ? text.slice(0, 28).trim() + '...' : text) : s.title;
          return {
            ...s,
            title: smartTitle,
            messages: [...s.messages, userMsg],
          };
        }
        return s;
      })
    );

    setInputMessage('');
    setLoading(true);

    try {
      const historyPayload = getRecentChatHistory(messages).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const response = await api.post('/ai/chat/', {
        message: text,
        history: historyPayload,
        session_id: currentSessionId,
        user_role: user?.role || 'student',
        user_id: user?.id,
        card_code: user?.card_code,
      }, AI_CHAT_REQUEST_CONFIG);

      const data = response.data;
      const overdueList = data.overdue_students || [];

      if (data.admin_stats) {
        setLatestAdminStats(data.admin_stats);
      }
      if (data.suggested_tab) {
        setSideTab(data.suggested_tab);
        if (isAdmin) setIsAdminPanelOpen(true);
      } else if (overdueList.length > 0) {
        setSideTab('overdue');
        if (isAdmin) setIsAdminPanelOpen(true);
      } else if (data.admin_stats && isAdmin) {
        setIsAdminPanelOpen(true);
      }

      const aiReply: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: cleanAndFormatMarkdown(data.reply || 'UTHie đã ghi nhận yêu cầu của bạn!', overdueList.length > 0),
        suggested_books: shouldShowBookSuggestions(chatRole) ? data.suggested_books || [] : [],
        overdue_students: overdueList,
        admin_stats: data.admin_stats,
        active_tab: data.suggested_tab,
        action: normalizeChatAction(data.action) || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: [...s.messages, aiReply],
            };
          }
          return s;
        })
      );
    } catch {
      const errorMsg: Message = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'Xin lỗi bạn, kết nối tới máy chủ tạm thời gián đoạn. Bạn thử lại sau ít giây nha!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: [...s.messages, errorMsg],
            };
          }
          return s;
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOverdueNotification = async (loanId: number) => {
    if (sendingLoans.includes(loanId) || notifiedLoanIds.includes(loanId)) return;
    setSendingLoans((prev) => [...prev, loanId]);

    try {
      await api.post('/ai/notify-overdue/', { loan_id: loanId });
      setNotifiedLoanIds((prev) => [...prev, loanId]);
    } catch {
      setNotifiedLoanIds((prev) => [...prev, loanId]);
    } finally {
      setSendingLoans((prev) => prev.filter((id) => id !== loanId));
    }
  };

  const handleSendAllOverdue = async (students: OverdueStudent[]) => {
    const unnotified = students.filter((s) => !notifiedLoanIds.includes(s.loan_id));
    for (const s of unnotified) {
      handleSendOverdueNotification(s.loan_id);
    }
  };

  const handleCopyCardCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectBook = (bookId: number) => {
    navigate(`/books/${bookId}`);
    setIsFullscreen(false);
    setIsMinimized(false);
  };

  // ─── Render Thẻ Sinh Viên Quá Hạn ──────────────────────────────────────────
  const renderStudentOverdueCard = (s: OverdueStudent) => {
    const days = s.overdue_days ?? s.days_overdue ?? 1;
    const fine = s.est_fine ?? s.estimated_fine ?? days * 2000;
    const studentName = s.student_name || 'Sinh viên UTH';
    const studentCode = s.card_code || s.student_id || 'N/A';
    const bookName = s.book_title || 'Tài liệu thư viện';
    const barcode = s.barcode || '';
    const dueAt = s.due_at || '';
    const nameParts = studentName.trim().split(/\s+/);
    const initial = nameParts[nameParts.length - 1]?.charAt(0)?.toUpperCase() || 'S';

    const isNotified = notifiedLoanIds.includes(s.loan_id);
    const isSending = sendingLoans.includes(s.loan_id);

    const severityConfig =
      days > 30
        ? {
            border: 'border-rose-200/90 hover:border-rose-300',
            bg: 'bg-rose-50/50 hover:bg-rose-50/80',
            badgeBg: 'bg-rose-600 text-white',
            label: 'Nghiêm trọng',
          }
        : days > 7
        ? {
            border: 'border-amber-200/90 hover:border-amber-300',
            bg: 'bg-amber-50/50 hover:bg-amber-50/80',
            badgeBg: 'bg-amber-500 text-white',
            label: 'Cảnh báo',
          }
        : {
            border: 'border-yellow-200/90 hover:border-yellow-300',
            bg: 'bg-yellow-50/50 hover:bg-yellow-50/80',
            badgeBg: 'bg-yellow-400 text-yellow-950 font-semibold',
            label: 'Mới quá hạn',
          };

    return (
      <div
        key={s.loan_id}
        className={`rounded-2xl border p-3 transition-all duration-200 shadow-xs hover:shadow-sm ${severityConfig.bg} ${severityConfig.border}`}
      >
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#006F70] to-[#008B8B] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm ring-2 ring-white">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs text-gray-900 truncate">{studentName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-mono font-medium text-gray-600 bg-white/95 px-1.5 py-0.2 rounded border border-gray-200/80">
                  {studentCode}
                </span>
                <button
                  onClick={() => handleCopyCardCode(studentCode)}
                  className="text-gray-400 hover:text-teal-700 transition-colors"
                  title="Sao chép MSSV"
                >
                  {copiedCode === studentCode ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <CopyIcon className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${severityConfig.badgeBg}`}>
              Quá {days} ngày
            </span>
            <span className="text-[9px] text-gray-400 mt-0.5 font-medium">{severityConfig.label}</span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-gray-200/60 text-[11px]">
          <p className="font-semibold text-gray-800 line-clamp-1">{bookName}</p>
          <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-gray-500 mt-1">
            {barcode && <span>Mã vạch: <strong className="font-mono text-gray-700">{barcode}</strong></span>}
            {dueAt && <span>Hạn trả: <strong className="text-gray-700">{dueAt}</strong></span>}
          </div>

          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-dashed border-gray-200">
            <div>
              <span className="text-[10px] text-gray-500 block">Tiền phạt tạm tính:</span>
              <span className="font-bold text-rose-600 text-xs">
                {Number(fine).toLocaleString('vi-VN')} VNĐ
              </span>
            </div>

            <button
              onClick={() => handleSendOverdueNotification(s.loan_id)}
              disabled={isNotified || isSending}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-xs active:scale-95 ${
                isNotified
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                  : isSending
                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-wait'
                  : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-rose-500/20'
              }`}
            >
              {isNotified ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Đã gửi nhắc</span>
                </>
              ) : isSending ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 fill-current" />
                  <span>Gửi thông báo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAdminDataUnavailable = () => (
    <div className="flex-1 p-4 flex items-center justify-center">
      <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xs">
        <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-3 text-sm font-bold text-slate-800">Chưa có dữ liệu thống kê</p>
        <p className="mt-1 text-xs text-slate-500">
          Hãy hỏi UTHie về tình hình thư viện để tải số liệu mới nhất từ hệ thống.
        </p>
      </div>
    </div>
  );

  // ─── Render Tab Giảng Viên Mượn Sách ───────────────────────────────────────
  const renderLecturersPanel = () => {
    if (!latestAdminStats) return renderAdminDataUnavailable();
    const list = latestAdminStats?.lecturer_borrowers ?? [];

    return (
      <div className="p-4 space-y-4 overflow-y-auto flex-1 ai-smooth-scroll ai-chat-scrollbar">
        <div className="bg-gradient-to-br from-[#006F70] to-[#004D40] text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-teal-400/30 text-teal-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Ưu đãi GV: 10 cuốn / 30 ngày
              </span>
            </div>
            <h3 className="text-xl font-bold mt-1">Danh Sách Giảng Viên Mượn Sách</h3>
            <p className="text-xs text-teal-100 mt-1">
              Hiện có {latestAdminStats?.lecturer_active_loans_count ?? list.length} cuốn sách đang được Quý Thầy/Cô mượn phục vụ nghiên cứu & giảng dạy.
            </p>
          </div>
          <GraduationCap className="w-10 h-10 text-amber-300 shrink-0" />
        </div>

        {list.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-teal-100 text-center shadow-xs">
            <CheckCheck className="w-10 h-10 text-teal-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-800">Không có sách giảng viên đang mượn</p>
            <p className="text-xs text-gray-500 mt-1">Toàn bộ tài liệu dành cho giảng viên đã được hoàn trả về kho.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {list.map((lb) => (
              <div
                key={lb.loan_id}
                className="bg-white p-4 rounded-2xl border border-teal-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                      <GraduationCap className="w-5 h-5 text-teal-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{lb.name}</h4>
                      <p className="text-[11px] text-gray-500 font-mono flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-gray-700">{lb.card_code}</span>
                        <span>•</span>
                        <span className="text-teal-700 font-sans font-medium">{lb.department}</span>
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-xl ${
                      lb.is_overdue
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {lb.is_overdue ? `Quá hạn ${lb.overdue_days} ngày` : 'Đang mượn'}
                  </span>
                </div>

                <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100 text-xs">
                  <p className="font-bold text-gray-900 text-[13px]">{lb.book_title}</p>
                  <div className="mt-2.5 flex flex-wrap items-center justify-between text-[11px] text-gray-600 gap-2 border-t border-gray-200/60 pt-2">
                    <span className="font-mono text-gray-500">Mã vạch: <strong>{lb.barcode}</strong></span>
                    <span>Hạn trả: <strong className="text-teal-800">{lb.due_at}</strong></span>
                    <span className="text-gray-400">Đã gia hạn: {lb.renew_count}/1 lần</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ─── Render Tab Tồn Kho Bản Sao ────────────────────────────────────────────
  const renderInventoryPanel = () => {
    if (!latestAdminStats) return renderAdminDataUnavailable();
    const stats = latestAdminStats;

    const total = stats.total_copies || 1;
    const availPct = ((stats.available_copies / total) * 100).toFixed(1);
    const borrowPct = ((stats.borrowed_copies / total) * 100).toFixed(1);
    const reservedPct = ((stats.reserved_copies / total) * 100).toFixed(1);
    const issuesPct = (((stats.damaged_copies + stats.lost_copies) / total) * 100).toFixed(1);

    return (
      <div className="p-4 space-y-4 overflow-y-auto flex-1 ai-smooth-scroll ai-chat-scrollbar">
        <div className="bg-gradient-to-br from-teal-900 to-teal-800 text-white p-4 rounded-2xl shadow-md relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-200 text-xs font-medium">Tổng số bản sao trong hệ thống</p>
              <h3 className="text-2xl font-black tracking-tight mt-0.5">{stats.total_copies.toLocaleString('vi-VN')} bản</h3>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Khả dụng {availPct}%</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/15">
            <div className="flex items-center justify-between text-[11px] text-teal-100 mb-1.5">
              <span>Cơ cấu trạng thái tài liệu</span>
              <span>100% kho sách</span>
            </div>
            <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden flex shadow-inner">
              <div style={{ width: `${availPct}%` }} className="bg-emerald-400 transition-all duration-500" title={`Sẵn sàng: ${stats.available_copies}`} />
              <div style={{ width: `${borrowPct}%` }} className="bg-blue-400 transition-all duration-500" title={`Đang mượn: ${stats.borrowed_copies}`} />
              <div style={{ width: `${reservedPct}%` }} className="bg-amber-400 transition-all duration-500" title={`Chờ nhận sách: ${stats.reserved_copies}`} />
              <div style={{ width: `${issuesPct}%` }} className="bg-rose-400 transition-all duration-500" title={`Hỏng/Mất: ${stats.damaged_copies + stats.lost_copies}`} />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-teal-200 mt-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Sẵn sàng ({stats.available_copies})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Đang mượn ({stats.borrowed_copies})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Chờ nhận sách ({stats.reserved_copies})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> Hỏng/Mất ({stats.damaged_copies + stats.lost_copies})</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-xs hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">Sẵn sàng phục vụ</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xl font-bold text-emerald-700 mt-1">{stats.available_copies} bản</p>
            <p className="text-[11px] text-gray-500 mt-1">Đang nằm trên giá sách các cơ sở, bạn đọc có thể tới mượn ngay.</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-xs hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">Đang lưu thông (mượn)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            </div>
            <p className="text-xl font-bold text-blue-700 mt-1">{stats.borrowed_copies} bản</p>
            <p className="text-[11px] text-gray-500 mt-1">
              Trong đó có <strong className="text-rose-600 font-semibold">{stats.overdue_loans_count} bản</strong> đã trễ hạn cần thu hồi.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-amber-100 shadow-xs hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">Đang chờ nhận sách / Mượn sách</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            </div>
            <p className="text-xl font-bold text-amber-700 mt-1">{stats.reserved_copies} bản</p>
            <p className="text-[11px] text-gray-500 mt-1">Dành cho sách đã sẵn sàng để bạn đọc nhận tại quầy lưu thông.</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-xs hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">Hao hụt / Báo hỏng</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            </div>
            <p className="text-xl font-bold text-rose-700 mt-1">{stats.damaged_copies + stats.lost_copies} bản</p>
            <p className="text-[11px] text-gray-500 mt-1">
              Gồm {stats.damaged_copies} bản hư hỏng & {stats.lost_copies} bản báo mất đang chờ bồi thường.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap gap-2">
          <button
            onClick={() => {
              navigate('/admin/copies');
              setIsFullscreen(false);
            }}
            className="flex-1 py-2 px-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Mở trang Quản lý Bản sao & Mã vạch</span>
          </button>
        </div>
      </div>
    );
  };

  // ─── Render Tab Sách Gần Hết Bản Sao ──────────────────────────────────────
  const renderLowStockPanel = () => {
    if (!latestAdminStats) return renderAdminDataUnavailable();
    const list = latestAdminStats?.low_stock_books ?? [];

    return (
      <div className="p-4 space-y-4 overflow-y-auto flex-1 ai-smooth-scroll ai-chat-scrollbar">
        <div className="bg-gradient-to-br from-amber-900 to-amber-800 text-white p-4 rounded-2xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-200 text-xs font-medium">Báo động Bản sao Khả dụng</p>
              <h3 className="text-xl font-black mt-0.5">{list.length} đầu sách sắp hết bản sẵn</h3>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200">
              <PackageX className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-amber-100 mt-2">
            Các đầu sách có số bản sao sẵn sàng $\le 1$ bản. Đề xuất thủ thư lên kế hoạch mua bổ sung hoặc đôn đốc thu hồi sách đang mượn.
          </p>
        </div>

        <div className="space-y-2.5">
          {list.map((b) => (
            <div
              key={b.id}
              className="bg-white p-3.5 rounded-2xl border border-amber-100/90 shadow-xs hover:shadow-sm transition-all flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-gray-900 truncate">{b.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{b.category}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.available_copies === 0
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {b.available_copies === 0 ? 'Hết sạch bản sẵn (0 cuốn)' : `Chỉ còn ${b.available_copies} cuốn`}
                  </span>
                  <span className="text-[10px] text-gray-400">Tổng kho: {b.total_copies} bản</span>
                </div>
              </div>

              <button
                onClick={() => handleSelectBook(b.id)}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95"
              >
                Xem sách
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── Render Tab Phiếu Phạt Chưa Thu ────────────────────────────────────────
  const renderFinesPanel = () => {
    if (!latestAdminStats) return renderAdminDataUnavailable();
    const stats = latestAdminStats;

    const finesList = stats.unpaid_fines_list || [];

    return (
      <div className="p-4 space-y-4 overflow-y-auto flex-1 ai-smooth-scroll ai-chat-scrollbar">
        <div className="bg-gradient-to-br from-rose-900 via-rose-800 to-rose-950 text-white p-4 rounded-2xl shadow-md relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-200 text-xs font-medium">Tổng tiền phạt chưa thu từ bạn đọc</p>
              <h3 className="text-2xl font-black tracking-tight mt-0.5">
                {stats.total_unpaid_amount.toLocaleString('vi-VN')} VNĐ
              </h3>
            </div>
            <div className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-200 font-bold text-xs flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{stats.unpaid_fines_count} phiếu phạt tồn đọng</span>
            </div>
          </div>
          <p className="text-[11px] text-rose-200 mt-2">
            Bao gồm tiền phạt quá hạn mượn sách (2.000đ/ngày) và bồi thường hư hại tài liệu.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              <span>Danh Sách Phiếu Phạt Cần Xử Lý</span>
            </h4>
            <button
              onClick={() => {
                navigate('/admin/fines');
                setIsFullscreen(false);
              }}
              className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả trên trang Quản lý</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {finesList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center text-gray-500 text-xs">
              <DollarSign className="w-8 h-8 text-rose-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">Đang ghi nhận {stats.unpaid_fines_count} phiếu phạt chưa thu.</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Thủ thư có thể thu phạt trực tiếp bằng tiền mặt hoặc QR qua cổng Quản lý Phạt.
              </p>
              <button
                onClick={() => {
                  navigate('/admin/fines');
                  setIsFullscreen(false);
                }}
                className="mt-3 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Mở trang Thu Phạt & Thanh Toán
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {finesList.map((f) => (
                <div
                  key={f.id}
                  className="bg-white p-3 rounded-2xl border border-rose-100 shadow-xs hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-xs text-gray-900">{f.student_name}</p>
                      <p className="text-[10px] font-mono text-gray-500 mt-0.5">MSSV: {f.card_code}</p>
                    </div>
                    <span className="text-xs font-black text-rose-600">
                      {f.remaining_amount.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
                    <span className="truncate max-w-[200px]" title={f.book_title}>{f.book_title}</span>
                    <span className="text-[10px] text-gray-400">{f.created_at}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── Render Tab Sinh Viên Bị Khóa Quyền Mượn ─────────────────────────────
  const renderLockedBorrowersPanel = () => {
    if (!latestAdminStats) return renderAdminDataUnavailable();
    const lockedUsers = latestAdminStats.locked_users ?? [];

    return (
      <div className="flex-1 overflow-y-auto p-4 ai-smooth-scroll ai-chat-scrollbar">
        <div className="mb-4 rounded-2xl bg-[#E6F4F3] p-4 ring-1 ring-teal-200/80">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-700">
                Xem xét ngoại lệ tại quầy
              </p>
              <h3 className="mt-1 text-lg font-bold text-slate-950">
                {lockedUsers.length} sinh viên đang bị khóa mượn
              </h3>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-teal-950/70">
                Kiểm tra nghĩa vụ còn tồn và ghi rõ căn cứ trước khi khôi phục quyền mượn sách.
              </p>
            </div>
            <div className="rounded-xl bg-white/80 p-2 text-teal-700 ring-1 ring-teal-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={lockedBorrowerSearch}
            onChange={(event) => setLockedBorrowerSearch(event.target.value)}
            placeholder="Tìm theo họ tên, MSSV, khoa hoặc lý do khóa..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        {filteredLockedBorrowers.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
            <CheckCheck className="mb-2 h-9 w-9 text-emerald-500" />
            <p className="text-sm font-semibold text-slate-700">
              {lockedUsers.length === 0 ? 'Không có sinh viên bị khóa quyền mượn.' : 'Không tìm thấy sinh viên phù hợp.'}
            </p>
            <p className="mt-1 text-xs text-slate-400">Danh sách sẽ cập nhật theo dữ liệu tài khoản thực tế.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLockedBorrowers.map((student) => {
              const isReviewing = reviewingLockedUserId === student.user_id;
              const hasOutstandingObligations = student.overdue_loans_count > 0 || student.unpaid_amount > 0;
              return (
                <article
                  key={student.user_id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-xs font-bold text-rose-700 ring-1 ring-rose-200">
                          {student.student_name.trim().charAt(0).toLocaleUpperCase('vi-VN')}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-950">{student.student_name}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            <span className="font-mono">{student.card_code}</span>
                            <span className="mx-1.5 text-slate-300">•</span>
                            {student.department}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-700 ring-1 ring-rose-200">
                        Đang khóa mượn
                      </span>
                    </div>

                    <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Lý do khóa</p>
                      <p className="mt-1 text-xs font-medium text-slate-700">{student.lock_reason_label}</p>
                    </div>

                    <div className="mt-3 grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-white py-2.5 text-center">
                      <div className="px-2">
                        <p className="text-sm font-bold text-slate-900">{student.active_loans_count}</p>
                        <p className="text-[10px] text-slate-500">Đang mượn</p>
                      </div>
                      <div className="px-2">
                        <p className={`text-sm font-bold ${student.overdue_loans_count > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                          {student.overdue_loans_count}
                        </p>
                        <p className="text-[10px] text-slate-500">Quá hạn</p>
                      </div>
                      <div className="px-2">
                        <p className={`text-sm font-bold ${student.unpaid_amount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                          {student.unpaid_amount.toLocaleString('vi-VN')}đ
                        </p>
                        <p className="text-[10px] text-slate-500">Nợ phạt</p>
                      </div>
                    </div>

                    {!isReviewing && (
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-[10px] leading-relaxed text-slate-500">
                          {hasOutstandingObligations
                            ? 'Còn nghĩa vụ chưa hoàn tất — chỉ mở khóa khi có căn cứ ngoại lệ rõ ràng.'
                            : 'Không còn nghĩa vụ tồn đọng trong hệ thống.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setReviewingLockedUserId(student.user_id);
                            setUnlockReviewReason('');
                            setUnlockReviewError(null);
                          }}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-300"
                        >
                          <Unlock className="h-3.5 w-3.5" />
                          Xem xét mở khóa
                        </button>
                      </div>
                    )}
                  </div>

                  {isReviewing && (
                    <div className="border-t border-teal-100 bg-teal-50/60 p-4">
                      <label htmlFor={`unlock-reason-${student.user_id}`} className="text-xs font-semibold text-slate-800">
                        Căn cứ mở khóa <span className="text-rose-600">*</span>
                      </label>
                      <textarea
                        id={`unlock-reason-${student.user_id}`}
                        value={unlockReviewReason}
                        onChange={(event) => {
                          setUnlockReviewReason(event.target.value);
                          if (unlockReviewError) setUnlockReviewError(null);
                        }}
                        maxLength={500}
                        rows={3}
                        placeholder="Ghi rõ tình huống chính đáng và bằng chứng đã kiểm tra..."
                        className={`mt-1.5 w-full resize-none rounded-xl border bg-white p-3 text-xs leading-relaxed text-slate-800 outline-none transition focus:ring-2 ${
                          unlockReviewError
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                            : 'border-teal-200 focus:border-teal-500 focus:ring-teal-100'
                        }`}
                      />
                      <div className="mt-1 flex items-start justify-between gap-3">
                        <p className={`text-[10px] ${unlockReviewError ? 'font-medium text-rose-600' : 'text-slate-500'}`}>
                          {unlockReviewError || 'Ngoại lệ có hiệu lực 30 ngày; lý do được lưu vào nhật ký kiểm toán.'}
                        </p>
                        <span className="text-[10px] tabular-nums text-slate-400">{unlockReviewReason.length}/500</span>
                      </div>
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReviewingLockedUserId(null);
                            setUnlockReviewReason('');
                            setUnlockReviewError(null);
                          }}
                          disabled={unlockingUserId === student.user_id}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-white disabled:opacity-50"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUnlockBorrower(student)}
                          disabled={unlockingUserId === student.user_id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"
                        >
                          {unlockingUserId === student.user_id ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ShieldCheck className="h-3.5 w-3.5" />
                          )}
                          Xác nhận khôi phục quyền mượn
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ─── Render Tab Top Sách Mượn Nhiều Nhất ────────────────────────────────────
  const renderTopBooksPanel = () => {
    if (!latestAdminStats) return renderAdminDataUnavailable();
    const list = latestAdminStats?.top_borrowed_books ?? [];

    return (
      <div className="p-4 space-y-4 overflow-y-auto flex-1 ai-smooth-scroll ai-chat-scrollbar">
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-xs font-medium">Bảng xếp hạng tài liệu được quan tâm</p>
            <h3 className="text-xl font-black mt-0.5">Top Sách Lưu Thông Cao Nhất</h3>
            <p className="text-[11px] text-indigo-100 mt-1">Dữ liệu tổng hợp từ toàn bộ lịch sử phiếu mượn thực tế tại UTH.</p>
          </div>
          <Flame className="w-8 h-8 text-amber-400 shrink-0" />
        </div>

        <div className="space-y-2.5">
          {list.map((tb, idx) => (
            <div
              key={tb.id}
              className="bg-white p-3.5 rounded-2xl border border-indigo-100 shadow-xs hover:shadow-sm transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center shrink-0 shadow-xs ${
                    idx === 0
                      ? 'bg-amber-400 text-amber-950'
                      : idx === 1
                      ? 'bg-slate-300 text-slate-800'
                      : idx === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-gray-900 truncate">{tb.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{tb.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100">
                  {tb.total_loans} lượt mượn
                </span>
                <button
                  onClick={() => handleSelectBook(tb.id)}
                  className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-lg transition-colors"
                  title="Xem sách"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── Render Tab Hư Hỏng & Báo Mất ──────────────────────────────────────────
  const renderDamagedPanel = () => {
    if (!latestAdminStats) return renderAdminDataUnavailable();
    const list = latestAdminStats?.issue_copies_list ?? [];

    return (
      <div className="p-4 space-y-4 overflow-y-auto flex-1 ai-smooth-scroll ai-chat-scrollbar">
        <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-rose-200 text-xs font-medium">Bảo quản & Phục hồi Tài liệu</p>
            <h3 className="text-xl font-bold mt-0.5">Bản Sao Hư Hỏng & Báo Mất</h3>
            <p className="text-[11px] text-rose-100 mt-1">Cần lập biên bản đánh giá tỷ lệ hao hại hoặc xử lý thủ tục đền bù.</p>
          </div>
          <Wrench className="w-7 h-7 text-rose-400 shrink-0" />
        </div>

        <div className="space-y-2.5">
          {list.map((c) => (
            <div
              key={c.id}
              className="bg-white p-3.5 rounded-2xl border border-rose-100/90 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-gray-900 truncate">{c.book_title}</p>
                <p className="text-[10px] font-mono text-gray-500 mt-0.5">Mã vạch: {c.barcode}</p>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-xl shrink-0 ${
                  c.status_code === 'damaged'
                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                    : 'bg-rose-100 text-rose-900 border border-rose-200'
                }`}
              >
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── Render Tab Tổng Quan Lưu Thông ─────────────────────────────────────────
  const renderOverviewPanel = () => {
    if (!latestAdminStats) return renderAdminDataUnavailable();
    const stats = latestAdminStats;

    return (
      <div className="p-4 space-y-4 overflow-y-auto flex-1 ai-smooth-scroll ai-chat-scrollbar">
        <div className="bg-gradient-to-br from-[#006F70] to-[#008B8B] text-white p-4 rounded-2xl shadow-md">
          <p className="text-teal-200 text-xs font-medium">Báo cáo Nhịp Độ Lưu Thông Thư Viện UTH</p>
          <h3 className="text-xl font-bold mt-0.5">Hệ thống đang phục vụ ổn định</h3>
          <p className="text-xs text-teal-100 mt-1">
            Tổng cộng {stats.active_loans_count} lượt mượn đang diễn ra với {stats.total_copies} bản sao tài liệu sẵn có.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-2xl border border-gray-200">
            <p className="text-[11px] text-gray-500 font-medium">Sách đang cho mượn</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{stats.active_loans_count} cuốn</p>
            <span className="text-[10px] text-teal-600">Lưu thông bình thường</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-rose-100 bg-rose-50/30">
            <p className="text-[11px] text-rose-700 font-medium">Sách mượn trễ hạn</p>
            <p className="text-lg font-bold text-rose-600 mt-0.5">{stats.overdue_loans_count} cuốn</p>
            <span className="text-[10px] text-rose-500">Cần đôn đốc thu hồi</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-gray-200">
            <p className="text-[11px] text-gray-500 font-medium">Mượn sách đang chờ</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{stats.pending_reservations} yêu cầu</p>
            <span className="text-[10px] text-gray-400">Giữ 3 ngày tại quầy</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-amber-100 bg-amber-50/30">
            <p className="text-[11px] text-amber-700 font-medium">Nợ phạt tồn đọng</p>
            <p className="text-lg font-bold text-amber-800 mt-0.5">
              {stats.total_unpaid_amount.toLocaleString('vi-VN')} đ
            </p>
            <span className="text-[10px] text-amber-600">{stats.unpaid_fines_count} phiếu phạt</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-gray-200">
            <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
              <UserX className="w-3 h-3 text-rose-500" />
              <span>Thẻ bạn đọc bị khóa</span>
            </p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{stats.locked_users_count ?? 1} tài khoản</p>
            <span className="text-[10px] text-gray-400">Trễ hạn nghiêm trọng</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-gray-200">
            <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
              <Inbox className="w-3 h-3 text-teal-600" />
              <span>Đề xuất mua sách mới</span>
            </p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{stats.pending_suggestions_count ?? 0} đề xuất</p>
            <span className="text-[10px] text-gray-400">Đang chờ thủ thư duyệt</span>
          </div>
        </div>
      </div>
    );
  };

  // ─── Kích Thước Khung Chat ──────────────────────────────────────────────────
  const windowClass = isFullscreen
    ? 'fixed inset-2 sm:inset-3 md:inset-4 w-auto h-auto rounded-3xl z-[9999]'
    : 'h-[650px] max-h-[90vh] w-[94vw] sm:w-[480px]';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none font-sans">
      {/* 1. NÚT TRÒN BONG BÓNG & TOOLTIP AVATAR */}
      {!isOpen && (() => {
        const isAvatarNearLeft = typeof window !== 'undefined' && window.innerWidth - 92 + avatarOffset.x < 240;
        return (
          <div
            style={
              avatarOffset.x !== 0 || avatarOffset.y !== 0
                ? { transform: `translate3d(${avatarOffset.x}px, ${avatarOffset.y}px, 0)` }
                : undefined
            }
            className={`relative flex items-center group touch-none select-none ${
              isAvatarDragging ? 'transition-none' : 'transition-transform duration-200'
            } ${isAvatarNearLeft ? 'flex-row-reverse' : ''}`}
          >
            <div
              onClick={() => {
                setIsOpen(true);
                setIsMinimized(false);
              }}
              className={`cursor-pointer ${
                isAvatarNearLeft ? 'ml-3.5' : 'mr-3.5'
              } px-3.5 py-2 rounded-2xl bg-white text-teal-950 text-xs font-semibold shadow-xl border border-teal-200/90 flex items-center gap-2 hover:bg-teal-50 transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap relative ${
                showGreetingBubble
                  ? 'opacity-100 translate-x-0 pointer-events-auto'
                  : 'opacity-0 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <span className="tracking-wide">
                {isAdmin ? 'UTHie sẵn sàng hỗ trợ quản lý!' : 'UTHie luôn hỗ trợ bạn!'}
              </span>
              {isAvatarNearLeft ? (
                <>
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-white drop-shadow-sm" />
                  <div className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[7px] border-y-transparent border-r-[9px] border-r-teal-200 -z-10" />
                </>
              ) : (
                <>
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-white drop-shadow-sm" />
                  <div className="absolute -right-[9px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[7px] border-y-transparent border-l-[9px] border-l-teal-200 -z-10" />
                </>
              )}
            </div>

            <div className="relative">
              <span className="absolute -inset-1.5 rounded-full bg-teal-400 opacity-60 blur-sm animate-pulse pointer-events-none" />
              <span className="absolute -inset-1 rounded-full border-2 border-teal-400/80 animate-ping opacity-30 pointer-events-none" />

              <button
                onPointerDown={handleAvatarPointerDown}
                onPointerMove={handleAvatarPointerMove}
                onPointerUp={handleAvatarPointerUp}
                onPointerCancel={handleAvatarPointerUp}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setAvatarOffset({ x: 0, y: 0 });
                }}
                aria-label="Mở trợ lý ảo UTHie"
                className={`relative w-[68px] h-[68px] rounded-full overflow-hidden shadow-2xl transition-all duration-200 flex items-center justify-center border-3 border-teal-500 bg-white ring-4 ring-teal-500/25 z-10 touch-none ${
                  isAvatarDragging
                    ? 'cursor-grabbing scale-105 ring-teal-500/50'
                    : 'cursor-grab hover:scale-105 active:scale-95'
                }`}
                title="Kéo để di chuyển UTHie (Nhấp đúp để về góc, click để mở chat)"
              >
                <img
                  src={uthieAvatarImg}
                  alt="UTHie Avatar"
                  className="w-full h-full object-cover pointer-events-none select-none"
                  draggable={false}
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm z-20 pointer-events-none" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* 2. CỬA SỔ CHAT UTHie AI */}
      {isOpen && (
        <>
          {isFullscreen && (
            <div
              className="fixed inset-0 bg-slate-900/60 z-[9998] transition-opacity duration-200"
              onClick={() => setIsFullscreen(false)}
            />
          )}

          <div
            ref={chatWindowRef}
            style={
              !isFullscreen && (dragOffset.x !== 0 || dragOffset.y !== 0)
                ? { transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)` }
                : undefined
            }
            className={`flex flex-col bg-white rounded-3xl shadow-xl border border-teal-200/60 overflow-hidden ${
              isDragging ? 'transition-none select-none shadow-teal-950/40' : 'shadow-teal-950/20'
            } origin-bottom-right ${windowClass} ${
              !isMinimized && !isFullscreen ? 'animate-in fade-in zoom-in-95' : ''
            }`}
          >
            {/* ── HEADER CỬA SỔ CHAT ── */}
            <div
              onPointerDown={handleHeaderPointerDown}
              onPointerMove={handleHeaderPointerMove}
              onPointerUp={handleHeaderPointerUp}
              onPointerCancel={handleHeaderPointerUp}
              onDoubleClick={(e) => {
                if ((e.target as HTMLElement).closest('button, a, input')) return;
                setDragOffset({ x: 0, y: 0 });
              }}
              className={`bg-gradient-to-r from-[#006F70] via-[#008B8B] to-[#00A896] px-3 sm:px-3.5 py-1.5 sm:py-2 text-white flex items-center justify-between shadow-md relative overflow-hidden shrink-0 select-none touch-none ${
                isFullscreen ? '' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              title={!isFullscreen ? 'Kéo để di chuyển khung chat (Nhấp đúp để về góc)' : undefined}
            >
              <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

              <div className="flex items-center gap-2 relative z-10">
                {/* Nút toggle Sidebar Lịch sử trò chuyện */}
                {!isMinimized && (
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-1 hover:bg-white/15 hover:text-white rounded-lg transition-all active:scale-90"
                    title={isSidebarOpen ? 'Thu gọn lịch sử chat' : 'Mở lịch sử chat'}
                  >
                    {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
                  </button>
                )}

                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/80 shadow-xs shrink-0 bg-white ring-1 ring-white/20">
                  <img
                    src={uthieAvatarImg}
                    alt="UTHie Avatar"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 border border-white rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 leading-none">
                    <h3 className="font-bold text-xs sm:text-[13px] tracking-wide">UTHie AI</h3>
                    <span className="bg-amber-400 text-amber-950 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5 shadow-2xs">
                      <Sparkles className="w-2 h-2 fill-current" />
                      {isAdmin ? 'COPILOT' : 'TRỢ LÝ'}
                    </span>
                  </div>
                  <p className="text-[10px] text-teal-100 font-medium leading-tight truncate max-w-[140px] sm:max-w-none mt-0.5">
                    {isAdmin ? 'Trợ lý Nghiệp vụ Thư viện UTH' : 'Trợ lý tra cứu Thư viện UTH'}
                  </p>
                </div>
              </div>

              {/* Grip icon ở giữa báo hiệu có thể kéo */}
              {!isFullscreen && (
                <div
                  className="hidden sm:flex items-center justify-center opacity-40 hover:opacity-80 transition-opacity pointer-events-none mx-1"
                  title="Kéo để di chuyển"
                >
                  <GripHorizontal className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Nhóm nút điều khiển Header */}
              <div className="flex items-center gap-0.5 sm:gap-1 text-teal-100 relative z-10">
                {!isMinimized && (
                  <>
                    {!isSidebarOpen && (
                      <button
                        onClick={handleNewChat}
                        className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-[11px] font-semibold transition-all active:scale-95 shadow-2xs"
                        title="Tạo đoạn chat mới"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Chat mới</span>
                      </button>
                    )}
                    <button
                      onClick={handleResetChat}
                      className="p-1 hover:bg-white/15 hover:text-white rounded-lg transition-colors active:scale-90"
                      title="Làm mới phiên trò chuyện hiện tại"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    {isFullscreen && isAdmin && (
                      <button
                        onClick={() => setIsAdminPanelOpen(!isAdminPanelOpen)}
                        className={`p-1 rounded-lg transition-all active:scale-90 flex items-center gap-1 ${
                          isAdminPanelOpen
                            ? 'bg-white/25 text-white'
                            : 'hover:bg-white/15 text-teal-100 hover:text-white'
                        }`}
                        title={isAdminPanelOpen ? 'Thu gọn bảng điều phối' : 'Mở bảng điều phối nghiệp vụ'}
                      >
                        {isAdminPanelOpen ? (
                          <PanelRightClose className="w-3.5 h-3.5" />
                        ) : (
                          <PanelRight className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden xl:inline text-[11px] font-semibold">
                          {isAdminPanelOpen ? 'Thu gọn bảng' : 'Bảng nghiệp vụ'}
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-1 hover:bg-white/15 hover:text-white rounded-lg transition-colors active:scale-90"
                      title={isFullscreen ? 'Thu nhỏ bình thường (Esc)' : 'Mở rộng toàn màn hình'}
                    >
                      {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setShowGreetingBubble(false);
                    setIsOpen(false);
                    setIsMinimized(false);
                    if (isFullscreen) setIsFullscreen(false);
                  }}
                  className="p-1 hover:bg-white/15 hover:text-white rounded-lg transition-colors active:scale-90"
                  title="Thu nhỏ về avatar"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsFullscreen(false);
                  }}
                  className="p-1 hover:bg-white/15 hover:text-white rounded-lg transition-colors active:scale-90"
                  title="Đóng chat"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── NỘI DUNG CHAT (ẨN KHI MINIMIZED) ── */}
            {!isMinimized && (
              <div className="flex-1 flex overflow-hidden">
                {/* ── CỘT LỊCH SỬ CHAT (SIDEBAR PHONG CÁCH GEMINI) ── */}
                {isSidebarOpen && (
                  <div className={`flex flex-col bg-[#EEF3F5] border-r border-slate-300/80 shrink-0 transition-all duration-300 z-10 ${
                    isFullscreen ? 'w-64 sm:w-72' : 'w-52 sm:w-60'
                  }`}>
                    {/* Header Sidebar: New chat button */}
                    <div className="p-2.5 border-b border-slate-200/80">
                      <button
                        onClick={handleNewChat}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-[#008B8B] to-[#00A896] hover:brightness-105 active:scale-95 text-white rounded-xl font-semibold text-xs shadow-xs transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Đoạn chat mới</span>
                      </button>
                    </div>

                    {/* Section label */}
                    <div className="px-3.5 pt-3 pb-2 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                        <span>Lịch sử trò chuyện</span>
                      </div>
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded-full font-bold">
                        {sessions.length}
                      </span>
                    </div>

                    {/* Danh sách các phiên trò chuyện */}
                    <div className="flex-1 overflow-y-auto px-2.5 pb-3 space-y-2 ai-smooth-scroll ai-chat-scrollbar">
                      {sessions.map((s) => {
                        const isActive = s.id === currentSessionId;
                        return (
                          <div
                            key={s.id}
                            onClick={() => setCurrentSessionId(s.id)}
                            className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${getHistorySessionTone(isActive)}`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1">
                              <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                              <span className="truncate text-xs">{s.title || 'Đoạn chat'}</span>
                            </div>
                            {sessions.length > 1 && (
                              <button
                                onClick={(e) => handleDeleteSession(s.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-md transition-all shrink-0"
                                title="Xóa đoạn chat này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer sidebar: User info */}
                    <div className="p-3 border-t border-slate-200/80 bg-white/60 flex items-center gap-2 text-xs">
                      <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                        {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 truncate text-[11px]">{user?.full_name || user?.username || 'Bạn đọc UTH'}</p>
                        <p className="text-[10px] text-slate-400 truncate">{isAdmin ? 'Quản trị viên / Thủ thư' : isLecturer ? 'Giảng viên' : 'Sinh viên'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── CỘT 2: VÙNG TRÒ CHUYỆN VÀ NHẬP LIỆU ── */}
                <div
                  className={`flex flex-col flex-1 h-full overflow-hidden transition-all duration-300 ${
                    isFullscreen && isAdmin && isAdminPanelOpen
                      ? 'md:max-w-[480px] lg:max-w-[560px] xl:max-w-[620px] border-r border-gray-200'
                      : 'w-full'
                  }`}
                >
                  {/* Danh sách tin nhắn */}
                  <div className="relative flex-1 overflow-hidden bg-[#0E979D]">
                    <div
                      aria-hidden="true"
                      className={`${chatCanvasTone.backgroundLayerClass} pointer-events-none select-none`}
                      style={{ backgroundImage: `url(${uthChatBackgroundImg})`, transform: 'translateZ(0)' }}
                    />
                    <div aria-hidden="true" className={`${chatCanvasTone.tintLayerClass} pointer-events-none`} />
                    <div
                      ref={chatScrollRef}
                      onScroll={handleChatScroll}
                      className="relative z-10 h-full overflow-y-auto p-4 sm:p-6 ai-smooth-scroll ai-chat-scrollbar"
                    >
                      <div className={`${getConversationWidthClass(isFullscreen, isAdmin)} min-h-full space-y-5`}>
                      {/* Màn hình bắt đầu tối giản, tập trung vào một hành động */}
                      {messages.length <= 1 && (
                        <div className="min-h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-300 pb-8">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-teal-200/80 shadow-sm ring-4 ring-teal-500/10 mb-5 bg-white">
                            <img src={uthieAvatarImg} alt="UTHie AI" className="w-full h-full object-cover" />
                          </div>
                          <div className={`max-w-2xl rounded-2xl px-5 sm:px-8 py-4 ${chatCanvasTone.welcomeSurfaceClass}`}>
                            <h2 className="text-xl sm:text-3xl font-semibold text-[#14383D] tracking-tight">
                              {chatGreeting} {isAdmin ? 'Hôm nay cần xử lý nghiệp vụ nào?' : 'Bạn muốn bắt đầu từ đâu?'}
                            </h2>
                            <p className="text-xs sm:text-sm text-[#46666A] max-w-lg mx-auto mt-2 leading-relaxed font-medium">
                              {isAdmin
                                ? 'UTHie Copilot hỗ trợ theo dõi lưu thông, quá hạn, tồn kho và công nợ thư viện.'
                                : isLecturer
                                  ? 'UTHie hỗ trợ tra cứu tài liệu nghiên cứu, sách đang mượn và chính sách dành cho giảng viên.'
                                  : 'UTHie hỗ trợ tìm giáo trình, tra cứu tài liệu và kiểm tra tình trạng mượn trả.'}
                            </p>
                          </div>
                        </div>
                      )}

                      {messages.filter((msg) => !msg.id.startsWith('welcome-')).map((msg) => {
                        const totalFine = (msg.overdue_students || []).reduce((acc, s) => {
                          const days = s.overdue_days ?? s.days_overdue ?? 1;
                          return acc + (s.est_fine ?? s.estimated_fine ?? days * 2000);
                        }, 0);

                        return (
                          <div
                            key={msg.id}
                            className={`flex items-start gap-3 ${
                              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                            }`}
                          >
                            <div
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 shadow-xs flex items-center justify-center ${
                                msg.sender === 'user'
                                  ? 'bg-gradient-to-tr from-amber-600 to-amber-500 text-white shadow-xs'
                                  : 'border border-teal-300/80 bg-white ring-1 ring-teal-500/10'
                              }`}
                            >
                              {msg.sender === 'user' ? (
                                <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                              ) : (
                                <img src={uthieAvatarImg} alt="UTHie" className="w-full h-full object-cover" />
                              )}
                            </div>

                            <div
                              className={`rounded-2xl ${
                                msg.sender === 'user'
                                  ? 'w-fit max-w-[85%] sm:max-w-[70%] ml-auto p-3.5 sm:p-4 bg-[#006F70] text-white border border-teal-300/30 rounded-tr-xs shadow-xs'
                                  : `w-full max-w-full sm:max-w-[92%] p-4 sm:p-5.5 rounded-tl-xs ${chatCanvasTone.assistantMessageClass}`
                              }`}
                            >
                              {msg.sender === 'ai' ? (
                                <div className="leading-relaxed">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                    {cleanAndFormatMarkdown(msg.text)}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                <div className="whitespace-pre-wrap leading-relaxed font-normal text-[13.5px] sm:text-[14.5px]">
                                  {msg.text}
                                </div>
                              )}

                              {msg.sender === 'ai' && msg.action && (
                                msg.action.type === 'reservation' && msg.action.book_id ? (
                                  <div className="mt-3.5 p-3 rounded-2xl bg-white/95 border-2 border-teal-200/90 shadow-md flex flex-col gap-2.5">
                                    <div className="flex items-center justify-between text-xs font-semibold text-teal-950">
                                      <span className="flex items-center gap-1.5">
                                        {msg.action.is_ready ? (
                                          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                                        ) : (
                                          <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                                        )}
                                        <span className="font-bold">
                                          {msg.action.is_ready ? '⚡ Sách sẵn sàng mượn tại quầy' : '⏳ Sách đang chờ vào hàng chờ'}
                                        </span>
                                      </span>
                                      <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-bold border border-teal-200/60">
                                        Mã sách #{msg.action.book_id}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      disabled={isReservingBookId === msg.action.book_id || reservedBookIds.has(msg.action.book_id)}
                                      onClick={() =>
                                        handleConfirmReservation(
                                          msg.action!.book_id!,
                                          msg.action!.book_title,
                                          msg.action!.is_ready
                                        )
                                      }
                                      className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-[13px] font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 ${
                                        reservedBookIds.has(msg.action.book_id)
                                          ? 'bg-emerald-600 text-white cursor-default'
                                          : isReservingBookId === msg.action.book_id
                                          ? 'bg-teal-700 text-white cursor-wait opacity-90'
                                          : msg.action.is_ready
                                          ? 'bg-gradient-to-r from-[#006F70] via-[#008B8B] to-[#00A896] hover:brightness-105 text-white hover:shadow-lg'
                                          : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:brightness-105 text-white hover:shadow-lg'
                                      }`}
                                    >
                                      {reservedBookIds.has(msg.action.book_id) ? (
                                        <>
                                          <Check className="w-4 h-4 text-emerald-200" />
                                          <span>Đã ghi nhận yêu cầu mượn!</span>
                                        </>
                                      ) : isReservingBookId === msg.action.book_id ? (
                                        <>
                                          <RefreshCw className="w-4 h-4 animate-spin" />
                                          <span>Đang xử lý mượn sách...</span>
                                        </>
                                      ) : (
                                        <>
                                          {msg.action.is_ready ? (
                                            <Sparkles className="w-4 h-4" />
                                          ) : (
                                            <RotateCcw className="w-4 h-4" />
                                          )}
                                          <span>{msg.action.label}</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const targetPath =
                                        msg.action!.label.toLowerCase().includes('mượn sách') && msg.action!.path === '/profile'
                                          ? '/reservations'
                                          : msg.action!.path;
                                      navigate(targetPath);
                                      setIsFullscreen(false);
                                      setIsOpen(false);
                                    }}
                                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#006F70] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#005B5C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    <span>{msg.action.label}</span>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  </button>
                                )
                              )}

                              {/* Thẻ sinh viên mượn quá hạn (chỉ hiện trong chat nếu không phải Fullscreen) */}
                              {!isFullscreen && msg.overdue_students && msg.overdue_students.length > 0 && (
                                <div className="mt-3.5 pt-3 border-t border-rose-100 space-y-2.5">
                                  <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-rose-50 to-orange-50 px-3 py-2 rounded-xl border border-rose-200/80 shadow-xs">
                                    <div>
                                      <div className="flex items-center gap-1.5 text-rose-950 font-bold text-xs">
                                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                        <span>{msg.overdue_students.length} bạn đọc mượn quá hạn</span>
                                      </div>
                                      <p className="text-[10px] text-gray-500 mt-0.5">
                                        Tổng phạt tạm tính:{' '}
                                        <strong className="text-rose-600 font-bold">
                                          {totalFine.toLocaleString('vi-VN')} VNĐ
                                        </strong>
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => handleSendAllOverdue(msg.overdue_students!)}
                                      className="text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl transition-all active:scale-95 shadow-xs flex items-center gap-1 shrink-0"
                                    >
                                      <Bell className="w-3 h-3 fill-current" />
                                      <span>Nhắc tất cả</span>
                                    </button>
                                  </div>

                                  <div className="space-y-2">
                                    {msg.overdue_students.map((s) => renderStudentOverdueCard(s))}
                                  </div>
                                </div>
                              )}

                              {/* Thẻ sách gợi ý từ DB */}
                              {shouldShowBookSuggestions(chatRole) && msg.suggested_books && msg.suggested_books.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                  <div className="text-xs sm:text-[13px] font-bold text-teal-900 flex items-center gap-1.5 mb-3">
                                    <BookOpen className="w-4 h-4 text-teal-600" />
                                    <span>Tài liệu đề xuất trong Thư viện UTH (Click để xem vị trí kệ & mượn sách):</span>
                                  </div>
                                  <div className={isFullscreen && !isAdmin ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "space-y-2.5"}>
                                    {msg.suggested_books.map((b, index) => {
                                      const tone = getSuggestedBookCardTone(index);
                                      return (
                                        <div
                                          key={b.id}
                                          onClick={() => handleSelectBook(b.id)}
                                          className={`group cursor-pointer p-3.5 rounded-xl border transition-colors duration-150 flex items-center justify-between hover:border-teal-500 shadow-2xs ${tone.surfaceClass}`}
                                        >
                                          <div className="flex-1 pr-2">
                                            <p className="font-bold text-teal-950 group-hover:text-teal-800 line-clamp-1 text-xs sm:text-[13.5px]">
                                              {b.title}
                                            </p>
                                            <p className={`text-[11px] sm:text-xs line-clamp-1 mt-0.5 ${tone.metadataClass}`}>
                                              {b.authors} • <span className="font-semibold">{b.category}</span>
                                            </p>
                                            <div className="mt-2 flex items-center gap-2">
                                              <span
                                                className={`text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-semibold tracking-wide flex items-center gap-1 border ${
                                                  b.available_copies > 0
                                                    ? 'bg-emerald-600 text-white border-emerald-700'
                                                    : 'bg-rose-600 text-white border-rose-700'
                                                }`}
                                              >
                                                <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
                                                {b.available_copies > 0
                                                  ? `Còn ${b.available_copies} cuốn sẵn sàng`
                                                  : 'Đang hết bản sẵn'}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            <button
                                              type="button"
                                              disabled={isReservingBookId === b.id || reservedBookIds.has(b.id)}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleConfirmReservation(b.id, b.title, b.available_copies > 0);
                                              }}
                                              className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 shadow-2xs active:scale-95 ${
                                                reservedBookIds.has(b.id)
                                                  ? 'bg-emerald-600 text-white cursor-default'
                                                  : isReservingBookId === b.id
                                                  ? 'bg-teal-700 text-white opacity-80 cursor-wait'
                                                  : b.available_copies > 0
                                                  ? 'bg-[#008B8B] hover:bg-[#006F70] text-white hover:shadow-sm'
                                                  : 'bg-amber-600 hover:bg-amber-700 text-white hover:shadow-sm'
                                              }`}
                                              title={b.available_copies > 0 ? 'Mượn sách tại quầy (giữ 3 ngày)' : 'Mượn sách vào hàng chờ'}
                                            >
                                              {reservedBookIds.has(b.id) ? (
                                                <>
                                                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                                                  <span>Đã đặt</span>
                                                </>
                                              ) : isReservingBookId === b.id ? (
                                                <>
                                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                  <span>Đang đặt...</span>
                                                </>
                                              ) : b.available_copies > 0 ? (
                                                <>
                                                  <Sparkles className="w-3.5 h-3.5" />
                                                  <span>Mượn sách</span>
                                                </>
                                              ) : (
                                                <>
                                                  <RotateCcw className="w-3.5 h-3.5" />
                                                  <span>Mượn sách</span>
                                                </>
                                              )}
                                            </button>
                                            <div className="flex items-center gap-0.5 text-teal-800 group-hover:text-teal-950 font-semibold text-xs">
                                              <span className="hidden sm:inline">Chi tiết</span>
                                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Footer tin nhắn: Thời gian + nút Sao chép */}
                              <div className="flex items-center justify-between text-[10px] mt-2.5 pt-2 border-t border-slate-100/80">
                                <span className={msg.sender === 'user' ? 'text-teal-100/90 font-medium' : 'text-slate-400 font-medium'}>
                                  {msg.timestamp}
                                </span>
                                {msg.sender === 'ai' && (
                                  <button
                                    onClick={() => handleCopyText(msg.id, msg.text)}
                                    className="flex items-center gap-1 text-slate-400 hover:text-teal-700 px-2 py-0.5 rounded-md hover:bg-teal-50 transition-colors"
                                    title="Sao chép nội dung"
                                  >
                                    {copiedMsgId === msg.id ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        <span className="text-emerald-600 font-medium">Đã chép</span>
                                      </>
                                    ) : (
                                      <>
                                        <CopyIcon className="w-3 h-3" />
                                        <span>Sao chép</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {loading && (
                        <div className="flex items-center gap-2.5 animate-in fade-in duration-200">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden shrink-0 border border-teal-400 bg-white ring-2 ring-teal-500/20">
                            <img
                              src={uthieAvatarImg}
                              alt="UTHie"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className={`px-4 py-3 rounded-2xl rounded-tl-none inline-flex items-center gap-1.5 ${chatCanvasTone.loadingSurfaceClass}`}>
                            <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                      </div>
                    </div>

                    {/* Nút nổi cuộn mượt xuống cuối khi người dùng cuộn lên đọc tin nhắn cũ */}
                    {showScrollBottomBtn && (
                      <button
                        type="button"
                        onClick={() => scrollToBottom('smooth')}
                        className="absolute bottom-4 right-6 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#005B5C] hover:bg-[#004D4E] text-white text-xs font-semibold shadow-md border border-teal-300/40 transition-colors active:scale-95"
                        aria-label="Cuộn xuống tin nhắn mới nhất"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>Xuống cuối</span>
                      </button>
                    )}
                  </div>

                  {/* Ô nhập luôn ghim ở đáy, kể cả khi bắt đầu đoạn chat mới */}
                  {shouldRenderDockedComposer(messages.length) && (
                    <div className="p-3 sm:p-4 bg-[#DCEFED] border-t border-teal-300/80 shadow-xs shrink-0">
                      <div className={`${getConversationWidthClass(isFullscreen, isAdmin)} flex items-center gap-2.5`}>
                        <input
                          ref={inputRef}
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={isAdmin ? 'Nhập nghiệp vụ cần kiểm tra...' : messages.length <= 1 ? 'Hỏi UTHie bất kỳ điều gì...' : 'Hỏi tiếp UTHie...'}
                          disabled={loading}
                          className="flex-1 text-xs sm:text-[14px] bg-[#F7FCFB] hover:bg-white focus:bg-white text-[#183B3F] placeholder-[#6B898C] px-4 py-3 rounded-2xl border border-teal-200 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all shadow-inner"
                        />
                        <button
                          onClick={() => handleSendMessage()}
                          disabled={!inputMessage.trim() || loading}
                          aria-label="Gửi câu hỏi"
                          className="w-11 h-11 rounded-2xl bg-teal-700 hover:bg-teal-800 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-sm shrink-0"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── CỘT 3: BẢNG ĐIỀU PHỐI ĐA NĂNG CHO THỦ THƯ (FULLSCREEN MODE DÀNH RIÊNG CHO ADMIN) ── */}
                {isFullscreen && isAdmin && isAdminPanelOpen && (
                  <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300 border-l border-gray-200">
                    {/* Header Tabs: Đầy đủ 8 Danh Mục Thống Kê */}
                    <div className="p-2.5 bg-white border-b border-gray-200 flex items-center justify-between gap-2 shrink-0 shadow-xs">
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0">
                        <button
                          onClick={() => setSideTab('overdue')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            sideTab === 'overdue'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Quá hạn</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                              sideTab === 'overdue' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {latestOverdueStudents.length}
                          </span>
                        </button>

                        <button
                          onClick={() => setSideTab('locked_users')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            sideTab === 'locked_users'
                              ? 'bg-teal-800 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Khóa mượn</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                              sideTab === 'locked_users' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {getAdminMetricLabel(latestAdminStats?.locked_users_count)}
                          </span>
                        </button>

                        <button
                          onClick={() => setSideTab('lecturers')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            sideTab === 'lecturers'
                              ? 'bg-teal-800 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>Giảng viên</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                              sideTab === 'lecturers' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {getAdminMetricLabel(latestAdminStats?.lecturer_active_loans_count ?? latestAdminStats?.lecturer_borrowers?.length)}
                          </span>
                        </button>

                        <button
                          onClick={() => setSideTab('inventory')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            sideTab === 'inventory'
                              ? 'bg-teal-700 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Tồn kho</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                              sideTab === 'inventory' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {getAdminMetricLabel(latestAdminStats?.total_copies)}
                          </span>
                        </button>

                        <button
                          onClick={() => setSideTab('low_stock')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            sideTab === 'low_stock'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <PackageX className="w-3.5 h-3.5" />
                          <span>Sắp hết</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                              sideTab === 'low_stock' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {getAdminMetricLabel(latestAdminStats?.low_stock_books?.length)}
                          </span>
                        </button>

                        <button
                          onClick={() => setSideTab('fines')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            sideTab === 'fines'
                              ? 'bg-rose-700 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Phiếu phạt</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                              sideTab === 'fines' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {getAdminMetricLabel(latestAdminStats?.unpaid_fines_count)}
                          </span>
                        </button>

                        <button
                          onClick={() => setSideTab('top_books')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            sideTab === 'top_books'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>Top sách</span>
                        </button>

                        <button
                          onClick={() => setSideTab('damaged')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            sideTab === 'damaged'
                              ? 'bg-slate-800 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Hỏng & Mất</span>
                        </button>

                        <button
                          onClick={() => setSideTab('overview')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            sideTab === 'overview'
                              ? 'bg-teal-900 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Tổng quan</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {sideTab === 'overdue' && latestOverdueStudents.length > 0 && (
                          <button
                            onClick={() => handleSendAllOverdue(latestOverdueStudents)}
                            className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                          >
                            <Bell className="w-3 h-3 fill-current" />
                            <span>Nhắc tất cả</span>
                          </button>
                        )}
                        <button
                          onClick={() => setIsAdminPanelOpen(false)}
                          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors ml-0.5 shrink-0"
                          title="Thu gọn bảng điều phối (để mở rộng khung chat)"
                        >
                          <PanelRightClose className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Nội dung render theo tab đang chọn */}
                    {sideTab === 'overdue' && (
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="p-3 bg-white/80 border-b border-gray-200/80 flex flex-wrap items-center gap-2 text-xs shrink-0">
                          <div className="relative flex-1 min-w-[200px]">
                            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={searchOverdueQuery}
                              onChange={(e) => setSearchOverdueQuery(e.target.value)}
                              placeholder="Tìm theo tên sinh viên, MSSV, tên sách..."
                              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-teal-500"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setOverdueSeverityFilter('all')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                                overdueSeverityFilter === 'all'
                                  ? 'bg-teal-700 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Tất cả
                            </button>
                            <button
                              onClick={() => setOverdueSeverityFilter('critical')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                                overdueSeverityFilter === 'critical'
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              }`}
                            >
                              &gt;30 ngày
                            </button>
                            <button
                              onClick={() => setOverdueSeverityFilter('warning')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                                overdueSeverityFilter === 'warning'
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              }`}
                            >
                              8-30 ngày
                            </button>
                            <button
                              onClick={() => setOverdueSeverityFilter('new')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                                overdueSeverityFilter === 'new'
                                  ? 'bg-yellow-400 text-yellow-950 font-bold'
                                  : 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100'
                              }`}
                            >
                              &le;7 ngày
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 ai-smooth-scroll ai-chat-scrollbar">
                          {filteredOverdueStudents.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                              <Check className="w-12 h-12 text-emerald-500 mb-2 stroke-1" />
                              <p className="font-semibold text-gray-600 text-sm">
                                {latestOverdueStudents.length === 0
                                  ? 'Không có sinh viên mượn quá hạn trong phiên hiện tại.'
                                  : 'Không tìm thấy kết quả phù hợp với bộ lọc.'}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Hỏi UTHie: "Sinh viên đang mượn quá hạn" để cập nhật dữ liệu mới nhất.
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                              {filteredOverdueStudents.map((s) => renderStudentOverdueCard(s))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {sideTab === 'locked_users' && renderLockedBorrowersPanel()}
                    {sideTab === 'lecturers' && renderLecturersPanel()}
                    {sideTab === 'inventory' && renderInventoryPanel()}
                    {sideTab === 'low_stock' && renderLowStockPanel()}
                    {sideTab === 'fines' && renderFinesPanel()}
                    {sideTab === 'top_books' && renderTopBooksPanel()}
                    {sideTab === 'damaged' && renderDamagedPanel()}
                    {sideTab === 'overview' && renderOverviewPanel()}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
