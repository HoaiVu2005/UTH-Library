import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { Alert } from '@/components/ui/Alert';
import { formatApiError } from '@/lib/api';

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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#071c1d] p-2 sm:p-4 lg:p-6 select-none relative overflow-x-hidden">
      {/* Ambient background blur to naturally fill wide screens without stretching the main canvas */}
      <div
        className="fixed inset-0 bg-cover bg-center filter blur-3xl opacity-35 scale-110 pointer-events-none"
        style={{ backgroundImage: 'url(/uth-campus-bg.jpg)' }}
      />
      <div className="fixed inset-0 bg-slate-950/50 pointer-events-none" />

      {/* Top Floating Back to Home Button */}
      <Link
        to="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full transition-all border border-white/20 shadow-md group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Về trang chủ Thư viện</span>
      </Link>

      {/* ==============================================================
          MAIN 1024x682 CANVAS - Exact 1:1 Native Dimensions (No Scaling/Zoom)
          ============================================================== */}
      <div className="relative w-[1024px] max-w-full h-[682px] max-h-[95vh] rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20 flex flex-col justify-center items-center lg:items-end p-5 sm:p-8 lg:pr-10 z-10 shrink-0">
        {/* Full-size 1024x682 UTH Campus Image rendered with optimal contrast */}
        <img
          src="/uth-campus-bg.jpg"
          alt="Khuôn viên Trường Đại học Giao thông vận tải TP.HCM"
          width={1024}
          height={682}
          className="absolute inset-0 w-full h-full object-cover sm:object-fill pointer-events-none"
          style={{ imageRendering: '-webkit-optimize-contrast' }}
        />

        {/* =========================================
            LOGIN CARD - Positioned on the Right
            ========================================= */}
        <div className="relative z-10 w-full max-w-[360px] sm:max-w-[380px] bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.3)] p-5 sm:p-7 border border-white/90 animate-page-enter">
          {/* Official UTH Logo */}
          <div className="text-center mb-3">
            <img
              src="/uth-logo.png"
              alt="UTH Logo"
              className="h-14 mx-auto object-contain"
            />
          </div>

          {/* Red Bold Heading */}
          <h1 className="text-xl font-black text-[#D32F2F] tracking-wider text-center uppercase mb-5">
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
          <form onSubmit={handleSubmit} className="space-y-3.5">
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

          {/* Forgot Password Link */}
          <div className="text-center mt-4">
            <Link
              to="/forgot-password"
              className="text-[#D32F2F] hover:text-red-700 hover:underline text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              QUÊN MẬT KHẨU?
            </Link>
          </div>

          {/* Demo Fast-Fill Pills for Convenient Testing */}
          <div className="mt-5 pt-3.5 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center mb-1.5">
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
    </div>
  );
};
