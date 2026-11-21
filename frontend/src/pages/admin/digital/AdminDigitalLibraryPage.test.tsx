import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AdminDigitalLibraryPage } from './AdminDigitalLibraryPage';

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, role: 'admin', fullName: 'Admin UTH' },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({
      data: {
        results: [],
        count: 0,
        total_pages: 1,
      },
    }),
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

describe('AdminDigitalLibraryPage', () => {
  it('renders without throwing error', () => {
    const { container } = render(
      <BrowserRouter>
        <AdminDigitalLibraryPage />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });
});

