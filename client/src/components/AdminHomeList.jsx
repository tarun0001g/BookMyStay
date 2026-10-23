// External libraries
import { Link } from 'react-router-dom';

// Local files
import { formatPrice } from '../utils/formatPrice';

// Lists owned homes with their edit and delete actions.
export function AdminHomeList({ homes, loading, error, onRetry, onEdit, onDelete }) {
  if (loading) return <p role="status">Loading listings...</p>;
  if (error)
    return (
      <div role="alert" className="notice">
        {error}{' '}
        <button className="text-button" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  if (!homes.length)
    return <p className="empty-state">No listings yet. Add your first home above.</p>;
  return (
    <div className="booking-list">
      {homes.map((home) => (
        <article className="booking-card" key={home._id}>
          <h3>
            <Link to={`/stays/${home._id}`}>{home.houseName}</Link>
          </h3>
          <p>
            {home.location} · {formatPrice(home.price)} per night
          </p>
          <div className="form-actions">
            <button className="secondary-button" onClick={() => onEdit(home)}>
              Edit
            </button>
            <button
              className="secondary-button danger-button"
              onClick={() => onDelete(home)}
            >
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
