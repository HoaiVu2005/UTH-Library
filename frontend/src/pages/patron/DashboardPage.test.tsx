import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import { AuthProvider } from '@/features/auth/AuthContext';

// Mock auth context and API
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockImplementation((url: string) => {
      if (url.includes('/loans/me')) {
        return Promise.resolve({ data: { data: [] } });
      }
      if (url.includes('/reservations/me')) {
        return Promise.resolve({ data: { data: [] } });
      }
      if (url.includes('/fines/me')) {
        return Promise.resolve({ data: { data: [] } });
      }
      return Promise.resolve({ data: {} });
    }),
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn().mockReturnValue('mock-token'),
}));

vi.mock('@/features/auth/AuthContext', async () => {
  const actual = await vi.importActual<any>('@/features/auth/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: {
        id: 1,
        username: 'sv001',
        full_name: 'Nguyễn Văn A',
        card_code: '21110001',
        department: 'Khoa Công nghệ thông tin',
        role: 'student',
        card_expiry: '2026-12-31',
        is_currently_locked: false,
        is_card_valid: true,
      },
      isAuthenticated: true,
      isLoading: false,
    }),
  };
});

describe('DashboardPage', () => {
  it('renders student patron card with UTH information and function cards', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <DashboardPage />
      </MemoryRouter>
    );

    // Patron Card checks
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByText('21110001')).toBeInTheDocument();
    expect(screen.getByText('Khoa Công nghệ thông tin')).toBeInTheDocument();
    expect(screen.getByText('Sinh viên')).toBeInTheDocument();

    // 8-cell function card grid checks
    expect(screen.getByText('Tra cứu sách')).toBeInTheDocument();
    expect(screen.getByText('Sách của tôi')).toBeInTheDocument();
    expect(screen.getByText('Đặt trước')).toBeInTheDocument();
    expect(screen.getByText('Gia hạn sách')).toBeInTheDocument();
    expect(screen.getByText('Tiền phạt')).toBeInTheDocument();
    expect(screen.getByText('Đề xuất sách')).toBeInTheDocument();
    expect(screen.getByText('Thông báo')).toBeInTheDocument();
    expect(screen.getByText('Hồ sơ thẻ')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Đang tải dữ liệu...')).not.toBeInTheDocument();
    });
  });
});

