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
  ArrowRight,
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white overflow-x-hidden animate-page-enter">
      {/* LEFT COLUMN: Full-Bleed UTH Campus Hero View (52% on desktop) */}
      <div className="relative w-full lg:w-[52%] min-h-[420px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 text-white overflow-hidden bg-gradient-to-br from-[#003435] via-[#005B5C] to-[#008B8B]">
        {/* Full-bleed Campus Building Photograph */}
        <img
          src="/uth-campus-login.jpg"
          alt="Khuôn viên Trường Đại học Giao thông vận tải TP.HCM (UTH)"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-95 contrast-105"
        />

        {/* Multi-layer Gradient Scrim for Contrast & UTH Teal Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#002728]/95 via-[#004748]/80 to-[#006F70]/40" />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

        {/* Top Header of Left Hero */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md p-2 flex items-center justify-center border border-white/30 shadow-md">
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
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-xs font-semibold text-white backdrop-blur-md border border-white/25 transition-all shadow-xs group"
          >
            <span>Về trang chủ</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Middle Inspiring Hero Content */}
        <div className="relative z-10 my-auto py-8 sm:py-12 space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/30 border border-teal-300/40 text-xs font-semibold text-teal-200 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Trường Đại học Giao thông vận tải TP.HCM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-white tracking-tight leading-[1.18]">
            Không gian Tri thức & Nghiên cứu Hiện đại
          </h1>

          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-light">
            Cổng tra cứu tài liệu học tập & nghiên cứu khoa học dành cho Sinh viên, Giảng viên. Kết nối hơn 50.000 giáo trình, tài liệu chuyên ngành Giao thông Vận tải, Logistics, CNTT và Kinh tế.
          </p>

          {/* Quick Feature Badges */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-teal-400/25 text-teal-200 shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Tra cứu thông minh</h4>
                <p className="text-[11px] text-teal-100/75 mt-0.5">Tìm theo giáo trình, ISBN & mã vạch</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-400/25 text-emerald-200 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Gia hạn 1-chạm</h4>
                <p className="text-[11px] text-teal-100/75 mt-0.5">Theo dõi hạn mượn & tự phục vụ 24/7</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Details of Left Hero */}
        <div className="relative z-10 pt-4 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-teal-200/90">
          <span>Trụ sở chính: Số 2, Võ Oanh, P.25, Q.Bình Thạnh, TP.HCM</span>
          <span className="font-mono font-medium">Hệ thống Thư viện số UTH</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Full-Height Clean Authentication Form (48% on desktop) */}
      <div className="w-full lg:w-[48%] min-h-[580px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-white overflow-y-auto">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <Link to="/" className="lg:hidden flex items-center gap-2 group">
            <img src="/uth-logo.png" alt="UTH Logo" className="h-8 object-contain" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-brand transition-colors ml-auto group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Quay lại trang chủ</span>
          </Link>
        </div>

        {/* Center Login Container */}
        <div className="max-w-[420px] w-full mx-auto my-auto py-2 sm:py-6">
          {/* Brand Logo & Heading */}
          <div className="mb-6">
            <Link to="/" className="hidden lg:inline-block mb-4 group">
              <img
                src="/uth-logo.png"
                alt="UTH Logo"
                className="h-11 object-contain group-hover:scale-102 transition-transform"
              />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Đăng nhập Thư viện UTH
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Nhập tài khoản bạn đọc hoặc email trường để bắt đầu
            </p>
          </div>

          {/* Error notification via Alert primitive */}
          {errorMsg && (
            <div className="mb-4 animate-in fade-in duration-150">
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
              <Link to="/forgot-password" className="text-brand hover:text-brand-dark hover:underline font-medium">
                Quên mật khẩu?
              </Link>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2 h-11 text-sm font-bold shadow-sm" isLoading={isLoading}>
              Đăng nhập
            </Button>
          </form>

          {/* Registration Notice */}
          <div className="mt-4 p-3 bg-teal-50/70 border border-teal-100 rounded-xl">
            <p className="text-[11px] text-teal-900 leading-relaxed font-medium">
              💡 <strong>Chưa có thẻ bạn đọc?</strong> Vui lòng liên hệ Quầy Lưu thông Thư viện UTH (Cơ sở 1) để hoàn tất thủ tục mở thẻ và nhận tài khoản đăng nhập.
            </p>
          </div>

          {/* Demo Fast Fill Section */}
          <div className="mt-6 pt-5 border-t border-gray-100">
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

        {/* Bottom Copyright of Right Side */}
        <div className="pt-4 text-center sm:text-left text-[11px] text-gray-400 border-t border-gray-100 mt-6">
          © 2026 Thư viện Trường Đại học Giao thông vận tải TP.HCM. All rights reserved.
        </div>
      </div>
    </div>
  );
};
