import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message?: string;
  description?: string;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  description,
  confirmText,
  confirmLabel,
  cancelText,
  cancelLabel,
  variant = 'primary',
  isLoading = false,
  onConfirm,
  onCancel,
  onClose,
}) => {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const bodyText = message || description || '';
  const confirmBtnText = confirmText || confirmLabel || 'Xác nhận';
  const cancelBtnText = cancelText || cancelLabel || 'Hủy bỏ';
  const handleCancel = onCancel || onClose || (() => {});

  const iconVariants = {
    danger: {
      bg: 'bg-rose-50 text-danger border-rose-200',
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    warning: {
      bg: 'bg-amber-50 text-warning border-amber-200',
      icon: <AlertCircle className="w-5 h-5" />,
    },
    primary: {
      bg: 'bg-primary-light text-primary border-primary/20',
      icon: <Info className="w-5 h-5" />,
    },
  }[variant];

  const dialogContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-modal border border-border max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
        <div className="flex items-start space-x-3.5">
          <div className={cn('p-2.5 rounded-xl border shrink-0', iconVariants.bg)}>
            {iconVariants.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-textPrimary tracking-tight">{title}</h3>
            {bodyText && <p className="text-xs text-textSecondary mt-1.5 leading-relaxed">{bodyText}</p>}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2 pt-2">
          <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isLoading}>
            {cancelBtnText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmBtnText}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
};
