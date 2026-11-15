import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Không có dữ liệu',
  description = 'Hiện tại chưa có thông tin nào để hiển thị trong mục này.',
  actionText,
  onAction,
  icon,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white border border-border rounded-xl shadow-card ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-3.5 shadow-2xs">
        {icon || <Inbox className="w-7 h-7" />}
      </div>
      <h3 className="text-sm sm:text-base font-bold text-textPrimary mb-1 tracking-tight">{title}</h3>
      <p className="text-xs text-textSecondary max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};


