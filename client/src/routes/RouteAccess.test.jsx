// React

// External libraries
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Local files
import { AuthProvider } from '../context/AuthContext';
import { AdminRoute } from './AdminRoute';
import { ProtectedRoute } from './ProtectedRoute';

// Renders protected content with a supplied session response.
function renderAccess(user) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: Boolean(user),
    json: async () => (user ? { user } : { message: 'Signed out' }),
  });
  return render(
    <MemoryRouter
      initialEntries={['/private']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider>
        <Routes>
          <Route
            path="/private"
            element={
              <ProtectedRoute>
                <p>Private page</p>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <p>Admin page</p>
              </AdminRoute>
            }
          />
          <Route path="/login" element={<p>Login page</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

// Checks redirects for signed-out users and access denial for guests.
describe('route access', () => {
  it('redirects a signed-out visitor to login', async () => {
    renderAccess(null);
    await waitFor(() => expect(screen.getByText('Login page')).toBeInTheDocument());
  });

  it('shows the forbidden page for a guest on an admin route', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { userType: 'guest' } }),
    });
    render(
      <MemoryRouter
        initialEntries={['/admin']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AuthProvider>
          <AdminRoute>
            <p>Admin page</p>
          </AdminRoute>
        </AuthProvider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByText('Access denied')).toBeInTheDocument());
  });
});
