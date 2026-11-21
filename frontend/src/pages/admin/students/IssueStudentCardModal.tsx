import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  GraduationCap,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  Building,
  BookOpen,
  Camera,
  Upload,
  User,
  Loader2,
  Sparkles,
  Printer,
  QrCode,
  Banknote,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import { formatCurrencyVND, cn } from '@/lib/utils';
import { ReceiptPrintModal, ReceiptData } from './ReceiptPrintModal';
import { StudentCardPrintModal, StudentCardData } from './StudentCardPrintModal';

interface IssueStudentCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onViewPatron?: (code: string) => void;
  initialMssv?: string;
}

interface LookupResult {
  found: boolean;
  message?: string;
  already_has_card?: boolean;
  eligible?: boolean;
  reason?: string;
  user_id?: number;
  card_code?: string;
  card_expiry?: string;
  suggested_expiry?: string;
  fee?: number;
  data?: {
    id: number;
    student_code: string;
    full_name: string;
    department: string;
    major?: string;
    class_name?: string;
    email?: string;
    phone?: string;
    academic_year?: string;
    status: string;
    status_display: string;
    is_card_issued: boolean;
    avatar?: string;
  };
}

// Cấu hình tài khoản SePay thực tế của Thư viện UTH
const SEPAY_CONFIG = {
  bankId: 'sacombank', // Sacombank (BIN: 970403)
  bankName: 'Sacombank (STB)',
  branch: 'Ngân hàng TMCP Sài Gòn Thương Tín',
  accountNumber: '040117536833',
  accountName: 'LE HOAI VU',
};

export const IssueStudentCardModal: React.FC<IssueStudentCardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onViewPatron,
  initialMssv,
}) => {
  const [searchMssv, setSearchMssv] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);

  useEffect(() => {
    if (isOpen && initialMssv) {
      setSearchMssv(initialMssv);
      handleSearch(initialMssv);
    }
  }, [isOpen, initialMssv]);

  // Form states for issuance
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('transfer'); // Ưu tiên chuyển khoản SePay
  const [feeCollected, setFeeCollected] = useState(100000);
  const [note, setNote] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Success state & Print Modals
  const [issuedSuccessData, setIssuedSuccessData] = useState<any | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // SePay Real-Time Webhook Polling: tự động bắt giao dịch khi sinh viên quét QR
  useEffect(() => {
    if (!isOpen || !lookupResult?.data || issuedSuccessData || paymentMethod !== 'transfer') {
      return;
    }

    const studentCode = lookupResult.data.student_code;
    let isMounted = true;

    const interval = setInterval(async () => {
      try {
        const res = await api.get<{ is_paid: boolean; transaction?: any }>(
          `/students/payment-status?student_code=${encodeURIComponent(studentCode)}`
        );
        if (res.data?.is_paid && isMounted) {
          toast.success(`SePay/Sacombank xác nhận nhận 100.000đ thành công! Thẻ đã được kích hoạt.`);
          setIssuedSuccessData(res.data.transaction);
          onSuccess();
        }
      } catch {
        // Silent polling
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, lookupResult, issuedSuccessData, paymentMethod, onSuccess]);

  const handleSearch = async (codeToSearch?: string) => {
    const code = (codeToSearch || searchMssv).trim();
    if (!code) {
      toast.error('Vui lòng nhập Mã số sinh viên (MSSV) hoặc quét mã vạch.');
      return;
    }

    try {
      setIsSearching(true);
      setLookupResult(null);
      setIssuedSuccessData(null);
      const res = await api.get(`/students/lookup?code=${encodeURIComponent(code)}`);
      const result: LookupResult = res.data;
      setLookupResult(result);

      if (result.found && result.eligible && !result.already_has_card) {
        setPhone(result.data?.phone || '');
        if (result.data?.avatar) {
          setAvatarPreview(result.data.avatar);
        } else {
          setAvatarPreview('');
        }
        if (result.suggested_expiry) {
          setCardExpiry(result.suggested_expiry);
        } else {
          const d = new Date();
          d.setFullYear(d.getFullYear() + 1);
          setCardExpiry(d.toISOString().split('T')[0]);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Không thể tra cứu thông tin sinh viên.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Đã sao chép ${fieldName}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmIssue = async () => {
    if (!lookupResult?.data) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('student_code', lookupResult.data.student_code);
      formData.append('card_expiry', cardExpiry);
      formData.append('phone', phone);
      formData.append('payment_method', paymentMethod);
      formData.append('fee_collected', String(feeCollected));
      formData.append('note', note || `Lệ phí cấp thẻ thư viện năm học cho sinh viên ${lookupResult.data.student_code}`);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await api.post('/students/issue-card', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const tx = res.data?.transaction;
      setIssuedSuccessData(tx);
      toast.success(
        res.data?.detail ||
          `Đã cấp thẻ thành công cho sinh viên ${lookupResult.data.full_name} (${lookupResult.data.student_code})!`
      );
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Lỗi khi cấp thẻ thư viện.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSearchMssv('');
    setLookupResult(null);
    setCardExpiry('');
    setPhone('');
    setPaymentMethod('transfer');
    setAvatarFile(null);
    setAvatarPreview('');
    setIssuedSuccessData(null);
    setIsReceiptModalOpen(false);
    setIsCardModalOpen(false);
  };

  // Cú pháp chuyển khoản SePay: UTH <MSSV> DKTHE
  const transferContent = lookupResult?.data ? `UTH ${lookupResult.data.student_code} DKTHE` : '';

  // Link ảnh VietQR Napas 24/7 trực tiếp tài khoản Sacombank SePay
  const vietQrUrl = lookupResult?.data
    ? `https://img.vietqr.io/image/${SEPAY_CONFIG.bankId}-${SEPAY_CONFIG.accountNumber}-compact2.png?amount=${feeCollected}&addInfo=${encodeURIComponent(
        transferContent
      )}&accountName=${encodeURIComponent(SEPAY_CONFIG.accountName)}`
    : '';

  const receiptData: ReceiptData | null = issuedSuccessData
    ? {
        transaction_code: issuedSuccessData.transaction_code,
        receipt_code: issuedSuccessData.receipt_code,
        amount: issuedSuccessData.amount,
        payment_method: issuedSuccessData.payment_method,
        payment_method_display: issuedSuccessData.payment_method_display,
        payer_name: issuedSuccessData.payer_name,
        student_code: issuedSuccessData.student_code,
        department: issuedSuccessData.department,
        class_name: issuedSuccessData.class_name,
        collected_by_name: issuedSuccessData.collected_by_name,
        collected_at: issuedSuccessData.collected_at,
        card_code: issuedSuccessData.card_code,
        card_expiry: issuedSuccessData.card_expiry,
      }
    : null;

  const cardData: StudentCardData | null = issuedSuccessData
    ? {
        student_code: issuedSuccessData.student_code,
        full_name: issuedSuccessData.payer_name,
        department: issuedSuccessData.department,
        class_name: issuedSuccessData.class_name,
        card_code: issuedSuccessData.card_code,
        card_expiry: issuedSuccessData.card_expiry,
        avatar: issuedSuccessData.avatar || avatarPreview,
      }
    : null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          handleReset();
          onClose();
        }}
        title="Quầy Lưu Thông — Cấp Thẻ Bạn Đọc & Thu Phí SePay"
        size="2xl"
      >
        <ModalBody className="p-6 space-y-5">
          {/* ========================================================
              SCREEN: THÀNH CÔNG (POST-ISSUANCE)
              ======================================================== */}
          {issuedSuccessData ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Green Success Hero Banner */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-md text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-1">
                  <CheckCircle2 className="w-9 h-9 text-white" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">Cấp Thẻ Thư Viện Thành Công!</h2>
                <p className="text-xs text-emerald-100 max-w-md mx-auto">
                  Hồ sơ bạn đọc đã được kích hoạt qua cổng thanh toán SePay (Sacombank), tài khoản có hiệu lực ngay lập tức.
                </p>
              </div>

              {/* Transaction Summary Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block text-[11px]">Họ và tên:</span>
                  <strong className="text-sm font-bold text-gray-900 block truncate">
                    {issuedSuccessData.payer_name}
                  </strong>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block text-[11px]">Mã số sinh viên (MSSV):</span>
                  <strong className="text-sm font-mono font-bold text-teal-700 block">
                    {issuedSuccessData.student_code}
                  </strong>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block text-[11px]">Mã thẻ thư viện:</span>
                  <strong className="text-sm font-mono font-bold text-brand block">
                    {issuedSuccessData.card_code}
                  </strong>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block text-[11px]">Mã biên lai:</span>
                  <strong className="text-xs font-mono font-bold text-teal-800 block">
                    {issuedSuccessData.receipt_code}
                  </strong>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block text-[11px]">Lệ phí đã thu:</span>
                  <strong className="text-sm font-bold text-orange-600 block">
                    {formatCurrencyVND(issuedSuccessData.amount)}
                  </strong>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block text-[11px]">Phương thức:</span>
                  <span className="inline-flex items-center px-2 py-0.5 mt-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {issuedSuccessData.payment_method_display || 'Chuyển khoản SePay (Sacombank)'}
                  </span>
                </div>
              </div>

              {/* 4 Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* 1. In Biên Lai */}
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(true)}
                  className="p-4 rounded-xl border-2 border-teal-200 hover:border-brand hover:bg-teal-50/50 bg-white transition-all flex items-center gap-3.5 text-left group shadow-xs cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-teal-100 text-brand flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 group-hover:text-brand">1. In Biên Lai Thu Tiền</h4>
                    <p className="text-xs text-gray-500">Mã biên lai {issuedSuccessData.receipt_code} theo chuẩn UTH</p>
                  </div>
                </button>

                {/* 2. In Thẻ Bạn Đọc */}
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(true)}
                  className="p-4 rounded-xl border-2 border-teal-200 hover:border-brand hover:bg-teal-50/50 bg-white transition-all flex items-center gap-3.5 text-left group shadow-xs cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 group-hover:text-brand">2. In Thẻ Bạn Đọc (PVC)</h4>
                    <p className="text-xs text-gray-500">Chuẩn thẻ PVC CR80 kèm mã vạch Code128</p>
                  </div>
                </button>

                {/* 3. Xem Hồ Sơ Bạn Đọc */}
                <button
                  type="button"
                  onClick={() => {
                    if (onViewPatron) {
                      onViewPatron(issuedSuccessData.student_code);
                    }
                    onClose();
                  }}
                  className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-slate-50 bg-white transition-all flex items-center gap-3.5 text-left group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-slate-100 text-gray-700 flex items-center justify-center shrink-0">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">3. Xem Hồ Sơ Bạn Đọc</h4>
                    <p className="text-xs text-gray-500">Xem chi tiết tài khoản mượn và công nợ</p>
                  </div>
                </button>

                {/* 4. Đăng Ký Cho Sinh Viên Tiếp Theo */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-4 rounded-xl border border-orange-200 hover:border-orange-300 hover:bg-orange-50/60 bg-white transition-all flex items-center gap-3.5 text-left group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 text-orange-950">4. Đăng Ký Sinh Viên Tiếp Theo</h4>
                    <p className="text-xs text-gray-500">Quay lại ô tra cứu MSSV cho bạn đọc mới</p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================
                SCREEN: TRA CỨU & XÁC MINH (FORM)
                ======================================================== */
            <>
              {/* Search Banner */}
              <div className="bg-slate-50 border border-border rounded-xl p-4 space-y-3">
                <label className="block text-xs font-bold text-textPrimary tracking-tight">
                  Nhập Mã số sinh viên (MSSV) hoặc Quét mã vạch Thẻ SV
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchMssv}
                      onChange={(e) => setSearchMssv(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="VD: 22510001, 22510002, 2251172153..."
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-white text-sm text-textPrimary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                      autoFocus
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleSearch()}
                    disabled={isSearching}
                    className="h-11 px-5 rounded-xl font-bold bg-primary hover:bg-primary-hover text-white shadow-xs shrink-0 flex items-center gap-1.5"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Tra cứu</span>
                  </Button>
                </div>
              </div>

              {/* Status views */}
              {lookupResult && (
                <div className="animate-in fade-in duration-200">
                  {/* Case B: Not Found */}
                  {!lookupResult.found ? (
                    <div className="p-4 rounded-xl bg-red-50/80 border border-red-200 text-red-800 flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-sm">Không tìm thấy sinh viên trong dữ liệu nhà trường</p>
                        <p className="text-xs text-red-700 leading-relaxed">
                          Mã số sinh viên không tồn tại trong kho dữ liệu Registry của trường UTH. Vui lòng kiểm tra lại
                          MSSV hoặc liên hệ Quản trị viên (Admin) để đồng bộ / import dữ liệu mới.
                        </p>
                      </div>
                    </div>
                  ) : lookupResult.already_has_card ? (
                    /* Case C: Already has card */
                    <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div className="space-y-1.5 flex-1">
                        <p className="font-bold text-sm">Sinh viên đã đăng ký thư viện UTH</p>
                        <p className="text-xs text-blue-800 leading-relaxed">
                          Sinh viên <strong>{lookupResult.data?.full_name}</strong> đã có thẻ thư viện đang hoạt động với
                          mã thẻ: <strong className="font-mono">{lookupResult.card_code}</strong>.
                        </p>
                        <p className="text-xs text-blue-700">
                          💡 Hệ thống không cho phép mở thẻ trùng. Để tiếp tục sử dụng, vui lòng chọn chức năng{' '}
                          <strong>"Gia hạn thẻ"</strong> tại danh sách bạn đọc.
                        </p>
                      </div>
                    </div>
                  ) : !lookupResult.eligible ? (
                    /* Case D: Ineligible */
                    <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-sm">Sinh viên không đủ điều kiện cấp thẻ</p>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          Họ tên: <strong>{lookupResult.data?.full_name}</strong> (Tình trạng:{' '}
                          <span className="font-semibold">{lookupResult.data?.status_display}</span>).
                        </p>
                        <p className="text-xs text-amber-700">
                          {lookupResult.reason ||
                            'Chỉ sinh viên đang theo học chính thức (Đang học) mới được phép mở thẻ thư viện.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Case A: Found & Eligible -> Activation Form & Payment */
                    <div className="border border-teal-200 bg-teal-50/30 rounded-2xl p-5 space-y-5">
                      {/* Match Badge */}
                      <div className="flex items-center justify-between border-b border-teal-200/80 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Đã xác thực dữ liệu nhà trường: Sinh viên chính khóa UTH
                          </span>
                        </div>
                        <span className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full border border-orange-300">
                          Lệ phí: {formatCurrencyVND(feeCollected)}
                        </span>
                      </div>

                      {/* Student Profile Card (Auto-filled) */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Avatar 3x4 */}
                        <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-border text-center">
                          <div className="w-24 h-32 rounded-lg bg-slate-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
                            {avatarPreview ? (
                              <img
                                src={avatarPreview}
                                alt="Ảnh thẻ"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center text-gray-400">
                                <User className="w-8 h-8 mb-1" />
                                <span className="text-[10px]">Ảnh thẻ 3x4</span>
                              </div>
                            )}
                          </div>
                          <label className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark cursor-pointer">
                            <Camera className="w-3.5 h-3.5" />
                            <span>{avatarPreview ? 'Đổi ảnh' : 'Tải ảnh thẻ'}</span>
                            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                          </label>
                        </div>

                        {/* Roster Information Fields */}
                        <div className="md:col-span-2 space-y-2.5 bg-white p-4 rounded-xl border border-border text-xs">
                          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-gray-100">
                            <div>
                              <span className="text-gray-400 block text-[11px]">Họ và tên:</span>
                              <strong className="text-sm text-textPrimary">{lookupResult.data?.full_name}</strong>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[11px]">Mã số sinh viên (MSSV):</span>
                              <strong className="text-sm font-mono text-primary">
                                {lookupResult.data?.student_code}
                              </strong>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-gray-400 block text-[11px]">Khoa / Viện:</span>
                              <span className="font-medium text-textPrimary">{lookupResult.data?.department}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[11px]">Ngành / Lớp:</span>
                              <span className="font-medium text-textPrimary">
                                {lookupResult.data?.class_name ? `Lớp ${lookupResult.data.class_name}` : lookupResult.data?.major || 'Đại trà'}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-gray-400 block text-[11px]">Khóa học:</span>
                              <span className="font-medium text-textPrimary">{lookupResult.data?.academic_year}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[11px]">Email trường cấp:</span>
                              <span className="font-mono text-textPrimary truncate block">{lookupResult.data?.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Inputs: Phone & Card Expiry */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Số điện thoại liên hệ"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="VD: 0901234567"
                          required
                        />

                        <div>
                          <label className="block text-xs font-semibold text-textPrimary mb-1">
                            Thời hạn sử dụng thẻ <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full h-9 px-3 rounded-lg border border-border bg-white text-xs text-textPrimary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            required
                          />
                          <p className="text-[10px] text-gray-500 mt-1">Mặc định 12 tháng kể từ ngày mở thẻ</p>
                        </div>
                      </div>

                      {/* PAYMENT METHOD SELECTION */}
                      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3.5">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-brand" />
                            <span>Phương thức thanh toán lệ phí (SePay Gateway)</span>
                          </label>
                          <strong className="text-sm font-bold text-orange-600">
                            {formatCurrencyVND(feeCollected)}
                          </strong>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* Option 1: SePay VietQR Sacombank */}
                          <label
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
                              paymentMethod === 'transfer'
                                ? 'border-brand bg-teal-50/50 text-brand font-semibold shadow-2xs'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                            )}
                          >
                            <input
                              type="radio"
                              name="payment_method"
                              checked={paymentMethod === 'transfer'}
                              onChange={() => setPaymentMethod('transfer')}
                              className="accent-brand"
                            />
                            <div className="flex items-center gap-2">
                              <QrCode className="w-5 h-5 text-purple-600" />
                              <div className="text-xs">
                                <div className="font-bold flex items-center gap-1.5">
                                  <span>Chuyển khoản SePay</span>
                                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-100 text-purple-800 border border-purple-200">
                                    Tự động
                                  </span>
                                </div>
                                <div className="text-[10px] text-gray-500">Sacombank STB 24/7</div>
                              </div>
                            </div>
                          </label>

                          {/* Option 2: Cash */}
                          <label
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
                              paymentMethod === 'cash'
                                ? 'border-brand bg-teal-50/50 text-brand font-semibold shadow-2xs'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                            )}
                          >
                            <input
                              type="radio"
                              name="payment_method"
                              checked={paymentMethod === 'cash'}
                              onChange={() => setPaymentMethod('cash')}
                              className="accent-brand"
                            />
                            <div className="flex items-center gap-2">
                              <Banknote className="w-5 h-5 text-emerald-600" />
                              <div className="text-xs">
                                <div className="font-bold">Tiền mặt</div>
                                <div className="text-[10px] text-gray-500">Thu trực tiếp tại quầy</div>
                              </div>
                            </div>
                          </label>
                        </div>

                        {/* SEPAY SACOMBANK DISPLAY WHEN TRANSFER SELECTED */}
                        {paymentMethod === 'transfer' && (
                          <div className="p-4 bg-gradient-to-br from-purple-50/80 via-white to-teal-50/40 border border-purple-200 rounded-xl space-y-3.5 animate-in fade-in duration-200">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                              {/* VietQR Image Container */}
                              <div className="w-36 h-36 bg-white p-2 rounded-xl border border-purple-300 shadow-sm shrink-0 flex items-center justify-center relative">
                                <img
                                  src={vietQrUrl}
                                  alt="VietQR Sacombank SePay"
                                  className="w-full h-full object-contain"
                                />
                                <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white rounded-full p-1 shadow">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                </div>
                              </div>

                              {/* Official Account Details */}
                              <div className="space-y-1.5 text-xs text-gray-800 flex-1 w-full">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-xs uppercase text-purple-900 tracking-tight">
                                    Cổng Thanh Toán Tự Động SePay
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Đang chờ chuyển khoản</span>
                                  </span>
                                </div>

                                <div className="bg-white/80 p-2.5 rounded-lg border border-purple-100 space-y-1 text-[11px]">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Ngân hàng:</span>
                                    <strong className="text-gray-900 font-semibold">{SEPAY_CONFIG.bankName}</strong>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Số tài khoản:</span>
                                    <div className="flex items-center gap-1.5 font-mono font-bold text-purple-800 text-xs">
                                      <span>{SEPAY_CONFIG.accountNumber}</span>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(SEPAY_CONFIG.accountNumber, 'Số tài khoản')}
                                        className="text-gray-400 hover:text-purple-600"
                                      >
                                        {copiedField === 'Số tài khoản' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Chủ tài khoản:</span>
                                    <strong className="text-gray-900 uppercase">{SEPAY_CONFIG.accountName}</strong>
                                  </div>
                                  <div className="flex justify-between items-center pt-1 border-t border-purple-100">
                                    <span className="text-gray-500">Nội dung CK:</span>
                                    <div className="flex items-center gap-1.5 font-mono font-bold text-brand text-xs">
                                      <span>{transferContent}</span>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(transferContent, 'Nội dung CK')}
                                        className="text-gray-400 hover:text-brand"
                                      >
                                        {copiedField === 'Nội dung CK' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-[11px] text-gray-500 pt-0.5">
                                  <span>Số tiền chính xác: <strong className="text-orange-600 font-bold font-mono">100.000 đ</strong></span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
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
            disabled={isSubmitting}
          >
            Đóng
          </Button>

          {!issuedSuccessData && lookupResult?.found && lookupResult?.eligible && !lookupResult?.already_has_card && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={handleConfirmIssue}
                disabled={isSubmitting || !cardExpiry}
                className="bg-primary hover:bg-primary-hover text-white font-bold px-5 flex items-center gap-2 shadow-sm"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>
                  {paymentMethod === 'cash' ? 'Xác nhận thu 100.000đ Tiền mặt' : 'Xác nhận & Kích hoạt Thẻ'}
                </span>
              </Button>
            </div>
          )}
        </ModalFooter>
      </Modal>

      {/* Printable Receipt Modal */}
      <ReceiptPrintModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={receiptData}
      />

      {/* Printable Student Card Modal */}
      <StudentCardPrintModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        cardData={cardData}
      />
    </>
  );
};
