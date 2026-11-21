import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  Scan,
  AlertTriangle,
  Loader2,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Camera,
  Users,
  ShieldAlert,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Modal, ModalBody } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import { formatCurrencyVND, numberToVietnameseWords } from '@/lib/utils';
import { CameraBarcodeScannerModal } from '@/components/ui/CameraBarcodeScannerModal';

export interface BatchCopyItem {
  id: number;
  barcode: string;
  shelf_location?: string;
  purchase_price?: number;
  book_title?: string;
  book_isbn?: string;
  category_name?: string;
  status: string;
  status_display: string;
  reason: string; // Lý do thanh lý riêng cho từng cuốn
}

export interface CommitteeMember {
  id: string;
  name: string;
  title: string;
  role: string;
}

interface DeaccessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCopyIds?: number[];
  onSuccess: () => void;
}

const REASON_OPTIONS = [
  { value: 'damaged', label: 'Hư hỏng nặng không thể phục hồi' },
  { value: 'outdated', label: 'Lạc hậu nội dung / hết niên hạn' },
  { value: 'lost', label: 'Mất mát trong quá trình kiểm kê' },
  { value: 'duplicate_surplus', label: 'Dư thừa, rách nát do trùng lặp bản sao' },
];

const COMMITTEE_ROLE_OPTIONS = [
  { value: 'Chủ tịch Hội đồng', label: 'Chủ tịch Hội đồng' },
  { value: 'Phó Chủ tịch Hội đồng', label: 'Phó Chủ tịch Hội đồng' },
  { value: 'Thư ký Hội đồng', label: 'Thư ký Hội đồng' },
  { value: 'Ủy viên', label: 'Ủy viên' },
];

const DEFAULT_COMMITTEE: CommitteeMember[] = [
  {
    id: '1',
    name: 'PGS.TS Nguyễn Xuân Phương',
    title: 'Ban Giám hiệu / Hiệu trưởng',
    role: 'Chủ tịch Hội đồng',
  },
  {
    id: '2',
    name: 'ThS. Trần Thị Thu Thư',
    title: 'Tổ trưởng Lưu thông - Thư viện UTH',
    role: 'Thư ký Hội đồng',
  },
  {
    id: '3',
    name: 'Nguyễn Văn Quản Trị',
    title: 'Quản trị viên Hệ thống Thư viện',
    role: 'Ủy viên',
  },
  {
    id: '4',
    name: 'Đại diện Phòng Kế hoạch - Tài chính',
    title: 'Phòng Kế hoạch - Tài chính UTH',
    role: 'Ủy viên',
  },
];

const EMPTY_INITIAL_IDS: number[] = [];

// Phát âm thanh phản hồi khi quét mã vạch (Web Audio API)
const playSound = (type: 'success' | 'error') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (type === 'success') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {
    // Không làm gián đoạn UI nếu trình duyệt chặn autoplay audio
  }
};

export const DeaccessionModal: React.FC<DeaccessionModalProps> = ({
  isOpen,
  onClose,
  initialCopyIds = EMPTY_INITIAL_IDS,
  onSuccess,
}) => {
  // 1. Pháp lý & Hội đồng
  const [decisionNumber, setDecisionNumber] = useState<string>('');
  const [decisionDate, setDecisionDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>(DEFAULT_COMMITTEE);
  const [note, setNote] = useState<string>('');

  // 2. Barcode scanner state
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [scanLoading, setScanLoading] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // 3. Batch copies list
  const [batchCopies, setBatchCopies] = useState<BatchCopyItem[]>([]);

  // 4. Candidates (Chỉ hiển thị sách hỏng / báo mất)
  const [candidates, setCandidates] = useState<BatchCopyItem[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState<boolean>(false);
  const [showCandidates, setShowCandidates] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const initialCopyIdsKey = useMemo(() => (initialCopyIds || []).join(','), [initialCopyIds]);

  // Tải danh sách ứng viên (CHỈ SÁCH HỎNG HOẶC MẤT, KHÔNG LẤY SÁCH SẴN SÀNG)
  const fetchDamagedOrLostCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const res = await api.get('/copies/deaccession-candidates');
      const data = res.data?.data?.copies || res.data?.data || [];
      const items: BatchCopyItem[] = data.map((c: any) => ({
        id: c.id,
        barcode: c.barcode,
        shelf_location: c.shelf_location,
        purchase_price: c.purchase_price || 0,
        book_title: c.book_title || c.book?.title || 'Không rõ tựa sách',
        book_isbn: c.book_isbn || c.book?.isbn || '',
        category_name: c.category_name || c.book?.category?.name || '',
        status: c.status,
        status_display: c.status_display || (c.status === 'damaged' ? 'Hư hỏng' : 'Báo mất'),
        reason: c.status === 'lost' ? 'lost' : 'damaged',
      }));
      setCandidates(items);
    } catch (err) {
      console.error('Không thể tải gợi ý sách hỏng/mất:', err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  // Nạp các bản sao ban đầu (nếu mở từ shortcut menu 3 chấm)
  const fetchInitialCopies = async (ids: number[]) => {
    if (ids.length === 0) return;
    try {
      const res = await api.get('/copies', { params: { group_by: 'copy', ids: ids.join(',') } });
      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : (res.data?.results || res.data?.data?.results || []);

      const items: BatchCopyItem[] = data.map((c: any) => ({
        id: c.id,
        barcode: c.barcode,
        shelf_location: c.shelf_location,
        purchase_price: c.purchase_price || 0,
        book_title: c.book_title || c.book?.title || 'Không rõ tựa sách',
        book_isbn: c.book_isbn || c.book?.isbn || '',
        category_name: c.category_name || c.book?.category?.name || '',
        status: c.status,
        status_display: c.status_display || c.status,
        reason: c.status === 'lost' ? 'lost' : c.status === 'damaged' ? 'damaged' : 'outdated',
      }));

      setBatchCopies((prev) => {
        const existingIds = new Set(prev.map((x) => x.id));
        const newOnes = items.filter((x) => !existingIds.has(x.id));
        return [...prev, ...newOnes];
      });
    } catch (err) {
      console.error('Không thể nạp bản sao ban đầu:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setScanError(null);
      setBarcodeInput('');
      setBatchCopies([]);

      const currentYear = new Date().getFullYear();
      setDecisionNumber((prev) => prev || `QĐ-${currentYear}/QĐ-ĐHGTVT`);

      const ids = initialCopyIdsKey ? initialCopyIdsKey.split(',').map(Number).filter(Boolean) : [];
      if (ids.length > 0) {
        fetchInitialCopies(ids);
      }

      fetchDamagedOrLostCandidates();

      // Auto focus ô quét mã vạch
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 200);
    }
  }, [isOpen, initialCopyIdsKey]);

  // Xử lý quét mã vạch
  const handleBarcodeScan = async (rawCode?: string) => {
    const code = (rawCode || barcodeInput).trim().toUpperCase();
    if (!code) return;

    setScanLoading(true);
    setScanError(null);

    // 1. Kiểm tra quét trùng trong danh sách hiện tại
    if (batchCopies.some((c) => c.barcode.toUpperCase() === code)) {
      playSound('error');
      setScanError(`Mã vạch "${code}" đã có trong danh sách biên bản này.`);
      setScanLoading(false);
      barcodeInputRef.current?.select();
      return;
    }

    try {
      const res = await api.get(`/copies/lookup?barcode=${encodeURIComponent(code)}`);
      const copy = res.data?.data;
      if (!copy) {
        playSound('error');
        setScanError(`Không tìm thấy bản sao với mã vạch "${code}".`);
        return;
      }

      // 2. Kiểm tra các ràng buộc an toàn
      if (copy.status === 'borrowed') {
        playSound('error');
        setScanError(`Bản sao "${code}" đang được bạn đọc mượn. Không thể đưa vào biên bản thanh lý.`);
        return;
      }
      if (copy.status === 'reserved_hold' || copy.status === 'reserved') {
        playSound('error');
        setScanError(`Bản sao "${code}" đang được giữ chỗ đặt trước. Không thể đưa vào biên bản thanh lý.`);
        return;
      }
      if (copy.status === 'withdrawn') {
        playSound('error');
        setScanError(`Bản sao "${code}" đã được thanh lý trước đó rồi.`);
        return;
      }
      if (copy.deaccession_batch) {
        playSound('error');
        setScanError(`Bản sao "${code}" đã nằm trong biên bản thanh lý khác (${copy.deaccession_batch_code || 'đang xử lý'}).`);
        return;
      }

      // 3. Quét thành công -> Thêm vào danh sách
      playSound('success');
      const defaultReason = copy.status === 'lost' ? 'lost' : copy.status === 'damaged' ? 'damaged' : 'outdated';
      const newItem: BatchCopyItem = {
        id: copy.id,
        barcode: copy.barcode,
        shelf_location: copy.shelf_location,
        purchase_price: copy.purchase_price || 0,
        book_title: copy.book_title || copy.book?.title || 'Không rõ tựa sách',
        book_isbn: copy.book_isbn || copy.book?.isbn || '',
        category_name: copy.category_name || copy.book?.category?.name || '',
        status: copy.status,
        status_display: copy.status_display || copy.status,
        reason: defaultReason,
      };

      setBatchCopies((prev) => [newItem, ...prev]);
      setBarcodeInput('');
      setScanError(null);
      toast.success(`Đã thêm: [${copy.barcode}] ${newItem.book_title}`);

      // Giữ focus cho lần quét tiếp theo
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 50);
    } catch (err: any) {
      playSound('error');
      const msg = err.response?.data?.detail || `Không tìm thấy bản sao với mã vạch "${code}".`;
      setScanError(msg);
    } finally {
      setScanLoading(false);
    }
  };

  const handleKeyDownBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBarcodeScan();
    }
  };

  // Thêm ứng viên từ danh sách gợi ý sách hỏng / mất
  const handleAddCandidate = (candidate: BatchCopyItem) => {
    if (batchCopies.some((c) => c.id === candidate.id)) {
      toast.warning(`Bản sao ${candidate.barcode} đã có trong biên bản.`);
      return;
    }
    playSound('success');
    setBatchCopies((prev) => [candidate, ...prev]);
    toast.success(`Đã thêm: [${candidate.barcode}] ${candidate.book_title}`);
  };

  // Thêm tất cả ứng viên hỏng / mất đã phát hiện
  const handleAddAllDamagedLost = () => {
    const existingIds = new Set(batchCopies.map((c) => c.id));
    const toAdd = candidates.filter((c) => !existingIds.has(c.id));
    if (toAdd.length === 0) {
      toast.info('Tất cả sách hỏng/mất đã phát hiện đều đã có trong biên bản.');
      return;
    }
    playSound('success');
    setBatchCopies((prev) => [...toAdd, ...prev]);
    toast.success(`Đã thêm toàn bộ ${toAdd.length} bản sao hỏng/mất vào biên bản.`);
  };

  // Xóa một dòng khỏi biên bản
  const handleRemoveCopy = (id: number) => {
    setBatchCopies((prev) => prev.filter((c) => c.id !== id));
  };

  // Đổi lý do riêng của từng cuốn
  const handleReasonChange = (id: number, newReason: string) => {
    setBatchCopies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, reason: newReason } : c))
    );
  };

  // Thành phần Hội đồng
  const handleAddMember = () => {
    const newId = String(Date.now());
    setCommitteeMembers((prev) => [
      ...prev,
      { id: newId, name: '', title: '', role: 'Ủy viên' },
    ]);
  };

  const handleUpdateMember = (id: string, field: keyof CommitteeMember, value: string) => {
    setCommitteeMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleRemoveMember = (id: string) => {
    if (committeeMembers.length <= 1) {
      toast.warning('Hội đồng thẩm định cần có ít nhất một thành viên.');
      return;
    }
    setCommitteeMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // Tính tổng số lượng và tổng nguyên giá
  const totalQuantity = batchCopies.length;
  const totalValue = useMemo(() => {
    return batchCopies.reduce((sum, c) => sum + (c.purchase_price || 0), 0);
  }, [batchCopies]);

  // Validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!decisionNumber.trim()) {
      errs.decisionNumber = 'Vui lòng nhập số quyết định thành lập hội đồng thanh lý.';
    }
    if (!decisionDate) {
      errs.decisionDate = 'Vui lòng chọn ngày quyết định.';
    }
    if (batchCopies.length === 0) {
      errs.copies = 'Vui lòng quét hoặc thêm ít nhất một bản sao tài liệu vào biên bản thanh lý.';
    }
    const hasInvalidMember = committeeMembers.some((m) => !m.name.trim());
    if (hasInvalidMember) {
      errs.committee = 'Vui lòng nhập đầy đủ họ và tên của các thành viên trong Hội đồng thẩm định.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Ghép danh sách thành viên hội đồng thành văn bản có cấu trúc chuẩn
      const committeeText = committeeMembers
        .map((m, idx) => `${idx + 1}. ${m.name.trim()} - ${m.title.trim() || 'Thành viên'} (${m.role})`)
        .join('\n');

      // Tạo map lý do riêng từng cuốn
      const copyReasons: Record<string, string> = {};
      batchCopies.forEach((c) => {
        copyReasons[String(c.id)] = c.reason;
      });

      // Xác định lý do chung của lô (lấy lý do phổ biến nhất)
      const reasonCount: Record<string, number> = {};
      batchCopies.forEach((c) => {
        reasonCount[c.reason] = (reasonCount[c.reason] || 0) + 1;
      });
      let dominantReason = 'damaged';
      let maxCount = 0;
      Object.entries(reasonCount).forEach(([r, count]) => {
        if (count > maxCount) {
          maxCount = count;
          dominantReason = r;
        }
      });

      const payload = {
        decision_number: decisionNumber.trim(),
        decision_date: decisionDate,
        reason: dominantReason,
        committee: committeeText,
        note: note.trim(),
        copy_ids: batchCopies.map((c) => c.id),
        copy_reasons: copyReasons,
      };

      await api.post('/deaccession-batches', payload);
      toast.success(`Đã lập biên bản thanh lý thành công cho ${batchCopies.length} bản sao tài liệu.`);
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white rounded-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-teal-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white shadow-2xs shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <span>Lập Biên bản Thanh lý Tài sản Thư viện theo Lô</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand font-semibold">
                  Chuẩn Nghiệp vụ UTH
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Quét mã vạch gáy sách để gom lô thanh lý, thẩm định từng cuốn và trình Ban Giám hiệu phê duyệt
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

        {/* Modal Body - Scrollable */}
        <ModalBody className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 min-h-0">
          {/* Section 1: Căn cứ pháp lý & Hội đồng Thẩm định */}
          <div className="rounded-2xl border border-teal-200/70 bg-teal-50/25 p-4 sm:p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-1 border-b border-teal-100/70">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-brand rounded-full inline-block"></span>
                <span>1. Căn cứ pháp lý & Quyết định thành lập Hội đồng</span>
              </h3>
              <span className="text-[11px] text-gray-400 italic">Mục có dấu (*) là bắt buộc</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Số Quyết định thành lập HĐ <span className="text-red-500">*</span>
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
            </div>

            {/* Danh sách Thành viên Hội đồng có cấu trúc */}
            <div className="space-y-2 pt-1 border-t border-teal-100/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-brand" />
                  <span>Danh sách thành viên Hội đồng thẩm định ({committeeMembers.length} thành viên)</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="text-xs font-semibold text-brand hover:text-teal-800 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm thành viên</span>
                </button>
              </div>

              {errors.committee && (
                <p className="text-xs text-red-600 font-medium">{errors.committee}</p>
              )}

              <div className="space-y-2">
                {committeeMembers.map((member, idx) => (
                  <div
                    key={member.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-white p-2 rounded-xl border border-gray-200/80 shadow-2xs"
                  >
                    <div className="sm:col-span-1 text-center font-mono text-xs text-gray-400 font-bold">
                      #{idx + 1}
                    </div>
                    <div className="sm:col-span-4">
                      <Input
                        value={member.name}
                        onChange={(e) => handleUpdateMember(member.id, 'name', e.target.value)}
                        placeholder="Họ và tên thành viên"
                        className="text-xs h-8 bg-transparent"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <Input
                        value={member.title}
                        onChange={(e) => handleUpdateMember(member.id, 'title', e.target.value)}
                        placeholder="Chức vụ / Đơn vị công tác"
                        className="text-xs h-8 bg-transparent"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Select
                        value={member.role}
                        onChange={(e) => handleUpdateMember(member.id, 'role', e.target.value)}
                        options={COMMITTEE_ROLE_OPTIONS}
                        className="text-xs h-8 bg-transparent"
                      />
                    </div>
                    <div className="sm:col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={committeeMembers.length <= 1}
                        className="text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed p-1 cursor-pointer"
                        title="Xóa thành viên này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Ghi chú / Căn cứ đề xuất xử lý tài sản
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Căn cứ biên bản kiểm kê thư viện định kỳ; đề xuất tiêu hủy phân loại sinh học hoặc chuyển nhượng phế liệu thu hồi ngân sách..."
                rows={2}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 bg-white shadow-2xs transition-all resize-none"
              />
            </div>
          </div>

          {/* Section 2: Đưa sách vào Biên bản (Barcode Scanner & Auto Suggest) */}
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-gray-200">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-orange-500 rounded-full inline-block"></span>
                  <span>2. Quét mã vạch Code128 đưa sách vào Biên bản</span>
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Cầm máy quét mã vạch quét trực tiếp trên gáy sách. Hệ thống tự động kiểm tra an toàn và thêm vào danh mục.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCandidates(!showCandidates)}
                  className="text-xs h-8 px-3 rounded-xl border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 font-semibold cursor-pointer shadow-2xs"
                >
                  <AlertTriangle className="h-3.5 w-3.5 mr-1 text-amber-600" />
                  <span>
                    {showCandidates ? 'Ẩn gợi ý sách hỏng/mất' : `Gợi ý sách hỏng & mất (${candidates.length})`}
                  </span>
                </Button>
              </div>
            </div>

            {/* Ô QUÉT MÃ VẠCH (Auto-focus & Bắt phím Enter) */}
            <div className="bg-white border-2 border-brand/40 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3.5 top-2.5 text-brand pointer-events-none">
                    <Scan className="w-4 h-4 animate-pulse" />
                  </div>
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyDown={handleKeyDownBarcodeInput}
                    placeholder="Quét mã vạch Code128 gáy sách tại đây (nhấn Enter hoặc bấm Thêm)..."
                    className="w-full rounded-xl border border-brand/30 pl-10 pr-24 py-2.5 text-xs font-mono font-bold focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 bg-teal-50/20 text-gray-900 placeholder:text-gray-400"
                  />
                  <div className="absolute right-2 top-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="px-2 py-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Quét bằng Camera thiết bị"
                    >
                      <Camera className="w-3.5 h-3.5 text-gray-600" />
                      <span className="hidden sm:inline">Camera</span>
                    </button>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={!barcodeInput.trim() || scanLoading}
                  isLoading={scanLoading}
                  onClick={() => handleBarcodeScan()}
                  className="rounded-xl px-5 text-xs font-bold cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Thêm sách</span>
                </Button>
              </div>

              {/* Thông báo lỗi quét mã vạch */}
              {scanError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 animate-shake">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="font-semibold">{scanError}</span>
                </div>
              )}
            </div>

            {/* Panel Gợi ý Sách hỏng / Mất (Chỉ hiện khi bật và KHÔNG CÓ SÁCH SẴN SÀNG) */}
            {showCandidates && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-3.5 space-y-2.5 animate-page-enter">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Danh sách bản sao phát hiện Hư hỏng hoặc Báo mất ({candidates.length} cuốn)</span>
                  </div>
                  {candidates.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAddAllDamagedLost}
                      className="text-xs font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                    >
                      + Thêm tất cả sách hỏng/mất này
                    </button>
                  )}
                </div>

                {loadingCandidates ? (
                  <div className="text-center py-4 text-xs text-gray-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    <span>Đang tìm kiếm sách hỏng và mất trong kho...</span>
                  </div>
                ) : candidates.length === 0 ? (
                  <p className="text-xs text-gray-500 py-2 italic text-center">
                    Hiện tại trong kho không có bản sao nào ở trạng thái Hư hỏng hoặc Báo mất.
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {candidates.map((cand) => {
                      const isAdded = batchCopies.some((c) => c.id === cand.id);
                      return (
                        <div
                          key={cand.id}
                          className="flex items-center justify-between p-2 bg-white rounded-xl border border-amber-100 text-xs shadow-2xs hover:bg-amber-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              {cand.barcode}
                            </span>
                            <span className="font-semibold text-gray-900 truncate max-w-xs">
                              {cand.book_title}
                            </span>
                            <Badge variant={cand.status === 'lost' ? 'danger' : 'warning'} size="sm">
                              {cand.status_display}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-mono text-gray-600 text-xs">
                              {formatCurrencyVND(cand.purchase_price || 0)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddCandidate(cand)}
                              disabled={isAdded}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                                isAdded
                                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                  : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                              }`}
                            >
                              {isAdded ? 'Đã thêm' : '+ Thêm'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Section 3: Bảng danh sách bản sao trong Biên bản & Chọn lý do riêng */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                  <span>Danh mục sách đưa vào Biên bản ({totalQuantity} cuốn)</span>
                </h4>
                {totalQuantity > 0 && (
                  <button
                    type="button"
                    onClick={() => setBatchCopies([])}
                    className="text-[11px] text-gray-400 hover:text-red-600 font-semibold cursor-pointer"
                  >
                    Xóa tất cả danh sách
                  </button>
                )}
              </div>

              {errors.copies && (
                <p className="text-xs text-red-600 font-semibold p-2.5 bg-red-50 border border-red-200 rounded-xl">
                  {errors.copies}
                </p>
              )}

              <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-2xs bg-white">
                <div className="max-h-72 overflow-y-auto">
                  {batchCopies.length === 0 ? (
                    <div className="text-center py-12 px-4 text-xs text-gray-400 space-y-2">
                      <Scan className="w-8 h-8 text-gray-300 mx-auto animate-bounce" />
                      <p className="font-semibold text-gray-600 text-sm">Chưa có cuốn sách nào trong biên bản</p>
                      <p className="text-[11px] text-gray-400 max-w-md mx-auto">
                        Hãy quét mã vạch trên gáy sách bằng máy quét cầm tay hoặc chọn từ danh sách sách hỏng/mất bên trên.
                      </p>
                    </div>
                  ) : (
                    <table className="w-full border-collapse text-left text-xs">
                      <thead className="sticky top-0 bg-slate-50 text-gray-600 border-b border-gray-200 font-semibold z-10 shadow-2xs text-[11px] uppercase tracking-wider">
                        <tr>
                          <th className="w-10 p-2.5 text-center">STT</th>
                          <th className="p-2.5 w-36 whitespace-nowrap">Mã vạch Code128</th>
                          <th className="p-2.5 min-w-[200px]">Tựa sách / Giáo trình</th>
                          <th className="p-2.5 w-32 whitespace-nowrap">Hiện trạng</th>
                          <th className="p-2.5 w-28 text-right whitespace-nowrap">Nguyên giá</th>
                          <th className="p-2.5 min-w-[220px]">Lý do thanh lý riêng</th>
                          <th className="w-14 p-2.5 text-center">Bỏ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {batchCopies.map((cp, idx) => (
                          <tr key={cp.id} className="hover:bg-teal-50/15 transition-colors">
                            <td className="p-2.5 text-center font-mono text-gray-400 text-xs">
                              {idx + 1}
                            </td>
                            <td className="p-2.5 whitespace-nowrap">
                              <span className="font-mono font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-xs">
                                {cp.barcode}
                              </span>
                            </td>
                            <td className="p-2.5">
                              <div className="font-semibold text-gray-900 leading-tight">
                                {cp.book_title}
                              </div>
                              <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                                Kệ: {cp.shelf_location || 'Kho UTH'}
                              </div>
                            </td>
                            <td className="p-2.5 whitespace-nowrap">
                              <Badge
                                variant={
                                  cp.status === 'damaged'
                                    ? 'warning'
                                    : cp.status === 'lost'
                                    ? 'danger'
                                    : 'neutral'
                                }
                                size="sm"
                              >
                                {cp.status_display}
                              </Badge>
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-gray-800 whitespace-nowrap">
                              {formatCurrencyVND(cp.purchase_price || 0)}
                            </td>
                            <td className="p-2.5">
                              <Select
                                value={cp.reason}
                                onChange={(e) => handleReasonChange(cp.id, e.target.value)}
                                options={REASON_OPTIONS}
                                className="text-xs h-8 bg-white border-gray-200 shadow-2xs rounded-lg"
                              />
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveCopy(cp.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                                title="Bỏ cuốn sách này ra khỏi biên bản"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        {/* Modal Footer: Statistics & Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-slate-50/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-gray-600 flex flex-wrap items-center gap-x-4 gap-y-1">
            <div>
              Tổng số lượng: <strong className="text-brand text-sm">{totalQuantity}</strong> cuốn
            </div>
            <div>
              Tổng nguyên giá: <strong className="text-orange-600 text-sm">{formatCurrencyVND(totalValue)}</strong>
            </div>
            {totalValue > 0 && (
              <span className="text-[11px] text-gray-400 italic">
                ({numberToVietnameseWords(totalValue)})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-4 text-xs font-semibold cursor-pointer"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              disabled={isSubmitting || totalQuantity === 0}
              className="rounded-xl px-5 text-xs font-bold cursor-pointer"
            >
              <FileCheck className="w-4 h-4 mr-1.5" />
              <span>Hoàn tất & Lưu Biên bản dự thảo</span>
            </Button>
          </div>
        </div>
      </form>

      {/* Camera Barcode Scanner Modal */}
      <CameraBarcodeScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScanSuccess={(code) => {
          setIsCameraOpen(false);
          handleBarcodeScan(code);
        }}
        title="Quét mã vạch Code128 trên gáy sách"
        description="Hướng Camera vào tem mã vạch dán trên gáy cuốn sách cần thanh lý"
      />
    </Modal>
  );
};
