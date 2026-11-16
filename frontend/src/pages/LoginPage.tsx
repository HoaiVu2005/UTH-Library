import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Clock,
  ArrowRight,
  ArrowLeft,
  Megaphone,
  Calendar,
  X,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { Alert } from '@/components/ui/Alert';
import { formatApiError } from '@/lib/api';

interface NoticeItem {
  id: number;
  title: string;
  date: string;
  isNew?: boolean;
  content: string;
}

const NOTICES: NoticeItem[] = [
  {
    id: 1,
    title: 'Thông báo về việc xét học bổng khuyến khích học tập UTH học kỳ 1, năm học 2025-2026',
    date: '12/11/2026',
    isNew: true,
    content:
      'Trường Đại học Giao thông vận tải TP.HCM thông báo kế hoạch xét cấp học bổng khuyến khích học tập cho sinh viên chính quy có kết quả rèn luyện và học tập xuất sắc trong học kỳ 1 năm học 2025-2026. Sinh viên kiểm tra danh sách và phản hồi trước ngày 25/11/2026.',
  },
  {
    id: 2,
    title: 'THÔNG BÁO ĐÓNG BẢO HIỂM Y TẾ NĂM HỌC 2026 - 2027',
    date: '03/11/2026',
    isNew: false,
    content:
      'Nhà trường yêu cầu toàn thể sinh viên các khóa thực hiện nghiêm túc quy định tham gia BHYT bắt buộc năm học 2026 - 2027. Thời hạn hoàn tất nộp phí BHYT qua cổng thanh toán điện tử UTH đến hết ngày 30/11/2026.',
  },
  {
    id: 3,
    title: 'Thông báo V/v Đăng ký tham gia Ngày hội sinh viên năm học 2026 - 2027',
    date: '02/11/2026',
    isNew: false,
    content:
      'Đoàn Thanh niên - Hội Sinh viên UTH phát động Ngày hội Sinh viên UTH 2026 với chuỗi hoạt động giao lưu học thuật, triển lãm sáng tạo công nghệ và giải thi đấu thể thao sôi nổi tại Cơ sở 1.',
  },
  {
    id: 4,
    title: 'Thông báo về việc đăng ký các học phần điều kiện',
    date: '15/10/2026',
    isNew: false,
    content:
      'Phòng Đào tạo thông báo mở cổng đăng ký bổ sung các học phần điều kiện (Giáo dục thể chất, Giáo dục Quốc phòng - An ninh) cho sinh viên năm 2 và năm 3 trên hệ thống quản lý đào tạo.',
  },
  {
    id: 5,
    title: 'Thông báo V/v đóng học phí HKI năm học 2026 – 2027',
    date: '10/10/2026',
    isNew: false,
    content:
      'Sinh viên theo dõi thông báo đóng học phí HKI năm học 2026 – 2027 trên cổng thông tin sinh viên và thực hiện đóng học phí đúng hạn quy định để không ảnh hưởng đến tiến độ học tập và mượn sách thư viện.',
  },
];

// Stylized document icon with botanical accent from the UTH student portal
const NoticeDocIcon: React.FC = () => {
  return (
    <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
      <div className="absolute inset-0 bg-teal-50 rounded-xl border border-teal-100" />
      <span className="absolute -bottom-1 -right-1 text-xs select-none">🌿</span>
      <div className="relative z-10 w-6 h-7 bg-white rounded-[3px] border border-teal-300 shadow-[0_1px_2px_rgba(0,0,0,0.06)] flex flex-col p-1 gap-0.8 items-center justify-center">
        <div className="w-4 h-0.5 bg-teal-600 rounded-full mb-0.5" />
        <div className="w-3.5 h-0.5 bg-teal-400 rounded-full mb-0.5" />
        <div className="w-4 h-0.5 bg-teal-200 rounded-full mb-0.5" />
        <div className="w-2.5 h-0.5 bg-teal-200 rounded-full" />
      </div>
    </div>
  );
};

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lockTime, setLockTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [showAllNotices, setShowAllNotices] = useState(false);

  // Redirect path after login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLockTime(null);

    if (!identity.trim()) {
      setErrorMsg('Vui lòng nhập tài khoản đăng nhập.');
      return;
    }
    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(identity.trim(), password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(from === '/' ? '/dashboard' : from);
      }
    } catch (err: any) {
      if (err.response?.data?.code === 'USER_LOCKED') {
        const lockedUntil = err.response.data.locked_until;
        setLockTime(lockedUntil);
        setErrorMsg('Tài khoản đã bị tạm khóa do nhập sai mật khẩu nhiều lần.');
      } else {
        setErrorMsg(formatApiError(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (id: string, pwd: string) => {
    setIdentity(id);
    setPassword(pwd);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-x-hidden select-none">
      {/* =========================================
          FULL-SCREEN UTH CAMPUS BACKGROUND PHOTOGRAPH
          ========================================= */}
      <img
        src="/uth-campus-bg.jpg"
        alt="Khuôn viên Trường Đại học Giao thông vận tải TP.HCM"
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-95 contrast-105"
      />

      {/* Atmospheric Overlays for Brand Depth & Card Readability */}
      <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1.5px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#003435]/65 via-[#004748]/30 to-black/25" />

      {/* Top Floating Back to Home button */}
      <Link
        to="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full transition-all border border-white/20 shadow-md group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Về trang chủ Thư viện</span>
      </Link>

      {/* Main Double Card Container */}
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-8 relative z-10 animate-page-enter">
        {/* =========================================
            LEFT CARD: TIN TỨC & THÔNG BÁO (approx 60%)
            ========================================= */}
        <div className="w-full lg:w-[60%] xl:w-[62%] bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-5 sm:p-7 flex flex-col justify-between border border-white/90">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                  <Megaphone className="w-5 h-5 text-[#008B8B]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#008B8B] tracking-tight uppercase">
                    TIN TỨC & THÔNG BÁO
                  </h2>
                  <p className="text-xs text-gray-500">Cập nhật mới nhất từ nhà trường</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAllNotices(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 border border-teal-600/40 hover:bg-teal-50 px-3.5 py-1.5 rounded-full transition-all group"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="space-y-3 mt-4">
              {NOTICES.map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => setSelectedNotice(notice)}
                  className="group bg-white hover:bg-teal-50/25 border border-gray-100 hover:border-teal-200 rounded-xl p-3 flex items-center gap-3.5 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md cursor-pointer"
                >
                  <NoticeDocIcon />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-teal-800 line-clamp-2 leading-snug">
                        {notice.title}
                      </h3>
                      {notice.isNew && (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0">
                          MỚI
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-600/70" />
                      <span>{notice.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Notice Tip */}
          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Thư viện & Cổng đào tạo ĐH Giao thông vận tải TP.HCM</span>
            <span className="font-medium text-teal-700">Hỗ trợ 24/7</span>
          </div>
        </div>

        {/* =========================================
            RIGHT CARD: FORM ĐĂNG NHẬP HỆ THỐNG (approx 40%)
            ========================================= */}
        <div className="w-full lg:w-[40%] xl:w-[38%] bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 sm:p-8 flex flex-col justify-between border border-white/90">
          <div>
            {/* Logo UTH Official */}
            <div className="text-center mb-3">
              <img
                src="/uth-logo.png"
                alt="UTH Logo"
                className="h-14 sm:h-16 mx-auto object-contain"
              />
            </div>

            {/* Red Bold Heading */}
            <h1 className="text-xl sm:text-2xl font-black text-[#C92A2A] tracking-wider text-center uppercase mb-6">
              ĐĂNG NHẬP HỆ THỐNG
            </h1>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 animate-in fade-in duration-150">
                <Alert variant="danger">
                  <div className="font-semibold text-xs">{errorMsg}</div>
                  {lockTime && (
                    <div className="text-[11px] mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Khóa đến: {new Date(lockTime).toLocaleTimeString('vi-VN')}
                    </div>
                  )}
                </Alert>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder="Tài khoản đăng nhập"
                  autoFocus
                  className="w-full px-3.5 py-2.5 text-sm text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand placeholder:text-gray-400 placeholder:italic transition-all shadow-xs"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  className="w-full px-3.5 py-2.5 text-sm text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand placeholder:text-gray-400 placeholder:italic pr-10 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-[#008B8B] hover:bg-[#007272] active:bg-[#005B5C] text-white font-bold py-2.5 px-4 rounded-lg text-sm tracking-wider uppercase shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'ĐĂNG NHẬP'
                )}
              </button>
            </form>

            {/* Forgot password link */}
            <div className="text-center mt-5">
              <Link
                to="/forgot-password"
                className="text-[#C92A2A] hover:text-red-700 hover:underline text-xs font-bold uppercase tracking-wider transition-colors"
              >
                QUÊN MẬT KHẨU?
              </Link>
            </div>
          </div>

          {/* Demo fast-fill buttons for convenient testing */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center mb-2">
              Tài khoản mẫu thử nghiệm:
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleDemoFill('admin', 'Admin@123')}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-gray-200 rounded-md transition-colors"
              >
                Thủ thư (Admin)
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('052205006506', 'Student@123')}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-gray-200 rounded-md transition-colors"
              >
                Sinh viên
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('gv_hoangnam', 'Lecturer@123')}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-gray-200 rounded-md transition-colors"
              >
                Giảng viên
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal View Notice Detail */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setSelectedNotice(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-teal-700 mb-2">
              <Bell className="w-4 h-4" />
              <span>Thông báo chính thức • {selectedNotice.date}</span>
            </div>
            <h3 className="text-base font-bold text-gray-900 leading-snug mb-3">
              {selectedNotice.title}
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-gray-100">
              {selectedNotice.content}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 text-xs font-semibold bg-[#008B8B] hover:bg-[#007272] text-white rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal View All Notices */}
      {showAllNotices && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative border border-gray-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                  <Megaphone className="w-4 h-4 text-[#008B8B]" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Tất cả Tin tức & Thông báo UTH
                </h3>
              </div>
              <button
                onClick={() => setShowAllNotices(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto space-y-3 py-4 flex-1">
              {NOTICES.map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => {
                    setShowAllNotices(false);
                    setSelectedNotice(notice);
                  }}
                  className="p-3.5 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/20 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-800">{notice.title}</h4>
                    {notice.isNew && (
                      <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0">
                        MỚI
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>{notice.date}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowAllNotices(false)}
                className="px-4 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
