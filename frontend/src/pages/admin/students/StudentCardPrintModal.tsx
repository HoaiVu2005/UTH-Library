import React, { useRef } from 'react';
import { Printer, X, CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Barcode } from '@/components/ui/Barcode';

export interface StudentCardData {
  student_code: string;
  full_name: string;
  department?: string;
  class_name?: string;
  card_code: string;
  card_expiry?: string;
  avatar?: string;
}

interface StudentCardPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardData: StudentCardData | null;
}

export const StudentCardPrintModal: React.FC<StudentCardPrintModalProps> = ({
  isOpen,
  onClose,
  cardData,
}) => {
  const cardPrintAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !cardData) return null;

  const handlePrint = () => {
    const printContent = cardPrintAreaRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>In Thẻ Thư Viện - ${cardData.student_code}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: auto;
              margin: 8mm;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 10px;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .cards-container {
              display: flex;
              flex-direction: column;
              gap: 20px;
              align-items: center;
            }
            .pvc-card {
              width: 85.6mm;
              height: 53.98mm;
              box-sizing: border-box;
              border: 1px solid #cbd5e1;
              border-radius: 4mm;
              overflow: hidden;
              position: relative;
              background: #fff;
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div class="cards-container">
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
    }, 350);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-brand flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Mẫu Thẻ Thư Viện Bạn Đọc UTH</h3>
            <p className="text-xs text-gray-500">Chuẩn kích thước thẻ nhựa PVC CR80 (85.60 × 53.98 mm)</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-slate-200/60"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <ModalBody className="p-6 bg-slate-100 flex flex-col items-center justify-center space-y-6">
        {/* Printable Card Container */}
        <div ref={cardPrintAreaRef} className="space-y-6 flex flex-col items-center">
          {/* Mặt trước thẻ (Front Side) */}
          <div className="w-[340px] h-[214px] bg-white rounded-2xl shadow-md border border-gray-300 relative overflow-hidden flex flex-col justify-between p-3.5 select-none">
            {/* Background Accent Gradients */}
            <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-r from-teal-700 via-teal-800 to-[#005f60] z-0" />
            <div className="absolute top-12 left-0 right-0 h-1 bg-amber-500 z-0" />

            {/* Card Header */}
            <div className="relative z-10 flex items-center justify-between text-white pb-2">
              <div className="flex items-center gap-2">
                <img
                  src="/uth-logo.png"
                  alt="UTH Logo"
                  className="h-8 object-contain bg-white/95 px-1.5 py-0.5 rounded shadow-xs"
                />
                <div>
                  <div className="text-[9px] font-bold tracking-wider uppercase opacity-95">ĐH GIAO THÔNG VẬN TẢI TP.HCM</div>
                  <div className="text-[11px] font-extrabold uppercase text-amber-300 tracking-tight">THẺ THƯ VIỆN BẠN ĐỌC</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-semibold tracking-widest text-teal-200 uppercase block">LIBRARY CARD</span>
              </div>
            </div>

            {/* Card Center: Avatar & Info */}
            <div className="relative z-10 flex gap-3 items-center mt-1">
              {/* Photo 3x4 */}
              <div className="w-16 h-22 rounded-lg bg-gray-100 border border-teal-600/30 overflow-hidden shrink-0 shadow-2xs flex items-center justify-center">
                {cardData.avatar ? (
                  <img src={cardData.avatar} alt="Ảnh thẻ" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-1 text-gray-400">
                    <span className="text-[9px] font-medium block">ẢNH THẺ</span>
                    <span className="text-[8px] block">3x4</span>
                  </div>
                )}
              </div>

              {/* Student Details */}
              <div className="flex-1 min-w-0 space-y-1">
                <div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-tight block">Họ và tên / Full Name:</span>
                  <div className="text-xs font-black uppercase text-teal-950 truncate tracking-tight">
                    {cardData.full_name}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <div>
                    <span className="text-gray-500 block text-[8px] uppercase">Mã số SV:</span>
                    <strong className="font-mono text-teal-800 text-[11px]">{cardData.student_code}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[8px] uppercase">Hạn thẻ:</span>
                    <strong className="text-gray-800 text-[10px]">{cardData.card_expiry || '12 tháng'}</strong>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 block text-[8px] uppercase">Đơn vị / Khoa:</span>
                  <span className="text-[10px] font-semibold text-gray-700 truncate block">
                    {cardData.department || 'ĐH Giao thông Vận tải TP.HCM'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Bottom: Barcode Code128 */}
            <div className="relative z-10 pt-1 border-t border-gray-100 flex flex-col items-center justify-center">
              <Barcode
                value={cardData.card_code || cardData.student_code}
                height={26}
                barWidth={1.3}
                showText={true}
                className="scale-95"
              />
            </div>
          </div>

          {/* Mặt sau thẻ (Back Side) */}
          <div className="w-[340px] h-[214px] bg-white rounded-2xl shadow-md border border-gray-300 relative overflow-hidden flex flex-col justify-between p-4 select-none text-[9px] text-gray-700 leading-normal">
            <div>
              <div className="text-center border-b border-teal-600/30 pb-1.5 mb-2">
                <strong className="text-[10px] uppercase text-teal-800 tracking-wide block">
                  QUY ĐỊNH SỬ DỤNG THẺ THƯ VIỆN UTH
                </strong>
                <span className="text-[8px] text-gray-500 italic">Central Library - University of Transport HCMC</span>
              </div>

              <ol className="list-decimal pl-4 space-y-1 text-gray-600">
                <li>Thẻ này dùng để ra vào Thư viện và mượn trả tài nguyên, tài liệu học tập.</li>
                <li>Bạn đọc có trách nhiệm bảo quản thẻ, <strong>không cho người khác mượn</strong>.</li>
                <li>Khi mất thẻ, phải báo ngay cho Quầy lưu thông để khóa và cấp lại thẻ mới.</li>
                <li>Mượn và trả sách đúng thời hạn quy định; giữ gìn sách nguyên vẹn.</li>
              </ol>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between items-end text-[8px] text-gray-500">
              <div>
                <div>Hotline: <strong>(028) 3899 1373</strong></div>
                <div>Website: <strong>https://lib.uth.edu.vn</strong></div>
              </div>
              <div className="text-right">
                <span className="font-bold text-teal-800 uppercase block">TRUNG TÂM THƯ VIỆN UTH</span>
                <span className="text-[7px]">TP. Hồ Chí Minh</span>
              </div>
            </div>
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
          <span>In Thẻ Bạn Đọc (PVC / Máy in thẻ)</span>
        </Button>
      </ModalFooter>
    </Modal>
  );
};

