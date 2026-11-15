import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Badge } from './Badge';

describe('Badge Component', () => {
  it('renders standard Vietnamese labels', () => {
    render(<Badge status="available" />);
    expect(screen.getByText('Sẵn sàng')).toBeInTheDocument();
  });

  it('renders overdue badge with warning text', () => {
    render(<Badge status="overdue" />);
    expect(screen.getByText('Quá hạn')).toBeInTheDocument();
  });

  it('renders custom text when provided', () => {
    render(<Badge status="available" customText="Tùy chỉnh" />);
    expect(screen.getByText('Tùy chỉnh')).toBeInTheDocument();
  });
});

