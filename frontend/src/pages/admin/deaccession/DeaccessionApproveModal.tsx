import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Loader2,
  X,
  FileCheck,
  Building2,
  Calendar,
  User,
  Layers,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Modal, ModalBody } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { toast } from '@/components/ui/Toast';
import { formatCurrencyVND } from '@/lib/utils';
import type { DeaccessionBatchListItem } from './DeaccessionTab';

interface DeaccessionApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: DeaccessionBatchListItem | null;
  onSuccess: () => void;
}

const DISPOSAL_METHODS = [
  { value: 'Tiêu hủy phân loại sinh học bảo vệ môi trường', label: 'Tiêu hủy / Phân hủy sinh học bảo vệ môi trường' },
  { value: 'Chuyển nhượng bán phế liệu nộp ngân sách trường', label: 'Bán phế liệu nộp ngân sách Nhà nước / Trường' },
  { value: 'Thanh lý chuyển giao nguyên liệu tái chế giấy', label: 'Thanh lý chuyển giao nguyên liệu tái chế giấy' },
  { value: 'Chuyển giao đơn vị cơ sở đào tạo vùng sâu vùng xa', label: 'Chuyển giao cho đơn vị cơ sở đào tạo kết nghĩa' },
];

export const DeaccessionApproveModal: React.FC<DeaccessionApproveModalProps> = ({
  isOpen,
  onClose,
  batch,
  onSuccess,
}) => {
  const [bghDecisionNumber, setBghDecisionNumber] = useState<string>('');
  const [bghDecisionDate, setBghDecisionDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [bghApproverName, setBghApproverName] = useState<string>('PGS.TS Nguyễn Xuân Phương - Hiệu trưởng');
  const [disposalMethod, setDisposalMethod] = useState<string>(
    'Tiêu hủy phân loại sinh học bảo vệ môi trường'
  );
  const [approvalNote, setApprovalNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && batch) {
      const year = new Date().getFullYear();
      setBghDecisionNumber(`QĐ-${year}/QĐ-BGH-ĐHGTVT`);
      setBghDecisionDate(new Date().toISOString().split('T')[0]);
      setBghApproverName('PGS.TS Nguyễn Xuân Phương - Hiệu trưởng');
      setDisposalMethod('Tiêu hủy phân loại sinh học bảo vệ môi trường');
      setApprovalNote(
        `Đồng ý phê duyệt xuất hủy thanh lý theo đề xuất của Hội đồng thanh lý tài sản Thư viện (Biên bản ${batch.code}).`
      );
      setErrors({});
    }
  }, [isOpen, batch]);

  if (!isOpen || !batch) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!bghDecisionNumber.trim()) {
      errs.bghDecisionNumber = 'Vui lòng nhập số Quyết định phê duyệt của Ban Giám hiệu.';
    }
    if (!bghDecisionDate) {
      errs.bghDecisionDate = 'Vui lòng chọn ngày ký quyết định phê duyệt.';
    }
    if (!bghApproverName.trim()) {
      errs.bghApproverName = 'Vui lòng nhập họ tên & chức danh người ký phê duyệt.';
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
        bgh_decision_number: bghDecisionNumber.trim(),
        bgh_decision_date: bghDecisionDate,
        bgh_approver_name: bghApproverName.trim(),
        disposal_method: disposalMethod,
        approval_note: approvalNote.trim(),
      };

      await api.post(`/deaccession-batches/${batch.id}/approve`, payload);
      toast.success(
        `Đã phê duyệt biên bản ${batch.code} thành công theo QĐ số ${bghDecisionNumber.trim()} của Ban Giám hiệu.`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.response?.data?.message || 'Không thể phê duyệt biên bản thanh lý.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-emerald-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-2xs shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                Phê duyệt Biên bản Thanh lý Tài sản (Ban Giám hiệu)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Cập nhật Quyết định phê duyệt của Ban Giám hiệu để xuất hủy tài sản khỏi sổ theo dõi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200/60 hover:text-gray-600 transition-colors cursor-pointer shrink-0"
            title="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <ModalBody className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
          {/* Batch Summary Card */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-teal-800 font-mono text-sm">{batch.code}</span>
                <span className="text-xs text-gray-500">• QĐ Hội đồng: <strong>{batch.decision_number}</strong></span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Chờ phê duyệt
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-gray-500 block">Số lượng thanh lý</span>
                <span className="font-bold text-gray-900 text-sm">{batch.total_copies} cuốn</span>
              </div>
              <div>
                <span className="text-gray-500 block">Tổng nguyên giá</span>
                <span className="font-bold text-brand text-sm">{formatCurrencyVND(batch.total_value)}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Lý do chính</span>
                <span className="font-medium text-gray-800">{batch.reason_display}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Thủ thư lập dự thảo</span>
                <span className="font-medium text-gray-800">{batch.created_by_name}</span>
              </div>
            </div>
          </div>

          {/* BGH Approval Inputs */}
          <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/25 p-4 sm:p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-1 border-b border-emerald-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-600 rounded-full inline-block"></span>
                <span>Căn cứ Quyết định phê duyệt của Ban Giám hiệu</span>
              </h3>
              <span className="text-[11px] text-gray-400 italic">Bắt buộc theo Luật Quản lý tài sản công</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Số Quyết định BGH phê duyệt <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    value={bghDecisionNumber}
                    onChange={(e) => setBghDecisionNumber(e.target.value)}
                    placeholder="Ví dụ: QĐ-125/QĐ-BGH-ĐHGTVT"
                    error={errors.bghDecisionNumber}
                    className="pl-9 bg-white rounded-xl shadow-2xs text-xs h-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ngày ký Quyết định <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={bghDecisionDate}
                    onChange={(e) => setBghDecisionDate(e.target.value)}
                    error={errors.bghDecisionDate}
                    className="pl-9 bg-white rounded-xl shadow-2xs text-xs h-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Người ký phê duyệt (Đại diện BGH) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    value={bghApproverName}
                    onChange={(e) => setBghApproverName(e.target.value)}
                    placeholder="PGS.TS Nguyễn Xuân Phương - Hiệu trưởng"
                    error={errors.bghApproverName}
                    className="pl-9 bg-white rounded-xl shadow-2xs text-xs h-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phương thức xử lý tài sản <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Layers className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Select
                    value={disposalMethod}
                    onChange={(e) => setDisposalMethod(e.target.value)}
                    options={DISPOSAL_METHODS}
                    className="pl-9 bg-white rounded-xl shadow-2xs text-xs h-9"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ý kiến / Căn cứ phê duyệt của Ban Giám hiệu
                </label>
                <textarea
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="Ghi rõ ý kiến chỉ đạo hoặc căn cứ công văn kết luận của Hội đồng..."
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 bg-white shadow-2xs transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Legal Warning Banner */}
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-3.5 border border-amber-200/80 text-xs text-amber-900">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11.5px]">
              <strong>Lưu ý pháp lý:</strong> Sau khi xác nhận phê duyệt, tất cả{' '}
              <strong>{batch.total_copies} bản sao</strong> trong biên bản này sẽ chính thức bị xuất sổ
              và chuyển vĩnh viễn sang trạng thái <strong>Đã thanh lý (Withdrawn)</strong>. Thao tác này có
              hiệu lực trên toàn hệ thống và được lưu vết vào Nhật ký kiểm toán (Audit Logs).
            </div>
          </div>
        </ModalBody>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-slate-50/95 px-6 py-3.5 flex items-center justify-end gap-2.5 shrink-0">
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
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs font-semibold px-4 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang xử lý phê duyệt...</span>
              </>
            ) : (
              <>
                <FileCheck className="h-4 w-4" />
                <span>Xác nhận & Phê duyệt xuất hủy</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

