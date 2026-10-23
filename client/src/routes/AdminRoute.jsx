// React

// External libraries
import { Navigate } from 'react-router-dom';

// Local files
import { useAuth } from '../context/AuthContext';
import { ForbiddenPage } from '../pages/ForbiddenPage';

// Limits an administrative route to accounts with the admin role.
export function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <p className="wrap page-main" role="status">
        Loading account…
      </p>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return user.userType === 'admin' ? children : <ForbiddenPage />;
}
