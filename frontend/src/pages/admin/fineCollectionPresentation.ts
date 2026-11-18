type FineCollectionEntryMode = {
  shouldFocusCardInput: boolean;
  helperText: string;
};

export function getFineCollectionEntryMode(search: string): FineCollectionEntryMode {
  const params = new URLSearchParams(search);
  const shouldFocusCardInput = params.get('mode') === 'collect';
  return {
    shouldFocusCardInput,
    helperText: shouldFocusCardInput
      ? 'Quét mã thẻ sinh viên/giảng viên hoặc nhập mã rồi nhấn Enter'
      : 'Tìm theo tên, mã thẻ, mã phạt hoặc tên sách',
  };
}
