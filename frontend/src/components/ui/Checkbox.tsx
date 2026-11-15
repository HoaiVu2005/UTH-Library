import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className = '', id, checked, ...props }, ref) => {
    const checkboxId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className={cn('relative flex items-start gap-2.5', className)}>
        <div className="flex h-5 items-center">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={checkboxId}
            className={cn(
              'h-4 w-4 rounded border border-border bg-white transition-all cursor-pointer flex items-center justify-center',
              'peer-checked:bg-primary peer-checked:border-primary peer-checked:text-white',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 peer-focus-visible:ring-offset-1',
              'peer-disabled:cursor-not-allowed peer-disabled:bg-slate-100 peer-disabled:border-slate-300',
              error && 'border-danger'
            )}
          >
            <Check className="h-3 w-3 stroke-[3] opacity-0 peer-checked:opacity-100 transition-opacity" />
          </label>
        </div>
        {(label || description) && (
          <div className="text-xs">
            {label && (
              <label
                htmlFor={checkboxId}
                className="font-medium text-textPrimary cursor-pointer select-none leading-none"
              >
                {label}
              </label>
            )}
            {description && <p className="text-textSecondary mt-0.5">{description}</p>}
            {error && <p className="text-danger font-medium mt-0.5">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

