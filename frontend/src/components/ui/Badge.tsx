import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'available'
  | 'borrowed'
  | 'reserved_hold'
  | 'reading_room'
  | 'damaged'
  | 'lost'
  | 'withdrawn'
  | 'active'
  | 'returned'
  | 'overdue'
  | 'pending'
  | 'ready'
  | 'fulfilled'
  | 'expired'
  | 'cancelled'
  | 'unpaid'
  | 'partial'
  | 'paid'
  | 'waived'
  | 'student'
  | 'lecturer'
  | 'admin'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'default';

export interface BadgeProps {
  status?: string;
  variant?: string;
  size?: 'sm' | 'md' | 'lg';
  customText?: string;
  hasDot?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const BADGE_MAP: Record<string, { text: string; bg: string; textCol: string; border: string; dot: string }> = {
  // Generic Variants
  success: { text: 'Thành công', bg: 'bg-emerald-50', textCol: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  danger: { text: 'Nguy hiểm', bg: 'bg-rose-50', textCol: 'text-rose-700', border: 'border-rose-300 font-semibold', dot: 'bg-rose-600' },
  warning: { text: 'Cảnh báo', bg: 'bg-amber-50', textCol: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  info: { text: 'Thông tin', bg: 'bg-sky-50', textCol: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
  default: { text: 'Mặc định', bg: 'bg-slate-100', textCol: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },

  // Copy Status
  available: { text: 'Sẵn sàng', bg: 'bg-emerald-50', textCol: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  borrowed: { text: 'Đang mượn', bg: 'bg-sky-50', textCol: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
  reserved_hold: { text: 'Đang giữ chỗ', bg: 'bg-teal-50', textCol: 'text-teal-800', border: 'border-teal-200', dot: 'bg-teal-600' },
  reading_room: { text: 'Chỉ đọc tại chỗ', bg: 'bg-amber-50', textCol: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' },
  damaged: { text: 'Hư hỏng', bg: 'bg-orange-50', textCol: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  lost: { text: 'Đã mất', bg: 'bg-rose-50', textCol: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  withdrawn: { text: 'Đã thanh lý', bg: 'bg-slate-100', textCol: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },

  // Loan Status
  active: { text: 'Đang mượn', bg: 'bg-sky-50', textCol: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
  returned: { text: 'Đã trả', bg: 'bg-emerald-50', textCol: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  overdue: { text: 'Quá hạn', bg: 'bg-rose-50', textCol: 'text-rose-700', border: 'border-rose-300 font-semibold', dot: 'bg-rose-600' },

  // Reservation Status
  pending: { text: 'Chờ sách (Hàng chờ)', bg: 'bg-amber-50', textCol: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  ready: { text: 'Sẵn sàng nhận', bg: 'bg-teal-50', textCol: 'text-teal-800', border: 'border-teal-300 font-semibold', dot: 'bg-teal-600' },
  fulfilled: { text: 'Đã nhận sách', bg: 'bg-emerald-50', textCol: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  expired: { text: 'Hết hạn giữ', bg: 'bg-slate-100', textCol: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },
  cancelled: { text: 'Đã hủy', bg: 'bg-slate-100', textCol: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },

  // Fine Status
  unpaid: { text: 'Chưa nộp', bg: 'bg-rose-50', textCol: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  partial: { text: 'Đã nộp một phần', bg: 'bg-orange-50', textCol: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  paid: { text: 'Đã thanh toán', bg: 'bg-emerald-50', textCol: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  waived: { text: 'Được miễn', bg: 'bg-purple-50', textCol: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },

  // User Role
  student: { text: 'Sinh viên', bg: 'bg-blue-50', textCol: 'text-navy', border: 'border-blue-200', dot: 'bg-blue-600' },
  lecturer: { text: 'Giảng viên', bg: 'bg-emerald-50', textCol: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-600' },
  admin: { text: 'Thủ thư / Admin', bg: 'bg-teal-50', textCol: 'text-teal-900', border: 'border-teal-300 font-bold', dot: 'bg-teal-700' },
};

export const Badge: React.FC<BadgeProps> = ({
  status,
  variant,
  size = 'md',
  customText,
  hasDot = false,
  children,
  className = '',
}) => {
  const key = (status || variant || 'default').toLowerCase();
  const meta = BADGE_MAP[key] || {
    text: customText || (typeof children === 'string' ? children : key),
    bg: 'bg-slate-100',
    textCol: 'text-textPrimary',
    border: 'border-border',
    dot: 'bg-slate-400',
  };

  const sizeClass =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px] gap-1'
      : size === 'lg'
      ? 'px-3 py-1 text-sm gap-1.5'
      : 'px-2.5 py-0.5 text-xs gap-1.5';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium select-none whitespace-nowrap',
        sizeClass,
        meta.bg,
        meta.textCol,
        meta.border,
        className
      )}
    >
      {hasDot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            meta.dot,
            (key === 'ready' || key === 'overdue') && 'animate-pulse-dot'
          )}
        />
      )}
      {children !== undefined ? children : customText || meta.text}
    </span>
  );
};
