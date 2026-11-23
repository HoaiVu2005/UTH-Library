export type ChatRole = 'student' | 'lecturer' | 'librarian' | 'admin';

export type ChatAction = {
  label: string;
  path: string;
};

export const AI_CHAT_REQUEST_CONFIG = {
  timeout: 20_000,
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

export function getWelcomeActions(_role: ChatRole): [] {
  return [];
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
    assistantMessageClass: 'bg-[#E6F4F3] text-[#183B3F] border border-teal-200 shadow-[0_8px_20px_rgba(2,47,54,0.2)]',
    welcomeSurfaceClass: 'bg-[#E6F4F3] border border-teal-200 shadow-[0_10px_24px_rgba(2,47,54,0.2)]',
    loadingSurfaceClass: 'bg-[#E6F4F3] border border-teal-200 shadow-sm',
  };
}

export function getRecentChatHistory<T>(messages: T[], limit = 10): T[] {
  return messages.slice(-limit);
}

export function normalizeChatAction(value: unknown): ChatAction | null {
  if (!value || typeof value !== 'object') return null;
  const { label, path } = value as Partial<ChatAction>;
  if (typeof label !== 'string' || !label.trim()) return null;
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return null;
  return { label: label.trim(), path };
}

export function shouldShowBookSuggestions(role: ChatRole): boolean {
  return role !== 'admin';
}

export function getSuggestedBookCardTone(index: number): SuggestedBookCardTone {
  return SUGGESTED_BOOK_CARD_TONES[index % SUGGESTED_BOOK_CARD_TONES.length];
}
