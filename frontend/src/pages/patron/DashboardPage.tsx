import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  BookmarkCheck,
  Bell,
  Calendar as CalendarIcon,
  Clock,
  ShieldAlert,
  DollarSign,
  FileText,
  BookmarkPlus,
  RotateCcw,
  ChevronRight,
  Search,
  Barcode as BarcodeIcon,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { CalendarMonth, CalendarEventDot } from '@/components/ui/CalendarMonth';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { StudentIdCardModal } from '@/components/patron/StudentIdCardModal';
import { format, differenceInDays } from 'date-fns';
import { formatCurrencyVND } from '@/lib/utils';

interface ActiveLoan {
  id: number;
  book_title: string;
  barcode: string;
  cover_image?: string;
  borrowed_at: string;
  due_at: string;
  days_late: number;
  renewal_count: number;
  renewal_limit: number;
  can_renew: boolean;
}

interface ActiveReservation {
  id: number;
  book_title: string;
  status: 'ready' | 'pending';
  queue_position?: number;
  hold_expires_at?: string;
  ready_at?: string;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<ActiveLoan[]>([]);
  const [reservations, setReservations] = useState<ActiveReservation[]>([]);
  const [unpaidFinesTotal, setUnpaidFinesTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [renewingId, setRenewingId] = useState<number | null>(null);
  const [renewMessage, setRenewMessage] = useState<{ id: number; text: string; isError: boolean } | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [loansRes, resRes, finesRes] = await Promise.all([
        api.get('/loans/me?status=active'),
        api.get('/reservations/me'),
        api.get('/fines/me?status=unpaid'),
      ]);

      const activeLoans = (loansRes.data?.data || []).map((l: any) => ({
        id: l.id,
        book_title: l.copy?.book?.title || l.book_title || 'Sách mượn',
        barcode: l.copy?.barcode || '',
        cover_image: l.copy?.book?.cover_image,
        borrowed_at: l.borrowed_at,
        due_at: l.due_at,
        days_late: l.days_late || 0,
        renewal_count: l.renewal_count || 0,
        renewal_limit: l.renewal_limit_snapshot || 1,
        can_renew: (l.renewal_count || 0) < (l.renewal_limit_snapshot || 1) && (l.days_late || 0) === 0,
      }));
      setLoans(activeLoans);

      const activeRes = (resRes.data?.data || []).filter(
        (r: any) => r.status === 'ready' || r.status === 'pending'
      ).map((r: any) => ({
        id: r.id,
        book_title: r.book?.title || 'Sách đặt trước',
        status: r.status,
        queue_position: r.queue_position,
        hold_expires_at: r.hold_expires_at,
        ready_at: r.ready_at,
      }));
      setReservations(activeRes);

      const totalDebt = (finesRes.data?.data || []).reduce(
        (acc: number, f: any) => acc + (f.amount - (f.paid_amount || 0)),
        0
      );
      setUnpaidFinesTotal(totalDebt);
    } catch (err) {
      console.error('Failed to load patron dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRenew = async (loanId: number) => {
    try {
      setRenewingId(loanId);
      setRenewMessage(null);
      await api.post(`/loans/${loanId}/renew`);
      setRenewMessage({ id: loanId, text: 'Gia hạn thành công thêm 7 ngày!', isError: false });
      fetchDashboardData();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Không thể gia hạn sách.';
      setRenewMessage({ id: loanId, text: msg, isError: true });
    } finally {
      setRenewingId(null);
    }
  };

  // Build calendar event dots from active loans
  const calendarEvents: CalendarEventDot[] = loans.map((loan) => {
    const dueDate = new Date(loan.due_at);
    const isLate = loan.days_late > 0;
    return {
      date: dueDate,
      type: isLate ? 'overdue' : 'due_soon',
    };
  });

  const remainingQuota = Math.max(0, 5 - loans.length);

  return (
    <div className="space-y-6 pb-10 relative animate-page-enter">
      {/* Alert banner if locked */}
      {user?.is_currently_locked && (
        <Alert variant="danger" title="Tài khoản thư viện đang bị khóa">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>
              {user.locked_until
                ? `Khóa đến ngày: ${format(new Date(user.locked_until), 'dd/MM/yyyy HH:mm')}`
                : 'Vui lòng liên hệ thủ thư tại Quầy lưu thông hoặc kiểm tra các khoản phạt còn nợ.'}
            </span>
            <Link
              to="/fines"
              className="text-xs bg-danger text-white px-3 py-1.5 rounded-lg hover:bg-danger-hover font-bold inline-block shrink-0 shadow-xs"
            >
              Xem khoản phạt &rarr;
            </Link>
          </div>
        </Alert>
      )}

      {/* Row 1: Student Info Card & 2 Subcards + Monthly Calendar (Authentic UTH Portal Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column (8 cols): Thông tin sinh viên & 2 Subcards */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-4">
          {/* Card: Thông tin sinh viên */}
          <Card variant="elevated" className="p-5 flex-1 flex flex-col justify-between border-gray-200/80 rounded-2xl shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h2 className="text-[15px] font-bold text-primary">
                Thông tin sinh viên
              </h2>
              <button
                type="button"
                onClick={() => setIsCardModalOpen(true)}
                className="text-xs font-bold text-brand tracking-wider uppercase cursor-pointer hover:underline flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 hover:bg-teal-100 transition-colors shadow-2xs"
                title="Bấm để xem Thẻ sinh viên kỹ thuật số & mã vạch quét tại thư viện"
              >
                <BarcodeIcon className="w-3.5 h-3.5" />
                <span>THẺ SINH VIÊN</span>
              </button>
            </div>

            {/* Content: Photo + 2 Column Details Grid */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Photo 125x165 (Matches reference portrait from UTH screenshot 2) */}
              <div className="w-[125px] h-[165px] rounded-lg border border-border overflow-hidden shrink-0 shadow-xs bg-slate-50 flex items-center justify-center">
                <img
                  src={user?.avatar || '/student-avatar.png'}
                  alt={user?.full_name || 'Nguyễn Văn A'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/student-avatar.png';
                  }}
                />
              </div>

              {/* 2-Column Info Grid with generous horizontal spacing across full width */}
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-8 lg:gap-x-12 text-[13px] text-textPrimary py-0.5">
                {/* Column 1 */}
                <div className="space-y-3">
                  <div className="flex items-baseline">
                    <span className="font-bold text-textPrimary w-24 shrink-0">MSSV:</span>
                    <span className="text-textSecondary font-mono font-semibold">{user?.card_code || '21110001'}</span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="font-bold text-textPrimary w-24 shrink-0">Họ tên:</span>
                    <span className="text-textSecondary font-semibold">{user?.full_name || 'Nguyễn Văn A'}</span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="font-bold text-textPrimary w-24 shrink-0">Ngày sinh:</span>
                    <span className="text-textSecondary font-medium">
                      {user?.dob ? format(new Date(user.dob), 'dd/MM/yyyy') : '10/09/2005'}
                    </span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="font-bold text-textPrimary w-24 shrink-0">Nơi sinh:</span>
                    <span className="text-textSecondary font-medium">{user?.address || 'Gia Lai'}</span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="font-bold text-textPrimary w-24 shrink-0">Ngành:</span>
                    <span className="text-textSecondary font-medium">{user?.department || 'Khoa Công nghệ thông tin'}</span>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-3">
                  <div className="flex items-baseline">
                    <span className="font-bold text-textPrimary w-32 shrink-0">Khóa học:</span>
                    <span className="text-textSecondary font-medium">2023</span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="font-bold text-textPrimary w-32 shrink-0">Giới tính:</span>
                    <span className="text-textSecondary font-medium">Nam</span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="font-bold text-textPrimary w-32 shrink-0">Bậc đào tạo:</span>
                    <span className="text-textSecondary font-medium">
                      {user?.role === 'student' ? 'Sinh viên' : user?.role === 'lecturer' ? 'Giảng viên' : 'Sinh viên'}
                    </span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="font-bold text-textPrimary w-32 shrink-0">Loại hình đào tạo:</span>
                    <span className="text-textSecondary font-medium">Chính quy</span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="font-bold text-textPrimary w-32 shrink-0">Chuyên ngành:</span>
                    <span className="text-textSecondary font-medium">Hệ thống thông tin quản lý</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Subcards directly beneath student card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subcard 1: Thông báo thư viện */}
            <Card variant="elevated" className="p-4 flex flex-col justify-between h-[120px] border-gray-200/80 rounded-2xl shadow-xs card-hover">
              <div>
                <p className="text-xs text-textSecondary font-medium">Thông báo thư viện</p>
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-2xl font-bold text-textPrimary">
                      {unpaidFinesTotal > 0 ? '1' : '0'}
                    </span>
                    <span className="text-xs text-accent font-semibold">
                      {unpaidFinesTotal > 0 ? 'khoản phạt / thông báo mới' : 'thông báo mới'}
                    </span>
                  </div>
                  <Bell className="w-5 h-5 text-accent shrink-0" />
                </div>
              </div>
              <div>
                <Link
                  to="/notifications"
                  className="text-xs text-primary font-bold hover:underline inline-flex items-center"
                >
                  Xem chi tiết &rarr;
                </Link>
              </div>
            </Card>

            {/* Subcard 2: Công nợ & Tiền phạt thư viện */}
            <Card variant="elevated" className="p-4 flex flex-col justify-between h-[120px] border-gray-200/80 rounded-2xl shadow-xs card-hover">
              <div>
                <p className="text-xs text-textSecondary font-medium">Công nợ & Tiền phạt</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className={`text-xl font-bold ${unpaidFinesTotal > 0 ? 'text-danger' : 'text-emerald-600'}`}>
                    {formatCurrencyVND(unpaidFinesTotal)}
                  </span>
                  <DollarSign className="w-5 h-5 text-accent shrink-0" />
                </div>
              </div>
              <div>
                <Link
                  to="/fines"
                  className="text-xs text-primary font-bold hover:underline inline-flex items-center"
                >
                  Tra cứu công nợ &rarr;
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column (4 cols): Lịch theo tháng (Chiếm trọn chiều cao bằng 2 div bên trái) */}
        <div className="lg:col-span-4 flex flex-col">
          <CalendarMonth events={calendarEvents} className="h-full" />
        </div>
      </div>

      {/* Row 2: 8 Function Cards Grid (Matches UTH Portal screenshot 2) */}
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* Card 1: Tra cứu sách */}
          <Link
            to="/search"
            className="bg-white border border-border rounded-xl p-3 flex flex-col items-center text-center justify-center hover:border-primary/40 transition-all group h-[115px] card-hover shadow-xs"
          >
            <div className="mb-2">
              <Search className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs font-bold text-textPrimary leading-tight">
              Tra cứu sách
            </span>
          </Link>

          {/* Card 2: Sách của tôi */}
          <Link
            to="/loans"
            className="bg-white border border-border rounded-xl p-3 flex flex-col items-center text-center justify-center hover:border-primary/40 transition-all group h-[115px] card-hover shadow-xs"
          >
            <div className="mb-2">
              <BookOpen className="w-6 h-6 text-indigo-700 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs font-bold text-textPrimary leading-tight">
              Sách của tôi
            </span>
          </Link>

          {/* Card 3: Đặt trước */}
          <Link
            to="/reservations"
            className="bg-white border border-border rounded-xl p-3 flex flex-col items-center text-center justify-center hover:border-primary/40 transition-all group h-[115px] card-hover shadow-xs"
          >
            <div className="mb-2">
              <BookmarkPlus className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs font-bold text-textPrimary leading-tight">
              Đặt trước
            </span>
          </Link>

          {/* Card 4: Gia hạn sách */}
          <Link
            to="/loans"
            className="bg-white border border-border rounded-xl p-3 flex flex-col items-center text-center justify-center hover:border-primary/40 transition-all group h-[115px] card-hover shadow-xs"
          >
            <div className="mb-2">
              <RotateCcw className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs font-bold text-textPrimary leading-tight">
              Gia hạn sách
            </span>
          </Link>

          {/* Card 5: Tiền phạt */}
          <Link
            to="/fines"
            className="bg-white border border-border rounded-xl p-3 flex flex-col items-center text-center justify-center hover:border-primary/40 transition-all group h-[115px] card-hover shadow-xs"
          >
            <div className="mb-2">
              <DollarSign className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs font-bold text-textPrimary leading-tight">
              Tiền phạt
            </span>
          </Link>

          {/* Card 6: Đề xuất sách */}
          <Link
            to="/suggestions"
            className="bg-white border border-border rounded-xl p-3 flex flex-col items-center text-center justify-center hover:border-primary/40 transition-all group h-[115px] card-hover shadow-xs"
          >
            <div className="mb-2">
              <FileText className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs font-bold text-textPrimary leading-tight">
              Đề xuất sách
            </span>
          </Link>

          {/* Card 7: Thông báo */}
          <Link
            to="/notifications"
            className="bg-white border border-border rounded-xl p-3 flex flex-col items-center text-center justify-center hover:border-primary/40 transition-all group h-[115px] card-hover shadow-xs"
          >
            <div className="mb-2">
              <Bell className="w-6 h-6 text-rose-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs font-bold text-textPrimary leading-tight">
              Thông báo
            </span>
          </Link>

          {/* Card 8: Hồ sơ thẻ */}
          <Link
            to="/profile"
            className="bg-white border border-border rounded-xl p-3 flex flex-col items-center text-center justify-center hover:border-primary/40 transition-all group h-[115px] card-hover shadow-xs"
          >
            <div className="mb-2">
              <ShieldAlert className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs font-bold text-textPrimary leading-tight">
              Hồ sơ thẻ
            </span>
          </Link>
        </div>
      </div>

      {/* Row 3: Library Details & Active Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Sách đang mượn (6 cols) */}
        <Card variant="elevated" className="lg:col-span-6 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-xs sm:text-sm text-textPrimary">
                  Sách đang mượn ({loans.length})
                </h3>
              </div>
              <Link to="/loans" className="text-xs text-primary hover:underline font-semibold flex items-center">
                Xem tất cả <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="py-6 text-center text-xs text-textSecondary">Đang tải dữ liệu...</div>
            ) : loans.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs text-textSecondary">Bạn hiện không mượn cuốn sách nào.</p>
                <Link to="/search" className="text-xs text-primary font-bold mt-2 inline-block hover:underline">
                  Tìm sách trong thư viện &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {loans.slice(0, 3).map((loan) => {
                  const daysLeft = differenceInDays(new Date(loan.due_at), new Date());
                  const isLate = loan.days_late > 0;

                  return (
                    <div
                      key={loan.id}
                      className="border border-border/80 rounded-lg p-3 flex items-center justify-between hover:bg-teal-50/25 transition-colors bg-white shadow-2xs"
                    >
                      <div className="flex-1 pr-3 min-w-0">
                        <p className="font-bold text-xs text-textPrimary truncate">{loan.book_title}</p>
                        <p className="text-[11px] text-textSecondary font-mono mt-0.5">Mã vạch: {loan.barcode}</p>
                        <div className="flex items-center space-x-2 mt-1.5">
                          <span className="text-[11px] text-textSecondary flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-textSecondary" />
                            Hạn trả: {format(new Date(loan.due_at), 'dd/MM/yyyy')}
                          </span>
                          {isLate ? (
                            <Badge variant="overdue" size="sm" hasDot>Quá hạn {loan.days_late} ngày</Badge>
                          ) : daysLeft <= 2 ? (
                            <Badge variant="warning" size="sm" hasDot>Còn {daysLeft} ngày</Badge>
                          ) : (
                            <Badge variant="info" size="sm">Còn {daysLeft} ngày</Badge>
                          )}
                        </div>
                        {renewMessage && renewMessage.id === loan.id && (
                          <p className={`text-[11px] mt-1 font-semibold ${renewMessage.isError ? 'text-danger' : 'text-success'}`}>
                            {renewMessage.text}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={!loan.can_renew || renewingId === loan.id}
                          onClick={() => handleRenew(loan.id)}
                          isLoading={renewingId === loan.id}
                        >
                          Gia hạn
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Hạn mức & Công nợ (3 cols) */}
        <Card variant="elevated" className="lg:col-span-3 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
              <h3 className="font-bold text-xs sm:text-sm text-textPrimary">Hạn mức mượn</h3>
              <span className="text-xs font-bold text-primary font-mono">{loans.length} / 5</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(loans.length / 5) * 100}%` }}
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-textSecondary">
                <span>Hạn mức tối đa:</span>
                <span className="font-semibold text-textPrimary">5 cuốn</span>
              </div>
              <div className="flex justify-between text-textSecondary">
                <span>Đang mượn:</span>
                <span className="font-semibold text-textPrimary">{loans.length} cuốn</span>
              </div>
              <div className="flex justify-between text-textSecondary">
                <span>Còn có thể mượn:</span>
                <span className="font-bold text-success">{remainingQuota} cuốn</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs text-textSecondary mb-0.5">Tiền phạt & Công nợ:</p>
              <p className="text-xl font-bold text-danger font-mono">
                {formatCurrencyVND(unpaidFinesTotal)}
              </p>
            </div>
          </div>

          <Link
            to="/fines"
            className="mt-3 block text-center text-xs text-primary font-bold border border-primary/30 py-2 rounded-lg hover:bg-primary-light transition-colors"
          >
            Chi tiết công nợ
          </Link>
        </Card>

        {/* Sách đặt trước / Giữ chỗ (3 cols) */}
        <Card variant="elevated" className="lg:col-span-3 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
              <div className="flex items-center space-x-1.5">
                <BookmarkCheck className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-xs sm:text-sm text-textPrimary">Sách đặt trước</h3>
              </div>
              <Link to="/reservations" className="text-xs text-primary hover:underline font-semibold">
                Tất cả
              </Link>
            </div>

            {isLoading ? (
              <div className="py-5 text-center text-xs text-textSecondary">Đang tải...</div>
            ) : reservations.length === 0 ? (
              <div className="py-5 text-center text-xs text-textSecondary">
                Không có sách đang đặt trước.
              </div>
            ) : (
              <div className="space-y-2.5">
                {reservations.slice(0, 2).map((res) => (
                  <div key={res.id} className="border border-border rounded-lg p-2.5 bg-slate-50/60 text-xs">
                    <p className="font-bold text-textPrimary truncate">{res.book_title}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      {res.status === 'ready' ? (
                        <>
                          <Badge variant="ready" size="sm" hasDot>Giữ tại quầy</Badge>
                          <span className="text-[10px] text-textSecondary font-medium">
                            Hạn: {res.hold_expires_at ? format(new Date(res.hold_expires_at), 'dd/MM') : '3 ngày'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Badge variant="pending" size="sm">Hàng #{res.queue_position}</Badge>
                          <span className="text-[10px] text-textSecondary font-medium">Chờ sách</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/reservations"
            className="mt-3 block text-center text-xs text-primary font-bold border border-primary/30 py-2 rounded-lg hover:bg-primary-light transition-colors"
          >
            Quản lý đặt trước ({reservations.length})
          </Link>
        </Card>
      </div>

      {/* Floating Circular Sync Button */}
      <button
        onClick={fetchDashboardData}
        className="fixed bottom-6 right-6 w-11 h-11 bg-white hover:bg-slate-50 border border-border rounded-full shadow-dropdown flex items-center justify-center text-primary transition-all hover:scale-105 z-30 focus-ring"
        title="Đồng bộ dữ liệu"
      >
        <RotateCcw className={`w-5 h-5 text-primary ${isLoading ? 'animate-spin' : ''}`} />
      </button>

      {/* Student ID Card Modal (Digital card matching portal.ut.edu.vn) */}
      <StudentIdCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        user={user}
      />
    </div>
  );
};

