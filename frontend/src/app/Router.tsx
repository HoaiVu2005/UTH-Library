import React, { lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { UnauthorizedState } from '@/components/ui/UnauthorizedState';

// Public Pages (Lazy Loaded)
const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const BookSearchPage = lazy(() => import('@/pages/BookSearchPage').then((m) => ({ default: m.BookSearchPage })));
const BookDetailPage = lazy(() => import('@/pages/BookDetailPage').then((m) => ({ default: m.BookDetailPage })));

// Patron Pages (Lazy Loaded)
const DashboardPage = lazy(() => import('@/pages/patron/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const MyLoansPage = lazy(() => import('@/pages/patron/MyLoansPage').then((m) => ({ default: m.MyLoansPage })));
const MyReservationsPage = lazy(() => import('@/pages/patron/MyReservationsPage').then((m) => ({ default: m.MyReservationsPage })));
const MyFinesPage = lazy(() => import('@/pages/patron/MyFinesPage').then((m) => ({ default: m.MyFinesPage })));
const MySuggestionsPage = lazy(() => import('@/pages/patron/MySuggestionsPage').then((m) => ({ default: m.MySuggestionsPage })));
const NotificationsPage = lazy(() => import('@/pages/patron/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const ProfilePage = lazy(() => import('@/pages/patron/ProfilePage').then((m) => ({ default: m.ProfilePage })));

// Admin Pages (Lazy Loaded)
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const CirculationDeskPage = lazy(() => import('@/pages/admin/CirculationDeskPage').then((m) => ({ default: m.CirculationDeskPage })));
const BooksManagementPage = lazy(() => import('@/pages/admin/BooksManagementPage').then((m) => ({ default: m.BooksManagementPage })));
const CopiesManagementPage = lazy(() => import('@/pages/admin/CopiesManagementPage').then((m) => ({ default: m.CopiesManagementPage })));
const UsersManagementPage = lazy(() => import('@/pages/admin/UsersManagementPage').then((m) => ({ default: m.UsersManagementPage })));
const LoansManagementPage = lazy(() => import('@/pages/admin/LoansManagementPage').then((m) => ({ default: m.LoansManagementPage })));
const AdminReservationsPage = lazy(() => import('@/pages/admin/AdminReservationsPage').then((m) => ({ default: m.AdminReservationsPage })));
const FinesManagementPage = lazy(() => import('@/pages/admin/FinesManagementPage').then((m) => ({ default: m.FinesManagementPage })));
const SuggestionsReviewPage = lazy(() => import('@/pages/admin/SuggestionsReviewPage').then((m) => ({ default: m.SuggestionsReviewPage })));
const ReportsPage = lazy(() => import('@/pages/admin/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const SystemSettingsPage = lazy(() => import('@/pages/admin/SystemSettingsPage').then((m) => ({ default: m.SystemSettingsPage })));
const AuditLogsPage = lazy(() => import('@/pages/admin/AuditLogsPage').then((m) => ({ default: m.AuditLogsPage })));

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
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      // Public Routes
      { index: true, element: <HomePage /> },
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

