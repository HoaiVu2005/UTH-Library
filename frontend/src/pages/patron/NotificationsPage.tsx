import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Clock,
  AlertTriangle,
  BookmarkCheck,
  Lightbulb,
  Check,
  ChevronRight,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  ArrowUpRight,
  AlertCircle,
  CreditCard,
  Inbox,
  Sparkles,
  ExternalLink,
  Info,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRealtimeSync, broadcastRealtimeSync } from '@/lib/realtime';

export interface NotificationItem {
  id: number;
  type: string;
  channel: string;
  content: string;
  link?: string;
  is_read: boolean;
  sent_at: string;
  created_at: string;
}

interface CategoryConfig {
  label: string;
  categoryName: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  borderAccent: string;
  badgeStatus: string;
  badgeText: string;
  actionText: string;
  guideNote?: string;
}

const CATEGORY_MAP: Record<string, CategoryConfig> = {
  reservation_ready: {
    label: 'Giữ chỗ sách',
    categoryName: 'Sách đặt trước đã sẵn sàng',
    icon: BookmarkCheck,
    iconBg: 'bg-teal-50',
    iconColor: 'text-primary',
    borderAccent: 'border-l-primary',
    badgeStatus: 'ready',
    badgeText: 'Sẵn sàng nhận',
    actionText: 'Xem sách đang giữ chỗ',
    guideNote:
      'Quầy lưu thông đã chuẩn bị sẵn tài liệu cho bạn. Vui lòng mang Thẻ sinh viên hoặc Thẻ bạn đọc số đến quầy nhận sách trước thời hạn đã thông báo.',
  },
  due_soon: {
    label: 'Sắp đến hạn',
    categoryName: 'Nhắc nhở hạn trả sách',
    icon: Clock,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-700',
    borderAccent: 'border-l-amber-500',
    badgeStatus: 'warning',
    badgeText: 'Sắp đến hạn',
    actionText: 'Xem sách đang mượn & Gia hạn',
    guideNote:
      'Sách của bạn sắp đến hạn trả. Bạn có thể gia hạn trực tuyến 1-click thêm 7 ngày tại mục "Sách đang mượn" (nếu chưa có bạn đọc khác xếp hàng đặt trước).',
  },
  overdue: {
    label: 'Quá hạn',
    categoryName: 'Cảnh báo quá hạn sách',
    icon: AlertTriangle,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    borderAccent: 'border-l-rose-500',
    badgeStatus: 'overdue',
    badgeText: 'Quá hạn trả',
    actionText: 'Xem sách quá hạn & Xử lý',
    guideNote:
      'Sách mượn đã quá thời hạn quy định. Bạn đọc vui lòng hoàn trả sách sớm nhất tại Quầy lưu thông để tránh phát sinh thêm phí phạt quá hạn (1.000đ/ngày) và không bị khóa thẻ.',
  },
  suggestion_result: {
    label: 'Đề xuất tài liệu',
    categoryName: 'Kết quả xét duyệt đề xuất',
    icon: Lightbulb,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-700',
    borderAccent: 'border-l-purple-500',
    badgeStatus: 'waived',
    badgeText: 'Đề xuất tài liệu',
    actionText: 'Xem đề xuất của tôi',
    guideNote:
      'Đề xuất mua sách phục vụ học tập, nghiên cứu của bạn đã được Ban thư viện tiếp nhận và thẩm định. Khi sách về kho, bạn sẽ nhận được thông báo tiếp theo.',
  },
  fine_created: {
    label: 'Khoản phạt',
    categoryName: 'Thông báo phí phạt',
    icon: AlertCircle,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-700',
    borderAccent: 'border-l-orange-500',
    badgeStatus: 'unpaid',
    badgeText: 'Khoản phạt mới',
    actionText: 'Xem chi tiết phí phạt',
    guideNote:
      'Hệ thống ghi nhận phí phạt phát sinh từ sách quá hạn hoặc hư hỏng. Bạn có thể thanh toán trực tiếp tại Quầy lưu thông hoặc quét mã QR chuyển khoản.',
  },
  card_expiring: {
    label: 'Thẻ bạn đọc',
    categoryName: 'Hạn thẻ bạn đọc',
    icon: CreditCard,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-700',
    borderAccent: 'border-l-sky-500',
    badgeStatus: 'info',
    badgeText: 'Hạn thẻ bạn đọc',
    actionText: 'Xem thông tin thẻ',
    guideNote:
      'Thẻ bạn đọc sắp hết hạn. Sinh viên/Giảng viên có thể liên hệ Ban thư viện hoặc gia hạn trực tiếp tại quầy để duy trì quyền lợi mượn sách.',
  },
};

const DEFAULT_CONFIG: CategoryConfig = {
  label: 'Hệ thống',
  categoryName: 'Thông báo thư viện',
  icon: Bell,
  iconBg: 'bg-slate-100',
  iconColor: 'text-slate-600',
  borderAccent: 'border-l-slate-400',
  badgeStatus: 'default',
  badgeText: 'Thông báo',
  actionText: 'Xem trang liên quan',
  guideNote: 'Thông báo chính thức từ Cổng thư viện số Trường Đại học Giao thông Vận tải TP.HCM.',
};

type FilterTab = 'all' | 'unread' | 'reservation' | 'loan' | 'suggestion' | 'other';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  // Fetch all notifications for user
  const fetchNotifications = useCallback(async (showRefreshSpinner = false, isBackground = false) => {
    try {
      if (showRefreshSpinner) setIsRefreshing(true);
      else if (!isBackground) setIsLoading(true);

      const res = await api.get('/notifications/me');
      const list: NotificationItem[] = res.data?.data || [];
      setNotifications(list);

      // Instantly sync unread count with Header
      const unreadCount = list.filter((n) => !n.is_read).length;
      window.dispatchEvent(
        new CustomEvent('uth-unread-count-changed', { detail: { count: unreadCount } })
      );
    } catch (err) {
      if (!isBackground) {
        console.error('Failed to fetch notifications', err);
        toast.error('Không thể tải danh sách thông báo. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime synchronization: updates live when new notifications arrive
  useRealtimeSync('notifications', () => fetchNotifications(false, true), 4000);

  // Compute unread count from current list
  const totalUnread = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  // Sync unread count to Header whenever local state updates
  const syncUnreadToHeader = (newCount: number) => {
    window.dispatchEvent(
      new CustomEvent('uth-unread-count-changed', { detail: { count: Math.max(0, newCount) } })
    );
    window.dispatchEvent(new CustomEvent('uth-refresh-notifications'));
    broadcastRealtimeSync('notifications');
  };

  // Open detail modal and auto-mark as read
  const handleOpenDetail = async (item: NotificationItem) => {
    setSelectedNotification(item);

    // If unread, mark read immediately
    if (!item.is_read) {
      // 1. Instant local update
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
      );
      // 2. Decrement unread count and broadcast
      const newCount = Math.max(0, totalUnread - 1);
      syncUnreadToHeader(newCount);

      // 3. Persist in background
      try {
        await api.post(`/notifications/${item.id}/read`);
      } catch (err) {
        console.error('Failed to mark notification as read on server', err);
      }
    }
  };

  // Mark single notification as read from the item row checkmark
  const handleMarkRead = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();

    // 1. Instant local state update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    // 2. Immediate header count decrement
    const newCount = Math.max(0, totalUnread - 1);
    syncUnreadToHeader(newCount);
    toast.success('Đã đánh dấu đã đọc thông báo.');

    // 3. Persist to API
    try {
      await api.post(`/notifications/${id}/read`);
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  // Mark all notifications as read
  const handleBulkMarkRead = async () => {
    if (totalUnread === 0) return;

    // 1. Instant local update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    // 2. Reset badge immediately to 0
    syncUnreadToHeader(0);
    toast.success('Đã đánh dấu tất cả thông báo là đã đọc.');

    // 3. Persist to backend
    try {
      await api.post('/notifications/bulk-mark-read');
    } catch (err) {
      console.error('Failed to bulk mark read', err);
    }
  };

  // Helper formatting for date
  const formatNotificationTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      if (isToday(d)) {
        return `Hôm nay lúc ${format(d, 'HH:mm')}`;
      }
      if (isYesterday(d)) {
        return `Hôm qua lúc ${format(d, 'HH:mm')}`;
      }
      return format(d, 'dd/MM/yyyy HH:mm');
    } catch {
      return dateStr;
    }
  };

  // Filter tab counts
  const tabCounts = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter((n) => !n.is_read).length,
      reservation: notifications.filter((n) => n.type === 'reservation_ready').length,
      loan: notifications.filter((n) => n.type === 'due_soon' || n.type === 'overdue').length,
      suggestion: notifications.filter((n) => n.type === 'suggestion_result').length,
      other: notifications.filter(
        (n) =>
          n.type === 'fine_created' ||
          n.type === 'card_expiring' ||
          !['reservation_ready', 'due_soon', 'overdue', 'suggestion_result'].includes(n.type)
      ).length,
    };
  }, [notifications]);

  // Filtered notifications list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // 1. Tab filter
      if (activeTab === 'unread' && item.is_read) return false;
      if (activeTab === 'reservation' && item.type !== 'reservation_ready') return false;
      if (activeTab === 'loan' && item.type !== 'due_soon' && item.type !== 'overdue') return false;
      if (activeTab === 'suggestion' && item.type !== 'suggestion_result') return false;
      if (
        activeTab === 'other' &&
        ['reservation_ready', 'due_soon', 'overdue', 'suggestion_result'].includes(item.type)
      ) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const contentMatch = item.content.toLowerCase().includes(query);
        const config = CATEGORY_MAP[item.type] || DEFAULT_CONFIG;
        const categoryMatch = config.categoryName.toLowerCase().includes(query);
        return contentMatch || categoryMatch;
      }

      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  const activeModalConfig = selectedNotification
    ? CATEGORY_MAP[selectedNotification.type] || DEFAULT_CONFIG
    : null;

  return (
    <div className="w-full space-y-6 pb-16 animate-page-enter">
      {/* Page Header Banner */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand flex items-center justify-center shrink-0 shadow-2xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#008B8B] tracking-tight flex items-center">
                <span className="text-orange-500 font-bold mr-2 select-none">&gt;</span>
                <span>Hộp thư thông báo UTH</span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Theo dõi hạn trả tài liệu, nhận thông báo giữ chỗ sách sẵn sàng tại quầy và kết quả xét duyệt
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchNotifications(true)}
              disabled={isRefreshing || isLoading}
              className="text-xs h-9 px-3.5 border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl"
              title="Tải lại thông báo"
            >
              <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5 text-gray-500', isRefreshing && 'animate-spin')} />
              Làm mới
            </Button>

            {totalUnread > 0 && (
              <button
                type="button"
                onClick={handleBulkMarkRead}
                className="inline-flex items-center justify-center text-xs font-semibold h-9 px-4 rounded-xl border border-brand text-brand hover:bg-teal-50/70 transition-all bg-white shadow-2xs shrink-0 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1.5 text-brand" />
                <span>Đọc tất cả ({totalUnread})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs & Search Controls */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Scrollable Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5 shrink-0',
                activeTab === 'all'
                  ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
                  : 'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-slate-100/80'
              )}
            >
              <span>Tất cả</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white border border-gray-200 text-gray-700 font-bold">
                {tabCounts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('unread')}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5 shrink-0',
                activeTab === 'unread'
                  ? 'bg-red-50 text-red-600 border-red-300 shadow-2xs'
                  : 'bg-red-50/60 text-red-600 border-red-200/80 hover:bg-red-100/70'
              )}
            >
              <span>Chưa đọc</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white border border-red-200 text-red-700 font-bold">
                {tabCounts.unread}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reservation')}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5 shrink-0',
                activeTab === 'reservation'
                  ? 'bg-teal-50 text-brand border-brand shadow-2xs'
                  : 'bg-teal-50/60 text-brand border-teal-200/80 hover:bg-teal-100/70'
              )}
            >
              <span>Giữ chỗ</span>
              {tabCounts.reservation > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white border border-teal-200 text-brand font-bold">
                  {tabCounts.reservation}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('loan')}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5 shrink-0',
                activeTab === 'loan'
                  ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                  : 'bg-amber-50/60 text-amber-700 border-amber-200/80 hover:bg-amber-100/70'
              )}
            >
              <span>Hạn mượn</span>
              {tabCounts.loan > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white border border-amber-200 text-amber-800 font-bold">
                  {tabCounts.loan}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('suggestion')}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5 shrink-0',
                activeTab === 'suggestion'
                  ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-2xs'
                  : 'bg-blue-50/60 text-blue-700 border-blue-200/80 hover:bg-blue-100/70'
              )}
            >
              <span>Đề xuất</span>
              {tabCounts.suggestion > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white border border-blue-200 text-blue-700 font-bold">
                  {tabCounts.suggestion}
                </span>
              )}
            </button>

            {tabCounts.other > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('other')}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 flex items-center gap-1.5 shrink-0',
                  activeTab === 'other'
                    ? 'bg-purple-50 text-purple-800 border-purple-300 shadow-2xs'
                    : 'bg-purple-50/60 text-purple-700 border-purple-200/80 hover:bg-purple-100/70'
                )}
              >
                <span>Khác</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white border border-purple-200 text-purple-700 font-bold">
                  {tabCounts.other}
                </span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-textSecondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nội dung thông báo..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs border border-border rounded-lg text-textPrimary placeholder:text-textSecondary/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-textSecondary hover:text-textPrimary text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 bg-white border border-border rounded-xl flex items-center space-x-3.5 animate-pulse"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-4/5" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-8 shadow-card text-center">
          <EmptyState
            title={
              searchQuery
                ? 'Không tìm thấy thông báo phù hợp'
                : activeTab === 'unread'
                ? 'Tuyệt vời! Không có thông báo chưa đọc'
                : 'Hộp thư thông báo rỗng'
            }
            description={
              searchQuery
                ? `Không có kết quả nào cho từ khóa "${searchQuery}". Hãy thử tìm kiếm từ khóa khác.`
                : activeTab === 'unread'
                ? 'Bạn đã xem và cập nhật tất cả thông tin mới nhất từ Thư viện số UTH.'
                : 'Mọi thông báo về mượn trả, nhắc hạn và kết quả đề xuất sách sẽ xuất hiện tại đây.'
            }
            actionText={
              searchQuery || activeTab !== 'all'
                ? `Xem tất cả thông báo (${tabCounts.all})`
                : undefined
            }
            onAction={
              searchQuery || activeTab !== 'all'
                ? () => {
                    setSearchQuery('');
                    setActiveTab('all');
                  }
                : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredNotifications.map((item) => {
            const config = CATEGORY_MAP[item.type] || DEFAULT_CONFIG;
            const CategoryIcon = config.icon;

            return (
              <div
                key={item.id}
                onClick={() => handleOpenDetail(item)}
                className={cn(
                  'group relative bg-white border rounded-xl p-4 sm:p-4.5 cursor-pointer transition-all duration-150 card-hover select-none',
                  !item.is_read
                    ? 'border-l-4 border-l-primary border-t-teal-200/50 border-r-teal-200/50 border-b-teal-200/50 bg-gradient-to-r from-teal-50/20 via-white to-white shadow-card ring-1 ring-primary/10'
                    : 'border-border/80 hover:border-border hover:bg-slate-50/50 shadow-xs'
                )}
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  {/* Left: Category Icon + Content */}
                  <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 transition-transform group-hover:scale-105',
                        config.iconBg,
                        config.iconColor,
                        'border-border/60'
                      )}
                    >
                      <CategoryIcon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 space-y-1.5 min-w-0">
                      {/* Top tags row */}
                      <div className="flex items-center gap-2 flex-wrap text-[11px]">
                        <span
                          className={cn(
                            'font-bold px-2 py-0.2 rounded-md border text-[10px] tracking-wide',
                            config.iconBg,
                            config.iconColor,
                            'border-border/60'
                          )}
                        >
                          {config.categoryName}
                        </span>

                        {!item.is_read && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse-dot" />
                            Mới
                          </span>
                        )}

                        <span className="text-textSecondary text-[11px]">
                          {formatNotificationTime(item.created_at)}
                        </span>
                      </div>

                      {/* Main content body */}
                      <p
                        className={cn(
                          'text-xs text-textPrimary leading-relaxed line-clamp-2',
                          !item.is_read ? 'font-semibold text-slate-900' : 'font-normal text-textPrimary/90'
                        )}
                      >
                        {item.content}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-center">
                    <span className="hidden sm:inline-flex items-center text-xs text-primary font-bold group-hover:translate-x-0.5 transition-transform gap-0.5">
                      Chi tiết <ChevronRight className="w-4 h-4" />
                    </span>

                    {!item.is_read && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkRead(e, item.id)}
                        className="p-1.5 rounded-lg text-textSecondary hover:text-primary hover:bg-teal-50 border border-transparent hover:border-teal-200 transition-colors"
                        title="Đánh dấu đã đọc"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notification Detail Modal */}
      {selectedNotification && activeModalConfig && (
        <Modal
          isOpen={Boolean(selectedNotification)}
          onClose={() => setSelectedNotification(null)}
          size="lg"
        >
          <ModalHeader>
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center border shrink-0',
                  activeModalConfig.iconBg,
                  activeModalConfig.iconColor,
                  'border-border/60'
                )}
              >
                <activeModalConfig.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-textPrimary">Chi tiết thông báo</h3>
                <p className="text-xs text-textSecondary">{activeModalConfig.categoryName}</p>
              </div>
            </div>
          </ModalHeader>

          <ModalBody className="space-y-4">
            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border border-border rounded-xl text-xs">
              <Badge status={activeModalConfig.badgeStatus} hasDot size="sm">
                {activeModalConfig.badgeText}
              </Badge>

              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                  selectedNotification.is_read
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                )}
              >
                {selectedNotification.is_read ? 'Đã xem' : 'Chưa đọc'}
              </span>

              <span className="text-[11px] text-textSecondary flex items-center gap-1 ml-auto">
                <Clock className="w-3.5 h-3.5 text-textSecondary" />
                {formatNotificationTime(selectedNotification.created_at)}
              </span>
            </div>

            {/* Notification Full Content */}
            <div className="p-4 sm:p-5 rounded-xl bg-white border border-border shadow-xs">
              <span className="text-[11px] uppercase tracking-wider font-bold text-textSecondary block mb-1.5">
                Nội dung thông báo
              </span>
              <p className="text-sm font-medium text-textPrimary leading-relaxed whitespace-pre-wrap">
                {selectedNotification.content}
              </p>
            </div>

            {/* Contextual Guidance Box */}
            {activeModalConfig.guideNote && (
              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-slate-700 leading-relaxed">
                <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-brand block mb-0.5">Hướng dẫn từ Ban thư viện:</span>
                  <span>{activeModalConfig.guideNote}</span>
                </div>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedNotification(null)}
            >
              Đóng
            </Button>

            {selectedNotification.link && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const targetLink = selectedNotification.link!;
                  setSelectedNotification(null);
                  navigate(targetLink);
                }}
                rightIcon={<ArrowUpRight className="w-4 h-4" />}
              >
                {activeModalConfig.actionText}
              </Button>
            )}
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};
