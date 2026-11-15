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
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Keep at most 5 toasts
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
      className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-3 sm:p-0"
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
  const duration = item.duration ?? 4000;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(item.id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [item.id, duration, onDismiss]);

  // Colors strictly matched to user's uploaded reference image:
  // Info: Solid Blue (#1E88E5)
  // Error: Solid Red (#E53935)
  // Warning: Solid Amber/Gold (#F59E0B)
  // Success: Solid Green (#16A34A / #2E7D32)
  const config = {
    info: {
      cardClass: 'bg-[#1E88E5] text-white shadow-lg shadow-blue-900/20',
      Icon: Info,
    },
    error: {
      cardClass: 'bg-[#E53935] text-white shadow-lg shadow-red-900/20',
      Icon: AlertCircle,
    },
    warning: {
      cardClass: 'bg-[#F59E0B] text-white shadow-lg shadow-amber-900/20',
      Icon: AlertTriangle,
    },
    success: {
      cardClass: 'bg-[#16A34A] text-white shadow-lg shadow-green-900/20',
      Icon: CheckCircle2,
    },
  }[item.type];

  const Icon = config.Icon;

  // Filter out redundant generic labels per user request: "Chỉ cần hiện đúng thông báo thôi ko cần để 'Lỗi' hay bất kì cái gì"
  const isGenericTitle =
    !item.title ||
    ['thành công', 'lỗi', 'cảnh báo', 'lưu ý', 'thông tin', 'error', 'success', 'warning', 'info'].includes(
      item.title.trim().toLowerCase()
    );

  return (
    <div
      className={`pointer-events-auto rounded-lg shadow-xl px-4 py-3 flex items-center gap-3 transition-all transform animate-in slide-in-from-bottom-3 slide-in-from-right-3 fade-in duration-200 relative overflow-hidden select-none ${config.cardClass}`}
      role="alert"
    >
      {/* Icon (Matches reference) */}
      <div className="shrink-0 flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>

      {/* Message Content (No redundant "Lỗi" or "Thành công" prefix) */}
      <div className="flex-1 min-w-0 pr-1 text-xs sm:text-[13px] font-medium leading-snug whitespace-pre-line text-white">
        {!isGenericTitle && (
          <span className="font-bold mr-1.5 block sm:inline">{item.title}:</span>
        )}
        <span>{item.message}</span>

        {/* Link / Action (Uses safe SPA navigation without Router Context dependency) */}
        {(item.link || item.onAction) && (
          <div className="mt-1 flex items-center gap-2">
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
                className="text-[11px] font-bold text-white underline underline-offset-2 hover:opacity-90 inline-flex items-center gap-1 cursor-pointer"
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
                className="text-[11px] font-bold text-white underline underline-offset-2 hover:opacity-90 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{item.actionText || 'Xử lý ngay'}</span>
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Dismiss Button ✕ */}
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="text-white/80 hover:text-white rounded-md p-1 transition-colors -mr-1 shrink-0 cursor-pointer"
        aria-label="Đóng thông báo"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Auto-dismiss progress bar */}
      {duration > 0 && (
        <div
          className="absolute bottom-0 left-0 h-0.5 w-full bg-white/40"
          style={{
            animation: `shrinkWidth ${duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
};
