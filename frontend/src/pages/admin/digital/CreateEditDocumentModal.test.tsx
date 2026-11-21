import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { CreateEditDocumentModal } from './CreateEditDocumentModal';

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, role: 'admin', fullName: 'Admin UTH' },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

describe('CreateEditDocumentModal', () => {
  it('renders open modal without throwing error', () => {
    const { container } = render(
      <CreateEditDocumentModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );
    expect(container).toBeDefined();
  });
});

