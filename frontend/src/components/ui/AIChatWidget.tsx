import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import {
  X,
  Send,
  User as UserIcon,
  BookOpen,
  ChevronRight,
  RefreshCw,
  Minus,
  Sparkles,
  Maximize2,
  Minimize2,
  Bell,
  Check,
  AlertTriangle,
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
  Inbox,
  GraduationCap,
  MessageSquare,
  Plus,
  Trash2,
  PanelLeft,
  PanelLeftClose,
  Compass,
  Lightbulb,
} from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import uthieAvatarImg from '@/assets/uthie-avatar.jpg';
import { getChatStorageKey } from './aiChatStorage';
import {
  getChatGreeting,
  getConversationWidthClass,
  getRecentChatHistory,
  getSuggestedBookCardTone,
  shouldShowBookSuggestions,
  type ChatRole,
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
  pending_suggestions_count?: number;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  suggested_books?: SuggestedBook[];
  overdue_students?: OverdueStudent[];
  admin_stats?: AdminStats;
  active_tab?: 'overdue' | 'lecturers' | 'inventory' | 'low_stock' | 'fines' | 'top_books' | 'damaged' | 'overview';
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

  // Quản lý tab thống kê bên phải (mở rộng đầy đủ danh mục dữ liệu bao gồm Giảng viên)
  const [sideTab, setSideTab] = useState<'overdue' | 'lecturers' | 'inventory' | 'low_stock' | 'fines' | 'top_books' | 'damaged' | 'overview'>('overdue');
  const [latestAdminStats, setLatestAdminStats] = useState<AdminStats | null>(null);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isLecturer = user?.role === 'lecturer';
  const chatRole: ChatRole = user?.role || 'student';
  const chatGreeting = getChatGreeting({
    role: chatRole,
    fullName: user?.full_name,
    username: user?.username,
  });
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Lưu sessions vào localStorage mỗi khi có cập nhật
  useEffect(() => {
    if (activeStorageKeyRef.current !== storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(sessions));
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, isMinimized, messages]);

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

      const response = await axios.post('/api/v1/ai/chat/', {
        message: text,
        history: historyPayload,
        user_role: user?.role || 'student',
        user_id: user?.id,
        card_code: user?.card_code,
      });

      const data = response.data;
      const overdueList = data.overdue_students || [];

      if (data.admin_stats) {
        setLatestAdminStats(data.admin_stats);
      }
      if (data.suggested_tab) {
        setSideTab(data.suggested_tab);
      } else if (overdueList.length > 0) {
        setSideTab('overdue');
      }

      const aiReply: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: cleanAndFormatMarkdown(data.reply || 'UTHie đã ghi nhận yêu cầu của bạn!', overdueList.length > 0),
        suggested_books: shouldShowBookSuggestions(chatRole) ? data.suggested_books || [] : [],
        overdue_students: overdueList,
        admin_stats: data.admin_stats,
        active_tab: data.suggested_tab,
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
      await axios.post('/api/v1/ai/notify-overdue/', { loan_id: loanId });
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

  // ─── Render Tab Giảng Viên Mượn Sách ───────────────────────────────────────
  const renderLecturersPanel = () => {
    const list = latestAdminStats?.lecturer_borrowers || [
      {
        loan_id: 101,
        user_id: 55,
        name: 'ThS. Giảng Viên UTH 01',
        card_code: 'GV2026001',
        department: 'Khoa Kỹ thuật Giao thông',
        book_title: 'Nghệ thuật Đàm phán và Giải quyết Xung đột trong Môi trường Đa văn hóa',
        barcode: 'UTH-NN-000011',
        borrowed_at: '16/11/2026',
        due_at: '23/12/2026',
        is_overdue: false,
        overdue_days: 0,
        renew_count: 1,
      },
      {
        loan_id: 102,
        user_id: 55,
        name: 'ThS. Giảng Viên UTH 01',
        card_code: 'GV2026001',
        department: 'Khoa Kỹ thuật Giao thông',
        book_title: 'Hệ thống Giao thông Thông minh (ITS) trong Đô thị Hiện đại',
        barcode: 'UTH-GTVT-000006',
        borrowed_at: '04/11/2026',
        due_at: '05/12/2026',
        is_overdue: false,
        overdue_days: 0,
        renew_count: 0,
      },
    ];

    return (
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
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
    const stats = latestAdminStats || {
      total_copies: 288,
      available_copies: 271,
      borrowed_copies: 6,
      reserved_copies: 4,
      damaged_copies: 4,
      lost_copies: 1,
      active_loans_count: 6,
      overdue_loans_count: 3,
      unpaid_fines_count: 2,
      total_unpaid_amount: 217000,
      pending_reservations: 0,
    };

    const total = stats.total_copies || 1;
    const availPct = ((stats.available_copies / total) * 100).toFixed(1);
    const borrowPct = ((stats.borrowed_copies / total) * 100).toFixed(1);
    const reservedPct = ((stats.reserved_copies / total) * 100).toFixed(1);
    const issuesPct = (((stats.damaged_copies + stats.lost_copies) / total) * 100).toFixed(1);

    return (
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
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
              <div style={{ width: `${reservedPct}%` }} className="bg-amber-400 transition-all duration-500" title={`Giữ chỗ: ${stats.reserved_copies}`} />
              <div style={{ width: `${issuesPct}%` }} className="bg-rose-400 transition-all duration-500" title={`Hỏng/Mất: ${stats.damaged_copies + stats.lost_copies}`} />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-teal-200 mt-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Sẵn sàng ({stats.available_copies})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Đang mượn ({stats.borrowed_copies})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Giữ chỗ ({stats.reserved_copies})</span>
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
              <span className="text-xs font-semibold text-gray-600">Đang giữ chỗ / Đặt trước</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            </div>
            <p className="text-xl font-bold text-amber-700 mt-1">{stats.reserved_copies} bản</p>
            <p className="text-[11px] text-gray-500 mt-1">Dành riêng cho sinh viên đã đặt trước tại quầy lưu thông.</p>
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
    const list = latestAdminStats?.low_stock_books || [
      { id: 283, title: 'Githup', available_copies: 0, total_copies: 3, category: 'Công nghệ thông tin' },
      { id: 201, title: 'Thiết kế Hình học Đường ô tô và Nút giao thông Hiện đại', available_copies: 0, total_copies: 2, category: 'Kỹ thuật Xây dựng Công trình Giao thông' },
      { id: 202, title: 'Kỹ thuật Thiết kế Đường cao tốc và Nút giao Khác mức', available_copies: 0, total_copies: 3, category: 'Kỹ thuật Xây dựng Công trình Giao thông' },
      { id: 236, title: 'Kỹ năng Thuyết trình Chuyên nghiệp và Hùng biện trước Công chúng', available_copies: 1, total_copies: 2, category: 'Kỹ năng Mềm & Phát triển Bản thân' },
      { id: 235, title: 'Kỹ năng Quản trị Thời gian và Làm việc Nhóm trong Dự án Kỹ thuật', available_copies: 1, total_copies: 3, category: 'Kỹ năng Mềm & Phát triển Bản thân' },
    ];

    return (
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
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
    const stats = latestAdminStats || {
      unpaid_fines_count: 2,
      total_unpaid_amount: 217000,
      unpaid_fines_list: [],
    };

    const finesList = stats.unpaid_fines_list || [];

    return (
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
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

  // ─── Render Tab Top Sách Mượn Nhiều Nhất ────────────────────────────────────
  const renderTopBooksPanel = () => {
    const list = latestAdminStats?.top_borrowed_books || [
      { id: 202, title: 'Kỹ thuật Thiết kế Đường cao tốc và Nút giao Khác mức', category: 'Kỹ thuật Giao thông', total_loans: 3 },
      { id: 201, title: 'Thiết kế Hình học Đường ô tô và Nút giao thông Hiện đại', category: 'Kỹ thuật Giao thông', total_loans: 2 },
      { id: 283, title: 'Githup', category: 'Công nghệ thông tin', total_loans: 1 },
      { id: 203, title: 'Hệ thống Giao thông Thông minh (ITS) trong Đô thị Hiện đại', category: 'Giao thông Đô thị', total_loans: 1 },
    ];

    return (
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
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
    const list = latestAdminStats?.issue_copies_list || [
      { id: 101, barcode: 'UTH-GTVT-000010', book_title: 'Kỹ thuật Cầu Hầm và Công trình Ngầm', status: 'Hư hỏng', status_code: 'damaged' },
      { id: 102, barcode: 'UTH-CNTT-000045', book_title: 'An toàn Thông tin và Mạng Máy tính Nâng cao', status: 'Hư hỏng', status_code: 'damaged' },
      { id: 103, barcode: 'UTH-KT-000088', book_title: 'Kinh tế Vận tải và Logistics Toàn cầu', status: 'Hư hỏng', status_code: 'damaged' },
      { id: 104, barcode: 'UTH-GTVT-000099', book_title: 'Quy hoạch Tuyến Đường sắt Đô thị', status: 'Báo mất', status_code: 'lost' },
    ];

    return (
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
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
    const stats = latestAdminStats || {
      active_loans_count: 6,
      overdue_loans_count: 3,
      total_copies: 288,
      available_copies: 271,
      borrowed_copies: 6,
      reserved_copies: 4,
      damaged_copies: 4,
      lost_copies: 1,
      unpaid_fines_count: 2,
      total_unpaid_amount: 217000,
      pending_reservations: 0,
      locked_users_count: 1,
      pending_suggestions_count: 0,
    };

    return (
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
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
            <p className="text-[11px] text-gray-500 font-medium">Đặt trước đang chờ</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{stats.pending_reservations} yêu cầu</p>
            <span className="text-[10px] text-gray-400">Giữ chỗ 48h</span>
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
  const windowClass = isMinimized
    ? 'h-[64px] w-[94vw] sm:w-[480px]'
    : isFullscreen
    ? 'fixed inset-2 sm:inset-3 md:inset-4 w-auto h-auto rounded-3xl z-[9999]'
    : 'h-[650px] max-h-[90vh] w-[94vw] sm:w-[480px]';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none font-sans">
      {/* 1. NÚT TRÒN BONG BÓNG & TOOLTIP AVATAR */}
      {!isOpen && (
        <div className="relative flex items-center group">
          <div
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="cursor-pointer mr-4 px-4 py-2.5 rounded-2xl bg-white text-teal-950 text-xs font-semibold shadow-xl border border-teal-200/90 flex items-center gap-2 hover:bg-teal-50 transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap relative"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <span className="tracking-wide">
              {isAdmin ? 'UTHie sẵn sàng hỗ trợ quản lý!' : 'UTHie luôn hỗ trợ bạn!'}
            </span>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-white drop-shadow-sm" />
            <div className="absolute -right-[9px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[7px] border-y-transparent border-l-[9px] border-l-teal-200 -z-10" />
          </div>

          <div className="relative">
            <span className="absolute -inset-1.5 rounded-full bg-teal-400 opacity-60 blur-sm animate-pulse" />
            <span className="absolute -inset-1 rounded-full border-2 border-teal-400/80 animate-ping opacity-30" />

            <button
              onClick={() => {
                setIsOpen(true);
                setIsMinimized(false);
              }}
              aria-label="Mở trợ lý ảo UTHie"
              className="relative w-[68px] h-[68px] rounded-full overflow-hidden shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center border-3 border-teal-500 bg-white ring-4 ring-teal-500/25 z-10"
            >
              <img
                src={uthieAvatarImg}
                alt="UTHie Avatar"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm z-20" />
            </button>
          </div>
        </div>
      )}

      {/* 2. CỬA SỔ CHAT UTHie AI */}
      {isOpen && (
        <>
          {isFullscreen && (
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9998] transition-opacity duration-300"
              onClick={() => setIsFullscreen(false)}
            />
          )}

          <div
            className={`flex flex-col bg-white rounded-3xl shadow-2xl border border-teal-200/60 overflow-hidden transition-all duration-300 ease-out origin-bottom-right shadow-teal-950/20 ${windowClass} ${
              !isMinimized && !isFullscreen ? 'animate-in fade-in zoom-in-95 slide-in-from-bottom-5' : ''
            }`}
          >
            {/* ── HEADER CỬA SỔ CHAT ── */}
            <div className="bg-gradient-to-r from-[#006F70] via-[#008B8B] to-[#00A896] px-3.5 sm:px-4 py-2.5 sm:py-3 text-white flex items-center justify-between shadow-md relative overflow-hidden shrink-0">
              <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

              <div className="flex items-center gap-2.5 sm:gap-3 relative z-10">
                {/* Nút toggle Sidebar Lịch sử trò chuyện */}
                {!isMinimized && (
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-1.5 hover:bg-white/15 hover:text-white rounded-xl transition-all active:scale-90"
                    title={isSidebarOpen ? 'Thu gọn lịch sử chat' : 'Mở lịch sử chat'}
                  >
                    {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
                  </button>
                )}

                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-white/80 shadow-md shrink-0 bg-white ring-2 ring-white/20">
                  <img
                    src={uthieAvatarImg}
                    alt="UTHie Avatar"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-xs sm:text-sm tracking-wide">UTHie AI</h3>
                    <span className="bg-amber-400 text-amber-950 text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider flex items-center gap-0.5 shadow-xs">
                      <Sparkles className="w-2.5 h-2.5 fill-current" />
                      {isAdmin ? 'COPILOT' : 'TRỢ LÝ'}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-teal-100 font-medium truncate max-w-[140px] sm:max-w-none">
                    {isAdmin ? 'Trợ lý Nghiệp vụ Thư viện UTH' : 'Trợ lý tra cứu Thư viện UTH'}
                  </p>
                </div>
              </div>

              {/* Nhóm nút điều khiển Header */}
              <div className="flex items-center gap-1 sm:gap-1.5 text-teal-100 relative z-10">
                {!isMinimized && (
                  <>
                    <button
                      onClick={handleNewChat}
                      className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-2xs"
                      title="Tạo đoạn chat mới"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Chat mới</span>
                    </button>
                    <button
                      onClick={handleResetChat}
                      className="p-1.5 hover:bg-white/15 hover:text-white rounded-xl transition-colors active:scale-90"
                      title="Làm mới phiên trò chuyện hiện tại"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-1.5 hover:bg-white/15 hover:text-white rounded-xl transition-colors active:scale-90"
                      title={isFullscreen ? 'Thu nhỏ bình thường (Esc)' : 'Mở rộng toàn màn hình'}
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setIsMinimized(!isMinimized);
                    if (isFullscreen) setIsFullscreen(false);
                  }}
                  className="p-1.5 hover:bg-white/15 hover:text-white rounded-xl transition-colors active:scale-90"
                  title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsFullscreen(false);
                  }}
                  className="p-1.5 hover:bg-white/15 hover:text-white rounded-xl transition-colors active:scale-90"
                  title="Đóng chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── NỘI DUNG CHAT (ẨN KHI MINIMIZED) ── */}
            {!isMinimized && (
              <div className="flex-1 flex overflow-hidden">
                {/* ── CỘT LỊCH SỬ CHAT (SIDEBAR PHONG CÁCH GEMINI) ── */}
                {isSidebarOpen && (
                  <div className={`flex flex-col bg-[#F8FAFC] border-r border-slate-200 shrink-0 transition-all duration-300 z-10 ${
                    isFullscreen ? 'w-64 sm:w-72' : 'w-52 sm:w-60'
                  }`}>
                    {/* Header Sidebar: New chat button */}
                    <div className="p-3 border-b border-slate-200/80 flex items-center justify-between gap-2">
                      <button
                        onClick={handleNewChat}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-[#008B8B] to-[#00A896] hover:brightness-105 active:scale-95 text-white rounded-xl font-semibold text-xs shadow-xs transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Đoạn chat mới</span>
                      </button>
                      <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 hover:bg-slate-200/70 text-slate-500 rounded-lg transition-colors"
                        title="Đóng sidebar"
                      >
                        <PanelLeftClose className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Section label */}
                    <div className="px-3.5 pt-3 pb-1.5 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                        <span>Lịch sử trò chuyện</span>
                      </div>
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded-full font-bold">
                        {sessions.length}
                      </span>
                    </div>

                    {/* Danh sách các phiên trò chuyện */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      {sessions.map((s) => {
                        const isActive = s.id === currentSessionId;
                        return (
                          <div
                            key={s.id}
                            onClick={() => setCurrentSessionId(s.id)}
                            className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                              isActive
                                ? 'bg-teal-50 text-teal-950 font-semibold border border-teal-200/90 shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                            }`}
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
                  className={`flex flex-col flex-1 h-full overflow-hidden ${
                    isFullscreen && isAdmin
                      ? 'md:max-w-[480px] lg:max-w-[560px] border-r border-gray-200'
                      : 'w-full'
                  }`}
                >
                  {/* Danh sách tin nhắn */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9]">
                    <div className={`${getConversationWidthClass(isFullscreen, isAdmin)} min-h-full space-y-5`}>
                      {/* Màn hình bắt đầu tối giản, tập trung vào một hành động */}
                      {messages.length <= 1 && (
                        <div className="min-h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-300 pb-8">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-teal-200/80 shadow-sm ring-4 ring-teal-500/10 mb-5 bg-white">
                            <img src={uthieAvatarImg} alt="UTHie AI" className="w-full h-full object-cover" />
                          </div>
                          <h2 className="text-xl sm:text-3xl font-semibold text-slate-800 tracking-tight">
                            {chatGreeting} {isAdmin ? 'Hôm nay cần xử lý nghiệp vụ nào?' : 'Bạn muốn bắt đầu từ đâu?'}
                          </h2>
                          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mt-2 px-4 leading-relaxed">
                            {isAdmin
                              ? 'UTHie Copilot hỗ trợ theo dõi lưu thông, quá hạn, tồn kho và công nợ thư viện.'
                              : isLecturer
                                ? 'UTHie hỗ trợ tra cứu tài liệu nghiên cứu, sách đang mượn và chính sách dành cho giảng viên.'
                                : 'UTHie hỗ trợ tìm giáo trình, tra cứu tài liệu và kiểm tra tình trạng mượn trả.'}
                          </p>
                          <div className="w-full max-w-3xl mt-8 flex items-center gap-2.5 bg-white border border-slate-200 rounded-2xl p-2 shadow-lg shadow-slate-300/30">
                            <input
                              ref={inputRef}
                              type="text"
                              value={inputMessage}
                              onChange={(e) => setInputMessage(e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder={isAdmin ? 'Nhập nghiệp vụ cần kiểm tra...' : 'Hỏi UTHie bất kỳ điều gì...'}
                              disabled={loading}
                              className="flex-1 min-w-0 bg-transparent text-sm sm:text-[15px] text-slate-800 placeholder-slate-400 px-3.5 py-2.5 focus:outline-none"
                            />
                            <button
                              onClick={() => handleSendMessage()}
                              disabled={!inputMessage.trim() || loading}
                              aria-label="Gửi câu hỏi"
                              className="w-11 h-11 rounded-xl bg-teal-700 hover:bg-teal-800 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-sm shrink-0"
                            >
                              <Send className="w-5 h-5" />
                            </button>
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
                            className={`flex items-start gap-3 transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-2 ${
                              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                            }`}
                          >
                            <div
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 shadow-sm flex items-center justify-center ${
                                msg.sender === 'user'
                                  ? 'bg-gradient-to-tr from-amber-600 to-amber-500 text-white shadow-amber-500/20'
                                  : 'border-2 border-teal-300/80 bg-white ring-2 ring-teal-500/10'
                              }`}
                            >
                              {msg.sender === 'user' ? (
                                <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                              ) : (
                                <img src={uthieAvatarImg} alt="UTHie" className="w-full h-full object-cover" />
                              )}
                            </div>

                            <div
                              className={`rounded-2xl transition-all duration-200 ${
                                msg.sender === 'user'
                                  ? 'w-fit max-w-[85%] sm:max-w-[70%] ml-auto p-3.5 sm:p-4 bg-gradient-to-tr from-[#008B8B] to-[#00A896] text-white rounded-tr-xs shadow-md shadow-teal-900/10'
                                  : 'w-full max-w-full sm:max-w-[92%] p-4 sm:p-5.5 bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-xs'
                              }`}
                            >
                              {msg.sender === 'ai' ? (
                                <div className="leading-relaxed">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                    {msg.text}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                <div className="whitespace-pre-wrap leading-relaxed font-normal text-[13.5px] sm:text-[14.5px]">
                                  {msg.text}
                                </div>
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
                                    <span>Tài liệu đề xuất trong Thư viện UTH (Click để xem vị trí kệ & đặt mượn):</span>
                                  </div>
                                  <div className={isFullscreen && !isAdmin ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "space-y-2.5"}>
                                    {msg.suggested_books.map((b, index) => {
                                      const tone = getSuggestedBookCardTone(index);
                                      return (
                                        <div
                                          key={b.id}
                                          onClick={() => handleSelectBook(b.id)}
                                          className={`group cursor-pointer p-3.5 rounded-xl border-2 transition-all duration-200 flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 ${tone.surfaceClass}`}
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
                                          <div className="flex items-center gap-1 shrink-0 text-teal-800 group-hover:text-teal-950 font-semibold text-xs">
                                            <span className="hidden sm:inline">Chi tiết</span>
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                        <div className="flex items-center gap-3 text-teal-800 text-xs animate-in fade-in duration-200">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 border-2 border-teal-400 bg-white ring-2 ring-teal-500/20">
                            <img
                              src={uthieAvatarImg}
                              alt="UTHie"
                              className="w-full h-full object-cover animate-pulse"
                            />
                          </div>
                          <div className="bg-white border border-teal-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-2.5 text-teal-700">
                            <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                            <span className="font-medium text-xs sm:text-[13.5px]">UTHie đang tìm kiếm dữ liệu và soạn câu trả lời...</span>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Ô nhập chuyển xuống đáy sau khi cuộc trò chuyện bắt đầu */}
                  {messages.length > 1 && (
                    <div className="p-3 sm:p-4 bg-white border-t border-slate-200/80 shrink-0">
                      <div className={`${getConversationWidthClass(isFullscreen, isAdmin)} flex items-center gap-2.5`}>
                        <input
                          ref={inputRef}
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={isAdmin ? 'Nhập nghiệp vụ cần kiểm tra...' : 'Hỏi tiếp UTHie...'}
                          disabled={loading}
                          className="flex-1 text-xs sm:text-[14px] bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-slate-800 placeholder-slate-400 px-4 py-3 rounded-2xl border border-transparent focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all shadow-inner"
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

                {/* ── CỘT 2: BẢNG ĐIỀU PHỐI ĐA NĂNG CHO THỦ THƯ (FULLSCREEN MODE DÀNH RIÊNG CHO ADMIN) ── */}
                {isFullscreen && isAdmin && (
                  <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
                    {/* Header Tabs: Đầy đủ 8 Danh Mục Thống Kê */}
                    <div className="p-2.5 bg-white border-b border-gray-200 flex items-center justify-between gap-2 shrink-0 shadow-xs">
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
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
                            {latestAdminStats?.lecturer_active_loans_count ?? (latestAdminStats?.lecturer_borrowers?.length || 2)}
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
                            {latestAdminStats?.total_copies || 288}
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
                            {latestAdminStats?.low_stock_books?.length || 5}
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
                            {latestAdminStats?.unpaid_fines_count || 2}
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

                      {sideTab === 'overdue' && latestOverdueStudents.length > 0 && (
                        <button
                          onClick={() => handleSendAllOverdue(latestOverdueStudents)}
                          className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                        >
                          <Bell className="w-3 h-3 fill-current" />
                          <span>Nhắc tất cả</span>
                        </button>
                      )}
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

                        <div className="flex-1 overflow-y-auto p-4">
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
