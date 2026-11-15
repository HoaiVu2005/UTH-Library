import React, { useRef } from 'react';
import { Printer, ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Barcode } from '@/components/ui/Barcode';
import { format } from 'date-fns';

interface StudentIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    username?: string;
    full_name?: string;
    card_code?: string;
    avatar?: string;
    department?: string;
    role?: string;
    dob?: string;
    card_expiry?: string;
  } | null;
}

export const StudentIdCardModal: React.FC<StudentIdCardModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const cardCode = user?.card_code || '034205011586';
  const fullName = user?.full_name || 'BÙI VŨ HẢI PHONG';
  const department = user?.department || 'Khoa Công nghệ thông tin';

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-1">
        {/* Card Frame matching UTH Portal format */}
        <div
          ref={cardRef}
          id="student-id-card-print"
          className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xl select-none"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#005f60] via-[#007b7c] to-[#008B8B] px-4 py-3 text-center text-white relative">
            <p className="text-[12px] sm:text-[13px] font-bold uppercase tracking-wider leading-tight drop-shadow-xs">
              TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI TP. HCM
            </p>
            <p className="text-[10px] text-teal-100 font-medium tracking-wide mt-0.5">
              THẺ BẠN ĐỌC & SINH VIÊN KỸ THUẬT SỐ
            </p>
          </div>

          {/* Card Body */}
          <div className="p-5 sm:p-6 bg-white">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Student Portrait */}
              <div className="w-[115px] h-[150px] sm:w-[125px] sm:h-[160px] rounded-xl border border-slate-200 overflow-hidden shrink-0 shadow-xs bg-slate-50 flex items-center justify-center">
                <img
                  src={user.avatar || '/student-avatar.png'}
                  alt={fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/student-avatar.png';
                  }}
                />
              </div>

              {/* Student Details */}
              <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight leading-snug">
                  {fullName}
                </h3>

                <div className="space-y-1.5 text-[13px] text-slate-700">
                  <p>
                    <span className="text-slate-500 font-medium">MSSV: </span>
                    <strong className="font-mono text-slate-800 font-bold">{user?.username || cardCode}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500 font-medium">Mã thẻ thư viện: </span>
                    <strong className="font-mono text-brand font-bold text-[14px]">{cardCode}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500 font-medium">Khoa / Đơn vị: </span>
                    <strong className="text-slate-800">{department}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500 font-medium">Hạn sử dụng thẻ: </span>
                    <strong className="text-slate-800">
                      {user?.card_expiry ? format(new Date(user.card_expiry), 'dd/MM/yyyy') : 'Vô thời hạn'}
                    </strong>
                  </p>
                  <p className="text-[11.5px] text-slate-500 pt-1">
                    Đối tượng: <strong className="text-slate-700 font-semibold">{user?.role === 'lecturer' ? 'Giảng viên' : 'Sinh viên'}</strong> • Thư viện UTH
                  </p>
                </div>
              </div>
            </div>

            {/* Barcode Section (Standard UTH Student ID Barcode) */}
            <div className="mt-5 pt-4 border-t border-dashed border-slate-200 text-center flex flex-col items-center">
              <div className="w-full max-w-sm px-2 py-1 bg-white rounded-lg flex justify-center">
                <Barcode
                  value={cardCode}
                  height={58}
                  barWidth={2}
                  showText={true}
                  className="w-full"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand" />
                <span>Mã vạch Code128 tối ưu cho súng quét laser tại Quầy lưu thông</span>
              </p>
            </div>
          </div>

          {/* Dual-color Signature UTH Bottom Bar (Teal & Red gradient from portal.ut.edu.vn) */}
          <div className="h-2 w-full bg-gradient-to-r from-[#008B8B] via-[#008B8B] to-[#EF4444]" />
        </div>

        {/* Action Controls */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <Button variant="secondary" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1.5" />
            In thẻ / Lưu PDF
          </Button>

          <Button variant="primary" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
