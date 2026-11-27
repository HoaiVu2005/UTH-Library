export type ChatRole = 'student' | 'lecturer' | 'librarian' | 'admin';

export type ChatAction = {
  label: string;
  path: string;
  type?: 'link' | 'reservation';
  book_id?: number;
  book_title?: string;
  is_ready?: boolean;
};

export type WelcomeAction = {
  label: string;
  prompt: string;
};

export const AI_CHAT_REQUEST_CONFIG = {
  timeout: 10_000,
} as const;

type GreetingUser = {
  role: ChatRole;
  fullName?: string;
  username?: string;
};

type SuggestedBookCardTone = {
  surfaceClass: string;
  metadataClass: string;
};

type ChatCanvasTone = {
  backgroundLayerClass: string;
  tintLayerClass: string;
  assistantMessageClass: string;
  welcomeSurfaceClass: string;
  loadingSurfaceClass: string;
};

const SUGGESTED_BOOK_CARD_TONES: SuggestedBookCardTone[] = [
  {
    surfaceClass: 'bg-teal-100 border-teal-400 hover:bg-teal-200/80 shadow-sm',
    metadataClass: 'text-teal-900/75',
  },
  {
    surfaceClass: 'bg-white border-slate-300 hover:bg-slate-50 shadow-2xs',
    metadataClass: 'text-slate-600',
  },
  {
    surfaceClass: 'bg-teal-50 border-teal-300 hover:bg-teal-100 shadow-2xs',
    metadataClass: 'text-teal-900/70',
  },
  {
    surfaceClass: 'bg-slate-100 border-slate-300 hover:bg-slate-200/80 shadow-2xs',
    metadataClass: 'text-slate-700',
  },
];

const WELCOME_ACTIONS: Record<ChatRole, WelcomeAction[]> = {
  student: [
    { label: 'Tìm giáo trình theo môn học', prompt: 'Gợi ý giáo trình phù hợp với môn học của tôi' },
    { label: 'Sách nào sắp đến hạn?', prompt: 'Kiểm tra giúp tôi những sách đang mượn sắp đến hạn' },
    { label: 'Gia hạn sách đang mượn', prompt: 'Hướng dẫn tôi gia hạn sách đang mượn' },
    { label: 'Kiểm tra hàng chờ đặt trước', prompt: 'Kiểm tra vị trí của tôi trong hàng chờ đặt trước' },
    { label: 'Kiểm tra tiền phạt', prompt: 'Tôi có khoản phạt thư viện nào chưa thanh toán không?' },
  ],
  lecturer: [
    { label: 'Tìm tài liệu nghiên cứu', prompt: 'Gợi ý tài liệu nghiên cứu phù hợp với chuyên ngành của tôi' },
    { label: 'Sách nào sắp đến hạn?', prompt: 'Kiểm tra giúp tôi những sách đang mượn sắp đến hạn' },
    { label: 'Gia hạn tài liệu đang mượn', prompt: 'Hướng dẫn tôi gia hạn tài liệu đang mượn' },
    { label: 'Tra cứu tài liệu số', prompt: 'Gợi ý tài liệu số tôi có thể đọc trực tuyến' },
    { label: 'Chính sách dành cho giảng viên', prompt: 'Cho tôi biết chính sách mượn sách dành cho giảng viên' },
  ],
  librarian: [
    { label: 'Sinh viên nào đang quá hạn?', prompt: 'Cho tôi danh sách sinh viên đang mượn sách quá hạn' },
    { label: 'Kiểm tra bạn đọc bị khóa', prompt: 'Cho tôi danh sách bạn đọc đang bị khóa thẻ' },
    { label: 'Sách sắp hết bản khả dụng', prompt: 'Cho tôi danh sách sách sắp hết bản khả dụng' },
    { label: 'Tiền phạt chưa thu', prompt: 'Tổng hợp các khoản tiền phạt chưa thu' },
    { label: 'Tìm bản sao theo mã vạch', prompt: 'Hướng dẫn tôi kiểm tra bản sao sách theo mã vạch' },
  ],
  admin: [
    { label: 'Tổng quan vận hành hôm nay', prompt: 'Tóm tắt tình hình vận hành thư viện hôm nay' },
    { label: 'Sinh viên nào đang quá hạn?', prompt: 'Cho tôi danh sách sinh viên đang mượn sách quá hạn' },
    { label: 'Kiểm tra bạn đọc bị khóa', prompt: 'Cho tôi danh sách bạn đọc đang bị khóa thẻ' },
    { label: 'Sách sắp hết bản khả dụng', prompt: 'Cho tôi danh sách sách sắp hết bản khả dụng' },
    { label: 'Tiền phạt chưa thu', prompt: 'Tổng hợp các khoản tiền phạt chưa thu' },
  ],
};

function capitalizeName(value: string): string {
  const normalized = value.trim();
  return normalized ? normalized.charAt(0).toLocaleUpperCase('vi-VN') + normalized.slice(1) : '';
}

export function getChatGreeting(user: GreetingUser): string {
  if (user.role === 'admin') return 'Chào Quản trị viên!';
  if (user.role === 'librarian') return 'Chào Thủ thư!';
  if (user.role === 'lecturer') return 'Kính chào Thầy/Cô!';
  const displayName = capitalizeName(user.fullName || user.username || 'bạn');
  return `Chào ${displayName}!`;
}

export function getAdminMetricLabel(value: number | null | undefined): string {
  return value == null ? '—' : value.toLocaleString('vi-VN');
}

export function getWelcomeActions(role: ChatRole): WelcomeAction[] {
  return WELCOME_ACTIONS[role];
}

export function getConversationWidthClass(isFullscreen: boolean, isAdmin: boolean): string {
  return isFullscreen && !isAdmin ? 'w-full' : 'w-full';
}

export function shouldRenderDockedComposer(_messageCount: number): boolean {
  return true;
}

export function getHistorySessionTone(isActive: boolean): string {
  return isActive
    ? 'bg-teal-100 text-teal-950 font-semibold border border-teal-300 shadow-sm'
    : 'bg-slate-200 text-slate-700 border border-slate-300/80 hover:bg-slate-300 hover:text-slate-950';
}

export function getChatCanvasTone(): ChatCanvasTone {
  return {
    backgroundLayerClass: 'absolute inset-0 bg-cover bg-center opacity-90',
    tintLayerClass: 'absolute inset-0 bg-gradient-to-br from-[#063F46]/10 via-transparent to-[#032F36]/15 pointer-events-none',
    assistantMessageClass: 'bg-[#E6F4F3] text-[#183B3F] border border-teal-200 shadow-xs',
    welcomeSurfaceClass: 'bg-[#E6F4F3] border border-teal-200 shadow-xs',
    loadingSurfaceClass: 'bg-[#E6F4F3] border border-teal-200 shadow-xs',
  };
}

export function getRecentChatHistory<T>(messages: T[], limit = 10): T[] {
  return messages.slice(-limit);
}

export function normalizeChatAction(value: unknown): ChatAction | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const label = typeof raw.label === 'string' ? raw.label.trim() : '';
  if (!label) return null;

  let path = typeof raw.path === 'string' && raw.path.startsWith('/') && !raw.path.startsWith('//')
    ? raw.path
    : undefined;

  // Tự động chuẩn hóa đường dẫn nếu cache/lưu nhầm sang /profile cho danh sách mượn sách hoặc sách đang mượn
  if (label.toLowerCase().includes('mượn sách') && path === '/profile') {
    path = '/reservations';
  } else if (label.toLowerCase().includes('đang mượn') && path === '/profile') {
    path = '/loans';
  }

  const actionType = raw.type === 'reservation' ? 'reservation' : 'link';
  const bookId = typeof raw.book_id === 'number' ? raw.book_id : undefined;
  const bookTitle = typeof raw.book_title === 'string' ? raw.book_title : undefined;
  const isReady = typeof raw.is_ready === 'boolean' ? raw.is_ready : undefined;

  if (actionType === 'reservation') {
    return {
      label,
      path: path || (bookId ? `/books/${bookId}` : '/books'),
      type: 'reservation',
      book_id: bookId,
      book_title: bookTitle,
      is_ready: isReady,
    };
  }

  if (!path) return null;
  return { label, path };
}

export function shouldShowBookSuggestions(role: ChatRole): boolean {
  return role !== 'admin';
}

export function cleanAssistantReplyText(text: string): string {
  if (!text) return '';
  return text
    .replace(/```(?:json)?\s*\{[\s\S]*?\}\s*```/gi, '')
    .replace(/\{[\s\r\n]*"(?:action|book_ids|suggested_books|command)"[\s\S]*?\}/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function getSuggestedBookCardTone(index: number): SuggestedBookCardTone {
  return SUGGESTED_BOOK_CARD_TONES[index % SUGGESTED_BOOK_CARD_TONES.length];
}
