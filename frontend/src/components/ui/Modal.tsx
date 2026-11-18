import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  children: React.ReactNode;
  closeOnOutsideClick?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  closeOnOutsideClick = true,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key & lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
    '2xl': 'max-w-4xl',
    '3xl': 'max-w-5xl',
    '4xl': 'max-w-6xl',
    '5xl': 'max-w-7xl',
    full: 'max-w-[96vw]',
  }[size];

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-2xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (closeOnOutsideClick && e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className={cn(
          'relative w-full bg-white rounded-2xl shadow-modal border border-border flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150',
          sizeClasses,
          className
        )}
      >
        {(title || description) && (
          <div className="px-6 py-4 border-b border-border flex items-start justify-between bg-slate-50/80 shrink-0">
            <div>
              {title && <h3 className="text-base font-semibold text-textPrimary tracking-tight">{title}</h3>}
              {description && <p className="text-xs text-textSecondary mt-0.5">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-slate-200/60 transition-colors focus:outline-none"
              aria-label="Đóng hộp thoại"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export const ModalHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={cn('px-6 py-4 border-b border-border flex items-center justify-between shrink-0', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const ModalBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={cn('p-6 overflow-y-auto flex-1 min-h-0 space-y-4 text-sm', className)} {...props}>
      {children}
    </div>
  );
};

export const ModalFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={cn(
        'px-6 py-3.5 bg-slate-50/90 border-t border-border flex items-center justify-end space-x-2.5 shrink-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
