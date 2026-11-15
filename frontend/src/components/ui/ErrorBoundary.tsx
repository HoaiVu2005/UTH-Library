import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[UTH-Library ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-pageBg flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-6 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-textPrimary">Đã xảy ra lỗi không mong muốn</h2>
              <p className="text-xs text-textSecondary mt-1 leading-relaxed">
                Hệ thống Thư viện UTH đã ghi nhận sự cố. Vui lòng thử tải lại trang hoặc quay về trang chủ.
              </p>
            </div>
            {this.state.error && process.env.NODE_ENV === 'development' && (
              <pre className="text-[11px] font-mono bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto text-left max-h-36">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={this.handleReload} className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tải lại</span>
              </Button>
              <Button variant="primary" size="sm" onClick={this.handleGoHome} className="gap-1.5">
                <Home className="w-3.5 h-3.5" />
                <span>Về trang chủ</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
