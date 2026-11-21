import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, ShieldAlert, Archive, RotateCcw, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

interface ApprovalRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  document: {
    id: number;
    title: string;
    document_type_display?: string;
    status: string;
  } | null;
  actionType: 'reject' | 'disable' | 'archive' | 'restore';
}

export const ApprovalRejectModal: React.FC<ApprovalRejectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  document: docItem,
  actionType,
}) => {
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !docItem) return null;

  const config = {
    reject: {
      title: 'Từ chối Phê duyệt Học liệu số',
      desc: 'Tài liệu sẽ được trả về trạng thái Từ chối (Rejected). Thủ thư có thể chỉnh sửa metadata hoặc thay thế tệp PDF theo góp ý bên dưới để gửi duyệt lại.',
      icon: <AlertTriangle className="w-6 h-6 text-rose-600" />,
      color: 'rose',
      placeholder: 'Ghi rõ lý do từ chối (ví dụ: Thiếu xác nhận của GVHD, Tệp PDF bị lỗi định dạng font chữ, Chưa có giấy cam đoan bản quyền...)',
      buttonText: 'Xác nhận Từ chối xuất bản',
      btnVariant: 'danger' as const,
      isRequiredReason: true,
    },
    disable: {
      title: 'Tạm khóa / Thu hồi Học liệu số',
      desc: 'Tài liệu sẽ bị ẩn khỏi Thư viện số của sinh viên ngay lập tức. Mọi phiên đọc mới sẽ bị chặn và lịch sử kiểm toán được lưu vết.',
      icon: <ShieldAlert className="w-6 h-6 text-amber-600" />,
      color: 'amber',
      placeholder: 'Ghi rõ nguyên nhân thu hồi (ví dụ: Phát hiện nghi vấn sao chép học thuật theo phản ánh, cập nhật theo công văn mới của Ban Giám hiệu...)',
      buttonText: 'Thu hồi tài liệu',
      btnVariant: 'danger' as const,
      isRequiredReason: true,
    },
    archive: {
      title: 'Lưu trữ / Đóng học liệu (Archive)',
      desc: 'Chuyển tài liệu sang trạng thái Lưu trữ lịch sử. Tài liệu không còn mở đọc công khai nhưng dữ liệu kiểm định vẫn được bảo toàn.',
      icon: <Archive className="w-6 h-6 text-slate-600" />,
      color: 'slate',
      placeholder: 'Ghi chú lý do lưu trữ (ví dụ: Chương trình đào tạo cũ đã hết hiệu lực tuyển sinh...)',
      buttonText: 'Xác nhận Lưu trữ',
      btnVariant: 'secondary' as const,
      isRequiredReason: false,
    },
    restore: {
      title: 'Khôi phục Học liệu số',
      desc: 'Khôi phục tài liệu về trạng thái Bản nháp (Draft) hoặc Chờ duyệt để thẩm định lại.',
      icon: <RotateCcw className="w-6 h-6 text-teal-600" />,
      color: 'teal',
      placeholder: 'Ghi chú lý do khôi phục tài liệu...',
      buttonText: 'Khôi phục tài liệu',
      btnVariant: 'primary' as const,
      isRequiredReason: false,
    },
  }[actionType];

  const handleSubmit = async () => {
    if (config.isRequiredReason && !reason.trim()) {
      toast.error('Vui lòng nhập lý do cụ thể trước khi xác nhận.');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/digital-library/documents/${docItem.id}/workflow`, {
        action: actionType,
        note: reason.trim(),
      });

      toast.success(`Đã thực hiện thao tác "${config.buttonText}" thành công.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Workflow action failed', err);
      toast.error(err.response?.data?.detail || 'Thao tác không thành công.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        <div className="p-6 sm:p-7 space-y-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-${config.color}-50 flex items-center justify-center shrink-0`}>
              {config.icon}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-800">{config.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{config.desc}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Học liệu đang xử lý:
            </span>
            <p className="font-bold text-slate-800 line-clamp-2">{docItem.title}</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {config.isRequiredReason ? 'Lý do thực hiện *' : 'Ghi chú / Nhận xét'}
            </label>
            <textarea
              rows={4}
              placeholder={config.placeholder}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#008B8B] focus:border-transparent font-medium"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button variant="outline" onClick={onClose} disabled={loading} className="cursor-pointer">
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className={`cursor-pointer ${
              actionType === 'reject' || actionType === 'disable'
                ? 'bg-rose-600 hover:bg-rose-700 text-white font-bold'
                : 'bg-[#008B8B] hover:bg-[#007272] text-white font-bold'
            }`}
          >
            {loading ? 'Đang lưu...' : config.buttonText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

