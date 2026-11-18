import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Search,
  CheckSquare,
  Square,
  AlertTriangle,
  Loader2,
  X,
  FileCheck,
  Barcode,
  MapPin,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Modal, ModalBody } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import { formatCurrencyVND, numberToVietnameseWords } from '@/lib/utils';

export interface SelectableCopy {
  id: number;
  barcode: string;
  shelf_location?: string;
  purchase_price?: number;
  book_title?: string;
  book_isbn?: string;
  category_name?: string;
  status: string;
  status_display: string;
}

interface DeaccessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCopyIds?: number[];
  onSuccess: () => void;
}

const REASON_OPTIONS = [
  { value: 'damaged', label: 'Hư hỏng không thể phục hồi' },
  { value: 'outdated', label: 'Lạc hậu nội dung / hết niên hạn' },
  { value: 'lost', label: 'Mất mát trong quá trình kiểm kê' },
  { value: 'duplicate_surplus', label: 'Dư thừa do trùng lặp bản sao' },
];

export const DeaccessionModal: React.FC<DeaccessionModalProps> = ({
  isOpen,
  onClose,
  initialCopyIds = [],
  onSuccess,
}) => {
  const [decisionNumber, setDecisionNumber] = useState<string>('');
  const [decisionDate, setDecisionDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState<string>('damaged');
  const [committee, setCommittee] = useState<string>(
    'Hội đồng kiểm kê và thanh lý tài sản, tài liệu Thư viện Trường ĐH Giao thông Vận tải TP.HCM'
  );
  const [note, setNote] = useState<string>('');

  // Available copies to choose from
  const [availableCopies, setAvailableCopies] = useState<SelectableCopy[]>([]);
  const [loadingCopies, setLoadingCopies] = useState<boolean>(false);
  const [copySearch, setCopySearch] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialCopyIds.length > 0) {
        setSelectedIds(new Set(initialCopyIds));
      } else {
        setSelectedIds(new Set());
      }
      setErrors({});
      setCopySearch('');

      // Auto-suggest decision number with current year
      const currentYear = new Date().getFullYear();
      setDecisionNumber((prev) => prev || `QĐ-${currentYear}/QĐ-ĐHGTVT`);

      fetchCopies();
    }
  }, [isOpen, initialCopyIds]);

  const fetchCopies = async () => {
    setLoadingCopies(true);
    try {
      const params: Record<string, any> = {
        group_by: 'copy',
        page_size: 100,
      };

      // Nếu người dùng nhấn "Biên bản TL" của bản sao cụ thể, CHỈ tải đúng bản sao đó!
      if (initialCopyIds && initialCopyIds.length > 0) {
        params.ids = initialCopyIds.join(',');
      }

      const res = await api.get('/copies', { params });
      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : (res.data?.results || res.data?.data?.results || []);

      // Lọc bỏ các bản sao đã ở trạng thái thanh lý trước đó
      const candidates: SelectableCopy[] = data
        .filter((c: any) => c.status !== 'withdrawn')
        .map((c: any) => ({
          id: c.id,
          barcode: c.barcode,
          shelf_location: c.shelf_location,
          purchase_price: c.purchase_price || 0,
          book_title: c.book_title || c.book?.title,
          book_isbn: c.book_isbn || c.book?.isbn,
          category_name: c.category_name || c.book?.category?.name,
          status: c.status,
          status_display: c.status_display,
        }));

      setAvailableCopies(candidates);

      // Tự động tích chọn các bản sao mục tiêu
      if (initialCopyIds && initialCopyIds.length > 0) {
        setSelectedIds(new Set(candidates.map((c) => c.id)));
      }
    } catch {
      toast.error('Không thể tải thông tin bản sao cần thanh lý.');
    } finally {
      setLoadingCopies(false);
    }
  };

  const filteredCopies = useMemo(() => {
    if (!copySearch.trim()) return availableCopies;
    const q = copySearch.toLowerCase().trim();
    return availableCopies.filter(
      (cp) =>
        cp.barcode.toLowerCase().includes(q) ||
        (cp.book_title && cp.book_title.toLowerCase().includes(q)) ||
        (cp.shelf_location && cp.shelf_location.toLowerCase().includes(q))
    );
  }, [availableCopies, copySearch]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCopies.length && filteredCopies.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCopies.map((c) => c.id)));
    }
  };

  // Calculate selected total value
  const totalValue = useMemo(() => {
    return availableCopies
      .filter((c) => selectedIds.has(c.id))
      .reduce((sum, c) => sum + (c.purchase_price || 0), 0);
  }, [availableCopies, selectedIds]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!decisionNumber.trim()) {
      errs.decisionNumber = 'Vui lòng nhập số quyết định thành lập hội đồng thanh lý.';
    }
    if (!decisionDate) {
      errs.decisionDate = 'Vui lòng chọn ngày quyết định.';
    }
    if (selectedIds.size === 0) {
      errs.copies = 'Vui lòng chọn ít nhất một bản sao tài liệu để đưa vào biên bản thanh lý.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        decision_number: decisionNumber.trim(),
        decision_date: decisionDate,
        reason,
        committee: committee.trim(),
        note: note.trim(),
        copy_ids: Array.from(selectedIds),
      };

      await api.post('/deaccession-batches', payload);
      toast.success(`Đã lập biên bản thanh lý thành công (${selectedIds.size} bản sao).`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || 'Có lỗi xảy ra khi tạo biên bản thanh lý.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isSpecificMode = initialCopyIds && initialCopyIds.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-3.5 bg-teal-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white shadow-2xs shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                Lập biên bản thanh lý tài liệu (Deaccessioning)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Hội đồng kiểm kê và thanh lý tài nguyên thư viện trường ĐH Giao thông Vận tải TP.HCM (UTH)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200/60 hover:text-gray-600 transition-colors cursor-pointer shrink-0"
            title="Đóng cửa sổ"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable content */}
        <ModalBody className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
          {/* Section 1: Căn cứ pháp lý & Hội đồng thẩm định */}
          <div className="rounded-2xl border border-teal-200/70 bg-teal-50/25 p-4 sm:p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-1 border-b border-teal-100/70">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-brand rounded-full inline-block"></span>
                <span>Căn cứ pháp lý & Quyết định thành lập Hội đồng</span>
              </h3>
              <span className="text-[11px] text-gray-400 italic">Mục có dấu (*) là bắt buộc</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Số Quyết định <span className="text-red-500">*</span>
                </label>
                <Input
                  value={decisionNumber}
                  onChange={(e) => setDecisionNumber(e.target.value)}
                  placeholder="Ví dụ: QĐ-2026/QĐ-ĐHGTVT"
                  error={errors.decisionNumber}
                  className="bg-white rounded-xl shadow-2xs text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ngày ký Quyết định <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={decisionDate}
                  onChange={(e) => setDecisionDate(e.target.value)}
                  error={errors.decisionDate}
                  className="bg-white rounded-xl shadow-2xs text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Lý do thanh lý chính <span className="text-red-500">*</span>
                </label>
                <Select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  options={REASON_OPTIONS}
                  className="bg-white rounded-xl shadow-2xs text-xs h-9"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Thành phần Hội đồng thẩm định
                </label>
                <Input
                  value={committee}
                  onChange={(e) => setCommittee(e.target.value)}
                  placeholder="Hội đồng kiểm kê và thanh lý tài sản, tài liệu Thư viện Trường ĐH Giao thông Vận tải TP.HCM"
                  className="bg-white rounded-xl shadow-2xs text-xs h-9"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ghi chú & Căn cứ bổ sung
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Căn cứ biên bản kiểm kê thư viện định kỳ; đề xuất xử lý phân loại tiêu hủy hoặc chuyển nhượng phế liệu..."
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 bg-white shadow-2xs transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Book Copies Selector Block */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-gray-100">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-orange-500 rounded-full inline-block"></span>
                  <span>
                    {isSpecificMode
                      ? `Bản sao được chọn lập biên bản thanh lý (${selectedIds.size} cuốn)`
                      : `Danh sách bản sao thanh lý (${selectedIds.size} đã chọn)`}
                  </span>
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {isSpecificMode
                    ? `Bản sao chỉ định từ danh mục kiểm soát thư viện.`
                    : `Chỉ các bản sao khả dụng hoặc hư hỏng (không trong trạng thái đang mượn) mới được hiển thị.`}
                </p>
              </div>

              {availableCopies.length > 2 && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                    className="text-xs h-8 px-3 rounded-xl border-gray-200 shadow-2xs font-semibold cursor-pointer"
                  >
                    {selectedIds.size === filteredCopies.length && filteredCopies.length > 0 ? (
                      <>
                        <Square className="h-3.5 w-3.5 mr-1.5 text-gray-500" /> Bỏ chọn tất cả
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-3.5 w-3.5 mr-1.5 text-brand" /> Chọn tất cả ({filteredCopies.length})
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {errors.copies && (
              <p className="text-xs text-red-600 font-semibold p-2.5 bg-red-50 border border-red-200 rounded-xl">
                {errors.copies}
              </p>
            )}

            {/* Quick Filter - chỉ hiện khi danh sách có nhiều hơn 2 bản sao */}
            {availableCopies.length > 2 && (
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Lọc nhanh danh sách theo mã vạch Code128, tên tài liệu hoặc vị trí kệ..."
                  value={copySearch}
                  onChange={(e) => setCopySearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 pl-9 pr-8 py-2 text-xs focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 shadow-2xs bg-white"
                />
                {copySearch && (
                  <button
                    type="button"
                    onClick={() => setCopySearch('')}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* Table of copies */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-2xs bg-white">
              <div className="max-h-60 overflow-y-auto">
                {loadingCopies ? (
                  <div className="flex items-center justify-center py-10 text-gray-500 text-xs gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-brand" />
                    <span>Đang tải danh sách bản sao...</span>
                  </div>
                ) : filteredCopies.length === 0 ? (
                  <div className="text-center py-10 text-xs text-gray-500">
                    <p className="font-semibold text-gray-700">Không tìm thấy bản sao phù hợp</p>
                    <p className="text-[11px] text-gray-400 mt-1">Vui lòng thử lại với từ khóa khác.</p>
                  </div>
                ) : (
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="sticky top-0 bg-slate-50 text-gray-600 border-b border-gray-200 font-semibold z-10 shadow-2xs">
                      <tr>
                        <th className="w-10 p-2.5 text-center">
                          <span className="sr-only">Chọn</span>
                        </th>
                        <th className="p-2.5 w-44 whitespace-nowrap">Mã vạch Code128</th>
                        <th className="p-2.5 min-w-[240px]">Tựa sách / Giáo trình</th>
                        <th className="p-2.5 w-44 whitespace-nowrap">Vị trí kệ</th>
                        <th className="p-2.5 w-32 text-center whitespace-nowrap">Hiện trạng</th>
                        <th className="p-2.5 w-32 text-right whitespace-nowrap">Đơn giá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {filteredCopies.map((cp) => {
                        const isSelected = selectedIds.has(cp.id);
                        return (
                          <tr
                            key={cp.id}
                            onClick={() => toggleSelect(cp.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-teal-50/60 hover:bg-teal-50/80 border-l-4 border-l-brand'
                                : 'hover:bg-gray-50/80'
                            }`}
                          >
                            <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(cp.id)}
                                className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"
                              />
                            </td>
                            <td className="p-2.5">
                              <span className="inline-flex items-center gap-1 font-mono font-bold text-brand bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60 text-[11px] tracking-wide">
                                <Barcode className="h-3.5 w-3.5 text-brand/70" />
                                {cp.barcode}
                              </span>
                            </td>
                            <td className="p-2.5">
                              <p className="font-semibold text-gray-900 leading-snug">{cp.book_title || 'Chưa cập nhật'}</p>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                {cp.category_name && (
                                  <span className="text-[10px] font-medium text-teal-800 bg-teal-50/80 border border-teal-200/50 px-1.5 py-0.2 rounded">
                                    {cp.category_name}
                                  </span>
                                )}
                                {cp.book_isbn && (
                                  <span className="text-[11px] text-gray-400">
                                    ISBN: {cp.book_isbn}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-2.5 text-gray-600">
                              <div className="flex items-center gap-1 text-[11px]">
                                <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                                <span className="truncate">{cp.shelf_location || 'Kho lưu trữ'}</span>
                              </div>
                            </td>
                            <td className="p-2.5 text-center">
                              {cp.status === 'damaged' ? (
                                <Badge variant="warning" size="sm">Hư hỏng</Badge>
                              ) : cp.status === 'lost' ? (
                                <Badge variant="danger" size="sm">Đã mất</Badge>
                              ) : cp.status === 'reserved' || cp.status === 'reserved_hold' ? (
                                <Badge variant="info" size="sm">Đang giữ chỗ</Badge>
                              ) : cp.status === 'borrowed' ? (
                                <Badge variant="info" size="sm">Đang mượn</Badge>
                              ) : cp.status === 'withdrawn' ? (
                                <Badge variant="neutral" size="sm">Đã thanh lý</Badge>
                              ) : (
                                <Badge variant="success" size="sm">Sẵn sàng</Badge>
                              )}
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-gray-900">
                              {formatCurrencyVND(cp.purchase_price || 0)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Total Value Summary Box */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl bg-teal-50/60 p-3.5 text-xs border border-teal-200/80 shadow-2xs gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-teal-100 text-brand">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <span className="text-gray-700 font-medium">
                  Số lượng bản sao thanh lý: <strong className="text-brand text-sm font-bold">{selectedIds.size}</strong> cuốn
                </span>
              </div>
              <div className="text-left sm:text-right">
                <div className="flex items-center gap-2 sm:justify-end">
                  <span className="text-gray-600 font-medium">Tổng giá trị thanh lý:</span>
                  <span className="text-base font-bold text-brand">{formatCurrencyVND(totalValue)}</span>
                </div>
                {totalValue > 0 && (
                  <p className="text-[11px] text-gray-500 italic mt-0.5">
                    ({numberToVietnameseWords(totalValue)})
                  </p>
                )}
              </div>
            </div>
          </div>
        </ModalBody>

        {/* Modal Footer - Always pinned at bottom */}
        <div className="border-t border-gray-200 bg-slate-50/95 px-6 py-3.5 shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-gray-500 leading-snug">
              <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
              <span>
                Biên bản sẽ lưu ở trạng thái <strong>Dự thảo (Draft)</strong>. Sau khi phê duyệt, bản sao mới chính thức chuyển sang <strong>Đã thanh lý (Withdrawn)</strong>.
              </span>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border-gray-300 shadow-2xs px-4 font-medium cursor-pointer"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting || selectedIds.size === 0}
                className="flex items-center gap-1.5 rounded-xl bg-brand hover:bg-teal-700 text-white shadow-2xs font-semibold px-4 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang lập biên bản...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4" />
                    <span>Xác nhận lập biên bản ({selectedIds.size})</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
