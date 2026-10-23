// React

// External libraries
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Local files
import { AuthProvider, useAuth } from './AuthContext';

// Displays the shared account state for a provider test.
function AccountStatus() {
  const { user, loading } = useAuth();
  return <p>{loading ? 'Loading' : user?.email || 'Signed out'}</p>;
}

// Checks the auth provider loads its session user.
describe('AuthContext', () => {
  it('loads the current session user when mounted', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { email: 'guest@example.com' } }),
    });
    render(
      <AuthProvider>
        <AccountStatus />
      </AuthProvider>,
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText('guest@example.com')).toBeInTheDocument();
  });
});
