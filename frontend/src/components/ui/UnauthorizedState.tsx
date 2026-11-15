import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

export const UnauthorizedState: React.FC<{ message?: string }> = ({
  message = 'Bạn không có quyền truy cập vào chức năng hoặc trang này.',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-surface border border-line rounded-lg shadow-sm max-w-md mx-auto my-12">
      <div className="w-16 h-16 rounded-full bg-red-100 text-danger flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-lg font-bold text-ink mb-1">Không có quyền truy cập (403)</h2>
      <p className="text-xs text-muted mb-6">{message}</p>
      <div className="flex space-x-3">
        <Link to="/">
          <Button variant="secondary" size="sm">
            Về trang chủ
          </Button>
        </Link>
        <Link to="/login">
          <Button variant="primary" size="sm">
            Đăng nhập lại
          </Button>
        </Link>
      </div>
    </div>
  );
};

