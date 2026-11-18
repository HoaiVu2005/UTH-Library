import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({ login: vi.fn() }),
}));

describe('LoginPage', () => {
  it('renders login form inputs, submit button, and forgot password link', () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText('ĐĂNG NHẬP HỆ THỐNG')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tài khoản đăng nhập/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Mật khẩu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ĐĂNG NHẬP/i })).toBeInTheDocument();
    expect(screen.getByText('QUÊN MẬT KHẨU?')).toBeInTheDocument();
  });

  it('fills inputs when fast fill demo buttons are clicked', () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <LoginPage />
      </BrowserRouter>
    );

    const adminBtn = screen.getByText('Admin / Trưởng TV');
    fireEvent.click(adminBtn);

    const identityInput = screen.getByPlaceholderText(/Tài khoản đăng nhập/i) as HTMLInputElement;
    expect(identityInput.value).toBe('admin');

    const librarianBtn = screen.getByText('Thủ thư (Trực quầy)');
    fireEvent.click(librarianBtn);
    expect(identityInput.value).toBe('thuthu');
  });
});
