import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  User,
  Clock,
  ShieldCheck,
  GraduationCap,
  School,
  BookOpen,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Library,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Checkbox } from '@/components/ui/Checkbox';
import { formatApiError } from '@/lib/api';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lockTime, setLockTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect path after login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLockTime(null);

    if (!identity.trim()) {
      setErrorMsg('Vui lòng nhập tên đăng nhập hoặc mã thẻ bạn đọc.');
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
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-white overflow-x-hidden lg:overflow-hidden select-none animate-page-enter">
      {/* =========================================
          LEFT HERO VIEW: Full-Height UTH Campus Visual (52% on desktop)
          ========================================= */}
      <div className="relative w-full lg:w-[50%] xl:w-[52%] min-h-[460px] lg:h-full flex flex-col justify-between p-8 sm:p-12 lg:p-14 text-white overflow-hidden bg-gradient-to-br from-[#003435] via-[#005B5C] to-[#008B8B] shrink-0">
        {/* Full-bleed UTH Campus Building Photo */}
        <img
          src="/uth-campus-login.jpg"
          alt="Khuôn viên Trường Đại học Giao thông vận tải TP.HCM"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-95 contrast-105"
        />

        {/* Cinematic Multi-layer Gradient Scrim for Contrast & Brand Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#002B2C]/95 via-[#004D4E]/80 to-[#008B8B]/40" />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md p-2 flex items-center justify-center border border-white/30 shadow-md group-hover:scale-105 transition-all">
              <Library className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block uppercase leading-none">
                Thư viện UTH
              </span>
              <span className="text-[11px] text-teal-200 font-medium tracking-wide">
                Digital Library Portal
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-xs font-semibold text-white backdrop-blur-md border border-white/25 transition-all shadow-xs group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Về trang chủ</span>
          </Link>
        </div>

        {/* Middle Inspiring Hero Content */}
        <div className="relative z-10 my-auto py-8 sm:py-12 space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/25 border border-teal-300/35 text-xs font-semibold text-teal-200 backdrop-blur-md shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Trường Đại học Giao thông vận tải TP.HCM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-white tracking-tight leading-[1.18]">
            Khám phá Tri thức,<br />
            <span className="text-teal-200">Kiến tạo Tương lai.</span>
          </h1>

          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-light max-w-lg">
            Hệ thống cổng thông tin thư viện số thế hệ mới — Kết nối hơn 50.000 đầu sách, giáo trình chuyên sâu ngành Giao thông, Logistics, CNTT, Kinh tế và dịch vụ mượn trả tự động chuẩn quốc tế.
          </p>

          {/* Feature Glass Cards */}
          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-teal-400/20 text-teal-200 shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Tra cứu thông minh</h4>
                <p className="text-[11px] text-teal-100/75 mt-0.5 leading-snug">
                  Tìm theo giáo trình, ISBN & mã vạch
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-400/20 text-emerald-200 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Gia hạn 1-chạm</h4>
                <p className="text-[11px] text-teal-100/75 mt-0.5 leading-snug">
                  Theo dõi hạn mượn & tự phục vụ 24/7
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Details */}
        <div className="relative z-10 pt-4 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-teal-200/90">
          <span>Trụ sở chính: Số 2, Võ Oanh, P.25, Q.Bình Thạnh, TP.HCM</span>
          <span className="font-mono font-medium">Hệ thống Thư viện số UTH</span>
        </div>
      </div>

      {/* =========================================
          RIGHT AUTH VIEW: Full-Height Clean Form (48% on desktop)
          ========================================= */}
      <div className="w-full lg:w-[50%] xl:w-[48%] min-h-[580px] lg:h-full flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-white overflow-y-auto">
        {/* Top bar on Mobile */}
        <div className="flex items-center justify-between lg:justify-end mb-4 sm:mb-6">
          <Link to="/" className="lg:hidden flex items-center gap-2 group">
            <img src="/uth-logo.png" alt="UTH Logo" className="h-9 object-contain" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Về trang chủ</span>
          </Link>
        </div>

        {/* Center Auth Form Container */}
        <div className="max-w-[420px] w-full mx-auto my-auto py-4 space-y-5">
          {/* Brand Logo & Heading */}
          <div className="space-y-2">
            <Link to="/" className="hidden lg:inline-block mb-2 group">
              <img
                src="/uth-logo.png"
                alt="UTH Logo"
                className="h-12 object-contain group-hover:scale-102 transition-transform"
              />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Đăng nhập Thư viện UTH
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Nhập mã thẻ bạn đọc hoặc tài khoản UTH của bạn để bắt đầu
            </p>
          </div>

          {/* Error notification via Alert primitive */}
          {errorMsg && (
            <div className="animate-in fade-in duration-150">
              <Alert variant="danger">
                <div className="font-semibold">{errorMsg}</div>
                {lockTime && (
                  <div className="mt-1 flex items-center text-[11px] text-danger/90">
                    <Clock className="w-3.5 h-3.5 mr-1 shrink-0" />
                    Mở khóa lúc: {new Date(lockTime).toLocaleTimeString('vi-VN')}
                  </div>
                )}
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Mã bạn đọc / Tên đăng nhập / Email"
              placeholder="Ví dụ: SV20260001 hoặc admin"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              leftIcon={<User className="w-4 h-4 text-gray-400" />}
              autoFocus
              required
            />

            <Input
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu của bạn"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-gray-700 text-gray-400 focus:outline-none p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                label="Ghi nhớ đăng nhập"
              />
              <Link to="/forgot-password" className="text-brand hover:text-brand-dark hover:underline font-semibold">
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 h-11 text-sm font-bold shadow-sm rounded-xl"
              isLoading={isLoading}
            >
              Đăng nhập
            </Button>
          </form>

          {/* Registration Notice */}
          <div className="p-3.5 bg-teal-50/70 border border-teal-100 rounded-xl flex items-start gap-2.5">
            <span className="text-base shrink-0">💡</span>
            <p className="text-[11px] text-teal-900 leading-relaxed font-medium">
              <strong>Chưa có thẻ bạn đọc?</strong> Vui lòng liên hệ Quầy Lưu thông Thư viện UTH (Cơ sở 1) để hoàn tất thủ tục mở thẻ và nhận tài khoản đăng nhập.
            </p>
          </div>

          {/* Demo Fast Fill Section */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2.5">
              Tài khoản mẫu thử nghiệm nhanh:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin', 'AdminPassword123')}
                className="p-2.5 text-center bg-gray-50 hover:bg-teal-50 hover:border-brand/40 border border-gray-200/80 rounded-xl text-[11px] font-semibold text-gray-700 hover:text-brand transition-all flex flex-col items-center gap-1 shadow-2xs cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-brand" />
                <span>Thủ thư (Admin)</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('sv001', 'Password123')}
                className="p-2.5 text-center bg-gray-50 hover:bg-teal-50 hover:border-brand/40 border border-gray-200/80 rounded-xl text-[11px] font-semibold text-gray-700 hover:text-brand transition-all flex flex-col items-center gap-1 shadow-2xs cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>Sinh viên</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('gv01', 'Password123')}
                className="p-2.5 text-center bg-gray-50 hover:bg-teal-50 hover:border-brand/40 border border-gray-200/80 rounded-xl text-[11px] font-semibold text-gray-700 hover:text-brand transition-all flex flex-col items-center gap-1 shadow-2xs cursor-pointer"
              >
                <School className="w-4 h-4 text-blue-600" />
                <span>Giảng viên</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="text-center sm:text-left text-[11px] text-gray-400 pt-4 border-t border-gray-100 mt-4">
          © 2026 Thư viện Trường Đại học Giao thông vận tải TP.HCM. All rights reserved.
        </div>
      </div>
    </div>
  );
};
