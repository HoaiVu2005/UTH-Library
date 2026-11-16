import React, { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import { useRealtimeSync } from '@/lib/realtime';

interface DueAlert {
  loan_id: number;
  book_title: string;
  barcode: string;
  due_at: string;
  is_overdue: boolean;
  days_left: number;
  message: string;
  is_new: boolean;
}

interface LatestNotification {
  id: number;
  content: string;
  type: string;
  link?: string;
  created_at: string;
}

interface RealtimeCheckResponse {
  unread_count: number;
  due_alerts: DueAlert[];
  has_overdue: boolean;
  has_due_soon: boolean;
  latest_notifications: LatestNotification[];
}

export const RealtimeNotificationManager: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const isCheckingRef = useRef(false);

  const checkRealtimeNotifications = useCallback(async () => {
    if (!isAuthenticated || isCheckingRef.current) return;

    try {
      isCheckingRef.current = true;
      const res = await api.get<{ data: RealtimeCheckResponse }>('/notifications/realtime-check');
      const data = res.data?.data;

      if (!data) return;

      // Broadcast unread count to Header
      window.dispatchEvent(
        new CustomEvent('uth-unread-count-changed', {
          detail: { count: data.unread_count },
        })
      );

      // 1. Process Due-soon (within 2 days) & Overdue book reminders
      if (data.due_alerts && Array.isArray(data.due_alerts)) {
        data.due_alerts.forEach((alert) => {
          const sessionKey = `notif_loan_${alert.loan_id}_${alert.due_at.substring(0, 10)}_${alert.is_overdue ? 'overdue' : 'duesoon'}`;
          const alreadyNotified = sessionStorage.getItem(sessionKey);

          if (!alreadyNotified) {
            sessionStorage.setItem(sessionKey, 'true');

            if (alert.is_overdue) {
              toast.custom({
                type: 'error',
                title: 'Sách mượn đã quá hạn',
                message: alert.message,
                link: '/loans',
                actionText: 'Xem sách đang mượn',
                duration: 7000,
              });
            } else {
              toast.custom({
                type: 'warning',
                title: 'Sắp đến hạn trả sách',
                message: alert.message,
                link: '/loans',
                actionText: 'Gia hạn hoặc trả sách',
                duration: 6500,
              });
            }
          }
        });
      }

      // 2. Process latest unread notifications (e.g. Suggestions, Reservations, Fines, Overdue)
      if (data.latest_notifications && Array.isArray(data.latest_notifications)) {
        data.latest_notifications.forEach((notif) => {
          const sessionKey = `notif_item_${notif.id}`;
          const alreadyNotified = sessionStorage.getItem(sessionKey);

          if (!alreadyNotified) {
            sessionStorage.setItem(sessionKey, 'true');

            // Determine toast style & title from type & content
            let toastType: 'info' | 'warning' | 'success' | 'error' = 'info';
            let toastTitle = 'Thông báo Thư viện UTH';
            let duration = 6000;

            const lowerContent = (notif.content || '').toLowerCase();

            if (notif.type === 'reservation_ready') {
              toastType = 'success';
              toastTitle = 'Sách đặt trước đã sẵn sàng';
            } else if (notif.type === 'fine_created') {
              toastType = 'warning';
              toastTitle = 'Khoản phạt mới phát sinh';
            } else if (notif.type === 'fine_paid') {
              toastType = 'success';
              toastTitle = 'Thanh toán tiền phạt thành công';
            } else if (notif.type === 'suggestion_result' || lowerContent.includes('đề xuất')) {
              if (lowerContent.includes('đã được duyệt') || lowerContent.includes('chấp thuận')) {
                toastType = 'success';
                toastTitle = 'Đề xuất sách đã được duyệt';
              } else if (lowerContent.includes('từ chối') || lowerContent.includes('không được')) {
                toastType = 'warning';
                toastTitle = 'Kết quả xét duyệt đề xuất';
              } else if (lowerContent.includes('nhập về') || lowerContent.includes('về kho')) {
                toastType = 'success';
                toastTitle = 'Sách đề xuất đã về kho';
              } else {
                toastType = 'info';
                toastTitle = 'Đề xuất mua sách mới';
                duration = 7000;
              }
            } else if (notif.type === 'due_soon') {
              toastType = 'warning';
              toastTitle = 'Sắp đến hạn trả sách';
            } else if (notif.type === 'overdue') {
              toastType = 'error';
              toastTitle = 'Lượt mượn sách quá hạn';
            }

            // Clean message: strip redundant emoji, prefixes or repeated sentences
            let cleanMessage = (notif.content || '')
              .replace(/^[✨🎉⚠️⏰🔔📦📚ℹ️]\s*/g, '')
              .replace(/^(sách đặt trước đã sẵn sàng nhận!?:?|thông báo thư viện:?|thông báo:?)\s*/gi, '')
              .replace(/^Giữ chỗ thành công!\s*Giữ chỗ thành công!/gi, 'Giữ chỗ thành công!')
              .trim();

            toast.custom({
              type: toastType,
              title: toastTitle,
              message: cleanMessage,
              link: notif.link || '/notifications',
              actionText: notif.link ? 'Xem chi tiết' : 'Xem thông báo',
              duration,
            });
          }
        });
      }
    } catch (err) {
      console.debug('[RealtimeNotification] Check skipped:', err);
    } finally {
      isCheckingRef.current = false;
    }
  }, [isAuthenticated]);

  // Realtime event-driven check whenever notifications/suggestions/loans/reservations change
  useRealtimeSync(
    ['notifications', 'suggestions', 'reservations', 'loans', 'fines'],
    () => checkRealtimeNotifications(),
    3500
  );

  useEffect(() => {
    if (!isAuthenticated) return;

    // Run immediately on login/mount
    checkRealtimeNotifications();

    // Periodic polling every 3.5 seconds for quick synchronization
    const interval = setInterval(() => {
      checkRealtimeNotifications();
    }, 3500);

    // Also check on tab focus
    const onFocus = () => {
      checkRealtimeNotifications();
    };
    window.addEventListener('focus', onFocus);

    // Listen for manual trigger (e.g., after borrowing/reserving books)
    const onTrigger = () => {
      checkRealtimeNotifications();
    };
    window.addEventListener('uth-refresh-notifications', onTrigger);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('uth-refresh-notifications', onTrigger);
    };
  }, [isAuthenticated, user?.id, checkRealtimeNotifications]);

  return null;
};

