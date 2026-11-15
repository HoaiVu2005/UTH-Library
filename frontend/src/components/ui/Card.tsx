import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'flat';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'outlined',
  hoverable = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    elevated: 'bg-white border border-border shadow-card',
    outlined: 'bg-white border border-border/80 shadow-2xs',
    flat: 'bg-slate-50 border border-borderSubtle',
  }[variant];

  return (
    <div
      className={cn(
        'rounded-xl text-textPrimary overflow-hidden transition-all',
        variantStyles,
        hoverable && 'card-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={cn('p-5 pb-3 flex flex-col space-y-1.5', className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <h3
      className={cn('text-base font-bold text-textPrimary tracking-tight leading-snug', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <p className={cn('text-xs text-textSecondary leading-normal', className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={cn('p-5 pt-0', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={cn('p-5 pt-3 border-t border-border/60 flex items-center justify-between', className)}
      {...props}
    >
      {children}
    </div>
  );
};

