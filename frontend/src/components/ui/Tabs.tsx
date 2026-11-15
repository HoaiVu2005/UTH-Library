import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pills';
  size?: 'sm' | 'md';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onChange,
  variant = 'underline',
  size = 'md',
  className = '',
}) => {
  if (variant === 'pills') {
    return (
      <div
        className={cn(
          'inline-flex p-1 bg-slate-100 rounded-xl border border-border/80 gap-1 overflow-x-auto max-w-full',
          className
        )}
        role="tablist"
      >
        {items.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg font-medium transition-all select-none whitespace-nowrap',
                size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
                isActive
                  ? 'bg-white text-primary-dark font-semibold shadow-xs border border-border/50'
                  : 'text-textSecondary hover:text-textPrimary hover:bg-white/50',
                tab.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none',
                    isActive ? 'bg-primary-light text-primary' : 'bg-slate-200 text-textSecondary'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Underline variant
  return (
    <div
      className={cn('flex border-b border-border space-x-6 overflow-x-auto', className)}
      role="tablist"
    >
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 font-medium border-b-2 transition-all select-none pb-3 pt-1 whitespace-nowrap -mb-px',
              size === 'sm' ? 'text-xs' : 'text-sm',
              isActive
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-textSecondary hover:text-textPrimary hover:border-slate-300',
              tab.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none',
                  isActive ? 'bg-primary text-white' : 'bg-slate-100 text-textSecondary'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

