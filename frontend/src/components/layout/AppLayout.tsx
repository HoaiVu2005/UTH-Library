import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { SidebarDrawer } from './SidebarDrawer';
import { RealtimeNotificationManager } from '@/features/notifications/RealtimeNotificationManager';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-pageBg text-textPrimary">
      <RealtimeNotificationManager />
      <Header onToggleSidebar={() => setSidebarOpen(true)} />
      <SidebarDrawer isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className={`flex-1 w-full ${isHomePage ? '' : 'max-w-container mx-auto p-4 sm:p-6 lg:p-6'}`}>
        <Outlet />
      </main>

      <footer className="bg-surface border-t border-border py-6 text-center text-xs text-textSecondary mt-auto">
        <div className="max-w-container mx-auto px-4 space-y-1">
          <p className="font-bold text-textPrimary">
            Trường Đại học Giao thông vận tải Thành phố Hồ Chí Minh (UTH)
          </p>
          <p className="text-[12px] text-textSecondary">
            Số 2, Đường Võ Oanh, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh | Email: library@uth.edu.vn | Hotline: (028) 3899 1373
          </p>
          <p className="text-[11px] text-textTertiary pt-1">
            Hệ thống Quản lý Thư viện Số UTH &copy; 2026. Mọi quyền được bảo lưu.
          </p>
        </div>
      </footer>
    </div>
  );
};
