import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CirculationDeskPage } from './CirculationDeskPage';
import { AuthProvider } from '@/features/auth/AuthContext';

describe('CirculationDeskPage', () => {
  it('renders borrow tab and patron scan input with auto-focus', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CirculationDeskPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Quầy Lưu thông Mượn & Trả sách')).toBeInTheDocument();
    expect(screen.getByText('MƯỢN SÁCH TẠI QUẦY')).toBeInTheDocument();
    expect(screen.getByText('TRẢ SÁCH TẠI QUẦY')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Quét mã vạch thẻ/i)).toBeInTheDocument();
  });
});

