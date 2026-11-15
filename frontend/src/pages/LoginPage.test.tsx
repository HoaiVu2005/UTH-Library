import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { AuthProvider } from '@/features/auth/AuthContext';

describe('LoginPage', () => {
  it('renders login form inputs and submit button', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Đăng nhập Thư viện UTH')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/SV20260001/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Nhập mật khẩu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeInTheDocument();
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

    const identityInput = screen.getByPlaceholderText(/SV20260001/i) as HTMLInputElement;
    expect(identityInput.value).toBe('admin');
  });
});

