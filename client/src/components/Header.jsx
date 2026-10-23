// React
import { useEffect, useRef, useState } from 'react';

// External libraries
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

// Local files
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Provides public and account navigation with a responsive mobile menu.
export function Header() {
  const { user, loading, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      setMenuOpen(false);
      showToast('Logged out successfully.', { type: 'success' });
      navigate('/');
    } catch (error) {
      showToast(error.message, { type: 'error' });
    } finally {
      setLoggingOut(false);
    }
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
  const initials = displayName
    .split(/\s+/)
    .map((name) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="site-header">
      <div className="header-inner wrap">
        <Link
          className="wordmark"
          to="/"
          aria-label="BookMyStay home"
          onClick={closeMenu}
        >
          <span className="wordmark-mark" aria-hidden="true">
            B
          </span>
          <span>BookMyStay</span>
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
          <NavLink end to="/" onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/stays" onClick={closeMenu}>
            Stays
          </NavLink>
          <NavLink to="/journal" onClick={closeMenu}>
            Journal
          </NavLink>
          {!loading && user && (
            <>
              <NavLink to="/favourites" onClick={closeMenu}>
                Favourites
              </NavLink>
              <NavLink to="/bookings" onClick={closeMenu}>
                My bookings
              </NavLink>
              {user.userType === 'admin' && (
                <NavLink to="/admin" onClick={closeMenu}>
                  My listings
                </NavLink>
              )}
            </>
          )}
          {!loading && user && (
            <details className="account-menu">
              <summary aria-label={`Account menu for ${displayName}`}>
                <span className="account-avatar" aria-hidden="true">
                  {initials || 'U'}
                </span>
                <span>{user.firstName || 'Account'}</span>
              </summary>
              <div className="account-menu-panel">
                <p className="account-menu-name">{displayName}</p>
                <p className="account-menu-email">{user.email}</p>
                <button
                  className="account-logout"
                  type="button"
                  disabled={loggingOut}
                  onClick={handleLogout}
                >
                  {loggingOut ? 'Logging out…' : 'Log out'}
                </button>
              </div>
            </details>
          )}
          {!loading && !user && (
            <div className="guest-actions">
              <Link to="/login" onClick={closeMenu}>
                Log in
              </Link>
              <Link className="signup-link" to="/signup" onClick={closeMenu}>
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
