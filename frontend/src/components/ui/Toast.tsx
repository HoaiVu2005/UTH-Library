import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Check, X, AlertTriangle, Info, ExternalLink } from 'lucide-react';

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
      className="fixed bottom-5 right-5 z-[999999] flex flex-col gap-2.5 max-w-[360px] sm:max-w-[380px] w-full pointer-events-none p-3 sm:p-0"
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
  const [isPaused, setIsPaused] = useState(false);
  const remainingRef = useRef(duration);
  const startRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    startRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss(item.id);
    }, remainingRef.current);
  }, [item.id, onDismiss]);

  useEffect(() => {
    if (duration > 0) {
      startTimer();
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [duration, startTimer]);

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - startRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    }
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    if (remainingRef.current > 0) {
      startTimer();
    } else {
      onDismiss(item.id);
    }
  };

  // React-toastify colored theme color palette & crisp white circular icons
  const config = {
    info: {
      cardBg: 'bg-[#3498db]',
      iconColor: 'text-[#3498db]',
      Icon: Info,
    },
    error: {
      cardBg: 'bg-[#e74c3c]',
      iconColor: 'text-[#e74c3c]',
      Icon: X,
    },
    warning: {
      cardBg: 'bg-[#f1c40f]',
      iconColor: 'text-[#f1c40f]',
      Icon: AlertTriangle,
    },
    success: {
      cardBg: 'bg-[#07bc0c]',
      iconColor: 'text-[#07bc0c]',
      Icon: Check,
    },
  }[item.type];

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
          .replace(/^(sách mượn sách đã sẵn sàng nhận!?:?|thông báo thư viện:?|thông báo:?)\s*/gi, '')
          .replace(/^Chờ nhận sách thành công!\s*Chờ nhận sách thành công!/gi, 'Chờ nhận sách thành công!')
          .trim()
      : item.message;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto w-full text-white rounded-md ${config.cardBg} shadow-lg shadow-black/15 px-4 py-3 min-h-[58px] flex items-center gap-3 transition-all transform animate-in slide-in-from-right-full fade-in duration-250 relative overflow-hidden select-none`}
      role="alert"
    >
      {/* Crisp White Circle Badge with Colored Symbol */}
      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs self-start mt-0.5 sm:self-center sm:mt-0">
        <config.Icon className={`w-3.5 h-3.5 stroke-[3] ${config.iconColor}`} />
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 pr-1 py-0.5">
        {!isGenericTitle && rawTitle && (
          <h5 className="text-[13px] font-bold text-white tracking-tight leading-snug mb-0.5">
            {rawTitle}
          </h5>
        )}
        <div className="text-[13.5px] font-medium text-white leading-snug break-words">
          {cleanMessage}
        </div>

        {/* Action Link / Button if present */}
        {(item.link || item.onAction) && (
          <div className="mt-1.5 flex items-center gap-2">
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
                className="text-xs font-bold text-white underline underline-offset-2 hover:opacity-80 inline-flex items-center gap-1 cursor-pointer transition-opacity"
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
                className="text-xs font-bold text-white underline underline-offset-2 hover:opacity-80 inline-flex items-center gap-1 cursor-pointer transition-opacity"
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
        className="w-5 h-5 text-white/75 hover:text-white flex items-center justify-center shrink-0 ml-auto transition-opacity cursor-pointer self-start -mr-1"
        aria-label="Đóng thông báo"
      >
        <X className="w-4 h-4 stroke-[2.5]" />
      </button>

      {/* Bottom Progress Bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 overflow-hidden">
          <div
            className="h-full bg-white/40"
            style={{
              animation: `shrinkWidth ${duration}ms linear forwards`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          />
        </div>
      )}
    </div>
  );
};
