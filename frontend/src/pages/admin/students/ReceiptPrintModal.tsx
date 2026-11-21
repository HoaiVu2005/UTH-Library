import React, { useRef } from 'react';
import { Printer, X, CheckCircle2, ShieldCheck } from 'lucide-react';
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
  title?: string;
  fee_item_name?: string;
  fee_item_detail?: string;
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

    const printWindow = window.open('', '_blank', 'width=800,height=600');
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
              margin: 6mm 8mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 4px;
              line-height: 1.35;
              font-size: 11.5px;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .receipt-box {
              border: 1.5px solid #008B8B;
              border-radius: 8px;
              padding: 14px 18px;
            }
            .header-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 1.5px solid #008B8B;
              padding-bottom: 6px;
              margin-bottom: 8px;
            }
            .header-left .school {
              font-size: 11.5px;
              font-weight: 700;
              color: #008B8B;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            .header-left .sub {
              font-size: 10px;
              color: #475569;
              font-weight: 600;
              margin-top: 1px;
            }
            .header-left .addr {
              font-size: 9px;
              color: #94a3b8;
              margin-top: 1px;
            }
            .header-right {
              text-align: right;
              font-size: 10px;
              color: #64748b;
              line-height: 1.3;
            }
            .header-right strong {
              color: #008B8B;
              font-size: 12px;
            }
            .title-area {
              text-align: center;
              margin: 6px 0 10px;
            }
            .title-area h1 {
              font-size: 15px;
              font-weight: 800;
              color: #006F70;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin: 0;
            }
            .title-area .sub {
              font-size: 10px;
              color: #64748b;
              font-style: italic;
              margin-top: 2px;
            }
            .grid-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 4px 14px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 8px 10px;
              margin-bottom: 8px;
              font-size: 11px;
            }
            .item {
              display: flex;
            }
            .item .label {
              width: 110px;
              color: #64748b;
              flex-shrink: 0;
            }
            .item .val {
              flex: 1;
              color: #0f172a;
              font-weight: 600;
            }
            .fee-table {
              width: 100%;
              border-collapse: collapse;
              margin: 8px 0;
              font-size: 11px;
            }
            .fee-table th, .fee-table td {
              border: 1px solid #cbd5e1;
              padding: 5px 8px;
            }
            .fee-table th {
              background: #f0fdfa;
              color: #006F70;
              font-weight: 700;
              text-align: left;
            }
            .fee-table td.amount {
              text-align: right;
              font-weight: 700;
              font-family: monospace;
              color: #0f172a;
            }
            .fee-table .total-row td {
              background: #f8fafc;
              font-weight: 800;
              color: #006F70;
            }
            .words {
              font-size: 10.5px;
              font-style: italic;
              color: #334155;
              margin: 4px 0 10px;
            }
            .sign-row {
              display: flex;
              justify-content: space-between;
              margin-top: 8px;
              page-break-inside: avoid;
            }
            .sign-col {
              width: 45%;
              text-align: center;
              font-size: 11px;
            }
            .sign-col .role {
              font-weight: 700;
              text-transform: uppercase;
              color: #1e293b;
            }
            .sign-col .hint {
              font-size: 9.5px;
              font-style: italic;
              color: #94a3b8;
              margin-bottom: 30px;
            }
            .sign-col .name {
              font-weight: 700;
              color: #0f172a;
              border-top: 1px solid #cbd5e1;
              display: inline-block;
              padding-top: 2px;
              min-width: 120px;
            }
            .footer-tag {
              margin-top: 8px;
              text-align: center;
              font-size: 9px;
              color: #94a3b8;
              border-top: 1px dashed #e2e8f0;
              padding-top: 4px;
            }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const words = numberToVietnameseWords(receipt.amount);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-brand flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">Biên lai thu tiền Thư viện UTH</h3>
              <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {receipt.receipt_code}
              </span>
            </div>
            <p className="text-[11px] text-gray-500">Mã GD: {receipt.transaction_code} • Khổ in chuẩn A5</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-slate-200/60"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <ModalBody className="p-4 bg-slate-100/60">
        {/* Printable Paper Area (Compact & Crisp) */}
        <div
          ref={receiptPrintAreaRef}
          className="bg-white p-5 rounded-xl border border-teal-200/80 shadow-xs font-sans text-gray-800 border-t-4 border-t-[#008B8B]"
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b border-teal-600/40 pb-2.5 mb-2.5">
            <div className="leading-tight">
              <div className="text-[11px] font-bold text-[#008B8B] uppercase tracking-wide">
                TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI TP.HCM
              </div>
              <div className="text-[11.5px] font-semibold text-gray-700 mt-0.5">
                Trung tâm Thông tin - Thư viện UTH
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">
                Số 2, Võ Oanh, P.25, Q. Bình Thạnh, TP.HCM • (028) 3899 1373
              </div>
            </div>

            <div className="text-right text-[10.5px] text-gray-500 space-y-0.5 shrink-0">
              <div>Mẫu số: <strong className="text-gray-700 font-mono">01-BLTT/TV-UTH</strong></div>
              <div>Số biên lai: <strong className="text-[#008B8B] font-mono text-xs font-bold">{receipt.receipt_code}</strong></div>
              <div>Mã GD: <span className="text-gray-600 font-mono">{receipt.transaction_code}</span></div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-2">
            <h1 className="text-base font-bold uppercase text-[#006F70] tracking-wider">
              {receipt.title || 'BIÊN LAI THU LỆ PHÍ THƯ VIỆN'}
            </h1>
            <div className="text-[10.5px] italic text-gray-500 mt-0.5">
              (Liên 2: Giao cho người nộp tiền — Lưu trữ chứng từ đối soát tài chính)
            </div>
            <div className="text-[10.5px] text-gray-400 italic mt-0.5">
              Ngày {day} tháng {month} năm {year} lúc {timeStr}
            </div>
          </div>

          {/* Patron Info - Compact 2-column Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 bg-slate-50/80 border border-slate-200/80 rounded-lg p-2.5 text-[11px] my-2.5">
            <div className="flex">
              <span className="w-28 text-gray-500 shrink-0">Họ và tên:</span>
              <strong className="flex-1 uppercase font-bold text-gray-900 truncate">
                {receipt.payer_name}
              </strong>
            </div>
            <div className="flex">
              <span className="w-28 text-gray-500 shrink-0">MSSV:</span>
              <span className="flex-1 font-mono font-bold text-[#008B8B]">
                {receipt.student_code}
              </span>
            </div>
            <div className="flex">
              <span className="w-28 text-gray-500 shrink-0">Khoa / Lớp:</span>
              <span className="flex-1 text-gray-800 truncate" title={`${receipt.department || ''} ${receipt.class_name ? `— Lớp: ${receipt.class_name}` : ''}`}>
                {receipt.department || 'Sinh viên chính khóa UTH'} {receipt.class_name ? `(${receipt.class_name})` : ''}
              </span>
            </div>
            <div className="flex">
              <span className="w-28 text-gray-500 shrink-0">Phương thức:</span>
              <span className="flex-1 text-gray-900 font-semibold truncate">
                {receipt.payment_method_display || (receipt.payment_method === 'transfer' ? 'Chuyển khoản (VietQR)' : 'Tiền mặt tại quầy')}
              </span>
            </div>
          </div>

          {/* Compact Fee Summary Table */}
          <table className="w-full border-collapse my-2 text-[11px]">
            <thead>
              <tr className="bg-teal-50/70 text-[#006F70] border border-gray-200">
                <th className="border border-gray-200 py-1.5 px-2.5 text-center w-10">STT</th>
                <th className="border border-gray-200 py-1.5 px-2.5 text-left">Nội dung khoản thu</th>
                <th className="border border-gray-200 py-1.5 px-2.5 text-right w-32">Số tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border border-gray-200">
                <td className="border border-gray-200 py-1.5 px-2.5 text-center font-mono">01</td>
                <td className="border border-gray-200 py-1.5 px-2.5">
                  <div className="font-semibold text-gray-900">
                    {receipt.fee_item_name || 'Lệ phí kích hoạt tài khoản & cấp thẻ thư viện số UTH'}
                  </div>
                  <div className="text-[10px] text-gray-500 italic">
                    {receipt.fee_item_detail || (receipt.card_code ? `Thời hạn: 12 tháng • Mã thẻ: ${receipt.card_code}` : (receipt.note || 'Chứng từ thu phí Thư viện'))}
                  </div>
                </td>
                <td className="border border-gray-200 py-1.5 px-2.5 text-right font-mono font-bold text-gray-900">
                  {formatCurrencyVND(receipt.amount)}
                </td>
              </tr>
              <tr className="border border-gray-200 bg-slate-50 font-bold">
                <td colSpan={2} className="border border-gray-200 py-1.5 px-2.5 text-right uppercase text-gray-600 text-[10.5px]">
                  Tổng cộng:
                </td>
                <td className="border border-gray-200 py-1.5 px-2.5 text-right font-mono text-sm text-[#008B8B] font-bold">
                  {formatCurrencyVND(receipt.amount)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Amount in words */}
          <div className="text-[10.5px] italic text-gray-700 my-1.5">
            <span>Số tiền bằng chữ: </span>
            <strong className="font-semibold text-gray-900 capitalize">{words}.</strong>
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-start pt-2 mt-2 text-[11px]">
            <div className="w-[45%] text-center">
              <div className="font-bold uppercase text-gray-800 text-[10.5px]">Người nộp tiền</div>
              <div className="text-[9.5px] italic text-gray-400 mb-8">(Ký, ghi rõ họ tên)</div>
              <div className="font-bold text-gray-900 pt-0.5 border-t border-gray-300 inline-block min-w-[110px] text-xs">
                {receipt.payer_name}
              </div>
            </div>

            <div className="w-[45%] text-center">
              <div className="font-bold uppercase text-[#008B8B] text-[10.5px]">Thủ thư thu tiền</div>
              <div className="text-[9.5px] italic text-gray-400 mb-8">(Ký, ghi rõ họ tên)</div>
              <div className="font-bold text-teal-900 pt-0.5 border-t border-gray-300 inline-block min-w-[110px] text-xs">
                {receipt.collected_by_name}
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="mt-3 pt-2 border-t border-dashed border-gray-200 text-center text-[9.5px] text-gray-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-teal-600" />
            <span>Biên lai điện tử có giá trị lưu trữ đối soát nội bộ Thư viện UTH.</span>
          </div>
        </div>
      </ModalBody>

      <ModalFooter className="flex justify-between items-center px-5 py-3 bg-white border-t border-border">
        <Button variant="outline" size="sm" onClick={onClose}>
          Đóng
        </Button>
        <Button
          size="sm"
          onClick={handlePrint}
          className="bg-primary hover:bg-primary-hover text-white font-bold px-4 flex items-center gap-1.5 shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>In biên lai (A5 / Máy in quầy)</span>
        </Button>
      </ModalFooter>
    </Modal>
  );
};
