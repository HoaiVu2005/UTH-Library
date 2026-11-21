import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { DigitalLibraryPage } from './DigitalLibraryPage';

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      full_name: 'Lê Hoài Vũ',
      card_code: '052205006504',
      role: 'student',
    },
    isAuthenticated: true,
  }),
}));

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockImplementation((url: string) => {
      if (url.includes('/digital-library/documents')) {
        return Promise.resolve({
          data: {
            data: [
              {
                id: 1,
                title: 'Ứng dụng AI trong Tối ưu hóa Tuyến đường Vận tải Đa phương thức',
                document_type: 'thesis',
                document_type_display: 'Khóa luận tốt nghiệp',
                department: 'Khoa Công nghệ thông tin',
                major: 'Kỹ thuật phần mềm',
                author_names: 'Lê Hoài Vũ, Nguyễn Văn A',
                advisor_names: 'TS. Nguyễn Văn B',
                year: 2026,
                total_views: 45,
                current_version_number: 1,
                user_has_access: true,
                access_scope: 'all_university',
                access_scope_display: 'Toàn trường',
                cover_image: null,
                abstract: 'Đề tài nghiên cứu ứng dụng thuật toán học sâu...',
                keywords: 'AI, Logistics, GTVT',
              },
            ],
            total: 1,
          },
        });
      }
      return Promise.resolve({ data: {} });
    }),
  },
}));

describe('DigitalLibraryPage', () => {
  it('renders the Digital Library header and search input', async () => {
    render(
      <MemoryRouter>
        <DigitalLibraryPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Thư viện Số & Học liệu UTH/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tìm theo tên đề tài, tác giả, sinh viên thực hiện/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Ứng dụng AI trong Tối ưu hóa Tuyến đường/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Khóa luận tốt nghiệp/i).length).toBeGreaterThan(0);
    });
  });
});
