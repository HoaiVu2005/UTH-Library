import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isRequired?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, isRequired, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || props.name || generatedId;
    const descriptionId = error
      ? `${inputId}-error`
      : helperText
        ? `${inputId}-description`
        : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-[13.5px] font-medium text-textPrimary mb-1.5">
            {label}
            {(isRequired || props.required) && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <div className="relative rounded-lg">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            aria-describedby={descriptionId}
            className={cn(
              'block w-full text-sm rounded-lg border bg-white text-textPrimary transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
              leftIcon ? 'pl-9' : 'pl-3',
              rightIcon ? 'pr-9' : 'pr-3',
              'py-2 h-10',
              error ? 'border-danger focus:ring-danger/20 focus:border-danger' : 'border-border',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-textSecondary">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p id={descriptionId} className="mt-1 text-xs text-danger font-medium">{error}</p>}
        {helperText && !error && <p id={descriptionId} className="mt-1 text-xs text-textSecondary">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
