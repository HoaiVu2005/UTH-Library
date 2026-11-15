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
    <div className="min-h-[82vh] flex items-center justify-center py-6 sm:py-10 px-3 sm:px-4 animate-page-enter">
      <div className="max-w-5xl w-full bg-white border border-gray-200/90 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Visual Hero Column (Desktop & Tablet) */}
        <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between p-8 sm:p-10 text-white overflow-hidden bg-gradient-to-br from-[#004849] via-[#006F70] to-[#008B8B]">
          {/* UTH Campus Background Photo */}
          <img
            src="/uth-campus-login.jpg"
            alt="Khuôn viên Trường Đại học Giao thông vận tải TP.HCM"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-95 contrast-105"
          />

          {/* Elegant Teal & Dark Gradient Overlay for Maximum Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#003839]/95 via-[#005B5C]/75 to-[#008B8B]/40" />

          {/* Top Badge */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-xs">
              <BookOpen className="w-3.5 h-3.5 text-teal-200" />
              <span>Thư viện số UTH Portal</span>
            </div>
          </div>

          {/* Middle Inspiring Hero Content */}
          <div className="relative z-10 my-auto py-8 space-y-3.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Đại học Giao thông Vận tải TP.HCM</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug">
              Không gian Tri thức & Nghiên cứu Hiện đại
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-light">
              Kết nối hơn 50.000 đầu sách, giáo trình chuyên ngành Giao thông, Logistics, CNTT và hệ thống mượn trả tự động chuẩn quốc tế.
            </p>
          </div>

          {/* Bottom Highlights */}
          <div className="relative z-10 pt-5 border-t border-white/20 space-y-2 text-xs text-teal-100">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Tra cứu & mượn sách tự phục vụ 24/7</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Gia hạn 1-chạm & thông báo hạn trả qua Email</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Quét mã vạch Code128 tại quầy lưu thông</span>
            </div>
          </div>
        </div>

        {/* Mobile Header Banner */}
        <div className="lg:hidden relative h-36 w-full overflow-hidden">
          <img
            src="/uth-campus-login.jpg"
            alt="Khuôn viên Trường Đại học Giao thông vận tải TP.HCM"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#003839]/95 via-[#005B5C]/60 to-transparent flex items-end p-4">
            <div className="text-white">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200 block">Thư viện UTH Portal</span>
              <h2 className="text-sm font-bold">Không gian Tri thức UTH</h2>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          {/* Logo and title */}
          <div className="text-center sm:text-left mb-6">
            <Link to="/" className="inline-block mb-3 group">
              <img
                src="/uth-logo.png"
                alt="UTH Logo"
                className="h-11 object-contain group-hover:scale-102 transition-transform mx-auto sm:mx-0"
              />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Đăng nhập Thư viện UTH</h1>
            <p className="text-xs text-gray-500 mt-1">
              Trường Đại học Giao thông vận tải Thành phố Hồ Chí Minh
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

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isLoading}>
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
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2.5 text-center sm:text-left">
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
      </div>
    </div>
  );
};
