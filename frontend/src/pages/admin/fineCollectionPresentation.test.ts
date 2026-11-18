import { describe, expect, it } from 'vitest';

import { getFineCollectionEntryMode } from './fineCollectionPresentation';

describe('fine collection entry mode', () => {
  it('turns the AI workflow link into a scanner-first desk experience', () => {
    expect(getFineCollectionEntryMode('?mode=collect')).toEqual({
      shouldFocusCardInput: true,
      helperText: 'Quét mã thẻ sinh viên/giảng viên hoặc nhập mã rồi nhấn Enter',
    });
  });

  it('keeps the regular management screen neutral', () => {
    expect(getFineCollectionEntryMode('')).toEqual({
      shouldFocusCardInput: false,
      helperText: 'Tìm theo tên, mã thẻ, mã phạt hoặc tên sách',
    });
  });
});
