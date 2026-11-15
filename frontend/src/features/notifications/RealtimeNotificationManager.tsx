import React, { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import { broadcastRealtimeSync } from '@/lib/realtime';

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
                title: '⚠️ Cảnh báo sách quá hạn',
                message: alert.message,
                link: '/loans',
                actionText: 'Xem sách đang mượn',
                duration: 9000,
              });
            } else {
              toast.custom({
                type: 'warning',
                title: '⏰ Nhắc nhở: Sắp đến hạn trả sách (trước 2 ngày)',
                message: alert.message,
                link: '/loans',
                actionText: 'Gia hạn hoặc trả sách',
                duration: 8000,
              });
            }
          }
        });
      }

      // 2. Process latest unread notifications (e.g. Reservation Ready, Fines, etc.)
      if (data.latest_notifications && Array.isArray(data.latest_notifications)) {
        data.latest_notifications.forEach((notif) => {
          const sessionKey = `notif_item_${notif.id}`;
          const alreadyNotified = sessionStorage.getItem(sessionKey);

          if (!alreadyNotified) {
            sessionStorage.setItem(sessionKey, 'true');

            // Determine toast style from type
            let toastType: 'info' | 'warning' | 'success' = 'info';
            let toastTitle = '🔔 Thông báo thư viện';

            if (notif.type === 'reservation_ready') {
              toastType = 'success';
              toastTitle = '✨ Sách đặt trước đã sẵn sàng nhận!';
            } else if (notif.type === 'fine_created') {
              toastType = 'warning';
              toastTitle = '⚠️ Khoản phạt mới phát sinh';
            }

            toast.custom({
              type: toastType,
              title: toastTitle,
              message: notif.content,
              link: notif.link || '/notifications',
              actionText: 'Xem thông báo',
              duration: 7000,
            });
          }

          // Trigger live list refresh for specific modules matching this notification
          const lowerContent = (notif.content || '').toLowerCase();
          if (notif.type === 'suggestion_result' || lowerContent.includes('đề xuất')) {
            broadcastRealtimeSync('suggestions');
          }
          if (notif.type === 'reservation_ready' || lowerContent.includes('giữ chỗ') || lowerContent.includes('đặt trước')) {
            broadcastRealtimeSync('reservations');
          }
          if (notif.type === 'fine_created' || lowerContent.includes('phạt')) {
            broadcastRealtimeSync('fines');
          }
          if (notif.type === 'due_soon' || notif.type === 'overdue' || lowerContent.includes('mượn') || lowerContent.includes('trả')) {
            broadcastRealtimeSync('loans');
          }
        });
      }
    } catch (err) {
      // Silent error during background polling
      console.debug('[RealtimeNotification] Check skipped:', err);
    } finally {
      isCheckingRef.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Run immediately on login/mount
    checkRealtimeNotifications();

    // Periodic polling every 4 seconds for fast realtime web experience
    const interval = setInterval(() => {
      checkRealtimeNotifications();
    }, 4000);

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

