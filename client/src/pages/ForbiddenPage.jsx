// React

// External libraries
import { Link } from 'react-router-dom';

// Local files

// Explains that this account cannot open the requested area.
export function ForbiddenPage() {
  return (
    <main className="wrap page-main">
      <h1 tabIndex="-1">Access denied</h1>
      <p>This area is for administrators.</p>
      <Link to="/">Return home</Link>
    </main>
  );
}
