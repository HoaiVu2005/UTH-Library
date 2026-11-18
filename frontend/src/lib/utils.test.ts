import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getRemainingDays, numberToVietnameseWords } from './utils';

describe('getRemainingDays', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates exact calendar days remaining (17/11 to 30/11 is 13 days)', () => {
    // Mock current time: 2026-11-17 20:15:00
    vi.setSystemTime(new Date(2026, 10, 17, 20, 15, 0));

    // Due at 2026-11-30 23:59:59
    const dueAt = new Date(2026, 10, 30, 23, 59, 59).toISOString();
    expect(getRemainingDays(dueAt)).toBe(13);
  });

  it('returns 13 regardless of the time of day on 17/11 (morning or night)', () => {
    // Early morning: 2026-11-17 07:00:00
    vi.setSystemTime(new Date(2026, 10, 17, 7, 0, 0));
    const dueAt = new Date(2026, 10, 30, 23, 59, 59).toISOString();
    expect(getRemainingDays(dueAt)).toBe(13);

    // Late evening: 2026-11-17 23:55:00
    vi.setSystemTime(new Date(2026, 10, 17, 23, 55, 0));
    expect(getRemainingDays(dueAt)).toBe(13);
  });

  it('returns 0 when due date is today', () => {
    vi.setSystemTime(new Date(2026, 10, 30, 14, 0, 0));
    const dueAt = new Date(2026, 10, 30, 23, 59, 59).toISOString();
    expect(getRemainingDays(dueAt)).toBe(0);
  });

  it('returns 1 when due date is tomorrow', () => {
    vi.setSystemTime(new Date(2026, 10, 29, 10, 0, 0));
    const dueAt = new Date(2026, 10, 30, 23, 59, 59).toISOString();
    expect(getRemainingDays(dueAt)).toBe(1);
  });

  it('returns negative number when overdue', () => {
    vi.setSystemTime(new Date(2026, 11, 1, 9, 0, 0)); // 2026-12-01
    const dueAt = new Date(2026, 10, 30, 23, 59, 59).toISOString(); // 2026-11-30
    expect(getRemainingDays(dueAt)).toBe(-1);
  });

  it('handles null, undefined, and invalid date inputs safely', () => {
    expect(getRemainingDays(null)).toBe(0);
    expect(getRemainingDays(undefined)).toBe(0);
    expect(getRemainingDays('invalid-date')).toBe(0);
  });
});

describe('numberToVietnameseWords', () => {
  it('converts 0 to Không đồng', () => {
    expect(numberToVietnameseWords(0)).toBe('Không đồng');
  });

  it('converts tens and thousands correctly', () => {
    expect(numberToVietnameseWords(50000)).toBe('Năm mươi nghìn đồng');
    expect(numberToVietnameseWords(150000)).toBe('Một trăm năm mươi nghìn đồng');
  });

  it('converts millions and combinations correctly', () => {
    expect(numberToVietnameseWords(1500000)).toBe('Một triệu năm trăm nghìn đồng');
    expect(numberToVietnameseWords(2450000)).toBe('Hai triệu bốn trăm năm mươi nghìn đồng');
  });
});



