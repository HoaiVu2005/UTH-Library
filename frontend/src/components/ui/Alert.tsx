import React from 'react';
import { Info, CheckCircle2, AlertTriangle, AlertOctagon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  onClose,
  action,
  className = '',
}) => {
  const variantStyles = {
    info: {
      container: 'bg-blue-50/80 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
      titleColor: 'text-blue-900',
    },
    success: {
      container: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      titleColor: 'text-emerald-900',
    },
    warning: {
      container: 'bg-amber-50/80 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      titleColor: 'text-amber-900',
    },
    danger: {
      container: 'bg-rose-50/80 border-rose-200 text-rose-900',
      icon: <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />,
      titleColor: 'text-rose-900',
    },
  }[variant];

  return (
    <div
      className={cn(
        'rounded-xl border p-4 flex items-start gap-3 text-sm relative transition-all shadow-2xs',
        variantStyles.container,
        className
      )}
      role="alert"
    >
      <div className="pt-0.5">{icon || variantStyles.icon}</div>
      <div className="flex-1">
        {title && <h5 className={cn('font-bold tracking-tight text-xs uppercase mb-1', variantStyles.titleColor)}>{title}</h5>}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
        {action && <div className="mt-2.5">{action}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current opacity-60 hover:opacity-100 p-1 rounded-lg transition-opacity -mr-1 -mt-1"
          aria-label="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

