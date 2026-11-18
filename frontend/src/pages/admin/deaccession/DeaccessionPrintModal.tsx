import React, { useEffect, useState } from 'react';
import { Printer, X, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Modal, ModalBody } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatCurrencyVND, formatDateVN, numberToVietnameseWords } from '@/lib/utils';

export interface DeaccessionCopy {
  id: number;
  barcode: string;
  shelf_location?: string;
  purchase_price?: number;
  book_title?: string;
  book_isbn?: string;
  category_name?: string;
  status_display?: string;
}

export interface DeaccessionBatchDetail {
  id: number;
  code: string;
  decision_number: string;
  decision_date: string;
  reason: string;
  reason_display: string;
  status: string;
  status_display: string;
  committee: string;
  total_copies: number;
  total_value: number;
  note?: string;
  created_by_name: string;
  approved_by_name?: string | null;
  approved_at?: string | null;
  bgh_decision_number?: string | null;
  bgh_decision_date?: string | null;
  bgh_approver_name?: string | null;
  disposal_method?: string | null;
  approval_note?: string | null;
  created_at: string;
  copies?: DeaccessionCopy[];
}

interface DeaccessionPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: number | null;
}

export const DeaccessionPrintModal: React.FC<DeaccessionPrintModalProps> = ({
  isOpen,
  onClose,
  batchId,
}) => {
  const [batch, setBatch] = useState<DeaccessionBatchDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && batchId) {
      setLoading(true);
      setError(null);
      api
        .get(`/deaccession-batches/${batchId}`)
        .then((res) => {
          setBatch(res.data?.data || null);
        })
        .catch((err) => {
          setError(err?.response?.data?.detail || 'Không thể tải thông tin biên bản thanh lý.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setBatch(null);
    }
  }, [isOpen, batchId]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const decisionDate = batch?.decision_date ? new Date(batch.decision_date) : new Date();
  const dayStr = String(decisionDate.getDate()).padStart(2, '0');
  const monthStr = String(decisionDate.getMonth() + 1).padStart(2, '0');
  const yearStr = String(decisionDate.getFullYear());

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalBody className="p-0 max-h-[90vh] overflow-y-auto bg-gray-100">
        {/* Action Header - hidden when printing */}
        <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-800">Biên bản thanh lý tài liệu A4</span>
            {batch && (
              <span className="rounded bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-800">
                {batch.code}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              disabled={loading || !batch}
              className="flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4" />
              In biên bản
            </Button>
            <Button variant="outline" size="sm" onClick={onClose} className="flex items-center gap-1">
              <X className="h-4 w-4" />
              Đóng
            </Button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-2" />
            <p className="text-sm">Đang nạp chi tiết biên bản thanh lý...</p>
          </div>
        )}

        {error && (
          <div className="m-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Printable Document Sheet (Standard Vietnamese Institutional Form) */}
        {!loading && batch && (
          <div className="print-sheet mx-auto my-6 max-w-[820px] rounded-md bg-white p-10 shadow-md font-serif text-gray-900 leading-relaxed">
            {/* Header Columns */}
            <div className="grid grid-cols-2 gap-4 text-center pb-6">
              <div>
                <p className="text-xs uppercase font-medium tracking-wide">TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI TP.HCM</p>
                <p className="text-xs uppercase font-bold text-teal-900">THƯ VIỆN TRƯỜNG</p>
                <div className="mx-auto my-1 w-24 border-b border-gray-400"></div>
                <p className="text-xs mt-1 text-gray-600">Số: <span className="font-semibold">{batch.code}</span></p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                <p className="text-xs font-semibold">Độc lập - Tự do - Hạnh phúc</p>
                <div className="mx-auto my-1 w-32 border-b border-gray-400"></div>
                <p className="text-xs italic mt-1 text-gray-600">
                  TP. Hồ Chí Minh, ngày {dayStr} tháng {monthStr} năm {yearStr}
                </p>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-6">
              <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
                BIÊN BẢN THANH LÝ TÀI LIỆU THƯ VIỆN
              </h1>
              <p className="text-xs italic text-gray-600 mt-1">
                (Ban hành kèm theo Quyết định số {batch.decision_number} ngày {formatDateVN(batch.decision_date)})
              </p>
            </div>

            {/* Introduction & Legal Bases */}
            <div className="text-xs space-y-2 mb-6">
              <p>
                - Căn cứ Quy chế tổ chức và hoạt động của Thư viện Trường Đại học Giao thông Vận tải TP.HCM;
              </p>
              <p>
                - Căn cứ Quyết định số <strong>{batch.decision_number}</strong> ngày {formatDateVN(batch.decision_date)} của Hiệu trưởng Trường Đại học Giao thông Vận tải TP.HCM về việc thành lập Hội đồng kiểm kê và thanh lý tài liệu;
              </p>
              <p>
                - Hôm nay, ngày {dayStr} tháng {monthStr} năm {yearStr}, tại Văn phòng Thư viện UTH, Hội đồng thanh lý tiến hành họp và lập biên bản thanh lý tài liệu gồm các thành viên:
              </p>
              <div className="rounded border border-gray-200 bg-gray-50/60 p-3 italic text-gray-800">
                {batch.committee || 'Hội đồng thanh lý tài liệu Thư viện Trường ĐH Giao thông Vận tải TP.HCM'}
              </div>
              <p>
                - <strong>Lý do thanh lý:</strong> {batch.reason_display} {batch.note ? `(${batch.note})` : ''}
              </p>

              {batch.status === 'approved' && batch.bgh_decision_number && (
                <div className="rounded border border-teal-300 bg-teal-50/70 p-2.5 text-xs text-teal-950 font-medium">
                  ✓ <strong>Căn cứ Quyết định phê duyệt số:</strong> {batch.bgh_decision_number} ngày {formatDateVN(batch.bgh_decision_date || batch.approved_at || '')} của Ban Giám hiệu Trường ĐH Giao thông Vận tải TP.HCM.
                  {batch.disposal_method && (
                    <span className="block mt-0.5 text-teal-900 font-normal">
                      <strong>Phương thức xử lý tài sản:</strong> {batch.disposal_method}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Book Table */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase mb-2">
                I. Danh mục tài liệu đề nghị thanh lý:
              </p>
              <table className="w-full border-collapse border border-gray-400 text-xs">
                <thead>
                  <tr className="bg-gray-100 text-center font-bold">
                    <th className="border border-gray-400 p-1.5 w-10">STT</th>
                    <th className="border border-gray-400 p-1.5 text-left">Tên tài liệu / Giáo trình</th>
                    <th className="border border-gray-400 p-1.5 w-28">Mã vạch</th>
                    <th className="border border-gray-400 p-1.5 w-28">Thể loại</th>
                    <th className="border border-gray-400 p-1.5 w-28">Vị trí lưu trữ</th>
                    <th className="border border-gray-400 p-1.5 text-right w-24">Nguyên giá</th>
                  </tr>
                </thead>
                <tbody>
                  {batch.copies && batch.copies.length > 0 ? (
                    batch.copies.map((copy, idx) => (
                      <tr key={copy.id} className="text-gray-800 hover:bg-gray-50">
                        <td className="border border-gray-400 p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-gray-400 p-1.5 font-medium">{copy.book_title || '—'}</td>
                        <td className="border border-gray-400 p-1.5 text-center font-mono text-[11px]">{copy.barcode}</td>
                        <td className="border border-gray-400 p-1.5 text-center">{copy.category_name || '—'}</td>
                        <td className="border border-gray-400 p-1.5 text-center text-[11px]">{copy.shelf_location || '—'}</td>
                        <td className="border border-gray-400 p-1.5 text-right font-medium">
                          {formatCurrencyVND(copy.purchase_price || 0)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="border border-gray-400 p-4 text-center text-gray-500 italic">
                        Không có dữ liệu bản sao.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-bold">
                    <td colSpan={5} className="border border-gray-400 p-1.5 text-right">
                      Tổng cộng ({batch.total_copies} bản):
                    </td>
                    <td className="border border-gray-400 p-1.5 text-right text-teal-900">
                      {formatCurrencyVND(batch.total_value)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Total in Words */}
            <div className="text-xs mb-8 space-y-1">
              <p>
                - <strong>Tổng số lượng đề nghị thanh lý:</strong> {batch.total_copies} cuốn/bản sách.
              </p>
              <p>
                - <strong>Tổng giá trị tài sản đề nghị thanh lý:</strong> {formatCurrencyVND(batch.total_value)}
              </p>
              <p className="italic">
                - <strong>Bằng chữ:</strong> {numberToVietnameseWords(batch.total_value)}.
              </p>
              <p className="mt-2 text-gray-700">
                Biên bản này được lập thành 03 bản có giá trị như nhau: 01 bản lưu Thư viện, 01 bản gửi Phòng Kế hoạch - Tài chính, 01 bản gửi Ban Giám hiệu theo dõi.
              </p>
            </div>

            {/* Signature Blocks */}
            <div className="grid grid-cols-3 gap-4 text-center text-xs pt-4">
              <div>
                <p className="font-bold uppercase">Người lập biên bản</p>
                <p className="italic text-gray-500 text-[11px]">(Ký và ghi rõ họ tên)</p>
                <div className="h-20"></div>
                <p className="font-semibold text-gray-900">{batch.created_by_name || 'Thư viện viên'}</p>
              </div>

              <div>
                <p className="font-bold uppercase">Đại diện Hội đồng</p>
                <p className="italic text-gray-500 text-[11px]">(Ký và ghi rõ họ tên)</p>
                <div className="h-20"></div>
                <p className="font-semibold text-gray-900">Trưởng ban Thẩm định</p>
              </div>

              <div>
                <p className="font-bold uppercase">Ban Giám hiệu duyệt</p>
                {batch.bgh_decision_number ? (
                  <p className="text-[10px] text-teal-900 font-semibold mt-0.5">
                    (Theo QĐ số {batch.bgh_decision_number})
                  </p>
                ) : (
                  <p className="italic text-gray-500 text-[11px]">(Ký tên và đóng dấu)</p>
                )}
                <div className="h-16"></div>
                <p className="font-semibold text-gray-900">
                  {batch.bgh_approver_name || batch.approved_by_name || 'Hiệu trưởng / Đại diện BGH'}
                </p>
              </div>
            </div>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

