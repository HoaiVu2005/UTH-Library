import React, { lazy, useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet, useRouteError } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { UnauthorizedState } from '@/components/ui/UnauthorizedState';
import { LoginPage } from '@/pages/LoginPage';
import { AlertCircle, RefreshCw } from 'lucide-react';

const RouteErrorFallback: React.FC = () => {
  const error: any = useRouteError();

  useEffect(() => {
    console.error('RouteErrorFallback caught error:', error);
    const msg = error?.message || String(error);
    // Tự động reload để nạp bundle mới nhất nếu gặp lỗi chunk mismatch hoặc 504 Outdated Optimize Dep
    if (
      msg.includes('dynamically imported module') ||
      msg.includes('Failed to fetch') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('Outdated Optimize Dep')
    ) {
      const lastRetry = sessionStorage.getItem('chunk_retry_ts');
      const now = Date.now();
      if (!lastRetry || now - Number(lastRetry) > 4000) {
        sessionStorage.setItem('chunk_retry_ts', String(now));
        window.location.reload();
      }
    }
  }, [error]);

  const handleHardReload = () => {
    sessionStorage.clear();
    window.location.href = window.location.href;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-base">Đã xảy ra sự cố khi tải trang</h3>
          <p className="text-xs text-slate-500 mt-1">
            Mã ứng dụng vừa được cập nhật phiên bản mới hoặc kết nối mạng bị gián đoạn.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-2.5">
          <button
            onClick={handleHardReload}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#008B8B] text-white rounded-xl hover:bg-[#007272] transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tải lại trang</span>
          </button>
          <a
            href="/"
            className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Về trang chủ
          </a>
        </div>
      </div>
    </div>
  );
};

// Helper lazy loading with automatic retry for chunk mismatch / outdated optimize deps
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error: any) {
      const msg = error?.message || String(error);
      const isChunkError =
        msg.includes('dynamically imported module') ||
        msg.includes('Failed to fetch') ||
        msg.includes('Importing a module script failed') ||
        msg.includes('Outdated Optimize Dep');

      if (isChunkError && typeof window !== 'undefined') {
        const key = 'chunk_retry_' + window.location.pathname;
        const lastRetry = sessionStorage.getItem(key);
        const now = Date.now();
        if (!lastRetry || now - Number(lastRetry) > 3000) {
          sessionStorage.setItem(key, String(now));
          window.location.reload();
          return new Promise(() => {});
        }
      }
      throw error;
    }
  });
}

// Public Pages (Lazy Loaded with Auto-Retry)
const HomePage = lazyWithRetry(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const BookSearchPage = lazyWithRetry(() => import('@/pages/BookSearchPage').then((m) => ({ default: m.BookSearchPage })));
const BookDetailPage = lazyWithRetry(() => import('@/pages/BookDetailPage').then((m) => ({ default: m.BookDetailPage })));
const DigitalLibraryPage = lazyWithRetry(() => import('@/pages/digital/DigitalLibraryPage').then((m) => ({ default: m.DigitalLibraryPage })));
const DigitalDocumentDetailPage = lazyWithRetry(() => import('@/pages/digital/DigitalDocumentDetailPage').then((m) => ({ default: m.DigitalDocumentDetailPage })));

// Patron Pages (Lazy Loaded with Auto-Retry)
const DashboardPage = lazyWithRetry(() => import('@/pages/patron/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const MyLoansPage = lazyWithRetry(() => import('@/pages/patron/MyLoansPage').then((m) => ({ default: m.MyLoansPage })));
const MyReservationsPage = lazyWithRetry(() => import('@/pages/patron/MyReservationsPage').then((m) => ({ default: m.MyReservationsPage })));
const MyFinesPage = lazyWithRetry(() => import('@/pages/patron/MyFinesPage').then((m) => ({ default: m.MyFinesPage })));
const MySuggestionsPage = lazyWithRetry(() => import('@/pages/patron/MySuggestionsPage').then((m) => ({ default: m.MySuggestionsPage })));
const NotificationsPage = lazyWithRetry(() => import('@/pages/patron/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const ProfilePage = lazyWithRetry(() => import('@/pages/patron/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const DigitalReadingHistoryPage = lazyWithRetry(() => import('@/pages/patron/DigitalReadingHistoryPage').then((m) => ({ default: m.DigitalReadingHistoryPage })));

// Admin Pages (Lazy Loaded with Auto-Retry)
const AdminDashboardPage = lazyWithRetry(() => import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const CirculationDeskPage = lazyWithRetry(() => import('@/pages/admin/CirculationDeskPage').then((m) => ({ default: m.CirculationDeskPage })));
const BooksManagementPage = lazyWithRetry(() => import('@/pages/admin/BooksManagementPage').then((m) => ({ default: m.BooksManagementPage })));
const CopiesManagementPage = lazyWithRetry(() => import('@/pages/admin/CopiesManagementPage').then((m) => ({ default: m.CopiesManagementPage })));
const UsersManagementPage = lazyWithRetry(() => import('@/pages/admin/UsersManagementPage').then((m) => ({ default: m.UsersManagementPage })));
const LoansManagementPage = lazyWithRetry(() => import('@/pages/admin/LoansManagementPage').then((m) => ({ default: m.LoansManagementPage })));
const AdminReservationsPage = lazyWithRetry(() => import('@/pages/admin/AdminReservationsPage').then((m) => ({ default: m.AdminReservationsPage })));
const FinesManagementPage = lazyWithRetry(() => import('@/pages/admin/FinesManagementPage').then((m) => ({ default: m.FinesManagementPage })));
const SuggestionsReviewPage = lazyWithRetry(() => import('@/pages/admin/SuggestionsReviewPage').then((m) => ({ default: m.SuggestionsReviewPage })));
const ReportsPage = lazyWithRetry(() => import('@/pages/admin/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const SystemSettingsPage = lazyWithRetry(() => import('@/pages/admin/SystemSettingsPage').then((m) => ({ default: m.SystemSettingsPage })));
const AuditLogsPage = lazyWithRetry(() => import('@/pages/admin/AuditLogsPage').then((m) => ({ default: m.AuditLogsPage })));
const AdminDigitalLibraryPage = lazyWithRetry(() => import('@/pages/admin/digital/AdminDigitalLibraryPage').then((m) => ({ default: m.AdminDigitalLibraryPage })));

// Guard for authenticated users
export const ProtectedRoute: React.FC<{ allowedRoles?: string[] }> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <UnauthorizedState />;
  }

  return <Outlet />;
};

const AdminIndexRedirect: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'librarian') {
    return <Navigate to="/admin/circulation" replace />;
  }
  return <Navigate to="/admin/dashboard" replace />;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorFallback />,
    children: [
      // Public Routes
      { index: true, element: <HomePage /> },
      { path: 'search', element: <BookSearchPage /> },
      { path: 'books/:id', element: <BookDetailPage /> },
      { path: 'digital-library', element: <DigitalLibraryPage /> },
      { path: 'digital-library/:id', element: <DigitalDocumentDetailPage /> },
      { path: 'circulation', element: <Navigate to="/admin/circulation" replace /> },

      // Patron Protected Routes (Giao 4)
      {
        element: <ProtectedRoute allowedRoles={['student', 'lecturer', 'librarian', 'admin']} />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'loans', element: <MyLoansPage /> },
          { path: 'reservations', element: <MyReservationsPage /> },
          { path: 'fines', element: <MyFinesPage /> },
          { path: 'suggestions', element: <MySuggestionsPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'digital-library/my-history', element: <DigitalReadingHistoryPage /> },
        ],
      },

      // Admin & Librarian Staff Routes (Giao 3 & 5)
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={['admin', 'librarian']} />,
        children: [
          { index: true, element: <AdminIndexRedirect /> },
          { path: 'circulation', element: <CirculationDeskPage /> },
          { path: 'books', element: <BooksManagementPage /> },
          { path: 'copies', element: <CopiesManagementPage /> },
          { path: 'categories', element: <BooksManagementPage /> },
          { path: 'users', element: <UsersManagementPage /> },
          { path: 'loans', element: <LoansManagementPage /> },
          { path: 'reservations', element: <AdminReservationsPage /> },
          { path: 'fines', element: <FinesManagementPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'digital-library', element: <AdminDigitalLibraryPage /> },
          { path: 'suggestions', element: <SuggestionsReviewPage /> },
          { path: 'audit', element: <AuditLogsPage /> },
          {
            element: <ProtectedRoute allowedRoles={['admin']} />,
            children: [
              { path: 'dashboard', element: <AdminDashboardPage /> },
              { path: 'settings', element: <SystemSettingsPage /> },
            ],
          },
        ],
      },

      // 404 catch-all
      {
        path: '*',
        element: (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-ink">404 - Không tìm thấy trang</h2>
            <p className="text-xs text-muted mt-2">Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.</p>
            <a href="/" className="inline-block mt-4 text-xs font-bold text-brand hover:underline">
              Về trang chủ &rarr;
            </a>
          </div>
        ),
      },
    ],
  },
]);

