import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('keeps the generated id stable across rerenders', () => {
    const { rerender } = render(<Input label="Mã thẻ" value="SV001" readOnly />);
    const input = screen.getByLabelText('Mã thẻ');
    const initialId = input.id;

    rerender(<Input label="Mã thẻ" value="SV002" readOnly />);

    expect(input.id).toBe(initialId);
    expect(initialId).not.toBe('');
  });

  it('associates validation errors with the field', () => {
    render(<Input label="Mã thẻ" error="Mã thẻ không hợp lệ" />);

    const input = screen.getByLabelText('Mã thẻ');
    const error = screen.getByText('Mã thẻ không hợp lệ');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', error.id);
  });
});
