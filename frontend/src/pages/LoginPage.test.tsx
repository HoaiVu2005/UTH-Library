import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { AuthProvider } from '@/features/auth/AuthContext';

describe('LoginPage', () => {
  it('renders login form inputs, submit button, and forgot password link', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
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
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const adminBtn = screen.getByText('Thủ thư (Admin)');
    fireEvent.click(adminBtn);

    const identityInput = screen.getByPlaceholderText(/Tài khoản đăng nhập/i) as HTMLInputElement;
    expect(identityInput.value).toBe('admin');
  });
});
