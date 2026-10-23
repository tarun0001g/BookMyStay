// React

// External libraries
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Local files
import { LoginPage } from './LoginPage';
import { SignupPage } from './SignupPage';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

// Renders one auth form with the real provider boundaries.
function renderAuthPage(page) {
  global.fetch = vi.fn().mockImplementation(async (path) => {
    if (path === '/api/auth/me') {
      return { ok: false, json: async () => ({ message: 'Signed out' }) };
    }
    if (path === '/api/csrf') {
      return { ok: true, json: async () => ({ csrfToken: 'token' }) };
    }
    return {
      ok: false,
      json: async () => ({
        message: 'Correct the fields.',
        errors: { email: 'Email is invalid.' },
      }),
    };
  });
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={page} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

// Checks login and signup display field validation returned by the API.
describe('authentication forms', () => {
  it('shows API field errors on login', async () => {
    renderAuthPage(<LoginPage />);
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'guest@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'no' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    await waitFor(() =>
      expect(screen.getByText('Email is invalid.')).toBeInTheDocument(),
    );
  });

  it('shows API field errors on signup', async () => {
    renderAuthPage(<SignupPage />);
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Guest' } });
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Tester' } });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'bad@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Strong!Pass1' },
    });
    fireEvent.change(screen.getByLabelText('Confirm password'), {
      target: { value: 'Strong!Pass1' },
    });
    fireEvent.click(screen.getByLabelText('I agree to the terms.'));
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() =>
      expect(screen.getByText('Email is invalid.')).toBeInTheDocument(),
    );
  });
});
