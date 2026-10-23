// React
import { useRef, useState } from 'react';

// External libraries
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

// Local files
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Provides responsive navigation and session actions.
export function Header() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuButtonRef = useRef(null);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      showToast('You are logged out.');
      navigate('/');
    } catch (error) {
      showToast(error.message);
    } finally {
      setLoggingOut(false);
    }
  }

  function handleNavigationKeyDown(event) {
    if (event.key === 'Escape') {
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    }
  }

  const links = [
    ['Stays', '/stays'],
    ['Favourites', '/favourites'],
    ['Bookings', '/bookings'],
    ...(user?.userType === 'admin' ? [['My listings', '/admin']] : []),
  ];
  return (
    <header className="site-header">
      <div className="header-inner wrap">
        <Link className="wordmark" to="/" aria-label="BookMyStay home">
          BookMyStay
        </Link>
        <button
          ref={menuButtonRef}
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav
          id="primary-navigation"
          className={`navigation${menuOpen ? ' navigation-open' : ''}`}
          aria-label="Main navigation"
        >
          {links.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)}
              onKeyDown={handleNavigationKeyDown}
            >
              {label}
            </NavLink>
          ))}
          {user ? (
            <button
              className="text-button"
              type="button"
              disabled={loggingOut}
              onClick={handleLogout}
              onKeyDown={handleNavigationKeyDown}
            >
              {loggingOut ? 'Logging out…' : 'Log out'}
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              onKeyDown={handleNavigationKeyDown}
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
