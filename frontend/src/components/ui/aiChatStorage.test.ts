import { describe, expect, it } from 'vitest';

import { getChatStorageKey } from './aiChatStorage';

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
