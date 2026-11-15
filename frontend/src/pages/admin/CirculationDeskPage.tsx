import React, { useState, useRef, useEffect } from 'react';
import {
  ScanLine,
  User,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Receipt,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Camera,
  Bookmark,
  Search,
} from 'lucide-react';
import { api, formatApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Alert } from '@/components/ui/Alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/Table';
import { CameraBarcodeScannerModal } from '@/components/ui/CameraBarcodeScannerModal';
import { cn, formatCurrencyVND, formatDateVN } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { broadcastRealtimeSync } from '@/lib/realtime';

interface PatronInfo {
  id: number;
  username: string;
  full_name: string;
  role: string;
  card_code: string;
  avatar?: string;
  department?: string;
  card_expiry?: string;
  is_card_valid: boolean;
  is_currently_locked: boolean;
  active_loans_count: number;
  max_loans: number;
  remaining_quota: number;
  has_overdue: boolean;
  has_unpaid_fines: boolean;
  unpaid_fines_total: number;
  ready_reservations?: Array<{
    id: number;
    book_id: number;
    book_title: string;
    barcode: string;
    shelf_location?: string;
    hold_expires_at?: string;
  }>;
}

interface CartItem {
  barcode: string;
  title: string;
  category: string;
  shelf_location: string;
  reading_room_only: boolean;
}

interface ReturnLookupResult {
  loan_id: number;
  patron_name: string;
  patron_card_code: string;
  book_title: string;
  barcode: string;
  shelf_location: string;
  borrowed_at: string;
  due_at: string;
  is_overdue: boolean;
  days_late: number;
  estimated_fine: number;
  book_price: number;
  processing_fee: number;
}

export const CirculationDeskPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'borrow' | 'return'>('borrow');

  // BORROW TAB STATE
  const [patronScanInput, setPatronScanInput] = useState('');
  const [patron, setPatron] = useState<PatronInfo | null>(null);
  const [patronLoading, setPatronLoading] = useState(false);
  const [patronError, setPatronError] = useState<string | null>(null);

  const [bookScanInput, setBookScanInput] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartError, setCartError] = useState<string | null>(null);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [borrowSuccess, setBorrowSuccess] = useState<string | null>(null);

  // RETURN TAB STATE
  const [returnBarcodeInput, setReturnBarcodeInput] = useState('');
  const [returnLookup, setReturnLookup] = useState<ReturnLookupResult | null>(null);
  const [returnLookupLoading, setReturnLookupLoading] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);
  const [returnSuccess, setReturnSuccess] = useState<string | null>(null);

  const [condition, setCondition] = useState<'normal' | 'damaged' | 'lost'>('normal');
  const [damageLevel, setDamageLevel] = useState<'light' | 'medium' | 'heavy'>('light');
  const [amountOverride, setAmountOverride] = useState<string>('');
  const [returnNote, setReturnNote] = useState<string>('');

  // Camera Scanner State
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState<boolean>(false);
  const [cameraTarget, setCameraTarget] = useState<'patron' | 'book' | 'return'>('patron');

  // Refs for auto-focus
  const patronInputRef = useRef<HTMLInputElement>(null);
  const bookInputRef = useRef<HTMLInputElement>(null);
  const returnInputRef = useRef<HTMLInputElement>(null);

  const executePatronLookup = async (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return;

    setPatronScanInput(code);
    setPatronLoading(true);
    setPatronError(null);
    setBorrowSuccess(null);

    try {
      try {
        console.log('[CirculationDesk] Looking up patron:', code);
        const deskRes = await api.get<{ data: PatronInfo }>(`/circulation/desk/patron?card_code=${encodeURIComponent(code)}`);
        if (deskRes.data?.data) {
          console.log('[CirculationDesk] Patron found:', deskRes.data.data);
          setPatron(deskRes.data.data);
          setPatronScanInput(deskRes.data.data.card_code || code);
          setCart([]);
          setCartError(null);
          setBorrowSuccess(`Đã nhận diện hồ sơ bạn đọc: ${deskRes.data.data.full_name} (${deskRes.data.data.card_code})`);
          setTimeout(() => {
            bookInputRef.current?.focus();
            bookInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 150);
          return;
        }
      } catch (err: any) {
        console.warn('[CirculationDesk] Desk patron endpoint fallback:', err);
      }

      const res = await api.get<{ data: any[] }>(`/users?card_code=${encodeURIComponent(code)}&search=${encodeURIComponent(code)}`);
      const userList = res.data.data || [];
      const userObj = userList.find((u: any) =>
        u.card_code?.toUpperCase() === code || u.username?.toUpperCase() === code
      );

      if (!userObj) {
        setPatronError(`Không tìm thấy bạn đọc với mã thẻ: ${code}`);
        setPatron(null);
        return;
      }

      const [loansRes, finesRes] = await Promise.all([
        api.get<{ data: any[]; meta: { total: number } }>(`/loans?card_code=${encodeURIComponent(code)}&status=active`),
        api.get<{ data: any[] }>(`/fines?card_code=${encodeURIComponent(code)}&status=unpaid`),
      ]);

      const activeLoans = loansRes.data.data || [];
      const unpaidFines = finesRes.data.data || [];
      const hasOverdue = activeLoans.some((l) => l.is_overdue);
      const maxLimit = userObj.role === 'lecturer' ? 10 : 5;
      const unpaidTotal = unpaidFines.reduce((sum, f) => sum + (f.amount - f.paid_amount), 0);

      setPatron({
        id: userObj.id,
        username: userObj.username,
        full_name: userObj.full_name,
        role: userObj.role,
        card_code: userObj.card_code,
        avatar: userObj.avatar,
        department: userObj.department,
        card_expiry: userObj.card_expiry,
        is_card_valid: userObj.is_card_valid,
        is_currently_locked: userObj.is_currently_locked,
        active_loans_count: activeLoans.length,
        max_loans: maxLimit,
        remaining_quota: Math.max(0, maxLimit - activeLoans.length),
        has_overdue: hasOverdue,
        has_unpaid_fines: unpaidFines.length > 0,
        unpaid_fines_total: unpaidTotal,
      });

      setPatronScanInput(userObj.card_code || code);
      setCart([]);
      setCartError(null);
      setBorrowSuccess(`Đã nhận diện hồ sơ bạn đọc: ${userObj.full_name} (${userObj.card_code || code})`);
      setTimeout(() => {
        bookInputRef.current?.focus();
        bookInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    } catch (err) {
      setPatronError(formatApiError(err));
      setPatron(null);
    } finally {
      setPatronLoading(false);
    }
  };

  const handleCameraScanSuccess = async (scannedCode: string) => {
    const code = scannedCode.trim().toUpperCase();
    if (!code) return;

    if (cameraTarget === 'patron') {
      await executePatronLookup(code);
    } else if (cameraTarget === 'book') {
      await addBarcode(code);
    } else if (cameraTarget === 'return') {
      setReturnBarcodeInput(code);
      setReturnLookupLoading(true);
      setReturnError(null);
      setReturnSuccess(null);
      try {
        const res = await api.get<{ data: ReturnLookupResult }>(`/loans/lookup-return?barcode=${encodeURIComponent(code)}`);
        setReturnLookup(res.data.data);
        setCondition('normal');
        setAmountOverride('');
        setReturnNote('');
        setReturnBarcodeInput('');
      } catch (err) {
        setReturnError(formatApiError(err));
      } finally {
        setReturnLookupLoading(false);
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'borrow') {
      if (!patron) {
        patronInputRef.current?.focus();
      } else {
        bookInputRef.current?.focus();
      }
    } else {
      returnInputRef.current?.focus();
    }
  }, [activeTab, patron]);

  // Handle Patron Lookup by barcode scan (Enter)
  const handlePatronScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patronScanInput.trim()) return;
    await executePatronLookup(patronScanInput.trim());
  };

  // Helper to add barcode into cart
  const addBarcode = async (rawCode: string) => {
    const bc = rawCode.trim().toUpperCase();
    if (!bc) return;

    setCartError(null);
    setBorrowSuccess(null);

    if (cart.some((item) => item.barcode === bc)) {
      setCartError(`Mã vạch ${bc} đã có trong danh sách chuẩn bị mượn.`);
      setBookScanInput('');
      return;
    }

    if (patron && cart.length >= patron.remaining_quota) {
      setCartError(`Bạn đọc đã đạt giới hạn hạn mức còn lại (${patron.remaining_quota} cuốn).`);
      setBookScanInput('');
      return;
    }

    try {
      const res = await api.get<{ data: any }>(`/copies/lookup?barcode=${encodeURIComponent(bc)}`);
      const copyData = res.data.data;

      if (copyData.reading_room_only) {
        setCartError(`Bản sao ${bc} chỉ phục vụ đọc tại chỗ, không thể mượn về nhà!`);
        setBookScanInput('');
        return;
      }

      if (copyData.status !== 'available' && copyData.held_for_user !== patron?.id) {
        setCartError(`Bản sao ${bc} hiện ở trạng thái "${copyData.status_display}", không sẵn sàng để mượn!`);
        setBookScanInput('');
        return;
      }

      setCart((prev) => [
        ...prev,
        {
          barcode: copyData.barcode,
          title: copyData.book_title,
          category: copyData.category_name,
          shelf_location: copyData.shelf_location,
          reading_room_only: copyData.reading_room_only,
        },
      ]);

      setBookScanInput('');
      bookInputRef.current?.focus();
    } catch (err) {
      setCartError(formatApiError(err));
    }
  };

  // Handle Book Barcode Scan (Enter)
  const handleBookScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookScanInput.trim()) return;
    await addBarcode(bookScanInput);
  };

  // CONFIRM BORROW
  const handleConfirmBorrow = async () => {
    if (!patron || cart.length === 0) return;

    setBorrowLoading(true);
    setCartError(null);
    setBorrowSuccess(null);

    try {
      const barcodes = cart.map((c) => c.barcode);
      await api.post<{ detail: string; data: any[] }>('/loans/checkout', {
        user_id: patron.id,
        barcodes,
      });

      const successMsg = `Đã lập phiếu mượn thành công cho ${barcodes.length} cuốn sách.`;
      setBorrowSuccess(successMsg);
      toast.success(successMsg);
      setCart([]);
      broadcastRealtimeSync('loans');
      broadcastRealtimeSync('books');
      broadcastRealtimeSync('reservations');
      broadcastRealtimeSync('notifications');
      broadcastRealtimeSync('dashboard');
      window.dispatchEvent(new CustomEvent('uth-refresh-notifications'));
      setPatron((prev) =>
        prev
          ? {
              ...prev,
              active_loans_count: prev.active_loans_count + barcodes.length,
              remaining_quota: Math.max(0, prev.remaining_quota - barcodes.length),
            }
          : null
      );
      bookInputRef.current?.focus();
    } catch (err) {
      const errMsg = formatApiError(err);
      setCartError(errMsg);
      toast.error(errMsg);
    } finally {
      setBorrowLoading(false);
    }
  };

  // RETURN LOOKUP
  const handleReturnScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnBarcodeInput.trim()) return;

    setReturnLookupLoading(true);
    setReturnError(null);
    setReturnSuccess(null);

    try {
      const bc = returnBarcodeInput.trim().toUpperCase();
      const res = await api.get<{ data: ReturnLookupResult }>(`/loans/lookup-return?barcode=${encodeURIComponent(bc)}`);
      setReturnLookup(res.data.data);
      setCondition('normal');
      setAmountOverride('');
      setReturnNote('');
      setReturnBarcodeInput('');
    } catch (err) {
      setReturnError(formatApiError(err));
    } finally {
      setReturnLookupLoading(false);
    }
  };

  // CONFIRM RETURN
  const handleConfirmReturn = async () => {
    if (!returnLookup) return;

    setReturnLookupLoading(true);
    setReturnError(null);
    setReturnSuccess(null);

    try {
      const payload: any = {
        condition,
        note: returnNote,
      };

      if (condition === 'damaged') {
        payload.damage_level = damageLevel;
        if (amountOverride) {
          payload.amount_override = parseInt(amountOverride, 10);
        }
      }

      const res = await api.post<{ detail: string; data: { loan: any; fines: any[] } }>(
        `/loans/${returnLookup.loan_id}/return`,
        payload
      );

      const finesCount = res.data.data?.fines?.length || 0;
      let msg = `Đã xác nhận trả sách thành công cho bạn đọc ${returnLookup.patron_name}.`;
      if (finesCount > 0) {
        msg += ` Đã ghi nhận ${finesCount} khoản phạt liên quan.`;
      }

      setReturnSuccess(msg);
      toast.success(msg);
      setReturnLookup(null);
      broadcastRealtimeSync('loans');
      broadcastRealtimeSync('books');
      broadcastRealtimeSync('reservations');
      broadcastRealtimeSync('fines');
      broadcastRealtimeSync('notifications');
      broadcastRealtimeSync('dashboard');
      window.dispatchEvent(new CustomEvent('uth-refresh-notifications'));
      returnInputRef.current?.focus();
    } catch (err) {
      const errMsg = formatApiError(err);
      setReturnError(errMsg);
      toast.error(errMsg);
    } finally {
      setReturnLookupLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-page-enter">
      {/* Top Banner & Tab Controls */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center">
                <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
                <span>Quầy Lưu thông Mượn & Trả sách</span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Tối ưu cho máy quét mã vạch chuyên dụng — Tự động nhận diện phím Enter khi quét
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('borrow')}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-semibold border flex items-center gap-2 transition-all duration-150 shadow-2xs',
              activeTab === 'borrow'
                ? 'bg-teal-50 text-brand border-brand shadow-xs'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            )}
          >
            <BookOpen className="w-4 h-4 text-brand" />
            <span>MƯỢN SÁCH TẠI QUẦY</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('return')}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-semibold border flex items-center gap-2 transition-all duration-150 shadow-2xs',
              activeTab === 'return'
                ? 'bg-teal-50 text-brand border-brand shadow-xs'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            )}
          >
            <RotateCcw className="w-4 h-4 text-brand" />
            <span>TRẢ SÁCH TẠI QUẦY</span>
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: MƯỢN SÁCH ===================== */}
      {activeTab === 'borrow' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Patron card scan + Patron details */}
          <div className="lg:col-span-5 space-y-5">
            {/* Patron Scan Box */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-wider font-bold text-gray-900 flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-brand" />
                  <span>1. Quét thẻ bạn đọc</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Quét mã vạch trên thẻ sinh viên/giảng viên UTH hoặc nhập mã
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                <form onSubmit={handlePatronScan} className="flex gap-2">
                  <Input
                    ref={patronInputRef}
                    placeholder="Quét mã vạch thẻ hoặc nhập mã SV/GV..."
                    value={patronScanInput}
                    onChange={(e) => setPatronScanInput(e.target.value)}
                    className="font-mono font-semibold"
                    disabled={patronLoading}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCameraTarget('patron');
                      setIsCameraScannerOpen(true);
                    }}
                    className="h-10 px-3.5 rounded-xl text-xs font-semibold shrink-0 border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 bg-white transition-colors flex items-center gap-1.5 shadow-2xs"
                    title="Bật Camera để quét mã vạch trên Thẻ sinh viên"
                  >
                    <Camera className="w-4 h-4 text-brand" />
                    <span className="hidden sm:inline">Camera</span>
                  </button>
                  <button
                    type="submit"
                    disabled={patronLoading}
                    className="h-10 px-4 rounded-xl text-xs font-semibold shrink-0 border border-brand text-brand hover:bg-teal-50 bg-white transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Search className="w-3.5 h-3.5 text-brand" />
                    <span>Tìm</span>
                  </button>
                </form>

                {patronError && (
                  <Alert variant="danger" title="Lỗi tìm bạn đọc">
                    {patronError}
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Patron Details Card */}
            {patron ? (
              <Card className="border-teal-200 bg-teal-50/20 shadow-xs animate-page-enter">
                <CardHeader className="border-b border-teal-100 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-18 rounded-lg border border-teal-200 overflow-hidden shrink-0 shadow-2xs bg-white flex items-center justify-center">
                        {patron.avatar ? (
                          <img src={patron.avatar} alt={patron.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-7 h-7 text-teal-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 leading-snug">{patron.full_name}</h3>
                        <p className="text-xs text-brand font-mono font-bold mt-1">
                          Mã thẻ: {patron.card_code}
                        </p>
                        <p className="text-[11px] text-textSecondary mt-0.5">{patron.department || 'ĐH GTVT TP.HCM'}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-xs font-bold border shrink-0 select-none shadow-2xs',
                        patron.role === 'lecturer'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : patron.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-300'
                          : 'bg-blue-50 text-blue-700 border-blue-300'
                      )}
                    >
                      {patron.role === 'lecturer' ? 'GV' : patron.role === 'admin' ? 'AD' : 'SV'}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-gray-100">
                      <span className="text-gray-500 block text-[11px] mb-0.5">Khoa / Đơn vị:</span>
                      <span className="font-semibold text-gray-800 line-clamp-1">{patron.department || 'UTH'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-gray-100">
                      <span className="text-gray-500 block text-[11px] mb-0.5">Hạn thẻ:</span>
                      <span className={`font-semibold ${patron.is_card_valid ? 'text-gray-800' : 'text-red-600 font-bold'}`}>
                        {patron.card_expiry ? formatDateVN(patron.card_expiry) : 'Vĩnh viễn'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-gray-100">
                      <span className="text-gray-500 block text-[11px] mb-0.5">Đang mượn:</span>
                      <span className="font-bold text-gray-900">{patron.active_loans_count} / {patron.max_loans} cuốn</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-teal-200">
                      <span className="text-gray-500 block text-[11px] mb-0.5">Hạn mức còn lại:</span>
                      <span className="font-black text-brand text-sm">{patron.remaining_quota} cuốn</span>
                    </div>
                  </div>

                  {/* Conditions & Warnings */}
                  {(!patron.is_card_valid || patron.is_currently_locked || patron.has_overdue || patron.has_unpaid_fines) && (
                    <Alert variant="warning" title="Cảnh báo điều kiện mượn:">
                      <div className="space-y-1 mt-1">
                        {!patron.is_card_valid && <p>• Thẻ bạn đọc đã hết hạn sử dụng.</p>}
                        {patron.is_currently_locked && <p>• Tài khoản đang bị tạm khóa.</p>}
                        {patron.has_overdue && <p>• Bạn đọc có sách quá hạn chưa hoàn trả.</p>}
                        {patron.has_unpaid_fines && (
                          <p>• Có nợ phạt chưa thanh toán ({formatCurrencyVND(patron.unpaid_fines_total)}).</p>
                        )}
                      </div>
                    </Alert>
                  )}

                  <div className="pt-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPatron(null);
                        setCart([]);
                        patronInputRef.current?.focus();
                      }}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Đổi bạn đọc khác
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-gray-50/80 border border-dashed border-gray-200 rounded-2xl p-8 text-center text-xs text-gray-500">
                <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="font-medium text-gray-600">Chưa có thông tin bạn đọc</p>
                <p className="text-[11px] text-gray-400 mt-1">Vui lòng quét mã thẻ ở ô trên để bắt đầu lập phiếu mượn</p>
              </div>
            )}
          </div>

          {/* Right Column: Scan Books into Cart & Confirm */}
          <div className="lg:col-span-7 space-y-5">
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xs uppercase tracking-wider font-bold text-gray-900 flex items-center space-x-1.5">
                    <BookOpen className="w-4 h-4 text-brand" />
                    <span>2. Quét mã vạch sách mượn</span>
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Quét lần lượt các cuốn sách muốn mượn vào giỏ
                  </CardDescription>
                </div>
                <Badge variant={cart.length > 0 ? 'primary' : 'neutral'} size="sm">
                  Đã quét: <strong className="ml-1 font-bold">{cart.length}</strong> cuốn
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Sách đặt trước đang chờ nhận tại quầy */}
                {patron?.ready_reservations && patron.ready_reservations.length > 0 && (
                  <div className="p-3 bg-teal-50/90 border border-teal-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
                      <Bookmark className="w-4 h-4 text-brand shrink-0" />
                      <span>Sách bạn đọc đã đặt trước đang chờ lấy tại quầy:</span>
                    </div>
                    {patron.ready_reservations.map((res) => (
                      <div
                        key={res.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-teal-100 text-xs shadow-2xs"
                      >
                        <div>
                          <strong className="text-gray-900">{res.book_title}</strong>
                          <span className="block font-mono text-[11px] text-teal-700 mt-0.5">
                            Mã vạch: <strong>{res.barcode}</strong> {res.shelf_location ? `• Vị trí: ${res.shelf_location}` : ''}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="xs"
                          onClick={() => addBarcode(res.barcode)}
                          disabled={cart.some((c) => c.barcode === res.barcode)}
                          className="shrink-0"
                        >
                          {cart.some((c) => c.barcode === res.barcode) ? 'Đã trong giỏ' : 'Thêm vào giỏ'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleBookScan} className="flex gap-2">
                  <Input
                    ref={bookInputRef}
                    placeholder="Quét mã vạch bản sao (VD: UTH-CNTT-000001)..."
                    value={bookScanInput}
                    onChange={(e) => setBookScanInput(e.target.value)}
                    className="font-mono font-semibold"
                    disabled={!patron}
                  />
                  <button
                    type="button"
                    disabled={!patron}
                    onClick={() => {
                      setCameraTarget('book');
                      setIsCameraScannerOpen(true);
                    }}
                    className="h-10 px-3.5 rounded-xl text-xs font-semibold shrink-0 border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 bg-white transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Bật Camera để quét mã vạch trên gáy/bìa sách"
                  >
                    <Camera className="w-4 h-4 text-brand" />
                    <span className="hidden sm:inline">Camera</span>
                  </button>
                  <button
                    type="submit"
                    disabled={!patron}
                    className="h-10 px-4 rounded-xl text-xs font-semibold shrink-0 border border-brand text-brand hover:bg-teal-50 bg-white transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-brand" />
                    <span>Thêm</span>
                  </button>
                </form>

                {cartError && (
                  <Alert variant="danger">
                    {cartError}
                  </Alert>
                )}

                {/* Cart Table */}
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/90 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                        <TableHead className="w-32">Mã vạch</TableHead>
                        <TableHead>Tên sách</TableHead>
                        <TableHead className="w-36">Vị trí kệ</TableHead>
                        <TableHead className="w-16 text-right">Xóa</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.length === 0 ? (
                        <TableEmpty colSpan={4} message="Chưa có sách nào trong giỏ mượn. Quét mã vạch để thêm." />
                      ) : (
                        cart.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono font-bold text-brand">
                              {item.barcode}
                            </TableCell>
                            <TableCell className="font-semibold text-gray-900 line-clamp-1">
                              {item.title}
                            </TableCell>
                            <TableCell className="text-gray-600 text-xs">
                              {item.shelf_location || '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              <button
                                onClick={() => setCart((prev) => prev.filter((_, i) => i !== idx))}
                                className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg transition-colors hover:bg-red-50"
                                title="Xóa khỏi giỏ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Checkout Action Button */}
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleConfirmBorrow}
                    disabled={!patron || cart.length === 0}
                    isLoading={borrowLoading}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Xác nhận mượn ({cart.length} cuốn)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: TRẢ SÁCH ===================== */}
      {activeTab === 'return' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Scan Barcode to Return */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-wider font-bold text-gray-900 flex items-center space-x-1.5">
                <ScanLine className="w-4 h-4 text-brand" />
                <span>Quét mã vạch sách cần trả</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Hệ thống sẽ tự động tra cứu phiếu mượn tương ứng và kiểm tra thời hạn trả
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              <form onSubmit={handleReturnScan} className="flex gap-2">
                <Input
                  ref={returnInputRef}
                  placeholder="Quét mã vạch cuốn sách muốn trả..."
                  value={returnBarcodeInput}
                  onChange={(e) => setReturnBarcodeInput(e.target.value)}
                  className="font-mono font-bold text-base"
                  disabled={returnLookupLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setCameraTarget('return');
                    setIsCameraScannerOpen(true);
                  }}
                  className="h-10 px-3.5 rounded-xl text-xs font-semibold shrink-0 border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 bg-white transition-colors flex items-center gap-1.5 shadow-2xs"
                  title="Bật Camera để quét mã vạch trên gáy/bìa sách cần trả"
                >
                  <Camera className="w-4 h-4 text-brand" />
                  <span className="hidden sm:inline">Camera</span>
                </button>
                <button
                  type="submit"
                  disabled={returnLookupLoading}
                  className="h-10 px-4 rounded-xl text-xs font-semibold shrink-0 border border-brand text-brand hover:bg-teal-50 bg-white transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Search className="w-3.5 h-3.5 text-brand" />
                  <span>Tra cứu</span>
                </button>
              </form>

              {returnError && (
                <Alert variant="danger">
                  {returnError}
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Return Confirmation Card */}
          {returnLookup && (
            <Card className="border-teal-200 shadow-sm animate-page-enter">
              <CardHeader className="border-b border-gray-100 pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{returnLookup.book_title}</h3>
                    <p className="text-xs font-mono font-bold text-brand mt-0.5">
                      Mã vạch: {returnLookup.barcode} | Vị trí: {returnLookup.shelf_location}
                    </p>
                  </div>
                  <Badge variant={returnLookup.is_overdue ? 'danger' : 'success'}>
                    {returnLookup.is_overdue ? `Trễ ${returnLookup.days_late} ngày` : 'Đúng hạn'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 pt-4">
                {/* Patron & Due Info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-gray-50/80 p-3.5 rounded-xl border border-gray-200/80">
                  <div>
                    <span className="text-gray-500 block text-[11px] mb-0.5">Bạn đọc mượn:</span>
                    <span className="font-bold text-gray-900">{returnLookup.patron_name}</span>
                    <span className="text-gray-500 block font-mono text-[11px]">({returnLookup.patron_card_code})</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px] mb-0.5">Ngày mượn:</span>
                    <span className="font-semibold text-gray-800">
                      {formatDateVN(returnLookup.borrowed_at)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px] mb-0.5">Hạn trả:</span>
                    <span className={`font-semibold ${returnLookup.is_overdue ? 'text-red-600 font-bold' : 'text-gray-800'}`}>
                      {formatDateVN(returnLookup.due_at)}
                    </span>
                  </div>
                </div>

                {/* Overdue Penalty Banner if Late */}
                {returnLookup.is_overdue && (
                  <Alert variant="danger" title="Sách bị quá hạn">
                    <div className="flex items-center justify-between mt-1">
                      <span>Quá hạn <strong>{returnLookup.days_late} ngày</strong>. Tiền phạt phát sinh:</span>
                      <strong className="text-sm font-bold text-red-700">
                        {formatCurrencyVND(returnLookup.estimated_fine)}
                      </strong>
                    </div>
                  </Alert>
                )}

                {/* Condition Appraisal */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                    Đánh giá tình trạng sách khi nhận:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setCondition('normal')}
                      className={`p-3.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        condition === 'normal'
                          ? 'border-brand bg-teal-50 text-brand shadow-2xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Bình thường (Tốt)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCondition('damaged')}
                      className={`p-3.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        condition === 'damaged'
                          ? 'border-amber-400 bg-amber-50 text-amber-800 shadow-2xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Sách bị hư hỏng
                    </button>
                    <button
                      type="button"
                      onClick={() => setCondition('lost')}
                      className={`p-3.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        condition === 'lost'
                          ? 'border-red-400 bg-red-50 text-red-700 shadow-2xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Báo làm mất sách
                    </button>
                  </div>
                </div>

                {/* Damaged level details */}
                {condition === 'damaged' && (
                  <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3 text-xs animate-page-enter">
                    <label className="font-bold text-gray-900 block">Mức độ hư hỏng:</label>
                    <div className="grid grid-cols-3 gap-2">
                      <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg bg-white border border-amber-200">
                        <input
                          type="radio"
                          name="dmg"
                          checked={damageLevel === 'light'}
                          onChange={() => setDamageLevel('light')}
                          className="text-brand focus:ring-brand"
                        />
                        <span className="font-medium text-gray-800">Nhẹ (20% giá)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg bg-white border border-amber-200">
                        <input
                          type="radio"
                          name="dmg"
                          checked={damageLevel === 'medium'}
                          onChange={() => setDamageLevel('medium')}
                          className="text-brand focus:ring-brand"
                        />
                        <span className="font-medium text-gray-800">Vừa (50% giá)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg bg-white border border-amber-200">
                        <input
                          type="radio"
                          name="dmg"
                          checked={damageLevel === 'heavy'}
                          onChange={() => setDamageLevel('heavy')}
                          className="text-brand focus:ring-brand"
                        />
                        <span className="font-medium text-gray-800">Nặng (80% giá)</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <Input
                        label="Override số tiền phạt (Tùy chọn)"
                        type="number"
                        placeholder="Nhập số tiền VNĐ..."
                        value={amountOverride}
                        onChange={(e) => setAmountOverride(e.target.value)}
                      />
                      <Input
                        label="Ghi chú hỏng (Bắt buộc nếu override)"
                        placeholder="Mô tả mức hư hỏng, rách trang..."
                        value={returnNote}
                        onChange={(e) => setReturnNote(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Lost details */}
                {condition === 'lost' && (
                  <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl space-y-2 text-xs animate-page-enter">
                    <div className="flex items-center justify-between text-red-700 font-bold">
                      <span>Tổng tiền đền bù mất sách:</span>
                      <span className="text-base font-black">
                        {formatCurrencyVND(returnLookup.book_price + returnLookup.processing_fee)}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600">
                      Bao gồm giá bìa: {formatCurrencyVND(returnLookup.book_price)} + Phí xử lý tài liệu:{' '}
                      {formatCurrencyVND(returnLookup.processing_fee)}
                    </p>
                    <Input
                      label="Ghi chú báo mất"
                      placeholder="Lý do làm mất..."
                      value={returnNote}
                      onChange={(e) => setReturnNote(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                )}

                {/* Confirm Return Actions */}
                <div className="pt-3 border-t border-gray-100 flex justify-end space-x-3">
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => {
                      setReturnLookup(null);
                      returnInputRef.current?.focus();
                    }}
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    variant={condition === 'normal' ? 'primary' : 'danger'}
                    size="lg"
                    onClick={handleConfirmReturn}
                    isLoading={returnLookupLoading}
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Xác nhận hoàn tất trả sách
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Camera Barcode Scanner Modal */}
      <CameraBarcodeScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScanSuccess={handleCameraScanSuccess}
        title={
          cameraTarget === 'patron'
            ? 'Quét mã vạch Thẻ sinh viên / Bạn đọc'
            : cameraTarget === 'book'
            ? 'Quét mã vạch Bản sao sách để mượn'
            : 'Quét mã vạch Sách hoàn trả'
        }
        description={
          cameraTarget === 'patron'
            ? 'Hướng Camera vào mã vạch trên Thẻ sinh viên (trên điện thoại hoặc thẻ cứng) để tải hồ sơ bạn đọc.'
            : 'Hướng Camera vào tem mã vạch dán trên gáy hoặc bìa cuốn sách thư viện UTH.'
        }
      />
    </div>
  );
};
