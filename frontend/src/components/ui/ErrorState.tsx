import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Đã xảy ra lỗi',
  message = 'Không thể tải được dữ liệu từ hệ thống. Vui lòng thử lại sau.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-red-50/50 border border-red-200 rounded-lg ${className}`}>
      <div className="w-12 h-12 rounded-full bg-red-100 text-danger flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-danger mb-1">{title}</h3>
      <p className="text-xs text-muted max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="bg-white">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Thử lại
        </Button>
      )}
    </div>
  );
};

