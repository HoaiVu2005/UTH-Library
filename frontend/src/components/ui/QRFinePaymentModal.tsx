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
  CheckCircle2,
  RefreshCw,
  X,
  Zap,
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

// Sacombank Account details provided by User
const BANK_INFO = {
  bankId: 'sacombank', // Sacombank (BIN: 970403)
  bankName: 'Sacombank (STB)',
  branch: 'Sài Gòn Thương Tín',
  accountNumber: '040117536833',
  accountName: 'LE HOAI VU',
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
  const [localQrDataUrl, setLocalQrDataUrl] = useState<string>('');
  const [imageError, setImageError] = useState<boolean>(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const qrImageRef = useRef<HTMLImageElement>(null);

  // Transfer description syntax: UTH <CARD_CODE> [NOP PHAT | PHAT <ID>]
  const transferContent = isPayAll
    ? `UTH ${patronCardCode || 'BAN_DOC'} NOP PHAT`
    : `UTH ${patronCardCode || 'BAN_DOC'} PHAT ${fineId || ''}`.trim();

  // Dynamic VietQR Napas 24/7 API
  const vietQrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
    transferContent
  )}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsPaidSuccess(false);
      setImageError(false);
    }
  }, [isOpen]);

  // Generate fallback local QR code using QRCode library
  useEffect(() => {
    if (isOpen && amount > 0) {
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

  // Real-time Bank Polling: checks every 2s if the bank received the money
  useEffect(() => {
    if (!isOpen || isPaidSuccess) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        if (isPayAll) {
          const res = await api.get<{ is_all_paid: boolean }>('/fines/all-status');
          if (res.data?.is_all_paid && isMounted) {
            setIsPaidSuccess(true);
            toast.success('Sacombank đã xác nhận nhận tiền thành công!');
            broadcastRealtimeSync('fines');
            setTimeout(() => {
              onSuccess?.();
              onClose();
            }, 2600);
          }
        } else if (fineId) {
          const res = await api.get<{ is_paid: boolean }>(`/fines/${fineId}/status`);
          if (res.data?.is_paid && isMounted) {
            setIsPaidSuccess(true);
            toast.success('Sacombank đã xác nhận nhận tiền thành công!');
            broadcastRealtimeSync('fines');
            setTimeout(() => {
              onSuccess?.();
              onClose();
            }, 2600);
          }
        }
      } catch {
        // silent polling check
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, isPayAll, fineId, isPaidSuccess, onSuccess, onClose]);

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
    link.download = `VietQR_Sacombank_${BANK_INFO.accountNumber}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã tải ảnh mã QR xuống thiết bị.');
  };

  // Trigger test simulation of Bank Webhook
  const handleSimulateBankWebhook = async () => {
    setIsSimulating(true);
    try {
      const res = await api.post<{ detail: string }>('/fines/simulate-bank-transfer', {
        fine_id: fineId,
        is_pay_all: isPayAll,
        amount: amount,
      });
      toast.success(res.data.detail || 'Mô phỏng Sacombank chuyển tiền thành công!');
    } catch (err) {
      toast.error(formatApiError(err) || 'Không thể mô phỏng chuyển tiền');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-2xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-[#008B8B] text-white p-4 sm:p-5 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs text-white shrink-0 shadow-inner">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-tight">
                  Nộp phạt qua VietQR Sacombank (Tại nhà)
                </h3>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900 uppercase tracking-wider">
                  Napas 24/7
                </span>
              </div>
              <p className="text-xs text-blue-100/90 mt-0.5">
                Quét mã tức thì qua app Sacombank mBanking hoặc bất kỳ ngân hàng nào
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
        {isPaidSuccess ? (
          /* Payment Success Celebration View */
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Thanh toán Sacombank thành công!
              </h3>
              <p className="text-sm text-slate-500">
                Hệ thống đã nhận được{' '}
                <strong className="text-emerald-600 font-mono font-bold text-base">
                  {formatCurrencyVND(amount)}
                </strong>{' '}
                vào tài khoản <strong className="text-slate-800">{BANK_INFO.accountNumber} ({BANK_INFO.accountName})</strong>.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium max-w-md">
              Công nợ đã được trừ sạch và thẻ bạn đọc đã được tự động mở khóa mượn sách tức thì.
            </div>
            <p className="text-xs text-slate-400 animate-pulse">Đang tự động chuyển hướng...</p>
          </div>
        ) : (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Left Column: QR Code Visual Card */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-[280px] p-3 rounded-2xl bg-gradient-to-b from-blue-50/70 to-slate-50 border border-blue-200/90 shadow-sm flex flex-col items-center">
                  {/* Bank Header Badge */}
                  <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-blue-100 text-[11px] font-bold text-blue-900">
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-blue-700" />
                      {BANK_INFO.bankName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-mono">
                      24/7
                    </span>
                  </div>

                  {/* QR Image */}
                  <div className="relative w-[230px] h-[230px] bg-white rounded-xl p-2 border border-slate-200/80 shadow-xs flex items-center justify-center overflow-hidden group">
                    {!imageError ? (
                      <img
                        ref={qrImageRef}
                        src={vietQrUrl}
                        alt="VietQR nộp phạt Sacombank Thư viện UTH"
                        className="w-full h-full object-contain"
                        onError={() => setImageError(true)}
                      />
                    ) : localQrDataUrl ? (
                      <img
                        src={localQrDataUrl}
                        alt="Mã QR nộp phạt Sacombank Thư viện UTH"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-xs text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mb-1 text-blue-600" />
                        <span>Đang tạo mã VietQR Sacombank...</span>
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
                    <div className="text-[11px] text-slate-500 font-medium">Số tiền cần chuyển:</div>
                    <div className="text-xl font-extrabold text-blue-700 font-mono tracking-tight">
                      {formatCurrencyVND(amount)}
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    type="button"
                    onClick={handleDownloadQR}
                    className="mt-3 w-full py-2 px-3 rounded-xl bg-white hover:bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-700" />
                    <span>Tải mã QR về điện thoại</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 text-center mt-2 px-2 leading-relaxed">
                  Mã QR chứa sẵn STK Sacombank, số tiền và nội dung. Quét là tự điền.
                </p>
              </div>

              {/* Right Column: Details & Real-Time Listener */}
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
                    <CreditCard className="w-3.5 h-3.5 text-blue-700" />
                    <span>Thông tin chuyển khoản Sacombank:</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    {/* Account Number */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                      <div>
                        <span className="text-[10.5px] text-slate-400 block font-medium">Số tài khoản Sacombank</span>
                        <span className="font-bold text-sm font-mono text-blue-900 tracking-wider">
                          {BANK_INFO.accountNumber}
                        </span>
                      </div>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => copyToClipboard(BANK_INFO.accountNumber, 'Số tài khoản')}
                        className="h-8 px-2.5 text-xs text-blue-700 hover:bg-blue-50"
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
                        <span className="font-bold text-xs text-slate-900">
                          {BANK_INFO.accountName}
                        </span>
                      </div>
                      <span className="text-[11px] text-blue-700 font-semibold px-2 py-0.5 rounded bg-blue-50">
                        Sacombank
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

                {/* Automated Security & Policy Note */}
                <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/80 text-[11px] text-teal-900 leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#008B8B] shrink-0 mt-0.5" />
                  <span>
                    Hệ thống sẽ <strong>tự động phát hiện biến động số dư từ Sacombank</strong> để xóa nợ và mở khóa thẻ ngay lập tức khi bạn chuyển khoản thành công.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        {!isPaidSuccess && (
          <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            {/* Live Listening Radar Pulse */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium order-2 sm:order-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
              </span>
              <span>Đang lắng nghe biến động số dư Sacombank...</span>
            </div>

            {/* Test Simulation Button & Close */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="w-1/3 sm:w-auto text-xs px-3 rounded-xl"
              >
                Đóng
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSimulateBankWebhook}
                disabled={isSimulating}
                className="w-2/3 sm:w-auto text-xs px-4 rounded-xl bg-gradient-to-r from-blue-700 to-[#008B8B] hover:from-blue-800 hover:to-teal-800 text-white font-semibold shadow-xs flex items-center justify-center gap-1.5"
                title="Bấm để giả lập app ngân hàng Sacombank chuyển tiền thành công"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>⚡ Giả lập Sacombank khớp tiền (Test)</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
