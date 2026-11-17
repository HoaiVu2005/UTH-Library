import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, Calendar, User, ChevronDown, LogOut, KeyRound, UserCheck, LogIn, Bell, Shield, Barcode as BarcodeIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { api } from '@/lib/api';
import { StudentIdCardModal } from '@/components/patron/StudentIdCardModal';
import { cn } from '@/lib/utils';
import { useRealtimeSync } from '@/lib/realtime';
import { HEADER_CONTENT_RAIL } from './layoutPresentation';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isCardModalOpen, setIsCardModalOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await api.get('/notifications/me?unread=true');
      const total = typeof res.data?.meta?.total === 'number' 
        ? res.data.meta.total 
        : (Array.isArray(res.data?.data) ? res.data.data.length : 0);
      setUnreadCount(total);
    } catch {
      // keep previous count on network fluctuation
    }
  }, [isAuthenticated]);

  // Subscribe Header to cross-tab realtime notification sync
  useRealtimeSync('notifications', fetchUnreadCount, 4000);

  // Fetch unread count for patrons/staff
  useEffect(() => {
    fetchUnreadCount();

    const handleUnreadChanged = (e: any) => {
      if (typeof e.detail?.count === 'number') {
        setUnreadCount(e.detail.count);
      }
    };

    window.addEventListener('uth-unread-count-changed', handleUnreadChanged);
    window.addEventListener('uth-refresh-notifications', fetchUnreadCount);
    return () => {
      window.removeEventListener('uth-unread-count-changed', handleUnreadChanged);
      window.removeEventListener('uth-refresh-notifications', fetchUnreadCount);
    };
  }, [isAuthenticated, fetchUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="h-[60px] bg-white border-b border-border shadow-xs sticky top-0 z-30 backdrop-blur-md bg-white/95">
      <div className={HEADER_CONTENT_RAIL}>
        {/* Left: Sidebar Toggle + Official UTH Logo */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-100 text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-colors"
            aria-label="Mở menu điều hướng"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src="/uth-logo.png"
              alt="UTH - Trường Đại học Giao thông vận tải TP.HCM"
              className="h-8 sm:h-9 object-contain group-hover:opacity-90 transition-opacity"
            />
            <div className="hidden md:flex flex-col border-l border-border pl-3">
              <span className="text-xs font-bold text-textPrimary leading-tight tracking-tight">THƯ VIỆN UTH</span>
              <span className="text-[10px] text-textSecondary uppercase tracking-widest font-medium">Digital Library Portal</span>
            </div>
          </Link>
        </div>

        {/* Right: Quick actions + User Profile Dropdown */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Patron Digital ID Card Shortcut (Student & Lecturer) */}
          {isAuthenticated && user && user.role !== 'admin' && (
            <button
              type="button"
              onClick={() => setIsCardModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-brand text-xs font-bold border border-teal-200 transition-colors shadow-2xs"
              title="Mở Thẻ sinh viên kỹ thuật số & mã vạch quét mượn sách"
            >
              <BarcodeIcon className="w-4 h-4 text-brand" />
              <span className="hidden sm:inline">Thẻ bạn đọc</span>
            </button>
          )}

          {/* Notification Shortcut */}
          {isAuthenticated && (
            <Link
              to="/notifications"
              className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-slate-100 text-textSecondary hover:text-primary flex items-center justify-center transition-colors relative border border-border/80 focus-ring"
              title="Thông báo hệ thống"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] h-[18px] bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-slate-300 rounded-full" />
              )}
            </Link>
          )}

          {/* User Profile */}
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 py-1 px-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                aria-expanded={dropdownOpen}
              >
                <div className="w-8 h-8 rounded-full bg-primary-light text-primary-dark font-bold flex items-center justify-center text-xs overflow-hidden border border-primary/20 shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    user.full_name?.charAt(0) || <User className="w-4 h-4" />
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-textPrimary leading-tight line-clamp-1 max-w-[140px]">
                    {user.full_name}
                  </span>
                  <span className="text-[10px] text-textSecondary flex items-center gap-1">
                    {user.role === 'admin' ? (
                      <span className="text-primary font-semibold flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5" /> Quản trị viên
                      </span>
                    ) : (
                      <span className="font-mono">{user.card_code}</span>
                    )}
                  </span>
                </div>
                <ChevronDown className={cn("w-3.5 h-3.5 text-primary shrink-0 transition-transform duration-150", dropdownOpen && "rotate-180")} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-dropdown border border-border py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  <div className="px-3.5 py-2.5 border-b border-border/70 bg-slate-50/50">
                    <p className="font-bold text-textPrimary leading-snug">{user.full_name}</p>
                    <p className="text-[11px] text-textSecondary font-mono mt-0.5">{user.card_code}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary-light text-primary-dark border border-primary/20">
                      {user.role === 'admin' ? 'Quản trị viên / Thủ thư' : user.role === 'lecturer' ? 'Giảng viên' : 'Bạn đọc sinh viên'}
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-3.5 py-2 text-textPrimary hover:bg-primary-light hover:text-primary transition-colors font-medium"
                  >
                    <UserCheck className="w-4 h-4 mr-2.5 text-primary" />
                    Hồ sơ tài khoản & Thẻ UTH
                  </Link>

                  {user.role !== 'admin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        setIsCardModalOpen(true);
                      }}
                      className="w-full flex items-center px-3.5 py-2 text-textPrimary hover:bg-primary-light hover:text-primary transition-colors font-medium text-left"
                    >
                      <BarcodeIcon className="w-4 h-4 mr-2.5 text-primary" />
                      Thẻ sinh viên số & Mã vạch
                    </button>
                  )}

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-3.5 py-2 text-textPrimary hover:bg-primary-light hover:text-primary transition-colors font-medium"
                  >
                    <KeyRound className="w-4 h-4 mr-2.5 text-primary" />
                    Đổi mật khẩu
                  </Link>

                  <div className="border-t border-border/70 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3.5 py-2 text-danger hover:bg-danger-soft transition-colors text-left font-semibold"
                  >
                    <LogOut className="w-4 h-4 mr-2.5 text-danger" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-xs btn-interaction"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>

      {/* Student ID Card Modal (Patrons only) */}
      {user && user.role !== 'admin' && (
        <StudentIdCardModal
          isOpen={isCardModalOpen}
          onClose={() => setIsCardModalOpen(false)}
          user={user}
        />
      )}
    </header>
  );
};
