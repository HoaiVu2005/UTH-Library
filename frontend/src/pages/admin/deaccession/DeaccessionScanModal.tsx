import React, { useState, useEffect, useMemo } from 'react';
import {
  Scan,
  RefreshCw,
  CheckSquare,
  Square,
  AlertTriangle,
  FileCheck,
  Barcode,
  BookOpen,
  DollarSign,
  Layers,
  Search,
  Loader2,
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Modal, ModalBody } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import { formatCurrencyVND, formatDateVN } from '@/lib/utils';

export interface DeaccessionCandidate {
  id: number;
  barcode: string;
  book_id?: number;
  book_title: string;
  book_cover?: string;
  book_isbn?: string;
  category_name?: string;
  authors?: string[];
  status: string;
  status_display: string;
  note?: string;
  shelf_location: string;
  purchase_price: number;
  created_at?: string;
}

interface DeaccessionScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const REASON_OPTIONS = [
  { value: 'damaged', label: 'Hư hỏng không thể phục hồi' },
  { value: 'lost', label: 'Mất mát / Thất lạc sau kiểm kê' },
  { value: 'outdated', label: 'Lạc hậu nội dung / hết niên hạn' },
  { value: 'duplicate_surplus', label: 'Dư thừa do trùng lặp bản sao' },
];

export const DeaccessionScanModal: React.FC<DeaccessionScanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [candidates, setCandidates] = useState<DeaccessionCandidate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Batch Form State
  const [decisionNumber, setDecisionNumber] = useState<string>('');
  const [decisionDate, setDecisionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [reason, setReason] = useState<string>('damaged');
  const [committee, setCommittee] = useState<string>(
    'Hội đồng thanh lý tài liệu Thư viện Trường ĐH Giao thông Vận tải TP.HCM'
  );
  const [note, setNote] = useState<string>('');
  const [stats, setStats] = useState<{
    count: number;
    total_value: number;
    damaged_count: number;
    lost_count: number;
  }>({ count: 0, total_value: 0, damaged_count: 0, lost_count: 0 });

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/deaccession-candidates');
      const data = res.data?.data || {};
      const list: DeaccessionCandidate[] = data.candidates || [];
      setCandidates(list);
      setStats({
        count: data.count || list.length,
        total_value: data.total_value || 0,
        damaged_count: data.damaged_count || 0,
        lost_count: data.lost_count || 0,
      });

      // Default: select all eligible candidates
      setSelectedIds(new Set(list.map((c) => c.id)));
    } catch {
      toast.error('Không thể quét danh sách tài liệu đủ điều kiện thanh lý.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const currentYear = new Date().getFullYear();
      setDecisionNumber(`QĐ-${currentYear}/QĐ-ĐHGTVT`);
      setDecisionDate(new Date().toISOString().split('T')[0]);
      setSearchQuery('');
      setStatusFilter('all');
      fetchCandidates();
    }
  }, [isOpen]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((item) => {
      const matchSearch =
        !searchQuery.trim() ||
        item.barcode.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        item.book_title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (item.book_isbn && item.book_isbn.toLowerCase().includes(searchQuery.toLowerCase().trim()));

      const matchStatus =
        statusFilter === 'all' || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [candidates, searchQuery, statusFilter]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(filteredCandidates.map((c) => c.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const selectedTotalValue = useMemo(() => {
    return candidates
      .filter((c) => selectedIds.has(c.id))
      .reduce((sum, c) => sum + (c.purchase_price || 0), 0);
  }, [candidates, selectedIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.size === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 bản sao để lập biên bản thanh lý.');
      return;
    }
    if (!decisionNumber.trim()) {
      toast.warning('Vui lòng nhập số quyết định thanh lý.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        decision_number: decisionNumber.trim(),
        decision_date: decisionDate,
        reason,
        copy_ids: Array.from(selectedIds),
        committee: committee.trim(),
        note: note.trim() || undefined,
      };

      const res = await api.post('/deaccession-batches', payload);
      const batchCode = res.data?.data?.code || 'BBTL';
      toast.success(
        `Đã lập thành công biên bản thanh lý ${batchCode} cho ${selectedIds.size} bản sao! Bạn có thể phê duyệt 1-click ngay.`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail || 'Không thể tạo biên bản thanh lý. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalBody className="p-0 max-h-[90vh] flex flex-col overflow-hidden bg-slate-50/50">
        {/* Header */}
        <div className="p-5 bg-white border-b border-gray-200/80 flex items-start justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs border border-teal-200/60">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2">
                <span>Quét tài liệu đủ điều kiện thanh lý</span>
                <Badge variant="brand" size="sm">Tự động</Badge>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Hệ thống tự động phát hiện các bản sao sách bị hỏng hoặc báo mất chưa được lập biên bản để gom vào 1 lần duyệt duy nhất.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={fetchCandidates}
              disabled={isLoading}
              leftIcon={<RefreshCw className={isLoading ? 'w-3.5 h-3.5 animate-spin' : 'w-3.5 h-3.5'} />}
              className="h-8 text-xs font-semibold rounded-lg"
            >
              Quét lại
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scan Summary Banner */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-teal-50 via-slate-50 to-amber-50 border-b border-gray-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/80 p-2.5 rounded-xl border border-teal-200/70 shadow-2xs">
            <span className="text-gray-500 text-[11px] block">Đã quét phát hiện</span>
            <strong className="text-brand text-base font-bold">{stats.count} cuốn</strong>
          </div>
          <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/70 shadow-2xs">
            <span className="text-gray-500 text-[11px] block">Bị hỏng nặng</span>
            <strong className="text-amber-700 text-base font-bold">{stats.damaged_count} cuốn</strong>
          </div>
          <div className="bg-white/80 p-2.5 rounded-xl border border-rose-200/70 shadow-2xs">
            <span className="text-gray-500 text-[11px] block">Báo mất / Thất lạc</span>
            <strong className="text-rose-700 text-base font-bold">{stats.lost_count} cuốn</strong>
          </div>
          <div className="bg-white/80 p-2.5 rounded-xl border border-purple-200/70 shadow-2xs">
            <span className="text-gray-500 text-[11px] block">Đang chọn thanh lý</span>
            <strong className="text-purple-700 text-base font-bold">
              {selectedIds.size} cuốn ({formatCurrencyVND(selectedTotalValue)})
            </strong>
          </div>
        </div>

        {/* Content Body: Split into Candidates List (Left) and Batch Form (Right) */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Candidates Table (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Lọc theo mã vạch, tên sách..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs h-8 pl-8 pr-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-brand text-white border-brand'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Tất cả ({candidates.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('damaged')}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                    statusFilter === 'damaged'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  Bị hỏng ({stats.damaged_count})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('lost')}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                    statusFilter === 'lost'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  Báo mất ({stats.lost_count})
                </button>
              </div>
            </div>

            {/* Quick Action: Select all / Deselect all */}
            <div className="flex items-center justify-between text-xs px-1 text-gray-500">
              <span className="font-medium">
                Danh sách tài liệu ({filteredCandidates.length})
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-brand hover:underline font-semibold"
                >
                  Chọn tất cả
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-gray-500 hover:underline"
                >
                  Bỏ chọn tất cả
                </button>
              </div>
            </div>

            {/* Candidates Table Box */}
            <div className="bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-xs flex-1 min-h-[300px] max-h-[420px] overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-xs gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-brand" />
                  <span>Đang quét cơ sở dữ liệu...</span>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-xs p-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                  <span className="font-semibold text-gray-700">Không có bản sao nào cần thanh lý</span>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Hiện tất cả các bản sao trong thư viện đều đang ở trạng thái hợp lệ hoặc đã được lập biên bản.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredCandidates.map((c) => {
                    const isSelected = selectedIds.has(c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => toggleSelect(c.id)}
                        className={`p-3 flex items-start space-x-3 cursor-pointer transition-colors ${
                          isSelected ? 'bg-teal-50/30 hover:bg-teal-50/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="pt-1">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-brand" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-300" />
                          )}
                        </div>

                        {/* Thumbnail */}
                        <div className="w-12 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {c.book_cover ? (
                            <img
                              src={c.book_cover}
                              alt={c.book_title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="w-5 h-5 text-gray-400" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded">
                              {c.barcode}
                            </span>
                            {c.status === 'damaged' ? (
                              <Badge variant="warning" size="sm">Bị hỏng</Badge>
                            ) : (
                              <Badge variant="danger" size="sm">Báo mất</Badge>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug" title={c.book_title}>
                            {c.book_title}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-gray-500">
                            <span>Vị trí: {c.shelf_location}</span>
                            <span>Giá bìa: <strong className="text-gray-700">{formatCurrencyVND(c.purchase_price)}</strong></span>
                          </div>
                          {c.note && (
                            <p className="text-[10px] text-amber-700 italic truncate">
                              Ghi chú: {c.note}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Deaccession Batch Metadata Form (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-gray-200/80 rounded-xl p-4 shadow-xs space-y-3.5 flex flex-col justify-between">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-xs font-bold text-gray-800">
                <FileText className="w-4 h-4 text-brand" />
                <span>Thông tin Biên bản Thanh lý</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Số Quyết định thanh lý <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={decisionNumber}
                    onChange={(e) => setDecisionNumber(e.target.value)}
                    placeholder="VD: QĐ-2026/QĐ-ĐHGTVT"
                    className="text-xs h-8 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Ngày quyết định <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={decisionDate}
                    onChange={(e) => setDecisionDate(e.target.value)}
                    className="text-xs h-8 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Lý do thanh lý chính <span className="text-red-500">*</span>
                </label>
                <Select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  options={REASON_OPTIONS}
                  className="text-xs h-8 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Hội đồng thanh lý
                </label>
                <Input
                  value={committee}
                  onChange={(e) => setCommittee(e.target.value)}
                  className="text-xs h-8 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ghi chú thêm
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú về đợt thanh lý tài liệu..."
                  rows={2}
                  className="w-full text-xs p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-brand"
                />
              </div>

              {/* Informative Guidance */}
              <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl text-[11px] text-teal-900 leading-relaxed">
                💡 Biên bản sau khi tạo sẽ ở trạng thái <strong>Dự thảo</strong>. Trưởng thư viện / Quản trị viên chỉ cần nhấn <strong>Phê duyệt</strong> 1 lần duy nhất để thanh lý toàn bộ {selectedIds.size} cuốn sách đã chọn.
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting || selectedIds.size === 0}
                  className="w-full h-9 text-xs font-bold shadow-xs bg-brand hover:bg-[#006F70]"
                  leftIcon={isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCheck className="w-3.5 h-3.5" />}
                >
                  {isSubmitting ? 'Đang tạo biên bản...' : `Tạo biên bản thanh lý (${selectedIds.size} cuốn)`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};
