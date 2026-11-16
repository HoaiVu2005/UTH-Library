import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  X,
  ChevronRight,
  ChevronDown,
  Search,
  BookOpen,
  BookmarkCheck,
  Receipt,
  Bell,
  Lightbulb,
  User,
  ScanLine,
  Layers,
  Users,
  FileText,
  BarChart2,
  Settings,
  History,
  Home,
  RefreshCw,
  CreditCard,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  // Section collapse state (default open)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});

  const toggleGroup = (title: string) => {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const fetchBadgeCounts = useCallback(async () => {
    if (!user) return;
    try {
      const counts: Record<string, number> = {};

      if (isAdmin) {
        // Admin badges
        try {
          const res = await api.get('/dashboard/summary');
          const d = res.data?.data || {};
          if (d.pending_reservations > 0) counts['/admin/reservations'] = d.pending_reservations;
          if (d.pending_suggestions > 0) counts['/admin/suggestions'] = d.pending_suggestions;
          if (d.overdue_loans > 0) counts['/admin/loans'] = d.overdue_loans;
          if (d.locked_users > 0) counts['/admin/users'] = d.locked_users;
        } catch {
          // ignore
        }
      } else {
        // Patron badges
        try {
          const [resResv, resFines, resLoans] = await Promise.allSettled([
            api.get('/reservations/me'),
            api.get('/fines/me?status=unpaid'),
            api.get('/loans/me?status=active'),
          ]);

          if (resResv.status === 'fulfilled') {
            const list = resResv.value.data?.data || [];
            const readyOrPending = list.filter((r: any) => r.status === 'ready' || r.status === 'pending').length;
            if (readyOrPending > 0) counts['/reservations'] = readyOrPending;
          }

          if (resFines.status === 'fulfilled') {
            const list = resFines.value.data?.data || [];
            if (list.length > 0) counts['/fines'] = list.length;
          }

          if (resLoans.status === 'fulfilled') {
            const list = resLoans.value.data?.data || [];
            const overdue = list.filter((l: any) => l.is_overdue || (l.due_at && new Date(l.due_at) < new Date())).length;
            if (overdue > 0) counts['/loans'] = overdue;
          }
        } catch {
          // ignore
        }
      }

      // Notifications badge for both
      try {
        const resNotif = await api.get('/notifications/me?unread=true');
        const notifList = resNotif.data?.data || [];
        if (notifList.length > 0) {
          counts['/notifications'] = notifList.length;
        }
      } catch {
        // ignore
      }

      setBadgeCounts(counts);
    } catch (err) {
      console.error('Failed to fetch sidebar badge counts', err);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (isOpen) {
      fetchBadgeCounts();
    }
  }, [isOpen, fetchBadgeCounts]);

  // Sync real-time notification count from header/notification events
  useEffect(() => {
    const handleUnreadChanged = (e: any) => {
      if (typeof e.detail?.count === 'number') {
        setBadgeCounts((prev) => ({
          ...prev,
          '/notifications': e.detail.count,
        }));
      }
    };

    window.addEventListener('uth-unread-count-changed', handleUnreadChanged);
    window.addEventListener('uth-refresh-drawer-badges', fetchBadgeCounts);

    return () => {
      window.removeEventListener('uth-unread-count-changed', handleUnreadChanged);
      window.removeEventListener('uth-refresh-drawer-badges', fetchBadgeCounts);
    };
  }, [fetchBadgeCounts]);

  // Patron Menu Groups (Formatted according to UTH Portal style in reference screenshot)
  const patronGroups: MenuGroup[] = [
    {
      title: 'Học tập & Mượn trả',
      items: [
        { label: 'Trang chủ Thư viện', path: '/', icon: <Home className="w-4 h-4 text-emerald-600" /> },
        { label: 'Thông tin sinh viên / Thẻ', path: '/dashboard', icon: <GraduationCap className="w-4 h-4 text-primary" /> },
        { label: 'Sách đang mượn & Lịch sử', path: '/loans', icon: <BookOpen className="w-4 h-4 text-blue-600" /> },
        { label: 'Đặt trước & Giữ chỗ', path: '/reservations', icon: <BookmarkCheck className="w-4 h-4 text-amber-500" /> },
        { label: 'Gia hạn trực tuyến', path: '/loans', icon: <RefreshCw className="w-4 h-4 text-emerald-600" /> },
      ],
    },
    {
      title: 'Thông tin & Dịch vụ',
      items: [
        { label: 'Tra cứu danh mục sách (OPAC)', path: '/search', icon: <Search className="w-4 h-4 text-blue-600" /> },
        { label: 'Đề xuất mua sách mới', path: '/suggestions', icon: <Lightbulb className="w-4 h-4 text-purple-600" /> },
        { label: 'Hộp thư thông báo', path: '/notifications', icon: <Bell className="w-4 h-4 text-rose-500" /> },
      ],
    },
    {
      title: 'Công nợ & Tài chính',
      items: [
        { label: 'Tra cứu tiền phạt & Nợ', path: '/fines', icon: <CreditCard className="w-4 h-4 text-orange-500" /> },
        { label: 'Hồ sơ tài khoản & Bảo mật', path: '/profile', icon: <User className="w-4 h-4 text-teal-700" /> },
      ],
    },
  ];

  // Admin Menu Groups
  const adminGroups: MenuGroup[] = [
    {
      title: 'Quầy lưu thông',
      items: [
        { label: 'Bảng điều khiển Admin', path: '/admin/dashboard', icon: <BarChart2 className="w-4 h-4 text-primary" /> },
        { label: 'Quầy Mượn - Trả tại quầy (Desk)', path: '/admin/circulation', icon: <ScanLine className="w-4 h-4 text-primary" /> },
        { label: 'Hàng chờ Đặt trước toàn trường', path: '/admin/reservations', icon: <BookmarkCheck className="w-4 h-4 text-amber-500" /> },
      ],
    },
    {
      title: 'Biên mục & Kho sách',
      items: [
        { label: 'Quản lý Đầu sách', path: '/admin/books', icon: <BookOpen className="w-4 h-4 text-blue-600" /> },
        { label: 'Quản lý Bản sao & Mã vạch', path: '/admin/copies', icon: <Layers className="w-4 h-4 text-indigo-600" /> },
        { label: 'Duyệt Đề xuất mua sách', path: '/admin/suggestions', icon: <Lightbulb className="w-4 h-4 text-purple-600" /> },
      ],
    },
    {
      title: 'Bạn đọc & Công nợ',
      items: [
        { label: 'Quản lý Bạn đọc & Thẻ', path: '/admin/users', icon: <Users className="w-4 h-4 text-emerald-600" /> },
        { label: 'Danh sách Phiếu mượn', path: '/admin/loans', icon: <FileText className="w-4 h-4 text-sky-600" /> },
        { label: 'Quản lý Tiền phạt', path: '/admin/fines', icon: <Receipt className="w-4 h-4 text-red-500" /> },
      ],
    },
    {
      title: 'Hệ thống & Báo cáo',
      items: [
        { label: 'Báo cáo Thống kê', path: '/admin/reports', icon: <BarChart2 className="w-4 h-4 text-orange-500" /> },
        { label: 'Cấu hình Chính sách (Append-only)', path: '/admin/settings', icon: <Settings className="w-4 h-4 text-gray-700" /> },
        { label: 'Nhật ký Hệ thống (Audit Log)', path: '/admin/audit', icon: <History className="w-4 h-4 text-stone-600" /> },
      ],
    },
  ];

  const currentGroups = isAdmin ? adminGroups : patronGroups;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-40 transition-opacity duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 w-[350px] sm:w-[380px] max-w-[88vw] bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-240 ease-out border-r border-border',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header with Official UTH Logo */}
        <div className="h-[70px] px-6 flex items-center justify-between border-b border-border bg-slate-50/70">
          <Link to="/" onClick={onClose} className="flex items-center space-x-2.5">
            <img src="/uth-logo.png" alt="UTH Logo" className="h-8 sm:h-9 object-contain" />
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200/70 text-textSecondary hover:text-textPrimary focus:outline-none transition-colors"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Groups with expanded breathing room */}
        <div className="flex-1 overflow-y-auto py-5 px-4 space-y-4">
          {currentGroups.map((group) => {
            const isGroupCollapsed = collapsed[group.title];
            const groupBadgeTotal = group.items.reduce((acc, it) => acc + (badgeCounts[it.path] || 0), 0);

            return (
              <div key={group.title} className="space-y-1.5">
                {/* Group Title: Orange > icon, bold teal text */}
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between py-2 px-2.5 text-left text-primary hover:text-primary-dark hover:bg-teal-50/40 transition-colors group rounded-lg"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-orange-500 font-bold text-xs select-none">&gt;</span>
                    <span className="text-[13px] font-bold text-primary tracking-tight">{group.title}</span>
                    {isGroupCollapsed && groupBadgeTotal > 0 && (
                      <span className="relative flex items-center justify-center shrink-0 ml-1.5">
                        <span className="absolute -inset-0.5 rounded-full bg-rose-500/25 animate-pulse" />
                        <span className="relative inline-flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[9.5px] font-bold text-white bg-rose-500 rounded-full ring-2 ring-white shadow-2xs">
                          {groupBadgeTotal > 99 ? '99+' : groupBadgeTotal}
                        </span>
                      </span>
                    )}
                  </div>
                  {isGroupCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-textSecondary group-hover:text-primary transition-transform" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-textSecondary group-hover:text-primary transition-transform" />
                  )}
                </button>

                {/* Sub-items with comfortable vertical gaps */}
                {!isGroupCollapsed && (
                  <div className="space-y-1.5 pl-1.5">
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      const badgeCount = badgeCounts[item.path] || 0;

                      return (
                        <Link
                          key={item.path + item.label}
                          to={item.path}
                          onClick={onClose}
                          className={cn(
                            'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] transition-all group/item',
                            isActive
                              ? 'bg-primary-light text-primary-dark font-bold shadow-2xs border border-primary/20'
                              : 'text-textPrimary hover:bg-slate-50 hover:text-primary font-medium'
                          )}
                        >
                          <div className="flex items-center space-x-3.5 min-w-0">
                            <div className="shrink-0">{item.icon}</div>
                            <span className="truncate">{item.label}</span>
                          </div>

                          {badgeCount > 0 && (
                            <span
                              className="relative flex items-center justify-center shrink-0 ml-2"
                              title={`${badgeCount} thông báo / tác vụ cần xử lý`}
                            >
                              {/* Soft breathing ring pulse glow */}
                              <span className="absolute -inset-1 rounded-full bg-rose-500/20 animate-pulse" />
                              {/* Subtle ping ring wave */}
                              <span className="absolute -inset-0.5 rounded-full bg-rose-400/30 animate-ping opacity-75" />
                              {/* Badge */}
                              <span className="relative inline-flex items-center justify-center min-w-[19px] h-[19px] px-1.5 text-[10px] font-bold text-white bg-rose-500 rounded-full ring-2 ring-white shadow-2xs">
                                {badgeCount > 99 ? '99+' : badgeCount}
                              </span>
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info with generous spacing */}
        <div className="p-4 sm:p-5 border-t border-border text-xs text-textSecondary text-center bg-slate-50/80 space-y-1">
          <div>Trường ĐH Giao thông vận tải TP.HCM</div>
          <div className="font-bold text-primary text-sm mt-0.5">Hotline Thư viện: (028) 3899 1373</div>
        </div>
      </aside>
    </>
  );
};
