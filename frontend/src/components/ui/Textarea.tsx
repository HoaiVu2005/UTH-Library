import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
  maxLength?: number;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, isRequired, maxLength, showCount = false, className = '', id, value, ...props }, ref) => {
    const textareaId = id || props.name || Math.random().toString(36).substring(7);
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <label htmlFor={textareaId} className="block text-[13.5px] font-medium text-textPrimary">
              {label}
              {(isRequired || props.required) && <span className="text-danger ml-0.5">*</span>}
            </label>
          )}
          {showCount && maxLength && (
            <span className="text-[11px] text-textSecondary font-mono">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          value={value}
          aria-invalid={Boolean(error)}
          className={cn(
            'block w-full text-sm rounded-lg border bg-white text-textPrimary transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
            'p-3 min-h-[90px]',
            error ? 'border-danger focus:ring-danger/20 focus:border-danger' : 'border-border',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-danger font-medium">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-textSecondary">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

