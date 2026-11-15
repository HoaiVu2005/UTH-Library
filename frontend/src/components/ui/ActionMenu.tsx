import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActionMenuItem {
  key?: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'danger' | 'warning' | 'purple' | 'info' | 'default';
  disabled?: boolean;
  isDividerBefore?: boolean;
  title?: string;
  onClick: () => void;
}

export interface ActionMenuProps {
  title?: string;
  statusDot?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  items: ActionMenuItem[];
  isNearBottom?: boolean;
  align?: 'right' | 'left';
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  title,
  statusDot,
  items,
  isNearBottom = false,
  align = 'right',
  className = '',
  triggerClassName = '',
  menuClassName = '',
  isOpen: controlledOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof controlledOpen === 'boolean';
  const open = isControlled ? controlledOpen : internalOpen;
  const menuRef = useRef<HTMLDivElement>(null);

  const setOpen = (val: boolean) => {
    if (!isControlled) {
      setInternalOpen(val);
    }
    onOpenChange?.(val);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!items || items.length === 0) {
    return <span className="text-gray-300 select-none font-bold">—</span>;
  }

  const getVariantStyles = (variant: ActionMenuItem['variant'] = 'default') => {
    switch (variant) {
      case 'primary':
        return {
          btn: 'hover:bg-teal-50/80 hover:text-teal-800',
          badge: 'bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white',
        };
      case 'danger':
        return {
          btn: 'hover:bg-rose-50/80 hover:text-rose-700',
          badge: 'bg-rose-50 text-rose-500 group-hover:bg-rose-600 group-hover:text-white',
        };
      case 'warning':
        return {
          btn: 'hover:bg-amber-50/80 hover:text-amber-800',
          badge: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
        };
      case 'purple':
        return {
          btn: 'hover:bg-purple-50/80 hover:text-purple-800',
          badge: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
        };
      case 'info':
        return {
          btn: 'hover:bg-blue-50/80 hover:text-blue-800',
          badge: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
        };
      case 'default':
      default:
        return {
          btn: 'hover:bg-slate-100/90 hover:text-slate-900',
          badge: 'bg-slate-100 text-slate-600 group-hover:bg-slate-700 group-hover:text-white',
        };
    }
  };

  const getDotColor = (dot?: ActionMenuProps['statusDot']) => {
    switch (dot) {
      case 'success':
        return 'bg-emerald-500';
      case 'warning':
        return 'bg-amber-500';
      case 'danger':
        return 'bg-rose-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div ref={menuRef} className={cn('relative inline-block text-left action-menu-container', className)}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150',
          open
            ? 'bg-teal-100/80 text-teal-800 ring-2 ring-teal-500/25 shadow-2xs'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:bg-slate-200',
          triggerClassName
        )}
        title="Thao tác"
        aria-expanded={open}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-50 min-w-[195px] rounded-xl bg-white p-1.5 shadow-xl border border-slate-200/90 text-xs animate-in fade-in-50 zoom-in-95 duration-100 text-left space-y-1',
            align === 'right' ? 'right-0' : 'left-0',
            isNearBottom ? 'bottom-full mb-2' : 'top-full mt-2',
            menuClassName
          )}
        >
          {title && (
            <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none border-b border-slate-100 flex items-center justify-between">
              <span>{title}</span>
              {statusDot && <span className={cn('w-1.5 h-1.5 rounded-full', getDotColor(statusDot))} />}
            </div>
          )}

          <div className="space-y-0.5">
            {items.map((item, idx) => {
              const styles = getVariantStyles(item.variant);

              return (
                <React.Fragment key={item.key || idx}>
                  {item.isDividerBefore && <div className="h-px bg-slate-100 my-1" />}
                  <button
                    type="button"
                    disabled={item.disabled}
                    onClick={() => {
                      setOpen(false);
                      item.onClick();
                    }}
                    title={item.title}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-700 font-medium transition-all group disabled:opacity-40 disabled:cursor-not-allowed',
                      styles.btn
                    )}
                  >
                    {item.icon && (
                      <div
                        className={cn(
                          'w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all shadow-2xs',
                          styles.badge
                        )}
                      >
                        {item.icon}
                      </div>
                    )}
                    <span className="whitespace-nowrap text-xs font-semibold">{item.label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

