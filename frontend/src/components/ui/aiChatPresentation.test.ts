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
    expect(normalizeChatAction({ label: 'Trang lạ', path: 'https://example.com' })).toBeNull();
  });

  it('stops waiting shortly after the backend latency budget expires', () => {
    expect(AI_CHAT_REQUEST_CONFIG.timeout).toBe(20_000);
  });
  it('greets staff by role instead of treating the last word as their name', () => {
    expect(
      getChatGreeting({
        role: 'admin',
        fullName: 'Nguyễn Văn Quản Trị (Thủ Thư Trưởng)',
        username: 'admin',
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
});
