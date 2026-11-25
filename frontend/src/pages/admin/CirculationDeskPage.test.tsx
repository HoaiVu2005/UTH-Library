import { beforeEach, describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { api } from '@/lib/api';
import { CirculationDeskPage } from './CirculationDeskPage';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
  formatApiError: () => 'Không thể thực hiện yêu cầu.',
}));

const lockedPatron = {
  id: 27,
  username: 'sv20260027',
  full_name: 'Nguyễn Minh An',
  role: 'student',
  card_code: 'SV20260027',
  department: 'Khoa Công nghệ thông tin',
  card_expiry: '2027-12-31',
  is_card_valid: true,
  is_currently_locked: true,
  lock_reason: 'overdue_threshold',
  lock_reason_label: 'Khóa do sách quá hạn trên 7 ngày',
  active_loans_count: 2,
  overdue_loans_count: 1,
  max_loans: 5,
  remaining_quota: 3,
  has_overdue: true,
  has_unpaid_fines: true,
  unpaid_fines_count: 1,
  unpaid_fines_total: 60000,
  has_active_borrow_override: false,
  ready_reservations: [],
};

describe('CirculationDeskPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders borrow tab and patron scan input with auto-focus', () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CirculationDeskPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Quầy Lưu thông Mượn & Trả sách')).toBeInTheDocument();
    expect(screen.getByText('MƯỢN SÁCH TẠI QUẦY')).toBeInTheDocument();
    expect(screen.getByText('TRẢ SÁCH TẠI QUẦY')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Quét mã vạch thẻ/i)).toBeInTheDocument();
  });

  it('shows a focused lock review workspace after scanning a locked student', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: lockedPatron } } as never);
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CirculationDeskPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Quét mã vạch thẻ/i), {
      target: { value: 'SV20260027' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tìm' }));

    expect(await screen.findByRole('heading', { name: 'Tài khoản đang bị khóa quyền mượn' })).toBeInTheDocument();
    expect(screen.getByText('Khóa do sách quá hạn trên 7 ngày')).toBeInTheDocument();
    expect(screen.getByText('60.000 ₫')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Quét mã vạch bản sao/i)).not.toBeInTheDocument();
  });

  it('restores the book scanning workspace after a documented unlock review', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: lockedPatron } } as never);
    vi.mocked(api.post).mockResolvedValue({ data: { detail: 'Đã mở khóa.' } } as never);
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CirculationDeskPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Quét mã vạch thẻ/i), {
      target: { value: 'SV20260027' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tìm' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Xem xét mở khóa' }));
    fireEvent.change(screen.getByLabelText(/^Căn cứ mở khóa/), {
      target: { value: 'Sinh viên có xác nhận điều trị dài ngày từ phòng công tác sinh viên.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận mở khóa 30 ngày' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/users/27/unlock', {
        review_reason: 'Sinh viên có xác nhận điều trị dài ngày từ phòng công tác sinh viên.',
      });
    });
    expect(await screen.findByPlaceholderText(/Quét mã vạch bản sao/i)).toBeEnabled();
    expect(screen.queryByRole('heading', { name: 'Tài khoản đang bị khóa quyền mượn' })).not.toBeInTheDocument();
  });
});

