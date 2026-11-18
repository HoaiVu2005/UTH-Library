/**
 * UTH Library Master Design System Tokens & Configuration
 * Standardized constants for typography, color palette, spacing, and component variants.
 */

export const DESIGN_TOKENS = {
  colors: {
    // Primary Brand (UTH Teal)
    primary: {
      50: '#E6F4F3',
      100: '#CCE7E8',
      200: '#99CFD1',
      300: '#66B8BA',
      400: '#33A0A3',
      500: '#008B8B', // Main brand
      600: '#007A7A', // Hover
      700: '#006F70', // Dark
      800: '#005456', // Deeper
      900: '#003A3C',
    },
    // Accent (UTH Orange / Warning Alert)
    accent: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#ED6C02', // Main accent
      600: '#EA580C',
      700: '#C2410C',
      800: '#9A3412',
    },
    // Neutrals / Slate Scale
    neutral: {
      canvas: '#F3F6F8', // Page background
      surface: '#FFFFFF', // Card surface
      cell: '#F8FAFC', // Table zebra row
      border: '#E2E8F0', // Card and element dividers
      borderSubtle: '#F1F5F9',
      borderStrong: '#CBD5E1',
      textPrimary: '#263238', // Main text / Ink
      textSecondary: '#64748B', // Subtext / Muted
      textTertiary: '#94A3B8', // Placeholder / Hints
    },
    // Semantics
    semantic: {
      success: {
        bg: '#F0FDF4',
        text: '#16A34A',
        border: '#BBF7D0',
        solid: '#16A34A',
        hover: '#15803D',
      },
      warning: {
        bg: '#FEFCE8',
        text: '#D97706',
        border: '#FEF08A',
        solid: '#F59E0B',
        hover: '#D97706',
      },
      danger: {
        bg: '#FEF2F2',
        text: '#DC2626',
        border: '#FECACA',
        solid: '#EF4444',
        hover: '#DC2626',
      },
      info: {
        bg: '#EFF6FF',
        text: '#2563EB',
        border: '#BFDBFE',
        solid: '#3B82F6',
        hover: '#2563EB',
      },
    },
  },
  typography: {
    fontFamily: {
      sans: ['"Be Vietnam Pro"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['"JetBrains Mono"', 'monospace'],
    },
    pageTitle: 'text-2xl sm:text-3xl font-bold tracking-tight text-slate-800',
    sectionTitle: 'text-lg sm:text-xl font-bold tracking-tight text-slate-800',
    cardTitle: 'text-base font-semibold text-slate-800',
    bodyText: 'text-sm text-slate-700 leading-relaxed',
    subtext: 'text-xs text-slate-500 font-medium',
    caption: 'text-[11px] text-slate-400 font-medium tracking-wide',
  },
  borderRadius: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '14px',
    '2xl': '16px',
    full: '9999px',
  },
  shadows: {
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    cardHover: '0 6px 16px -2px rgba(0, 139, 139, 0.08), 0 3px 8px -2px rgba(0, 0, 0, 0.04)',
    dropdown: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    modal: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  spacing: {
    cardPadding: 'p-4 sm:p-5 lg:p-6',
    modalPadding: 'p-5 sm:p-6',
    tablePadding: 'px-4 py-3',
    inputPadding: 'px-3.5 py-2.5',
    buttonPadding: {
      sm: 'px-3 py-1.5',
      md: 'px-4 py-2',
      lg: 'px-5 py-2.5',
    },
  },
} as const;

export const REPORT_CHART_COLORS = {
  recoveryGauge: DESIGN_TOKENS.colors.primary[500],
  recoveryText: DESIGN_TOKENS.colors.primary[700],
} as const;

/**
 * Standard Status definitions for Books, Copies, Loans, Reservations, and Fines.
 */
export const STATUS_DEFINITIONS: Record<
  string,
  {
    label: string;
    variant: 'success' | 'warning' | 'danger' | 'info' | 'default';
    bg: string;
    text: string;
    border: string;
    dotColor?: string;
  }
> = {
  // Copy Statuses
  available: {
    label: 'Sẵn sàng',
    variant: 'success',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  borrowed: {
    label: 'Đang mượn',
    variant: 'info',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    dotColor: 'bg-sky-500',
  },
  reserved_hold: {
    label: 'Đang giữ chỗ',
    variant: 'default',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-200',
    dotColor: 'bg-teal-600',
  },
  reading_room: {
    label: 'Chỉ đọc tại chỗ',
    variant: 'warning',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dotColor: 'bg-amber-500',
  },
  damaged: {
    label: 'Hư hỏng',
    variant: 'warning',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dotColor: 'bg-orange-500',
  },
  lost: {
    label: 'Đã mất',
    variant: 'danger',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dotColor: 'bg-rose-500',
  },
  withdrawn: {
    label: 'Đã thanh lý',
    variant: 'default',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    dotColor: 'bg-slate-400',
  },

  // Loan Statuses
  active: {
    label: 'Đang mượn',
    variant: 'info',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    dotColor: 'bg-sky-500',
  },
  returned: {
    label: 'Đã trả',
    variant: 'success',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  overdue: {
    label: 'Quá hạn',
    variant: 'danger',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-300',
    dotColor: 'bg-rose-600',
  },

  // Reservation Statuses
  pending: {
    label: 'Chờ sách (Hàng chờ)',
    variant: 'warning',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dotColor: 'bg-amber-500',
  },
  ready: {
    label: 'Sẵn sàng nhận',
    variant: 'success',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-300',
    dotColor: 'bg-teal-600',
  },
  fulfilled: {
    label: 'Đã nhận sách',
    variant: 'success',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  expired: {
    label: 'Hết hạn giữ',
    variant: 'default',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    dotColor: 'bg-slate-400',
  },
  cancelled: {
    label: 'Đã hủy',
    variant: 'default',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    dotColor: 'bg-slate-400',
  },

  // Fine Statuses
  unpaid: {
    label: 'Chưa nộp',
    variant: 'danger',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dotColor: 'bg-rose-500',
  },
  partial: {
    label: 'Đã nộp một phần',
    variant: 'warning',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dotColor: 'bg-orange-500',
  },
  paid: {
    label: 'Đã thanh toán',
    variant: 'success',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  waived: {
    label: 'Được miễn',
    variant: 'default',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-200',
    dotColor: 'bg-teal-500',
  },

  // Roles
  student: {
    label: 'Sinh viên',
    variant: 'info',
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    border: 'border-sky-200',
    dotColor: 'bg-sky-500',
  },
  lecturer: {
    label: 'Giảng viên',
    variant: 'success',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dotColor: 'bg-emerald-600',
  },
  admin: {
    label: 'Thủ thư / Admin',
    variant: 'default',
    bg: 'bg-teal-50',
    text: 'text-teal-900',
    border: 'border-teal-300',
    dotColor: 'bg-teal-700',
  },
};

