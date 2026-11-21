import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  isRequired?: boolean;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, isRequired, containerClassName, children, className = '', id, ...props }, ref) => {
    const selectId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label htmlFor={selectId} className="block text-[13.5px] font-medium text-textPrimary mb-1.5">
            {label}
            {(isRequired || props.required) && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <div className="relative rounded-lg">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={Boolean(error)}
            className={cn(
              'block w-full text-sm rounded-lg border bg-white text-textPrimary appearance-none transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
              'pl-3 pr-9 py-2 h-10',
              error ? 'border-danger focus:ring-danger/20 focus:border-danger' : 'border-border',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-textSecondary">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-danger font-medium">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-textSecondary">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

