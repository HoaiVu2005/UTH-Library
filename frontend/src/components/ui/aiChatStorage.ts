const CHAT_STORAGE_PREFIX = 'uthie_ai_chat_sessions_v2';

type ChatOwner = {
  id: number;
  role: string;
};

type StoredMessage = {
  admin_stats?: unknown;
  overdue_students?: unknown;
};

const MAX_STORED_SESSIONS = 20;
const MAX_STORED_MESSAGES_PER_SESSION = 100;

export function getChatStorageKey(owner: ChatOwner | null | undefined): string {
  if (!owner) return `${CHAT_STORAGE_PREFIX}:anonymous`;
  return `${CHAT_STORAGE_PREFIX}:${owner.role}:${owner.id}`;
}

/**
 * Persist only durable conversation content. Operational dashboard payloads are
 * fetched fresh and can be hundreds of kilobytes, so duplicating them in every
 * message eventually exhausts the browser storage quota.
 */
export function prepareSessionsForStorage<
  M extends object,
  T extends { messages: M[] },
>(sessions: T[]): T[] {
  return sessions.slice(0, MAX_STORED_SESSIONS).map((session) => ({
    ...session,
    messages: session.messages.slice(-MAX_STORED_MESSAGES_PER_SESSION).map((message) => {
      const { admin_stats: _adminStats, overdue_students: _overdueStudents, ...durableMessage } = message as M & StoredMessage;
      return durableMessage;
    }),
  })) as T[];
}
