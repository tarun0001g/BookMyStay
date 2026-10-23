// React
import { useEffect, useState } from 'react';

// External libraries
import { Link, useParams } from 'react-router-dom';
import { Star } from 'lucide-react';

// Local files
import { getHome } from '../api/homesApi';
import { BookingForm } from '../components/BookingForm';
import { FavouriteButton } from '../components/FavouriteButton';
import { formatPrice } from '../utils/formatPrice';
import { useAuth } from '../context/AuthContext';
import { imageUrl } from '../utils/imageUrl';

// Shows listing information and the booking form for one home.
export function HomeDetailPage() {
  const { user } = useAuth();
  const { homeId } = useParams();
  const [state, setState] = useState({ home: null, loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();
    setState({ home: null, loading: true, error: null });
    getHome(homeId, { signal: controller.signal })
      .then((result) => setState({ home: result.home, loading: false, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setState({ home: null, loading: false, error });
        }
      });
    return () => controller.abort();
  }, [homeId]);

  if (state.loading) {
    return (
      <main className="wrap page-main" role="status">
        Loading stay details...
      </main>
    );
  }
  if (state.error) {
    return (
      <main className="wrap page-main">
        <h1 tabIndex="-1">We couldn’t load this stay</h1>
        <p role="alert">{state.error.message}</p>
        <Link to="/stays">Back to stays</Link>
      </main>
    );
  }

  const { home } = state;
  return (
    <main className="wrap page-main detail-page">
      <Link to="/stays">Back to stays</Link>
      <div className="detail-title">
        <h1 tabIndex="-1">{home.houseName}</h1>
        <FavouriteButton home={home} />
      </div>
      <div className="detail-layout">
        <section className="detail-content">
          <div className="detail-photo">
            {home.photo ? (
              <img
                src={imageUrl(home.photo, 1200)}
                width="1200"
                height="900"
                alt={home.houseName}
                loading="eager"
                fetchPriority="high"
              />
            ) : null}
          </div>
          <p className="muted">{home.location}</p>
          <p className="rating">
            <Star aria-hidden="true" /> {home.rating} / 5
          </p>
          <h2>About this home</h2>
          <p>{home.description}</p>
          {user && (
            <a
              className="secondary-button rules-link"
              href={`/api/homes/${home._id}/rules`}
            >
              Download house rules
            </a>
          )}
        </section>
        <aside>
          <p className="detail-price">
            <strong>{formatPrice(home.price)}</strong> / night
          </p>
          <BookingForm home={home} />
        </aside>
      </div>
    </main>
  );
}
