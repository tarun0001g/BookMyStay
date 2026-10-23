// React
import { useEffect } from 'react';

// External libraries
import { useLocation } from 'react-router-dom';

// Local files

// Moves keyboard focus to the page heading when the route changes.
export function RouteFocus() {
  const location = useLocation();
  useEffect(() => {
    document.querySelector('main h1')?.focus();
  }, [location.pathname]);
  return null;
}
