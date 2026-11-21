import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  X,
} from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/Toast';

interface StudentRosterImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StudentRosterImportModal: React.FC<StudentRosterImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [importSummary, setImportSummary] = useState<{
    created_count: number;
    updated_count: number;
    total: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async () => {
    try {
      const res = await api.get('/students/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'uth_danh_sach_sinh_vien_mau.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Đã tải xuống file CSV danh sách sinh viên mẫu.');
    } catch {
      toast.error('Không thể tải file mẫu. Vui lòng thử lại sau.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
        toast.error('Vui lòng chọn file định dạng CSV chuẩn (UTF-8).');
        return;
      }
      setSelectedFile(file);
      setImportSummary(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file CSV danh sách sinh viên.');
      return;
    }

    try {
      setIsUploading(true);

      let csvText = '';
      try {
        csvText = await selectedFile.text();
      } catch {
        csvText = '';
      }

      let res;
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        if (csvText) {
          formData.append('csv_data', csvText);
        }
        res = await api.post('/students/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch (uploadErr: any) {
        // Fallback: send as JSON payload if multipart failed
        if (csvText) {
          res = await api.post('/students/import', { csv_data: csvText });
        } else {
          throw uploadErr;
        }
      }

      const data = res.data;
      setImportSummary({
        created_count: data.created_count || 0,
        updated_count: data.updated_count || 0,
        total: data.total || 0,
      });

      // Làm mới ô upload sau khi nạp thành công
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success(data.detail || 'Import danh sách sinh viên thành công!');
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Lỗi khi import danh sách sinh viên.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImportSummary(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="Nhập danh sách sinh viên chính khóa từ Phòng Đào tạo"
      size="md"
    >
      <ModalBody className="p-6 space-y-4">
        {/* Step 1: Download Template */}
        <div className="bg-slate-50 border border-border rounded-xl p-4 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-brand flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-textPrimary">File CSV danh sách sinh viên mẫu chuẩn UTH</p>
              <p className="text-[11px] text-textSecondary mt-0.5">
                Đã kèm sẵn cột Ảnh thẻ, MSSV, Họ tên, Khoa, Ngành, Lớp, Email, SĐT, Khóa, Trạng thái
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="text-xs h-8 px-3 shrink-0 flex items-center gap-1.5 font-semibold text-primary border-primary/30 hover:bg-teal-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải file mẫu (.csv)</span>
          </Button>
        </div>

        {/* Step 2: Upload Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 hover:border-primary rounded-2xl p-6 text-center cursor-pointer transition-colors bg-white hover:bg-slate-50/50"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-teal-50 text-brand flex items-center justify-center mx-auto mb-2">
            <Upload className="w-6 h-6" />
          </div>

          <p className="text-xs font-bold text-textPrimary">
            {selectedFile ? selectedFile.name : 'Nhấp vào đây để chọn file CSV'}
          </p>
          <p className="text-[11px] text-textSecondary mt-1">
            {selectedFile
              ? `${(selectedFile.size / 1024).toFixed(1)} KB — Nhấp để chọn file khác`
              : 'Hỗ trợ định dạng file CSV xuất từ hệ thống Phòng Đào tạo'}
          </p>
        </div>

        {/* Step 3: Success Feedback */}
        {importSummary && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1.5 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Nạp dữ liệu sinh viên thành công!</span>
            </div>
            <p className="text-xs text-emerald-700">
              Đã xử lý <strong>{importSummary.total}</strong> bản ghi (Thêm mới:{' '}
              <strong className="text-emerald-800">{importSummary.created_count}</strong>, Cập nhật:{' '}
              <strong className="text-emerald-800">{importSummary.updated_count}</strong>).
            </p>
          </div>
        )}
      </ModalBody>

      <ModalFooter className="flex justify-between items-center p-4 bg-slate-50 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            handleReset();
            onClose();
          }}
          disabled={isUploading}
        >
          Đóng
        </Button>

        <Button
          type="button"
          onClick={handleUpload}
          disabled={isUploading || !selectedFile}
          className="bg-primary hover:bg-primary-hover text-white font-bold px-5 flex items-center gap-1.5"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          <span>{isUploading ? 'Đang nạp...' : 'Bắt đầu nạp danh sách'}</span>
        </Button>
      </ModalFooter>
    </Modal>
  );
};

