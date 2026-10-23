// React
import { lazy, Suspense } from 'react';

// External libraries
import { Route, Routes } from 'react-router-dom';

// Local files
import { RouteFocus } from '../components/RouteFocus';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { StaysPage } from '../pages/StaysPage';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

const HomeDetailPage = lazy(() =>
  import('../pages/HomeDetailPage').then((module) => ({
    default: module.HomeDetailPage,
  })),
);
const FavouritesPage = lazy(() =>
  import('../pages/FavouritesPage').then((module) => ({
    default: module.FavouritesPage,
  })),
);
const BookingsPage = lazy(() =>
  import('../pages/BookingsPage').then((module) => ({
    default: module.BookingsPage,
  })),
);
const AdminHomesPage = lazy(() =>
  import('../pages/AdminHomesPage').then((module) => ({
    default: module.AdminHomesPage,
  })),
);
const LoginPage = lazy(() =>
  import('../pages/LoginPage').then((module) => ({ default: module.LoginPage })),
);
const SignupPage = lazy(() =>
  import('../pages/SignupPage').then((module) => ({ default: module.SignupPage })),
);

// Maps the first client screens and directs unknown URLs to NotFound.
export function AppRoutes() {
  return (
    <>
      <RouteFocus />
      <Suspense
        fallback={
          <main className="wrap page-main" role="status" aria-label="Loading page">
            <div className="home-grid" aria-hidden="true">
              {[1, 2, 3, 4].map((item) => (
                <div className="skeleton-card" key={item} />
              ))}
            </div>
          </main>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stays" element={<StaysPage />} />
          <Route path="/stays/:homeId" element={<HomeDetailPage />} />
          <Route
            path="/favourites"
            element={
              <ProtectedRoute>
                <FavouritesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminHomesPage />
              </AdminRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
