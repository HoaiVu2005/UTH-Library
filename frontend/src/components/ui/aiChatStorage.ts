const CHAT_STORAGE_PREFIX = 'uthie_ai_chat_sessions_v2';

type ChatOwner = {
  id: number;
  role: string;
};

export function getChatStorageKey(owner: ChatOwner | null | undefined): string {
  if (!owner) return `${CHAT_STORAGE_PREFIX}:anonymous`;
  return `${CHAT_STORAGE_PREFIX}:${owner.role}:${owner.id}`;
}
