// React

// External libraries
import { Route, Routes } from 'react-router-dom';

// Local files
import { RouteFocus } from '../components/RouteFocus';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { SignupPage } from '../pages/SignupPage';
import { StaysPage } from '../pages/StaysPage';

// Maps the first client screens and directs unknown URLs to NotFound.
export function AppRoutes() {
  return (
    <>
      <RouteFocus />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stays" element={<StaysPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
