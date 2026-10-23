// React

// External libraries
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

// Local files
import { HomeCard } from './HomeCard';
import { AuthProvider } from '../context/AuthContext';
import { FavouritesProvider } from '../context/FavouritesContext';
import { ToastProvider } from '../context/ToastContext';

const home = {
  _id: 'abc123',
  houseName: 'Quiet cottage',
  location: 'Goa',
  price: 2500,
  rating: 4.8,
};

// Shows the destination after a logged-out favourite action.
function Destination() {
  const location = useLocation();
  return (
    <p>
      {location.pathname} {location.state?.from}
    </p>
  );
}

// Wraps the card with its real app providers for interaction checks.
function renderCard() {
  return render(
    <MemoryRouter
      initialEntries={['/stays?q=Goa']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider>
        <ToastProvider>
          <FavouritesProvider>
            <Routes>
              <Route path="/stays" element={<HomeCard home={home} />} />
              <Route path="/login" element={<Destination />} />
            </Routes>
          </FavouritesProvider>
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

// Checks card actions, listing links, and the signed-out redirect.
describe('HomeCard', () => {
  beforeEach(() => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: false, json: async () => ({ message: 'Signed out' }) });
  });

  it('renders real detail and booking links', () => {
    renderCard();
    expect(screen.getByRole('link', { name: 'View details' })).toHaveAttribute(
      'href',
      '/stays/abc123',
    );
    expect(screen.getByRole('link', { name: 'Book now' })).toHaveAttribute(
      'href',
      '/stays/abc123#booking',
    );
  });

  it('sends signed-out visitors to login and remembers the current search', () => {
    renderCard();
    fireEvent.click(
      screen.getByRole('button', { name: 'Add Quiet cottage to favourites' }),
    );
    expect(screen.getByText('/login /stays?q=Goa')).toBeInTheDocument();
  });

  it('saves a favourite for a signed-in user', async () => {
    global.fetch = vi.fn().mockImplementation(async (path) => {
      if (path === '/api/auth/me') {
        return { ok: true, json: async () => ({ user: { _id: 'user-1' } }) };
      }
      if (path === '/api/favourites') {
        return { ok: true, json: async () => ({ homes: [] }) };
      }
      if (path === '/api/csrf') {
        return { ok: true, json: async () => ({ csrfToken: 'token' }) };
      }
      return { ok: true, json: async () => ({ message: 'Saved' }) };
    });
    renderCard();
    const button = await screen.findByRole('button', {
      name: 'Add Quiet cottage to favourites',
    });
    fireEvent.click(button);
    await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'true'));
  });
});
