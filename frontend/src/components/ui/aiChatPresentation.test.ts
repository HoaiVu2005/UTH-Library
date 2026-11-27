import { describe, expect, it } from 'vitest';

import {
  AI_CHAT_REQUEST_CONFIG,
  getChatGreeting,
  getAdminMetricLabel,
  getChatCanvasTone,
  getConversationWidthClass,
  getHistorySessionTone,
  normalizeChatAction,
  getRecentChatHistory,
  getSuggestedBookCardTone,
  getWelcomeActions,
  shouldShowBookSuggestions,
  shouldRenderDockedComposer,
  cleanAssistantReplyText,
} from './aiChatPresentation';

describe('AI chat presentation by role', () => {
  it('shows an honest unavailable marker instead of fabricated admin metrics', () => {
    expect(getAdminMetricLabel(undefined)).toBe('—');
    expect(getAdminMetricLabel(null)).toBe('—');
    expect(getAdminMetricLabel(0)).toBe('0');
    expect(getAdminMetricLabel(288)).toBe('288');
  });
  it('accepts a safe internal workflow action for the fine-management screen', () => {
    expect(normalizeChatAction({
      label: 'Mở Quản lý tiền phạt',
      path: '/admin/fines',
    })).toEqual({
      label: 'Mở Quản lý tiền phạt',
      path: '/admin/fines',
    });
    expect(normalizeChatAction({
      label: 'Xem danh sách mượn sách của tôi',
      path: '/profile',
    })).toEqual({
      label: 'Xem danh sách mượn sách của tôi',
      path: '/reservations',
    });
    expect(normalizeChatAction({ label: 'Trang lạ', path: 'https://example.com' })).toBeNull();
  });

  it('stops waiting shortly after the backend latency budget expires', () => {
    expect(AI_CHAT_REQUEST_CONFIG.timeout).toBe(10_000);
  });
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

  it('offers distinct starter prompts for students and librarians', () => {
    const studentActions = getWelcomeActions('student');
    const librarianActions = getWelcomeActions('librarian');

    expect(studentActions).toHaveLength(5);
    expect(librarianActions).toHaveLength(5);
    expect(studentActions[0]).toEqual({
      label: 'Tìm giáo trình theo môn học',
      prompt: 'Gợi ý giáo trình phù hợp với môn học của tôi',
    });
    expect(librarianActions[0]).toEqual({
      label: 'Sinh viên nào đang quá hạn?',
      prompt: 'Cho tôi danh sách sinh viên đang mượn sách quá hạn',
    });
    expect(studentActions.map((action) => action.prompt)).not.toEqual(
      librarianActions.map((action) => action.prompt),
    );
    expect(shouldShowBookSuggestions('admin')).toBe(false);
    expect(shouldShowBookSuggestions('student')).toBe(true);
  });

  it('uses the full available content rail in fullscreen patron chat', () => {
    expect(getConversationWidthClass(true, false)).toContain('w-full');
    expect(getConversationWidthClass(true, false)).not.toContain('max-w-');
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

  it('keeps the message composer docked at the bottom even for a new chat', () => {
    expect(shouldRenderDockedComposer(1)).toBe(true);
    expect(shouldRenderDockedComposer(4)).toBe(true);
  });

  it('uses stronger surfaces to separate chat history sessions', () => {
    expect(getHistorySessionTone(true)).toContain('bg-teal-100');
    expect(getHistorySessionTone(true)).toContain('border-teal-300');
    expect(getHistorySessionTone(false)).toContain('bg-slate-200');
  });

  it('uses compositor-friendly chat surfaces for smooth scrolling', () => {
    const tone = getChatCanvasTone();

    expect(tone.backgroundLayerClass).toContain('opacity-');
    expect(tone.backgroundLayerClass).not.toContain('blur-');
    expect(tone.tintLayerClass).toContain('from-[#063F46]');
    expect(tone.tintLayerClass).not.toContain('bg-white');
    expect(tone.assistantMessageClass).toContain('bg-[#E6F4F3]');
    expect(tone.assistantMessageClass).toContain('shadow-');
    expect(tone.assistantMessageClass).not.toContain('backdrop-blur');
    expect(tone.welcomeSurfaceClass).not.toContain('backdrop-blur');
    expect(tone.loadingSurfaceClass).not.toContain('backdrop-blur');
  });

  it('strips raw hallucinated action JSON and technical markup from assistant reply', () => {
    const rawReply = `Bạn có thể xem sách bên dưới.\n\n{\n  "action": "show_book_cards",\n  "book_ids": [\n    "UTH-IT-000001",\n    "UTH-IT-000002"\n  ]\n}`;
    expect(cleanAssistantReplyText(rawReply)).toBe('Bạn có thể xem sách bên dưới.');
  });
});
