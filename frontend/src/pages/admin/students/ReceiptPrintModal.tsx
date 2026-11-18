import React, { useRef } from 'react';
import { Printer, X, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatCurrencyVND, numberToVietnameseWords } from '@/lib/utils';

export interface ReceiptData {
  transaction_code: string;
  receipt_code: string;
  amount: number;
  payment_method: string;
  payment_method_display?: string;
  payer_name: string;
  student_code: string;
  department?: string;
  class_name?: string;
  collected_by_name: string;
  collected_at: string;
  card_code?: string;
  card_expiry?: string;
  note?: string;
}

interface ReceiptPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ReceiptData | null;
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({
  isOpen,
  onClose,
  receipt,
}) => {
  const receiptPrintAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !receipt) return null;

  const dateObj = new Date(receipt.collected_at || Date.now());
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => {
    const printContent = receiptPrintAreaRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=850,height=650');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Biên Lai Thu Tiền - ${receipt.receipt_code}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A5 landscape;
              margin: 10mm;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              color: #111827;
              margin: 0;
              padding: 10px;
              line-height: 1.4;
              font-size: 13px;
              background: #fff;
            }
            .header-grid {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #008B8B;
              padding-bottom: 8px;
              margin-bottom: 12px;
            }
            .header-left {
              text-align: left;
            }
            .header-left .univ {
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              color: #374151;
            }
            .header-left .library {
              font-size: 13px;
              font-weight: bold;
              text-transform: uppercase;
              color: #008B8B;
            }
            .header-left .address {
              font-size: 10px;
              color: #6b7280;
            }
            .header-right {
              text-align: right;
              font-size: 11px;
            }
            .header-right strong {
              font-size: 12px;
              color: #008B8B;
            }
            .title-section {
              text-align: center;
              margin: 12px 0 16px;
            }
            .title-section h1 {
              font-size: 18px;
              font-weight: bold;
              text-transform: uppercase;
              margin: 0;
              color: #111827;
              letter-spacing: 0.5px;
            }
            .title-section .subtitle {
              font-size: 11px;
              font-style: italic;
              color: #4b5563;
              margin-top: 2px;
            }
            .receipt-body {
              margin-bottom: 16px;
            }
            .info-row {
              display: flex;
              margin-bottom: 6px;
              font-size: 13px;
            }
            .info-label {
              width: 170px;
              color: #4b5563;
              shrink: 0;
            }
            .info-value {
              flex: 1;
              color: #111827;
              border-bottom: 1px dotted #cbd5e1;
              padding-bottom: 1px;
            }
            .amount-box {
              background: #f0fdfa;
              border: 1px solid #99f6e4;
              border-radius: 6px;
              padding: 8px 12px;
              margin: 10px 0;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .amount-box .num {
              font-size: 16px;
              font-weight: bold;
              color: #006F70;
            }
            .signature-grid {
              display: flex;
              justify-content: space-between;
              margin-top: 24px;
              page-break-inside: avoid;
            }
            .sign-col {
              width: 45%;
              text-align: center;
            }
            .sign-col .role {
              font-weight: bold;
              text-transform: uppercase;
              font-size: 12px;
            }
            .sign-col .hint {
              font-size: 10px;
              font-style: italic;
              color: #6b7280;
              margin-bottom: 50px;
            }
            .sign-col .name {
              font-weight: bold;
              font-size: 13px;
              border-top: 1px solid #e2e8f0;
              display: inline-block;
              padding-top: 4px;
              min-width: 140px;
            }
            .footer-note {
              margin-top: 16px;
              font-size: 10px;
              color: #94a3b8;
              text-align: center;
              border-top: 1px dashed #cbd5e1;
              padding-top: 6px;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 350);
  };

  const words = numberToVietnameseWords(receipt.amount);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-brand flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Chứng từ & Biên lai thu tiền Thư viện UTH</h3>
            <p className="text-xs text-gray-500">Mã giao dịch chính thức theo tiêu chuẩn tài chính trường ĐH GTVT TP.HCM</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-slate-200/60"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <ModalBody className="p-6 bg-slate-100/50">
        {/* Printable Paper Area */}
        <div
          ref={receiptPrintAreaRef}
          className="bg-white p-7 rounded-xl border border-gray-300 shadow-sm font-serif text-gray-800"
        >
          {/* Header */}
          <div className="header-grid flex justify-between items-start border-b-2 border-teal-700 pb-3 mb-4">
            <div className="header-left">
              <div className="univ font-sans font-bold text-xs uppercase text-gray-700">
                Bộ Giao thông Vận tải
              </div>
              <div className="font-sans font-bold text-xs uppercase text-teal-800 tracking-wide">
                Trường Đại học Giao thông Vận tải TP.HCM (UTH)
              </div>
              <div className="library font-sans font-bold text-xs uppercase text-teal-700">
                Trung tâm Thông tin - Thư viện
              </div>
              <div className="address text-[10px] text-gray-500 font-sans mt-0.5">
                Số 2, Đ. Võ Oanh, P.25, Q. Bình Thạnh, TP.HCM • Hotline: (028) 3899 1373
              </div>
            </div>
            <div className="header-right text-right font-sans text-xs space-y-0.5">
              <div>
                Mẫu số: <strong className="text-gray-900 font-mono">01-BLTT/TV-UTH</strong>
              </div>
              <div>
                Số biên lai: <strong className="text-teal-700 font-mono text-sm">{receipt.receipt_code}</strong>
              </div>
              <div>
                Mã giao dịch: <strong className="text-gray-700 font-mono text-[11px]">{receipt.transaction_code}</strong>
              </div>
              <div className="text-[11px] text-gray-500">
                Ngày {day} tháng {month} năm {year} ({timeStr})
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="title-section text-center my-3">
            <h1 className="text-lg font-bold uppercase text-gray-900 tracking-wider">
              Biên Lai Thu Lệ Phí Thư Viện
            </h1>
            <p className="subtitle text-xs italic text-gray-600 mt-0.5">
              (Dùng cho thu lệ phí cấp thẻ bạn đọc, gia hạn thẻ & bồi hoàn tài liệu)
            </p>
          </div>

          {/* Body Info */}
          <div className="receipt-body space-y-2 text-xs leading-relaxed my-4">
            <div className="info-row flex">
              <span className="info-label w-44 text-gray-600 shrink-0">Họ và tên người nộp:</span>
              <strong className="info-value flex-1 uppercase font-bold text-gray-900 border-b border-dotted border-gray-400">
                {receipt.payer_name}
              </strong>
            </div>

            <div className="info-row flex">
              <span className="info-label w-44 text-gray-600 shrink-0">Mã số sinh viên (MSSV):</span>
              <span className="info-value flex-1 font-mono font-bold text-teal-800 border-b border-dotted border-gray-400">
                {receipt.student_code}
              </span>
            </div>

            <div className="info-row flex">
              <span className="info-label w-44 text-gray-600 shrink-0">Khoa / Lớp chuyên ngành:</span>
              <span className="info-value flex-1 text-gray-800 border-b border-dotted border-gray-400">
                {receipt.department || 'Sinh viên chính khóa UTH'} {receipt.class_name ? `— Lớp: ${receipt.class_name}` : ''}
              </span>
            </div>

            <div className="info-row flex">
              <span className="info-label w-44 text-gray-600 shrink-0">Nội dung thu:</span>
              <span className="info-value flex-1 text-gray-900 font-medium border-b border-dotted border-gray-400">
                Lệ phí cấp thẻ thư viện bạn đọc năm học (Thời hạn 12 tháng — Mã thẻ: {receipt.card_code || receipt.student_code})
              </span>
            </div>

            <div className="info-row flex">
              <span className="info-label w-44 text-gray-600 shrink-0">Phương thức thanh toán:</span>
              <span className="info-value flex-1 text-gray-900 font-semibold border-b border-dotted border-gray-400">
                {receipt.payment_method_display || (receipt.payment_method === 'transfer' ? 'Chuyển khoản (VietQR)' : 'Tiền mặt tại quầy')}
              </span>
            </div>

            {/* Highlighted Amount */}
            <div className="amount-box bg-teal-50/70 border border-teal-300 rounded-lg p-3 my-3 flex justify-between items-center font-sans">
              <div>
                <span className="text-xs text-teal-900 font-semibold">Tổng số tiền đã thu:</span>
                <div className="text-lg font-bold text-teal-800">
                  {formatCurrencyVND(receipt.amount)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-teal-700 italic block">Bằng chữ:</span>
                <span className="text-xs font-serif font-bold text-teal-900 capitalize">
                  {words}.
                </span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="signature-grid flex justify-between items-start pt-4 mt-6 text-xs font-sans">
            <div className="sign-col w-[45%] text-center">
              <div className="role font-bold uppercase text-gray-800">Người nộp tiền</div>
              <div className="hint text-[11px] italic text-gray-500 mb-14">(Ký, ghi rõ họ tên)</div>
              <div className="name font-bold text-gray-900 pt-1 border-t border-gray-300 inline-block min-w-[130px]">
                {receipt.payer_name}
              </div>
            </div>

            <div className="sign-col w-[45%] text-center">
              <div className="text-[11px] text-gray-500 italic mb-1">
                TP. Hồ Chí Minh, ngày {day} tháng {month} năm {year}
              </div>
              <div className="role font-bold uppercase text-teal-800">Thủ thư thu tiền</div>
              <div className="hint text-[11px] italic text-gray-500 mb-14">(Ký, đóng dấu hoặc xác nhận)</div>
              <div className="name font-bold text-teal-900 pt-1 border-t border-gray-300 inline-block min-w-[130px]">
                {receipt.collected_by_name}
              </div>
            </div>
          </div>

          {/* Security stamp note */}
          <div className="footer-note mt-6 pt-3 border-t border-dashed border-gray-300 text-center text-[10px] text-gray-400 font-sans flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Biên lai điện tử có giá trị pháp lý lưu trữ đối soát nội bộ. Vui lòng giữ biên lai để giải quyết các khiếu nại phát sinh.</span>
          </div>
        </div>
      </ModalBody>

      <ModalFooter className="flex justify-between items-center px-6 py-4 bg-white border-t border-border">
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
        <Button
          onClick={handlePrint}
          className="bg-brand hover:bg-brand-hover text-white font-bold px-5 flex items-center gap-2 shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>In biên lai (A5 / Máy in quầy)</span>
        </Button>
      </ModalFooter>
    </Modal>
  );
};

