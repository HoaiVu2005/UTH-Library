import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Copy,
  Check,
  Download,
  Building2,
  CheckCircle2,
  RefreshCw,
  X,
  CreditCard,
  User,
  FileText,
} from 'lucide-react';
import { Button } from './Button';
import { formatCurrencyVND } from '@/lib/utils';
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
  branch: 'Ngân hàng TMCP Sài Gòn Thương Tín',
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
        width: 300,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
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
            toast.success('Xác nhận nhận tiền thành công!');
            broadcastRealtimeSync('fines');
          }
        } else if (fineId) {
          const res = await api.get<{ is_paid: boolean }>(`/fines/${fineId}/status`);
          if (res.data?.is_paid && isMounted) {
            setIsPaidSuccess(true);
            toast.success('Xác nhận nhận tiền thành công!');
            broadcastRealtimeSync('fines');
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
  }, [isOpen, isPayAll, fineId, isPaidSuccess]);

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

  // Trigger test simulation of Bank Webhook (for development and demo)
  const handleSimulateBankWebhook = async () => {
    setIsSimulating(true);
    try {
      const res = await api.post<{ detail: string }>('/fines/simulate-bank-transfer', {
        fine_id: fineId,
        is_pay_all: isPayAll,
        amount: amount,
      });
      toast.success(res.data.detail || 'Xác nhận chuyển tiền thành công!');
      setIsPaidSuccess(true);
      broadcastRealtimeSync('fines');
    } catch (err) {
      toast.error(formatApiError(err) || 'Không thể mô phỏng chuyển tiền');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleFinish = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =========================================================
            1. MODAL HEADER - Crisp, Authoritative & Clean
            ========================================================= */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base sm:text-lg text-slate-900">
                Chuyển khoản nộp phạt trực tuyến
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                VietQR Napas 24/7
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Sử dụng ứng dụng ngân hàng bất kỳ để quét mã và chuyển tiền tức thời
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
            title="Đóng cửa sổ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* =========================================================
            2. MODAL BODY
            ========================================================= */}
        {isPaidSuccess ? (
          /* E-Receipt Success View */
          <div className="p-8 sm:p-10 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase">
                Giao dịch thành công
              </span>
              <h4 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
                {formatCurrencyVND(amount)}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto pt-1">
                Hệ thống đã nhận thanh toán vào tài khoản Sacombank và hoàn tất gạch nợ cho bạn đọc.
              </p>
            </div>

            {/* Receipt Summary Details */}
            <div className="w-full max-w-sm rounded-xl bg-slate-50 border border-slate-100 p-3.5 text-xs text-left space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span>Khoản nộp:</span>
                <span className="font-medium text-slate-800">
                  {isPayAll ? 'Nộp toàn bộ tiền phạt công nợ' : fineTypeDisplay || 'Tiền phạt thư viện'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Bạn đọc:</span>
                <span className="font-medium text-slate-800 font-mono">{patronCardCode}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Tài khoản nhận:</span>
                <span className="font-medium text-slate-800">{BANK_INFO.accountNumber} (STB)</span>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-emerald-700 font-medium">
                <span>Trạng thái hồ sơ:</span>
                <span>Đã xóa nợ & mở khóa thẻ</span>
              </div>
            </div>

            <div className="pt-2 w-full max-w-xs">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleFinish}
                className="w-full bg-[#008B8B] hover:bg-[#007272] text-white font-medium rounded-xl text-sm"
              >
                Hoàn tất
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* =========================================
                  Left Column: Clean Minimalist QR Code Box
                  ========================================= */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="w-full rounded-xl bg-slate-50/80 border border-slate-200/70 p-4 flex flex-col items-center">
                  {/* Bank Label Header */}
                  <div className="w-full flex items-center justify-between text-xs text-slate-600 font-medium mb-3 pb-2 border-b border-slate-200/50">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <Building2 className="w-3.5 h-3.5 text-[#008B8B]" />
                      Sacombank
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">Napas 24/7</span>
                  </div>

                  {/* QR Image Box */}
                  <div className="w-[190px] h-[190px] bg-white rounded-lg p-2 border border-slate-200 shadow-2xs flex items-center justify-center">
                    {!imageError ? (
                      <img
                        ref={qrImageRef}
                        src={vietQrUrl}
                        alt="Mã VietQR nộp phạt"
                        className="w-full h-full object-contain"
                        onError={() => setImageError(true)}
                      />
                    ) : localQrDataUrl ? (
                      <img
                        src={localQrDataUrl}
                        alt="Mã QR nộp phạt"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-xs text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mb-1 text-slate-400" />
                        <span>Đang tạo mã QR...</span>
                      </div>
                    )}
                  </div>

                  {/* Amount Indicator */}
                  <div className="mt-3 text-center">
                    <span className="text-[11px] text-slate-400 block font-medium">Số tiền nộp</span>
                    <span className="text-xl font-bold font-mono text-slate-900 tracking-tight">
                      {formatCurrencyVND(amount)}
                    </span>
                  </div>

                  {/* Download QR Link */}
                  <button
                    type="button"
                    onClick={handleDownloadQR}
                    className="mt-3 text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-slate-200/60 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải ảnh mã QR</span>
                  </button>
                </div>
              </div>

              {/* =========================================
                  Right Column: Normalized Transfer Details
                  ========================================= */}
              <div className="md:col-span-7 flex flex-col justify-between self-stretch">
                <div className="divide-y divide-slate-100 text-xs">
                  {/* Row 1: Purpose & Patron */}
                  <div className="pb-3 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Mục đích:</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {isPayAll ? 'Nộp toàn bộ tiền phạt công nợ' : fineTypeDisplay || 'Nộp phạt Thư viện UTH'}
                      </span>
                    </div>
                    {bookTitle && (
                      <div className="flex justify-between items-start pt-0.5">
                        <span className="text-slate-500 shrink-0 mr-2">Tài liệu:</span>
                        <span className="font-normal text-slate-600 text-right line-clamp-1">{bookTitle}</span>
                      </div>
                    )}
                    {patronName && (
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-slate-500">Bạn đọc:</span>
                        <span className="font-medium text-slate-800">
                          {patronName} <span className="text-slate-400 font-mono">({patronCardCode})</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Row 2: Bank & Account Number */}
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Ngân hàng thụ hưởng</span>
                      <span className="font-medium text-slate-800">{BANK_INFO.bankName}</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">{BANK_INFO.branch}</span>
                  </div>

                  {/* Row 3: Account Number with Copy */}
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Số tài khoản</span>
                      <span className="font-bold text-sm font-mono text-slate-900 tracking-wider">
                        {BANK_INFO.accountNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(BANK_INFO.accountNumber, 'Số tài khoản')}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#008B8B] hover:text-[#006F70] bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded transition-colors"
                    >
                      {copiedField === 'Số tài khoản' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Row 4: Account Name */}
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Chủ tài khoản thụ hưởng</span>
                      <span className="font-semibold text-slate-800">{BANK_INFO.accountName}</span>
                    </div>
                  </div>

                  {/* Row 5: Transfer Description (Syntax) */}
                  <div className="py-2.5 flex items-center justify-between bg-amber-50/50 -mx-2 px-2 rounded-lg border border-amber-200/60 mt-1">
                    <div className="pr-2">
                      <span className="text-[11px] font-medium text-amber-800 block">
                        Nội dung chuyển khoản (bắt buộc chính xác):
                      </span>
                      <span className="font-bold text-xs font-mono text-amber-950 select-all">
                        {transferContent}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(transferContent, 'Nội dung chuyển khoản')}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-900 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded transition-colors shrink-0"
                    >
                      {copiedField === 'Nội dung chuyển khoản' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Footnote note */}
                <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
                  * Hệ thống sẽ tự động gạch nợ và cập nhật thẻ bạn đọc ngay sau khi ngân hàng xác nhận giao dịch.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            3. MODAL FOOTER - Clean, Subdued, No Clutter
            ========================================================= */}
        {!isPaidSuccess && (
          <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs shrink-0">
            {/* Listening indicator */}
            <div className="flex items-center gap-2 text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#008B8B]"></span>
              </span>
              <span className="text-[11.5px]">Đang chờ ngân hàng xác nhận...</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSimulateBankWebhook}
                disabled={isSimulating}
                className="text-[11px] text-slate-400 hover:text-slate-600 underline underline-offset-2 px-2 py-1 transition-colors disabled:opacity-50"
                title="Mô phỏng khớp lệnh dành cho môi trường thử nghiệm"
              >
                {isSimulating ? 'Đang xử lý...' : 'Mô phỏng khớp lệnh'}
              </button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-8 px-4 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border-slate-200"
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
