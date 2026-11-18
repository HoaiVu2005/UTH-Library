import { describe, expect, it } from 'vitest';

import { getChatStorageKey, prepareSessionsForStorage } from './aiChatStorage';

describe('getChatStorageKey', () => {
  it('isolates chat history by authenticated user and role', () => {
    expect(getChatStorageKey({ id: 12, role: 'student' })).toBe(
      'uthie_ai_chat_sessions_v2:student:12',
    );
    expect(getChatStorageKey({ id: 12, role: 'lecturer' })).toBe(
      'uthie_ai_chat_sessions_v2:lecturer:12',
    );
    expect(getChatStorageKey({ id: 99, role: 'admin' })).toBe(
      'uthie_ai_chat_sessions_v2:admin:99',
    );
  });

  it('uses an isolated anonymous key when authentication is unresolved', () => {
    expect(getChatStorageKey(null)).toBe('uthie_ai_chat_sessions_v2:anonymous');
  });
});

describe('prepareSessionsForStorage', () => {
  it('keeps the conversation while removing duplicated dashboard payloads', () => {
    const sessions = [
      {
        id: 'session-1',
        title: 'Thống kê quá hạn',
        createdAt: 1,
        messages: [
          {
            id: 'ai-1',
            sender: 'ai',
            text: 'Có 3 bạn đọc quá hạn.',
            timestamp: '10:00',
            admin_stats: { overdue_students: Array.from({ length: 200 }, (_, id) => ({ id })) },
            overdue_students: Array.from({ length: 200 }, (_, id) => ({ id })),
            suggested_books: [{ id: 1, title: 'Sách mẫu' }],
          },
        ],
      },
    ];

    const prepared = prepareSessionsForStorage(sessions);
    const storedMessage = prepared[0].messages[0];

    expect(storedMessage.text).toBe('Có 3 bạn đọc quá hạn.');
    expect(storedMessage.suggested_books).toEqual([{ id: 1, title: 'Sách mẫu' }]);
    expect(storedMessage).not.toHaveProperty('admin_stats');
    expect(storedMessage).not.toHaveProperty('overdue_students');
  });

  it('limits retained sessions and messages without dropping the newest conversation', () => {
    const sessions = Array.from({ length: 30 }, (_, sessionIndex) => ({
      id: `session-${sessionIndex}`,
      title: `Phiên ${sessionIndex}`,
      createdAt: 30 - sessionIndex,
      messages: Array.from({ length: 140 }, (_, messageIndex) => ({
        id: `message-${sessionIndex}-${messageIndex}`,
        sender: messageIndex % 2 ? 'ai' : 'user',
        text: `Tin nhắn ${messageIndex}`,
        timestamp: '10:00',
      })),
    }));

    const prepared = prepareSessionsForStorage(sessions);

    expect(prepared).toHaveLength(20);
    expect(prepared[0].id).toBe('session-0');
    expect(prepared[0].messages).toHaveLength(100);
    expect(prepared[0].messages[0].text).toBe('Tin nhắn 40');
    expect(prepared[0].messages[99].text).toBe('Tin nhắn 139');
  });
});
