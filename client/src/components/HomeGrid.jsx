// React

// External libraries

// Local files
import { HomeCard } from './HomeCard';

// Lays out homes and explains when the search has no results.
export function HomeGrid({ homes, loading, error, onRetry, emptyMessage }) {
  if (loading) {
    return (
      <div className="home-grid" aria-label="Loading homes">
        {[1, 2, 3, 4].map((item) => (
          <div className="skeleton-card" key={item} />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className="notice" role="alert">
        <p>{error.message}</p>
        <button className="secondary-button" onClick={onRetry} type="button">
          Try again
        </button>
      </div>
    );
  }
  if (!homes.length) {
    return (
      <p className="empty-state">{emptyMessage || 'No stays match those details yet.'}</p>
    );
  }
  return (
    <div className="home-grid">
      {homes.map((home) => (
        <HomeCard key={home._id} home={home} />
      ))}
    </div>
  );
}
