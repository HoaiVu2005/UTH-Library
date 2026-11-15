import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { BookSearchPage } from '@/pages/BookSearchPage';
import { BookDetailPage } from '@/pages/BookDetailPage';
import { UnauthorizedState } from '@/components/ui/UnauthorizedState';
import { CirculationDeskPage } from '@/pages/admin/CirculationDeskPage';
import { LoansManagementPage } from '@/pages/admin/LoansManagementPage';
import { FinesManagementPage } from '@/pages/admin/FinesManagementPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { BooksManagementPage } from '@/pages/admin/BooksManagementPage';
import { CopiesManagementPage } from '@/pages/admin/CopiesManagementPage';
import { UsersManagementPage } from '@/pages/admin/UsersManagementPage';
import { SuggestionsReviewPage } from '@/pages/admin/SuggestionsReviewPage';
import { AdminReservationsPage } from '@/pages/admin/AdminReservationsPage';
import { ReportsPage } from '@/pages/admin/ReportsPage';
import { SystemSettingsPage } from '@/pages/admin/SystemSettingsPage';
import { AuditLogsPage } from '@/pages/admin/AuditLogsPage';
import { DashboardPage } from '@/pages/patron/DashboardPage';
import { MyLoansPage } from '@/pages/patron/MyLoansPage';
import { MyReservationsPage } from '@/pages/patron/MyReservationsPage';
import { MyFinesPage } from '@/pages/patron/MyFinesPage';
import { MySuggestionsPage } from '@/pages/patron/MySuggestionsPage';
import { NotificationsPage } from '@/pages/patron/NotificationsPage';
import { ProfilePage } from '@/pages/patron/ProfilePage';

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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      // Public Routes
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'search', element: <BookSearchPage /> },
      { path: 'books/:id', element: <BookDetailPage /> },

      // Patron Protected Routes (Giao 4)
      {
        element: <ProtectedRoute allowedRoles={['student', 'lecturer', 'admin']} />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'loans', element: <MyLoansPage /> },
          { path: 'reservations', element: <MyReservationsPage /> },
          { path: 'fines', element: <MyFinesPage /> },
          { path: 'suggestions', element: <MySuggestionsPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'profile', element: <ProfilePage /> },
        ],
      },

      // Admin Protected Routes (Giao 3 & 5)
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [
          { path: 'dashboard', element: <AdminDashboardPage /> },
          { path: 'circulation', element: <CirculationDeskPage /> },
          { path: 'books', element: <BooksManagementPage /> },
          { path: 'copies', element: <CopiesManagementPage /> },
          { path: 'categories', element: <BooksManagementPage /> },
          { path: 'users', element: <UsersManagementPage /> },
          { path: 'loans', element: <LoansManagementPage /> },
          { path: 'reservations', element: <AdminReservationsPage /> },
          { path: 'fines', element: <FinesManagementPage /> },
          { path: 'suggestions', element: <SuggestionsReviewPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'settings', element: <SystemSettingsPage /> },
          { path: 'audit', element: <AuditLogsPage /> },
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

