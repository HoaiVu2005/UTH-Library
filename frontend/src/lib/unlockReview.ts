export function validateUnlockReviewReason(reason: string): string | null {
  const normalized = reason.trim();
  if (!normalized) return 'Vui lòng ghi lý do xem xét mở khóa.';
  if (normalized.length < 10) return 'Lý do cần có ít nhất 10 ký tự.';
  return null;
}
