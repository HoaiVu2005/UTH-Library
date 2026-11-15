import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Building,
  CreditCard,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  X,
} from 'lucide-react';
import { Button } from './Button';
import { formatCurrencyVND, cn } from '@/lib/utils';
import { api, formatApiError } from '@/lib/api';
import { toast } from './Toast';
import { broadcastRealtimeSync } from '@/lib/realtime';

export interface QRFinePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  fineId?: number | null;
  amount: number;
  fineTypeDisplay?: string;
  bookTitle?: string;
  isPayAll?: boolean;
  patronCardCode: string;
  patronName?: string;
  onSuccess?: () => void;
}

const BANK_INFO = {
  bankId: 'VCB', // Vietcombank
  bankName: 'Vietcombank (VCB)',
  branch: 'Chi nhánh TP.HCM',
  accountNumber: '102388889999',
  accountName: 'TRUONG DH GIAO THONG VAN TAI TPHCM',
};

export const QRFinePaymentModal: React.FC<QRFinePaymentModalProps> = ({
  isOpen,
  onClose,
  fineId,
  amount,
  fineTypeDisplay,
  bookTitle,
  isPayAll = false,
  patronCardCode,
  patronName,
  onSuccess,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [transactionCode, setTransactionCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [localQrDataUrl, setLocalQrDataUrl] = useState<string>('');
  const [imageError, setImageError] = useState<boolean>(false);
  const qrImageRef = useRef<HTMLImageElement>(null);

  // Transfer description syntax: UTH <CARD_CODE> [NOP PHAT | PHAT <ID>]
  const transferContent = isPayAll
    ? `UTH ${patronCardCode || 'BAN_DOC'} NOP PHAT`
    : `UTH ${patronCardCode || 'BAN_DOC'} PHAT ${fineId || ''}`.trim();

  // VietQR QuickLink API (Official Napas standard)
  const vietQrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
    transferContent
  )}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  // Generate fallback local QR code using QRCode library
  useEffect(() => {
    if (isOpen && amount > 0) {
      setImageError(false);
      // Raw VietQR text payload / bank payment URI
      const rawPayload = `247|${BANK_INFO.bankId}|${BANK_INFO.accountNumber}|${amount}|${transferContent}|${BANK_INFO.accountName}`;
      QRCode.toDataURL(rawPayload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#005456',
          light: '#FFFFFF',
        },
      })
        .then((url) => setLocalQrDataUrl(url))
        .catch((err) => console.error('Failed to generate local QR', err));
    }
  }, [isOpen, amount, transferContent]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Đã sao chép ${fieldName}`);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = imageError ? localQrDataUrl : vietQrUrl;
    link.download = `VietQR_UTH_Fine_${patronCardCode || 'payment'}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã tải ảnh mã QR xuống thiết bị.');
  };

  const handleConfirmPayment = async () => {
    setIsSubmitting(true);
    try {
      if (isPayAll) {
        const res = await api.post<{ detail: string; total_paid: number; count: number }>(
          '/fines/pay-all-online',
          { transaction_code: transactionCode.trim() }
        );
        toast.success(res.data.detail || 'Thanh toán trực tuyến toàn bộ công nợ thành công!');
      } else if (fineId) {
        const res = await api.post<{ detail: string }>(
          `/fines/${fineId}/pay-online`,
          {
            amount: amount,
            transaction_code: transactionCode.trim(),
          }
        );
        toast.success(res.data.detail || 'Nộp phạt trực tuyến thành công!');
      }

      broadcastRealtimeSync('fines');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(formatApiError(err) || 'Không thể xác nhận thanh toán. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-2xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-700 via-[#008B8B] to-teal-800 text-white p-4 sm:p-5 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs text-white shrink-0 shadow-inner">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-tight">
                  Nộp phạt trực tuyến qua VietQR (Tại nhà)
                </h3>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900 uppercase tracking-wider">
                  Napas 24/7
                </span>
              </div>
              <p className="text-xs text-teal-100/90 mt-0.5">
                Quét mã tức thì qua ứng dụng Mobile Banking hoặc Ví điện tử bất kỳ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            title="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Left Column: QR Code Visual Card */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-[280px] p-3 rounded-2xl bg-gradient-to-b from-teal-50/80 to-slate-50 border border-teal-200/90 shadow-sm flex flex-col items-center">
                {/* Bank Header Badge */}
                <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-teal-100 text-[11px] font-bold text-teal-800">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#008B8B]" />
                    {BANK_INFO.bankName}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-mono">
                    24/7
                  </span>
                </div>

                {/* QR Image */}
                <div className="relative w-[230px] h-[230px] bg-white rounded-xl p-2 border border-slate-200/80 shadow-xs flex items-center justify-center overflow-hidden group">
                  {!imageError ? (
                    <img
                      ref={qrImageRef}
                      src={vietQrUrl}
                      alt="VietQR nộp phạt Thư viện UTH"
                      className="w-full h-full object-contain"
                      onError={() => setImageError(true)}
                    />
                  ) : localQrDataUrl ? (
                    <img
                      src={localQrDataUrl}
                      alt="Mã QR nộp phạt Thư viện UTH"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-xs text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mb-1 text-[#008B8B]" />
                      <span>Đang tạo mã QR...</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-2xs rounded-xl">
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={handleDownloadQR}
                      className="bg-white text-slate-900 shadow-md text-xs font-semibold"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Tải ảnh mã QR
                    </Button>
                  </div>
                </div>

                {/* Amount display under QR */}
                <div className="w-full mt-3 text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Số tiền cần thanh toán:</div>
                  <div className="text-xl font-extrabold text-[#008B8B] font-mono tracking-tight">
                    {formatCurrencyVND(amount)}
                  </div>
                </div>

                {/* Download Button */}
                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="mt-3 w-full py-2 px-3 rounded-xl bg-white hover:bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#008B8B]" />
                  <span>Tải mã QR về điện thoại</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 text-center mt-2 px-2 leading-relaxed">
                Quét mã bằng app ngân hàng bất kỳ để tự động điền đúng số tiền và cú pháp.
              </p>
            </div>

            {/* Right Column: Details & Confirmation Form */}
            <div className="md:col-span-7 space-y-4">
              {/* Payment Summary Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Mục đích:</span>
                  <span className="font-semibold text-slate-800">
                    {isPayAll ? 'Nộp toàn bộ tiền phạt công nợ' : fineTypeDisplay || 'Nộp phạt Thư viện UTH'}
                  </span>
                </div>
                {bookTitle && (
                  <div className="flex justify-between items-start text-xs">
                    <span className="text-slate-500 shrink-0 mr-2">Tài liệu:</span>
                    <span className="font-medium text-slate-700 text-right line-clamp-1">{bookTitle}</span>
                  </div>
                )}
                {patronName && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Bạn đọc:</span>
                    <span className="font-medium text-slate-800">
                      {patronName} <span className="text-slate-400 font-mono">({patronCardCode})</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Transfer Details Card with 1-click Copy */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#008B8B]" />
                  <span>Thông tin chuyển khoản thủ công:</span>
                </h4>

                <div className="space-y-2 text-xs">
                  {/* Account Number */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                    <div>
                      <span className="text-[10.5px] text-slate-400 block font-medium">Số tài khoản thụ hưởng</span>
                      <span className="font-bold text-sm font-mono text-slate-900 tracking-wider">
                        {BANK_INFO.accountNumber}
                      </span>
                    </div>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => copyToClipboard(BANK_INFO.accountNumber, 'Số tài khoản')}
                      className="h-8 px-2.5 text-xs text-[#008B8B] hover:bg-teal-50"
                    >
                      {copiedField === 'Số tài khoản' ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Account Name */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                    <div>
                      <span className="text-[10.5px] text-slate-400 block font-medium">Chủ tài khoản thụ hưởng</span>
                      <span className="font-semibold text-xs text-slate-800">
                        {BANK_INFO.accountName}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium shrink-0">
                      {BANK_INFO.bankId}
                    </span>
                  </div>

                  {/* Transfer Syntax (Important) */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
                    <div className="pr-2">
                      <span className="text-[10.5px] text-amber-700 block font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        Nội dung chuyển khoản (Bắt buộc chính xác):
                      </span>
                      <span className="font-bold text-xs font-mono text-amber-950 select-all">
                        {transferContent}
                      </span>
                    </div>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => copyToClipboard(transferContent, 'Nội dung chuyển khoản')}
                      className="h-8 px-2.5 text-xs text-amber-800 hover:bg-amber-100 shrink-0 font-semibold"
                    >
                      {copiedField === 'Nội dung chuyển khoản' ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Transaction code optional input */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11.5px] font-semibold text-slate-700 flex items-center justify-between">
                  <span>Mã tham chiếu / Mã giao dịch ngân hàng:</span>
                  <span className="text-[10.5px] text-slate-400 font-normal">Tùy chọn (Nếu có)</span>
                </label>
                <input
                  type="text"
                  value={transactionCode}
                  onChange={(e) => setTransactionCode(e.target.value)}
                  placeholder="Ví dụ: FT2411158930 hoặc VCB.123456"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#008B8B]/20 focus:border-[#008B8B] font-mono transition-all"
                />
              </div>

              {/* Automated policy note */}
              <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/80 text-[11px] text-teal-900 leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#008B8B] shrink-0 mt-0.5" />
                <span>
                  Hệ thống tự động kích hoạt lại quyền mượn sách và xóa trạng thái quá hạn ngay sau khi bạn xác nhận hoàn tất giao dịch nộp phạt trực tuyến.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 order-2 sm:order-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Mở app ngân hàng quét mã để thanh toán nhanh 30 giây</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-1/2 sm:w-auto text-xs px-4 rounded-xl"
            >
              Để sau
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirmPayment}
              disabled={isSubmitting}
              className="w-1/2 sm:w-auto text-xs px-5 rounded-xl bg-[#008B8B] hover:bg-[#007A7A] shadow-sm font-semibold"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Xác nhận đã chuyển khoản
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
