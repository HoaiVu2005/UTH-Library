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

interface BadgeItem {
  count: number;
}

const SEEN_BADGES_KEY = 'uth_sidebar_seen_badges';

const getSeenBadges = (): Record<string, number> => {
  try {
    const raw = localStorage.getItem(SEEN_BADGES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveSeenBadge = (path: string, count: number) => {
  try {
    const current = getSeenBadges();
    current[path] = count;
    localStorage.setItem(SEEN_BADGES_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
};

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const isStaff = user?.role === 'admin' || user?.role === 'librarian';

  // Section collapse state (default open)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [badges, setBadges] = useState<Record<string, BadgeItem>>({});
  const [seenBadges, setSeenBadges] = useState<Record<string, number>>(() => getSeenBadges());

  const toggleGroup = (title: string) => {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const fetchBadgeCounts = useCallback(async () => {
    if (!user) return;
    try {
      const newBadges: Record<string, BadgeItem> = {};

      if (isStaff) {
        // Admin badges: Hàng chờ mượn sách & Duyệt đề xuất mua sách
        try {
          const res = await api.get('/dashboard/summary');
          const d = res.data?.data || {};

          // Reservations: pending reservations count
          const resvCount = d.pending_reservations || d.today_reservations || 0;
          if (resvCount > 0) {
            newBadges['/admin/reservations'] = { count: resvCount };
          }

          // Suggestions: pending suggestions count (Staff: Admin & Librarian)
          const suggCount = d.pending_suggestions || d.today_suggestions || 0;
          if (suggCount > 0) {
            newBadges['/admin/suggestions'] = { count: suggCount };
          }
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
            if (readyOrPending > 0) {
              newBadges['/reservations'] = { count: readyOrPending };
            }
          }

          if (resFines.status === 'fulfilled') {
            const list = resFines.value.data?.data || [];
            if (list.length > 0) {
              newBadges['/fines'] = { count: list.length };
            }
          }

          if (resLoans.status === 'fulfilled') {
            const list = resLoans.value.data?.data || [];
            const overdue = list.filter((l: any) => l.is_overdue || (l.due_at && new Date(l.due_at) < new Date())).length;
            if (overdue > 0) {
              newBadges['/loans'] = { count: overdue };
            }
          }

          // Kiểm tra xem có đợt khảo sát đề xuất sách nào đang mở không
          try {
            const resCamp = await api.get('/suggestions/campaigns/active');
            if (resCamp.data?.has_active_campaign && resCamp.data?.campaign?.is_active) {
              newBadges['/suggestions'] = { count: 1 };
            }
          } catch {
            // ignore
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
          newBadges['/notifications'] = { count: notifList.length };
        }
      } catch {
        // ignore
      }

      // Automatically sync any stored seen count if current count dropped below it
      const currentSeen = getSeenBadges();
      let seenChanged = false;
      Object.entries(currentSeen).forEach(([path, count]) => {
        const currentCount = newBadges[path]?.count || 0;
        if (currentCount < count) {
          currentSeen[path] = currentCount;
          seenChanged = true;
        }
      });
      if (seenChanged) {
        try {
          localStorage.setItem(SEEN_BADGES_KEY, JSON.stringify(currentSeen));
        } catch {
          // ignore
        }
        setSeenBadges({ ...currentSeen });
      }

      setBadges(newBadges);
    } catch (err) {
      console.error('Failed to fetch sidebar badge counts', err);
    }
  }, [user, isStaff]);

  useEffect(() => {
    if (isOpen) {
      fetchBadgeCounts();
    }
  }, [isOpen, fetchBadgeCounts]);

  // If user is already on the page of a menu item, auto-mark its badge as seen
  useEffect(() => {
    const badge = badges[location.pathname];
    if (badge && badge.count > 0) {
      const seen = seenBadges[location.pathname] ?? 0;
      if (badge.count > seen) {
        saveSeenBadge(location.pathname, badge.count);
        setSeenBadges((prev) => ({ ...prev, [location.pathname]: badge.count }));
      }
    }
  }, [location.pathname, badges, seenBadges]);

  // Sync real-time notification count from header/notification events
  useEffect(() => {
    const handleUnreadChanged = (e: any) => {
      if (typeof e.detail?.count === 'number') {
        setBadges((prev) => ({
          ...prev,
          '/notifications': { count: e.detail.count },
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
        { label: 'Mượn sách & Chờ nhận sách', path: '/reservations', icon: <BookmarkCheck className="w-4 h-4 text-amber-500" /> },
        { label: 'Gia hạn trực tuyến', path: '/loans', icon: <RefreshCw className="w-4 h-4 text-emerald-600" /> },
      ],
    },
    {
      title: 'Thư viện số & Học liệu',
      items: [
        { label: 'Thư viện số UTH', path: '/digital-library', icon: <FileText className="w-4 h-4 text-[#008B8B]" /> },
        { label: 'Lịch sử đọc số & Tiến độ', path: '/digital-library/my-history', icon: <History className="w-4 h-4 text-emerald-600" /> },
      ],
    },
    {
      title: 'Thông tin & Dịch vụ',
      items: [
        { label: 'Tra cứu danh mục sách', path: '/search', icon: <Search className="w-4 h-4 text-blue-600" /> },
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
        { label: 'Hàng chờ Mượn sách toàn trường', path: '/admin/reservations', icon: <BookmarkCheck className="w-4 h-4 text-amber-500" /> },
      ],
    },
    {
      title: 'Biên mục & Kho sách',
      items: [
        { label: 'Quản lý Đầu sách', path: '/admin/books', icon: <BookOpen className="w-4 h-4 text-blue-600" /> },
        { label: 'Quản lý Bản sao & Mã vạch', path: '/admin/copies', icon: <Layers className="w-4 h-4 text-indigo-600" /> },
        { label: 'Quản lý Thư viện số UTH', path: '/admin/digital-library', icon: <FileText className="w-4 h-4 text-[#008B8B]" /> },
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

  const ADMIN_ONLY_PATHS = [
    '/admin/dashboard',
    '/admin/settings',
  ];

  const currentGroups = isStaff
    ? user?.role === 'librarian'
      ? adminGroups
          .map((g) => ({
            ...g,
            title: g.title === 'Hệ thống & Báo cáo' ? 'Báo cáo & Thao tác' : g.title,
            items: g.items
              .filter((item) => !ADMIN_ONLY_PATHS.includes(item.path))
              .map((item) =>
                item.path === '/admin/audit'
                  ? { ...item, label: 'Nhật ký Thao tác của Tôi' }
                  : item
              ),
          }))
          .filter((g) => g.items.length > 0)
      : adminGroups
    : patronGroups;

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
            const groupBadgeTotal = group.items.reduce((acc, it) => {
              const b = badges[it.path];
              const seen = seenBadges[it.path] ?? 0;
              return acc + (b && b.count > seen ? b.count : 0);
            }, 0);

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
                        <span className="absolute -inset-0.5 rounded-full bg-rose-400/40 animate-ping opacity-75" />
                        <span className="relative inline-flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[9.5px] font-bold text-white rounded-full bg-rose-500 ring-2 ring-white shadow-2xs">
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
                      const badge = badges[item.path];
                      const seenCount = seenBadges[item.path] ?? 0;
                      const hasUnread = badge && badge.count > 0 && badge.count > seenCount;

                      const handleLinkClick = () => {
                        if (badge && badge.count > 0) {
                          saveSeenBadge(item.path, badge.count);
                          setSeenBadges((prev) => ({ ...prev, [item.path]: badge.count }));
                        }
                        onClose();
                      };

                      return (
                        <Link
                          key={item.path + item.label}
                          to={item.path}
                          onClick={handleLinkClick}
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

                          {hasUnread && (
                            <span
                              className="relative flex items-center justify-center shrink-0 ml-2"
                              title={`${badge.count} tác vụ / thông báo cần xử lý`}
                            >
                              {/* Subtle ping ring wave */}
                              <span className="absolute -inset-0.5 rounded-full bg-rose-400/40 animate-ping opacity-75" />
                              {/* Notification-style circular badge */}
                              <span className="relative min-w-[20px] h-[20px] px-1.5 flex items-center justify-center text-[11px] font-bold text-white bg-rose-500 rounded-full ring-2 ring-white shadow-2xs">
                                {badge.count > 99 ? '99+' : badge.count}
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
