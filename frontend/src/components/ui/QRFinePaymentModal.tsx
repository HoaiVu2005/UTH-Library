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
  Receipt,
  ShieldCheck,
} from 'lucide-react';
import { Button } from './Button';
import { formatCurrencyVND, formatDateTimeVN } from '@/lib/utils';
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
  const [transactionRef, setTransactionRef] = useState<string>('');
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
      setTransactionRef(`STB${Date.now().toString().slice(-6)}`);
    }
  }, [isOpen]);

  // Generate fallback local QR code using QRCode library
  useEffect(() => {
    if (isOpen && amount > 0) {
      const rawPayload = `247|${BANK_INFO.bankId}|${BANK_INFO.accountNumber}|${amount}|${transferContent}|${BANK_INFO.accountName}`;
      QRCode.toDataURL(rawPayload, {
        width: 280,
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
    toast.success('Đã tải ảnh mã QR');
  };

  // Trigger test simulation of Bank Webhook (for development and demo)
  const handleSimulateBankWebhook = async () => {
    setIsSimulating(true);
    try {
      const res = await api.post<{ detail: string; transaction_code?: string }>('/fines/simulate-bank-transfer', {
        fine_id: fineId,
        is_pay_all: isPayAll,
        amount: amount,
      });
      if (res.data.transaction_code) {
        setTransactionRef(res.data.transaction_code);
      }
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-2xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =========================================================
            HEADER - Clean University Portal Style
            ========================================================= */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#008B8B] flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-slate-900 leading-tight">
                {isPaidSuccess ? 'Biên lai xác nhận thanh toán' : 'Chuyển khoản nộp phạt trực tuyến'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isPaidSuccess
                  ? 'Giao dịch đã được đối soát và ghi nhận thành công'
                  : 'Hỗ trợ tất cả ứng dụng ngân hàng và ví điện tử qua VietQR Napas 24/7'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0"
            title="Đóng cửa sổ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* =========================================================
            BODY
            ========================================================= */}
        {isPaidSuccess ? (
          /* Digital Bank E-Receipt Card */
          <div className="p-6 sm:p-8 flex flex-col items-center animate-in fade-in duration-200">
            {/* Success Check Pill */}
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 mb-3 shadow-2xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">
              Giao dịch thành công
            </span>

            {/* Amount */}
            <div className="mt-1 mb-4 text-center">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {formatCurrencyVND(amount)}
              </span>
            </div>

            {/* Receipt Table Card */}
            <div className="w-full rounded-xl bg-slate-50/70 border border-slate-200/70 p-4 text-xs space-y-2.5 mb-6">
              <div className="flex justify-between items-center text-slate-500">
                <span>Mã giao dịch:</span>
                <span className="font-mono font-medium text-slate-800">{transactionRef}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Thời gian:</span>
                <span className="font-medium text-slate-800">{formatDateTimeVN(new Date())}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Bạn đọc:</span>
                <span className="font-medium text-slate-800 font-mono">{patronCardCode}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Khoản nộp:</span>
                <span className="font-medium text-slate-800">
                  {isPayAll ? 'Nộp toàn bộ tiền phạt công nợ' : fineTypeDisplay || 'Tiền phạt thư viện'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Tài khoản nhận:</span>
                <span className="font-medium text-slate-800">{BANK_INFO.accountNumber} (Sacombank)</span>
              </div>
              <div className="pt-2.5 border-t border-slate-200/60 flex justify-between items-center text-emerald-700 font-semibold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Trạng thái:
                </span>
                <span>Đã gạch nợ &amp; Mở khóa thẻ</span>
              </div>
            </div>

            {/* Complete Action Button */}
            <div className="w-full">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleFinish}
                className="w-full bg-[#008B8B] hover:bg-[#007272] text-white font-medium rounded-xl text-xs sm:text-sm py-2.5 shadow-xs"
              >
                Hoàn tất &amp; Đóng
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
              {/* =========================================
                  Left Column: Clean Minimal QR Card
                  ========================================= */}
              <div className="sm:col-span-5 flex flex-col items-center">
                <div className="w-full rounded-xl bg-slate-50/70 border border-slate-200/80 p-3.5 flex flex-col items-center shadow-2xs">
                  {/* Bank Header Label */}
                  <div className="w-full flex items-center justify-between text-xs text-slate-600 font-medium pb-2 mb-2.5 border-b border-slate-200/60">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Building2 className="w-3.5 h-3.5 text-[#008B8B]" />
                      Sacombank
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      Napas 24/7
                    </span>
                  </div>

                  {/* QR Box */}
                  <div className="w-[170px] h-[170px] bg-white rounded-lg p-1.5 border border-slate-200 flex items-center justify-center">
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
                  <div className="mt-2.5 text-center">
                    <span className="text-[10.5px] text-slate-400 block font-medium">Số tiền thanh toán</span>
                    <span className="text-lg font-bold font-mono text-[#008B8B] tracking-tight">
                      {formatCurrencyVND(amount)}
                    </span>
                  </div>

                  {/* Download QR Link */}
                  <button
                    type="button"
                    onClick={handleDownloadQR}
                    className="mt-2 text-[11px] text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1 py-1 px-2 rounded hover:bg-slate-200/60 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Tải ảnh mã QR</span>
                  </button>
                </div>
              </div>

              {/* =========================================
                  Right Column: Normalized Transfer Details
                  ========================================= */}
              <div className="sm:col-span-7 flex flex-col justify-between self-stretch text-xs">
                <div className="divide-y divide-slate-100">
                  {/* Row 1: Target Fine & Patron */}
                  <div className="pb-2.5 space-y-0.5">
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

                  {/* Row 2: Bank Name */}
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Ngân hàng thụ hưởng:</span>
                    <span className="font-medium text-slate-800">{BANK_INFO.bankName}</span>
                  </div>

                  {/* Row 3: Account Number with Copy */}
                  <div className="py-2 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 block text-[10.5px]">Số tài khoản</span>
                      <span className="font-bold text-sm font-mono text-slate-900 tracking-wider">
                        {BANK_INFO.accountNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(BANK_INFO.accountNumber, 'Số tài khoản')}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#008B8B] hover:text-[#006F70] bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded transition-colors"
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
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Chủ tài khoản:</span>
                    <span className="font-semibold text-slate-800">{BANK_INFO.accountName}</span>
                  </div>

                  {/* Row 5: Transfer Description (Syntax) */}
                  <div className="py-2.5 flex items-center justify-between bg-amber-50/40 -mx-1.5 px-2 rounded-lg border border-amber-200/50 mt-1">
                    <div className="pr-2 min-w-0 flex-1">
                      <span className="text-[10.5px] font-medium text-amber-800 block">
                        Nội dung chuyển khoản (bắt buộc):
                      </span>
                      <span className="font-bold text-xs font-mono text-amber-950 select-all block truncate">
                        {transferContent}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(transferContent, 'Nội dung chuyển khoản')}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-900 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded transition-colors shrink-0"
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
                <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                  * Hệ thống sẽ tự động gạch nợ và mở khóa thẻ sau khi ngân hàng xác nhận giao dịch.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            FOOTER - Clean, Subdued, No Clutter
            ========================================================= */}
        {!isPaidSuccess && (
          <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs shrink-0">
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
                className="text-[11px] text-slate-400 hover:text-slate-600 underline underline-offset-2 px-1.5 py-1 transition-colors disabled:opacity-50"
                title="Mô phỏng khớp lệnh dành cho môi trường thử nghiệm"
              >
                {isSimulating ? 'Đang xử lý...' : 'Mô phỏng khớp lệnh'}
              </button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-7.5 px-3 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border-slate-200"
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
