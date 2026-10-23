// React

// External libraries
import { Heart, Star } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Local files
import { useFavourites } from '../hooks/useFavourites';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';

// Displays one listing and its accessible favourite action.
export function HomeCard({ home }) {
  const { ids, pending, toggle } = useFavourites();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const id = home._id;
  const saved = ids.includes(id);

  async function handleFavourite() {
    if (!user) {
      navigate('/login', {
        state: { from: `${location.pathname}${location.search}` },
      });
      return;
    }
    try {
      await toggle(id);
    } catch {
      // The hook displays the request error through the toast.
    }
  }

  return (
    <article className="home-card">
      <div className="home-photo">
        {home.photo ? <img src={home.photo} alt={home.houseName} /> : null}
        <button
          className="favourite-button"
          type="button"
          aria-label={
            saved
              ? `Remove ${home.houseName} from favourites`
              : `Add ${home.houseName} to favourites`
          }
          aria-pressed={saved}
          disabled={pending.includes(id)}
          onClick={handleFavourite}
        >
          <Heart aria-hidden="true" fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="home-card-content">
        <div className="home-card-title">
          <h2>{home.houseName}</h2>
          <span className="rating">
            <Star aria-hidden="true" /> {home.rating}
          </span>
        </div>
        <p className="muted">{home.location}</p>
        <p className="price-line">
          <strong>{formatPrice(home.price)}</strong> / night
        </p>
        <div className="card-links">
          <Link to={`/stays/${id}`}>View details</Link>
          <Link to={`/stays/${id}#booking`}>Book now</Link>
        </div>
      </div>
    </article>
  );
}
