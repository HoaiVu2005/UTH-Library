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
  success: (message: React.ReactNode, titleOrOptions?: string | ToastOptions, duration = 4000) => {
    const parsed = parseToastArgs(message, titleOrOptions, duration);
    toastListeners.forEach((fn) => fn({ ...parsed, type: 'success', duration: parsed.duration || 4000 }));
  },
  error: (message: React.ReactNode, titleOrOptions?: string | ToastOptions, duration = 5000) => {
    const parsed = parseToastArgs(message, titleOrOptions, duration);
    toastListeners.forEach((fn) => fn({ ...parsed, type: 'error', duration: parsed.duration || 5000 }));
  },
  warning: (message: React.ReactNode, titleOrOptions?: string | ToastOptions, duration = 4500) => {
    const parsed = parseToastArgs(message, titleOrOptions, duration);
    toastListeners.forEach((fn) => fn({ ...parsed, type: 'warning', duration: parsed.duration || 4500 }));
  },
  info: (message: React.ReactNode, titleOrOptions?: string | ToastOptions, duration = 4000) => {
    const parsed = parseToastArgs(message, titleOrOptions, duration);
    toastListeners.forEach((fn) => fn({ ...parsed, type: 'info', duration: parsed.duration || 4000 }));
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
    setToasts((prev) => {
      // Prevent duplicate identical toasts from stacking simultaneously
      const isDuplicate = prev.some(
        (t) =>
          typeof t.message === 'string' &&
          typeof toastData.message === 'string' &&
          t.message.trim() === toastData.message.trim()
      );
      if (isDuplicate) return prev;
      return [newToast, ...prev.slice(0, 2)]; // Keep at most 3 toasts
    });
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
      className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 max-w-[460px] sm:max-w-[480px] w-full pointer-events-none p-3 sm:p-0"
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

  // Original solid colors preserved as requested:
  // Info: Solid Blue (#1E88E5)
  // Error: Solid Red (#E53935)
  // Warning: Solid Amber (#F59E0B)
  // Success: Solid Green (#16A34A)
  const config = {
    info: {
      cardBg: 'bg-[#1E88E5]',
      shadow: 'shadow-xl shadow-blue-950/20',
      Icon: Info,
    },
    error: {
      cardBg: 'bg-[#E53935]',
      shadow: 'shadow-xl shadow-red-950/20',
      Icon: AlertCircle,
    },
    warning: {
      cardBg: 'bg-[#F59E0B]',
      shadow: 'shadow-xl shadow-amber-950/20',
      Icon: AlertTriangle,
    },
    success: {
      cardBg: 'bg-[#16A34A]',
      shadow: 'shadow-xl shadow-green-950/20',
      Icon: CheckCircle2,
    },
  }[item.type];

  const Icon = config.Icon;

  // Clean title: Filter generic words
  const rawTitle = item.title ? item.title.replace(/[✨🎉⚠️⏰🔔📦📚ℹ️]/g, '').trim() : '';
  const isGenericTitle =
    !rawTitle ||
    ['thành công', 'lỗi', 'cảnh báo', 'lưu ý', 'thông tin', 'error', 'success', 'warning', 'info'].includes(
      rawTitle.toLowerCase()
    );

  // Format message: Clean repetitive sentences and trim excess length
  const cleanMessage =
    typeof item.message === 'string'
      ? item.message
          .replace(/^[✨🎉⚠️⏰🔔📦📚ℹ️]\s*/g, '')
          .replace(/^(sách đặt trước đã sẵn sàng nhận!?:?|thông báo thư viện:?|thông báo:?)\s*/gi, '')
          .replace(/^Giữ chỗ thành công!\s*Giữ chỗ thành công!/gi, 'Giữ chỗ thành công!')
          .trim()
      : item.message;

  return (
    <div
      className={`pointer-events-auto w-full text-white rounded-2xl ${config.cardBg} ${config.shadow} px-5 py-4 min-h-[82px] flex items-start gap-4 transition-all transform animate-in slide-in-from-bottom-3 slide-in-from-right-3 fade-in duration-200 relative overflow-hidden select-none border border-white/20`}
      role="alert"
    >
      {/* Icon in translucent badge */}
      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner mt-0.5">
        <Icon className="w-5 h-5 text-white" />
      </div>

      {/* Content Area - Spacious & well-formatted */}
      <div className="flex-1 min-w-0 pr-1 py-0.5">
        {!isGenericTitle && rawTitle && (
          <h5 className="text-[14px] font-bold text-white tracking-tight leading-snug">
            {rawTitle}
          </h5>
        )}
        <div className={`text-xs sm:text-[13px] text-white/95 leading-relaxed ${!isGenericTitle && rawTitle ? 'mt-1' : ''} line-clamp-3`}>
          {cleanMessage}
        </div>

        {/* Action Link / Button */}
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
                className="text-xs font-bold text-white underline underline-offset-4 hover:text-white/80 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>{item.actionText || 'Xem chi tiết'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : item.onAction ? (
              <button
                type="button"
                onClick={() => {
                  item.onAction?.();
                  onDismiss(item.id);
                }}
                className="text-xs font-bold text-white underline underline-offset-4 hover:text-white/80 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
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
        className="w-7 h-7 rounded-lg text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition-colors shrink-0 -mr-1 mt-0.5 cursor-pointer"
        aria-label="Đóng thông báo"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Subtle Progress Bar */}
      {duration > 0 && (
        <div
          className="absolute bottom-0 left-0 h-1 w-full bg-white/25"
          style={{
            animation: `shrinkWidth ${duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
};
