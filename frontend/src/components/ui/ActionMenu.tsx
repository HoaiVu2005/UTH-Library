import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

interface Coords {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  openUpwards: boolean;
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

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<Coords>({ openUpwards: false });

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Check if trigger button is visible / in viewport
    if (rect.bottom < 0 || rect.top > viewportHeight || rect.width === 0) {
      setOpen(false);
      return;
    }

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = isNearBottom || (spaceBelow < 200 && spaceAbove > spaceBelow);

    let top: number | undefined = undefined;
    let bottom: number | undefined = undefined;

    if (openUp) {
      bottom = viewportHeight - rect.top + 6;
    } else {
      top = rect.bottom + 6;
    }

    let left: number | undefined = undefined;
    let right: number | undefined = undefined;

    if (align === 'left') {
      left = Math.max(8, Math.min(rect.left, viewportWidth - 220));
    } else {
      const idealRight = viewportWidth - rect.right;
      right = Math.max(8, Math.min(idealRight, viewportWidth - 220));
    }

    setCoords({ top, bottom, left, right, openUpwards: openUp });
  };

  const setOpen = (val: boolean) => {
    if (val) {
      updatePosition();
    }
    if (!isControlled) {
      setInternalOpen(val);
    }
    onOpenChange?.(val);
  };

  // Keep coords updated on scroll / resize & handle clicks outside
  useEffect(() => {
    if (!open) return;

    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, align, isNearBottom]);

  // Spotlight effect: toggle active row class on parent tr/card and container tbody
  useEffect(() => {
    if (!containerRef.current) return;
    const tr = containerRef.current.closest('tr');
    const tbody = tr?.parentElement;
    const card = containerRef.current.closest('.action-card');

    if (open) {
      if (tr && tbody) {
        tr.classList.add('table-row-active-menu');
        tbody.classList.add('table-tbody-has-active-menu');
      }
      if (card) {
        card.classList.add('action-card-active');
      }
    }

    return () => {
      if (tr && tbody) {
        tr.classList.remove('table-row-active-menu');
        if (!tbody.querySelector('.table-row-active-menu')) {
          tbody.classList.remove('table-tbody-has-active-menu');
        }
      }
      if (card) {
        card.classList.remove('action-card-active');
      }
    };
  }, [open]);

  if (!items || items.length === 0) {
    return <span className="text-gray-300 select-none font-bold">—</span>;
  }

  const getVariantStyles = (variant: ActionMenuItem['variant'] = 'default') => {
    switch (variant) {
      case 'primary':
        return {
          btn: 'hover:bg-teal-50/90 hover:text-teal-900',
          badge: 'bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white',
        };
      case 'danger':
        return {
          btn: 'hover:bg-rose-50/90 hover:text-rose-800',
          badge: 'bg-rose-50 text-rose-500 group-hover:bg-rose-600 group-hover:text-white',
        };
      case 'warning':
        return {
          btn: 'hover:bg-amber-50/90 hover:text-amber-900',
          badge: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
        };
      case 'purple':
        return {
          btn: 'hover:bg-purple-50/90 hover:text-purple-900',
          badge: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
        };
      case 'info':
        return {
          btn: 'hover:bg-blue-50/90 hover:text-blue-900',
          badge: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
        };
      case 'default':
      default:
        return {
          btn: 'hover:bg-slate-100 hover:text-slate-900',
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
    <div
      ref={containerRef}
      className={cn(
        'relative inline-block text-left action-menu-container',
        open && 'action-menu-open',
        className
      )}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150',
          open
            ? 'bg-[#008B8B] text-white shadow-sm ring-2 ring-[#008B8B]/25 scale-105'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:bg-slate-200',
          triggerClassName
        )}
        title="Thao tác"
        aria-expanded={open}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              left: coords.left !== undefined ? `${coords.left}px` : undefined,
              right: coords.right !== undefined ? `${coords.right}px` : undefined,
              maxHeight: coords.openUpwards
                ? `calc(100vh - ${(coords.bottom ?? 0)}px - 16px)`
                : `calc(100vh - ${(coords.top ?? 0)}px - 16px)`,
            }}
            className={cn(
              'z-[9990] min-w-[200px] max-w-[280px] overflow-y-auto rounded-xl bg-white p-1.5 shadow-2xl border border-slate-200/90 text-xs text-left space-y-1',
              coords.openUpwards ? 'dropdown-enter-up' : 'dropdown-enter-down',
              menuClassName
            )}
            onClick={(e) => e.stopPropagation()}
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
                      onClick={(e) => {
                        e.stopPropagation();
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
          </div>,
          document.body
        )}
    </div>
  );
};


