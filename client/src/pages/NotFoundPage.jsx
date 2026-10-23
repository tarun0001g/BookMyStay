// React

// External libraries
import { Link } from 'react-router-dom';

// Local files

// Explains that the requested page is not available.
export function NotFoundPage() {
  return (
    <main className="wrap page-main">
      <h1 tabIndex="-1">Page not found</h1>
      <p>We couldn’t find that page.</p>
      <Link to="/">Return home</Link>
    </main>
  );
}
