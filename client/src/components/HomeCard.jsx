// External libraries
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

// Local files
import { formatPrice } from '../utils/formatPrice';
import { FavouriteButton } from './FavouriteButton';
import { imageUrl } from '../utils/imageUrl';

// Displays one listing and its accessible favourite action.
export function HomeCard({ home }) {
  const id = home._id;

  return (
    <article className="home-card">
      <div className="home-photo">
        {home.photo ? (
          <img
            src={imageUrl(home.photo, 600)}
            srcSet={`${imageUrl(home.photo, 400)} 400w, ${imageUrl(home.photo, 600)} 600w, ${imageUrl(home.photo, 900)} 900w`}
            sizes="(max-width: 560px) calc(100vw - 40px), (max-width: 900px) 45vw, 260px"
            width="600"
            height="450"
            alt={home.houseName}
            loading="lazy"
            decoding="async"
          />
        ) : null}
        <FavouriteButton home={home} />
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
          <Link className="card-view-link" to={`/stays/${id}`}>
            View details
          </Link>
          <Link className="card-book-link" to={`/stays/${id}#booking`}>
            Book now
          </Link>
        </div>
      </div>
    </article>
  );
}
