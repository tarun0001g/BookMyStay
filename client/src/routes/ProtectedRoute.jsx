// React

// External libraries
import { Navigate, useLocation } from 'react-router-dom';

// Local files
import { useAuth } from '../context/AuthContext';

// Redirects signed-out visitors to login while preserving their destination.
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <p className="wrap page-main" role="status">
        Loading account…
      </p>
    );
  }
  return user ? (
    children
  ) : (
    <Navigate
      to="/login"
      replace
      state={{ from: `${location.pathname}${location.search}` }}
    />
  );
}
