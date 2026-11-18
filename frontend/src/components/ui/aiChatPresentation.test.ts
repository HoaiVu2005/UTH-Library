import { describe, expect, it } from 'vitest';

import {
  getChatGreeting,
  getConversationWidthClass,
  getRecentChatHistory,
  getSuggestedBookCardTone,
  getWelcomeActions,
  shouldShowBookSuggestions,
} from './aiChatPresentation';

describe('AI chat presentation by role', () => {
  it('greets staff by role instead of treating the last word as their name', () => {
    expect(
      getChatGreeting({
        role: 'admin',
        fullName: 'Nguyễn Văn Quản Trị (Thủ Thư Trưởng)',
        username: 'admin',
      }),
    ).toBe('Chào Quản trị viên!');

    expect(
      getChatGreeting({
        role: 'librarian',
        fullName: 'Trần Thị Thủ Thư',
        username: 'librarian01',
      }),
    ).toBe('Chào Thủ thư!');
  });

  it('normalizes a patron display name', () => {
    expect(
      getChatGreeting({ role: 'student', fullName: 'phong', username: 'phong' }),
    ).toBe('Chào Phong!');
  });

  it('keeps the empty chat focused by removing suggestion actions', () => {
    expect(getWelcomeActions('admin')).toEqual([]);
    expect(getWelcomeActions('lecturer')).toEqual([]);
    expect(getWelcomeActions('student')).toEqual([]);
    expect(shouldShowBookSuggestions('admin')).toBe(false);
    expect(shouldShowBookSuggestions('student')).toBe(true);
  });

  it('uses a wider shared content rail in fullscreen patron chat', () => {
    expect(getConversationWidthClass(true, false)).toContain('max-w-6xl');
  });

  it('keeps enough recent turns for a coherent conversation', () => {
    const messages = Array.from({ length: 12 }, (_, index) => ({ id: index }));
    expect(getRecentChatHistory(messages).map((message) => message.id)).toEqual([
      2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ]);
  });

  it('alternates recommendation cards with clearly separated surface tones', () => {
    expect(getSuggestedBookCardTone(0).surfaceClass).toContain('bg-teal-100');
    expect(getSuggestedBookCardTone(1).surfaceClass).toContain('bg-white');
    expect(getSuggestedBookCardTone(2).surfaceClass).toContain('bg-teal-50');
    expect(getSuggestedBookCardTone(3).surfaceClass).toContain('bg-slate-100');
  });
});
