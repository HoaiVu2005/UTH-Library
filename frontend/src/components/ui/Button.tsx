import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'subtle';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center whitespace-nowrap shrink-0 font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-interaction select-none';

  const sizeClasses = {
    xs: 'text-xs px-2.5 py-1 h-7 gap-1',
    sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
    md: 'text-sm px-4 py-2 h-10 gap-2',
    lg: 'text-base px-6 py-2.5 h-11 gap-2.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-primary hover:bg-primary-hover active:bg-primary-dark text-white shadow-xs font-semibold',
    secondary:
      'bg-primary-light hover:bg-[#D6ECEB] text-primary-dark font-medium border border-primary/20',
    subtle:
      'bg-slate-100 hover:bg-slate-200 text-textPrimary font-medium border border-border',
    ghost:
      'bg-transparent hover:bg-slate-100 text-textPrimary',
    danger:
      'bg-danger hover:bg-danger-hover active:bg-danger-dark text-white shadow-xs font-semibold',
    outline:
      'border border-brand bg-white hover:bg-teal-50/70 text-brand shadow-2xs font-semibold',
  }[variant];

  return (
    <button
      className={cn(baseClasses, sizeClasses, variantClasses, className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
