import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, ExternalLink } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: React.ReactNode;
  duration?: number;
  link?: string;
  actionText?: string;
  onAction?: () => void;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Standalone event-bus for calling toast outside of React components
type ToastListener = (toast: Omit<ToastItem, 'id'>) => void;
const toastListeners = new Set<ToastListener>();

export type ToastOptions = {
  title?: string;
  duration?: number;
  link?: string;
  actionText?: string;
  onAction?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
};

function parseToastArgs(
  message: React.ReactNode,
  titleOrOptions?: string | ToastOptions,
  maybeDuration?: number
): Omit<ToastItem, 'id'> {
  if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
    return {
      type: 'info',
      message,
      title: titleOrOptions.title,
      duration: titleOrOptions.duration,
      link: titleOrOptions.link,
      actionText: titleOrOptions.actionText || titleOrOptions.action?.label,
      onAction: titleOrOptions.onAction || titleOrOptions.action?.onClick,
    };
  }
  return {
    type: 'info',
    message,
    title: typeof titleOrOptions === 'string' ? titleOrOptions : undefined,
    duration: maybeDuration,
  };
}

export const toast = {
  success: (message: React.ReactNode, titleOrOptions?: string | ToastOptions, duration = 3500) => {
    const parsed = parseToastArgs(message, titleOrOptions, duration);
    toastListeners.forEach((fn) => fn({ ...parsed, type: 'success', duration: parsed.duration || 3500 }));
  },
  error: (message: React.ReactNode, titleOrOptions?: string | ToastOptions, duration = 4500) => {
    const parsed = parseToastArgs(message, titleOrOptions, duration);
    toastListeners.forEach((fn) => fn({ ...parsed, type: 'error', duration: parsed.duration || 4500 }));
  },
  warning: (message: React.ReactNode, titleOrOptions?: string | ToastOptions, duration = 4000) => {
    const parsed = parseToastArgs(message, titleOrOptions, duration);
    toastListeners.forEach((fn) => fn({ ...parsed, type: 'warning', duration: parsed.duration || 4000 }));
  },
  info: (message: React.ReactNode, titleOrOptions?: string | ToastOptions, duration = 3500) => {
    const parsed = parseToastArgs(message, titleOrOptions, duration);
    toastListeners.forEach((fn) => fn({ ...parsed, type: 'info', duration: parsed.duration || 3500 }));
  },
  custom: (options: Omit<ToastItem, 'id'>) => {
    toastListeners.forEach((fn) => fn(options));
  },
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toastData: Omit<ToastItem, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = { ...toastData, id };
    setToasts((prev) => [newToast, ...prev.slice(0, 3)]); // Keep at most 4 toasts to avoid clutter
    return id;
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  useEffect(() => {
    const listener: ToastListener = (data) => {
      addToast(data);
    };
    toastListeners.add(listener);
    return () => {
      toastListeners.delete(listener);
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-2 max-w-[380px] w-full pointer-events-none p-3 sm:p-0"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{
  item: ToastItem;
  onDismiss: (id: string) => void;
}> = ({ item, onDismiss }) => {
  const duration = item.duration ?? 4500;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(item.id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [item.id, duration, onDismiss]);

  // Clean, modern styling: White cards with subtle border, soft shadow, and crisp status badge
  const config = {
    info: {
      badgeClass: 'bg-teal-50 text-[#008B8B] border border-teal-200/70',
      progressBar: 'bg-[#008B8B]',
      Icon: Info,
    },
    error: {
      badgeClass: 'bg-rose-50 text-rose-600 border border-rose-200/70',
      progressBar: 'bg-rose-500',
      Icon: AlertCircle,
    },
    warning: {
      badgeClass: 'bg-amber-50 text-amber-600 border border-amber-200/70',
      progressBar: 'bg-amber-500',
      Icon: AlertTriangle,
    },
    success: {
      badgeClass: 'bg-emerald-50 text-emerald-600 border border-emerald-200/70',
      progressBar: 'bg-emerald-500',
      Icon: CheckCircle2,
    },
  }[item.type];

  const Icon = config.Icon;

  // Clean title: Strip excessive emojis or redundant prefixes
  const rawTitle = item.title ? item.title.replace(/[✨🎉⚠️⏰🔔📦📚ℹ️]/g, '').trim() : '';
  const isGenericTitle =
    !rawTitle ||
    ['thành công', 'lỗi', 'cảnh báo', 'lưu ý', 'thông tin', 'error', 'success', 'warning', 'info'].includes(
      rawTitle.toLowerCase()
    );

  return (
    <div
      className="pointer-events-auto w-full bg-white rounded-xl shadow-lg shadow-slate-900/6 border border-slate-200/80 p-3.5 flex items-start gap-3 transition-all transform animate-in slide-in-from-bottom-2 slide-in-from-right-2 fade-in duration-200 relative overflow-hidden select-none"
      role="alert"
    >
      {/* Icon Badge */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${config.badgeClass}`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content Area - Separates title and message into distinct typographic hierarchy */}
      <div className="flex-1 min-w-0 pr-1">
        {!isGenericTitle && rawTitle && (
          <h5 className="text-[13px] font-semibold text-slate-900 tracking-tight leading-snug">
            {rawTitle}
          </h5>
        )}
        <div className={`text-xs text-slate-600 leading-relaxed ${!isGenericTitle && rawTitle ? 'mt-0.5' : ''}`}>
          {item.message}
        </div>

        {/* Action Link */}
        {(item.link || item.onAction) && (
          <div className="mt-2 flex items-center gap-2">
            {item.link ? (
              <a
                href={item.link}
                onClick={(e) => {
                  e.preventDefault();
                  onDismiss(item.id);
                  if (item.link?.startsWith('/')) {
                    window.history.pushState(null, '', item.link);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  } else if (item.link) {
                    window.location.href = item.link;
                  }
                }}
                className="text-[11.5px] font-semibold text-[#008B8B] hover:text-[#006F70] hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{item.actionText || 'Xem chi tiết'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : item.onAction ? (
              <button
                type="button"
                onClick={() => {
                  item.onAction?.();
                  onDismiss(item.id);
                }}
                className="text-[11.5px] font-semibold text-[#008B8B] hover:text-[#006F70] hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{item.actionText || 'Xử lý ngay'}</span>
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="w-6 h-6 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0 -mr-1 -mt-0.5 cursor-pointer"
        aria-label="Đóng thông báo"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Subtle Auto-dismiss progress bar */}
      {duration > 0 && (
        <div
          className={`absolute bottom-0 left-0 h-0.5 w-full opacity-60 ${config.progressBar}`}
          style={{
            animation: `shrinkWidth ${duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
};
