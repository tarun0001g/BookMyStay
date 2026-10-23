// External libraries
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

// Local files
import { useAuth } from '../context/AuthContext';

// Provides useful site links without linking to unimplemented support pages.
export function Footer() {
  const { user } = useAuth();

  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <div className="footer-brand-column">
          <Link className="wordmark" to="/">
            <span className="wordmark-mark" aria-hidden="true">
              B
            </span>
            <span>BookMyStay</span>
          </Link>
          <p>
            Find a place that feels like yours. Thoughtful homes for weekends away and
            longer stays.
          </p>
        </div>
        <div className="footer-column">
          <strong>Explore</strong>
          <Link to="/stays">Stays</Link>
          <Link to="/journal">Journal</Link>
          {user && <Link to="/favourites">Favourites</Link>}
        </div>
        {user && (
          <div className="footer-column">
            <strong>Your account</strong>
            <Link to="/bookings">My bookings</Link>
            {user.userType === 'admin' && <Link to="/admin">My listings</Link>}
          </div>
        )}
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} BookMyStay</span>
        <Link to="/stays">
          Find your next stay <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </footer>
  );
}
