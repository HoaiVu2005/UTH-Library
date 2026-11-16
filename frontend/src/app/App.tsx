import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { router } from './Router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <React.Suspense
              fallback={
                <div className="min-h-screen flex flex-col items-center justify-center space-y-3 bg-slate-50">
                  <div className="w-8 h-8 border-3 border-[#008B8B] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-500 font-medium">Đang tải Thư viện UTH...</span>
                </div>
              }
            >
              <RouterProvider router={router} />
            </React.Suspense>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

