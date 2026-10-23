// React
import React from 'react';
import { createRoot } from 'react-dom/client';

// External libraries
import { BrowserRouter } from 'react-router-dom';

// Local files
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { FavouritesProvider } from './context/FavouritesContext';
import { ToastProvider } from './context/ToastContext';
import './styles/index.css';

// Mounts the client with shared routing, account, and feedback state.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <ToastProvider>
            <FavouritesProvider>
              <div className="app-shell">
                <Header />
                <AppRoutes />
                <Footer />
              </div>
            </FavouritesProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
