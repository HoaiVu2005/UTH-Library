export type ChatRole = 'student' | 'lecturer' | 'admin';

type GreetingUser = {
  role: ChatRole;
  fullName?: string;
  username?: string;
};

type SuggestedBookCardTone = {
  surfaceClass: string;
  metadataClass: string;
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
  if (user.role === 'admin') return 'Chào Thủ thư!';
  if (user.role === 'lecturer') return 'Kính chào Thầy/Cô!';
  const displayName = capitalizeName(user.fullName || user.username || 'bạn');
  return `Chào ${displayName}!`;
}

export function getWelcomeActions(_role: ChatRole): [] {
  return [];
}

export function getConversationWidthClass(isFullscreen: boolean, isAdmin: boolean): string {
  return isFullscreen && !isAdmin ? 'max-w-6xl mx-auto w-full' : 'w-full';
}

export function getRecentChatHistory<T>(messages: T[], limit = 10): T[] {
  return messages.slice(-limit);
}

export function shouldShowBookSuggestions(role: ChatRole): boolean {
  return role !== 'admin';
}

export function getSuggestedBookCardTone(index: number): SuggestedBookCardTone {
  return SUGGESTED_BOOK_CARD_TONES[index % SUGGESTED_BOOK_CARD_TONES.length];
}
