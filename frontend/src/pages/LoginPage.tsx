import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, Clock, ShieldCheck, GraduationCap, School } from 'lucide-react';
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
    <div className="min-h-[82vh] flex flex-col justify-center items-center py-10 px-4 animate-page-enter">
      <div className="max-w-[420px] w-full bg-white border border-border rounded-2xl shadow-card p-6 sm:p-8">
        {/* Logo and title */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-3 group">
            <img src="/uth-logo.png" alt="UTH Logo" className="h-10 mx-auto object-contain group-hover:scale-102 transition-transform" />
          </Link>
          <h1 className="text-xl font-bold text-textPrimary tracking-tight">Đăng nhập Thư viện UTH</h1>
          <p className="text-xs text-textSecondary mt-1">
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
            leftIcon={<User className="w-4 h-4 text-textSecondary" />}
            autoFocus
            required
          />

          <Input
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            placeholder="Nhập mật khẩu của bạn"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-textSecondary" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-textPrimary text-textSecondary focus:outline-none p-1"
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
            <Link to="/forgot-password" className="text-primary hover:text-primary-dark hover:underline font-medium">
              Quên mật khẩu?
            </Link>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isLoading}>
            Đăng nhập
          </Button>
        </form>

        {/* Demo Fast Fill Section */}
        <div className="mt-6 pt-5 border-t border-border/70">
          <p className="text-[10px] text-textSecondary font-bold uppercase tracking-wider mb-2.5 text-center">
            Tài khoản mẫu thử nghiệm nhanh:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('admin', 'AdminPassword123')}
              className="p-2 text-center bg-slate-50 hover:bg-primary-light hover:border-primary/40 border border-border rounded-lg text-[11px] font-bold text-textPrimary hover:text-primary-dark transition-all btn-interaction flex flex-col items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Thủ thư (Admin)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('sv001', 'Password123')}
              className="p-2 text-center bg-slate-50 hover:bg-primary-light hover:border-primary/40 border border-border rounded-lg text-[11px] font-bold text-textPrimary hover:text-primary-dark transition-all btn-interaction flex flex-col items-center gap-1"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sinh viên</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('gv01', 'Password123')}
              className="p-2 text-center bg-slate-50 hover:bg-primary-light hover:border-primary/40 border border-border rounded-lg text-[11px] font-bold text-textPrimary hover:text-primary-dark transition-all btn-interaction flex flex-col items-center gap-1"
            >
              <School className="w-3.5 h-3.5 text-blue-600" />
              <span>Giảng viên</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
