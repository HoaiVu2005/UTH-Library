import React, { useState, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { SidebarDrawer } from './SidebarDrawer';
import { Footer } from './Footer';
import { RealtimeNotificationManager } from '@/features/notifications/RealtimeNotificationManager';

const PageFallback: React.FC = () => (
  <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3 py-16 animate-pulse">
    <div className="w-9 h-9 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
    <span className="text-xs text-gray-500 font-medium tracking-tight">Đang tải dữ liệu trang...</span>
  </div>
);

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return (
      <div className="min-h-screen w-full bg-white text-textPrimary">
        <RealtimeNotificationManager />
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-pageBg text-textPrimary">
      <RealtimeNotificationManager />
      <Header onToggleSidebar={() => setSidebarOpen(true)} />
      <SidebarDrawer isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className={`flex-1 w-full ${isHomePage ? '' : 'max-w-container mx-auto p-4 sm:p-6 lg:p-6'}`}>
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
};
