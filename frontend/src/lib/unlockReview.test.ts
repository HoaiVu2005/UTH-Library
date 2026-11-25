import { describe, expect, it } from 'vitest';

import { validateUnlockReviewReason } from './unlockReview';

describe('borrow-lock review', () => {
  it('requires a meaningful librarian justification before unlocking', () => {
    expect(validateUnlockReviewReason('   ')).toBe('Vui lòng ghi lý do xem xét mở khóa.');
    expect(validateUnlockReviewReason('quá ngắn')).toBe('Lý do cần có ít nhất 10 ký tự.');
    expect(
      validateUnlockReviewReason('Sinh viên có xác nhận điều trị dài ngày.'),
    ).toBeNull();
  });
});
