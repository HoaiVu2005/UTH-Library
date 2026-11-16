import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AdminDashboardPage } from './AdminDashboardPage';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockImplementation((url: string) => {
      if (url.includes('/dashboard/summary')) {
        return Promise.resolve({
          data: {
            data: {
              total_books: 100,
              total_copies: 350,
              available_copies: 300,
              borrowed_copies: 40,
              reserved_copies: 10,
              damaged_lost_copies: 0,
              active_loans: 40,
              overdue_loans: 3,
              total_unpaid_fines: 60000,
              pending_reservations: 2,
              ready_reservations: 5,
              pending_suggestions: 4,
              total_users: 26,
              locked_users: 2,
            },
          },
        });
      }
      if (url.includes('/dashboard/action-items')) {
        return Promise.resolve({
          data: {
            data: {
              pending_suggestions: [],
              expiring_holds: [],
              severe_overdue: [],
            },
          },
        });
      }
      if (url.includes('/reports/borrow-trends')) {
        return Promise.resolve({
          data: {
            data: [
              { date: '10/11', borrows: 5, returns: 3 },
              { date: '11/11', borrows: 8, returns: 6 },
            ],
          },
        });
      }
      return Promise.resolve({ data: {} });
    }),
  },
}));

describe('AdminDashboardPage', () => {
  it('renders summary stat cards and action items section', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Bảng điều khiển quản trị (Admin Dashboard)')).toBeInTheDocument();
      expect(screen.getByText('Sách đang mượn')).toBeInTheDocument();
      expect(screen.getByText('Sách quá hạn')).toBeInTheDocument();
      expect(screen.getByText('Công nợ tiền phạt')).toBeInTheDocument();
      expect(screen.getByText('Bạn đọc thư viện')).toBeInTheDocument();
      expect(screen.getByText(/Cần xử lý hôm nay/i)).toBeInTheDocument();
    });
  });
});

