import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Card } from './Card';

describe('Card surface hierarchy', () => {
  it('uses the shared elevated university-portal surface treatment', () => {
    render(<Card data-testid="card">Nội dung</Card>);

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('rounded-2xl');
    expect(card).toHaveClass('shadow-card');
    expect(card).toHaveClass('border-white/80');
  });

  it('keeps flat sections quieter than actionable cards', () => {
    render(<Card data-testid="flat-card" variant="flat">Nội dung</Card>);

    expect(screen.getByTestId('flat-card')).toHaveClass('bg-primary-50/45');
    expect(screen.getByTestId('flat-card')).not.toHaveClass('shadow-card');
  });
});
