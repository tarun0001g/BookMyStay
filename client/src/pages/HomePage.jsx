// React
import { useEffect, useMemo, useState } from 'react';

// External libraries
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Compass, ShieldCheck, Sparkles } from 'lucide-react';

// Local files
import { getHomes } from '../api/homesApi';
import { HomeGrid } from '../components/HomeGrid';
import { SearchBar } from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';
import { journalArticles } from '../data/journalArticles';
import { imageUrl } from '../utils/imageUrl';

// Presents real listing discovery, truthful guidance, and journal stories.
export function HomePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [state, setState] = useState({ homes: [], loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, loading: true, error: null }));
    getHomes(new URLSearchParams('limit=8'), { signal: controller.signal })
      .then((result) => setState({ homes: result.homes, loading: false, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setState({ homes: [], loading: false, error });
        }
      });
    return () => controller.abort();
  }, [reloadKey]);

  const destinations = useMemo(
    () =>
      [
        ...new Map(
          state.homes.filter((home) => home.photo).map((home) => [home.location, home]),
        ).values(),
      ].slice(0, 5),
    [state.homes],
  );
  const heroHome = state.homes.find((home) => home.photo);

  function search(values) {
    const query = new URLSearchParams(values);
    navigate(`/stays${query.size ? `?${query}` : ''}`);
  }

  return (
    <main className="home-page">
      <section className="hero-section wrap">
        <div className="hero-copy">
          <p className="eyebrow">
            <Sparkles size={16} aria-hidden="true" /> A place for your kind of trip
          </p>
          <h1 tabIndex="-1">Find a stay that feels like yours.</h1>
          <p className="hero-description">
            Thoughtful homes for weekends away and longer stays. Find a place that makes
            the trip yours.
          </p>
          <div className="hero-assurance">
            <span>
              <ShieldCheck size={17} aria-hidden="true" /> Booking details checked before
              confirmation
            </span>
            <span>
              <Compass size={17} aria-hidden="true" /> Search real available listings with
              dates
            </span>
          </div>
        </div>
        {heroHome && (
          <Link
            className="hero-feature"
            to={`/stays/${heroHome._id}`}
            aria-label={`Explore ${heroHome.houseName} in ${heroHome.location}`}
          >
            <img
              src={imageUrl(heroHome.photo, 1200)}
              width="1200"
              height="900"
              alt={heroHome.houseName}
              fetchPriority="high"
            />
            <span className="hero-feature-caption">
              <span className="eyebrow">A place to begin</span>
              <strong>{heroHome.houseName}</strong>
              <span>{heroHome.location}</span>
            </span>
          </Link>
        )}
      </section>

      <section className="wrap home-search" aria-label="Search stays">
        <SearchBar initial={{ q: params.get('q') }} onSubmit={search} />
      </section>

      <section className="wrap discovery-section" aria-labelledby="discover-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Find your kind of stay</p>
            <h2 id="discover-heading">Browse by what matters to you</h2>
          </div>
          <Link to="/stays" className="inline-link">
            Explore all stays <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <nav className="category-links" aria-label="Popular stay filters">
          <Link to="/stays?propertyType=villa">Villas</Link>
          <Link to="/stays?propertyType=farmhouse">Farmhouses</Link>
          <Link to="/stays?amenities=pet-friendly">Pet friendly</Link>
          <Link to="/stays?amenities=pool">Pool</Link>
          <Link to="/stays?maxPrice=1999">Under ₹1,999</Link>
        </nav>
      </section>

      <section className="wrap destination-section" aria-labelledby="destination-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Based on real listings</p>
            <h2 id="destination-heading">Places to start exploring</h2>
          </div>
        </div>
        {destinations.length ? (
          <div className="destination-grid">
            {destinations.map((home) => (
              <Link
                className="destination-card"
                to={`/stays?q=${encodeURIComponent(home.location)}`}
                key={home.location}
              >
                <img
                  src={imageUrl(home.photo, 700)}
                  width="700"
                  height="520"
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <span>
                  <strong>{home.location}</strong>
                  <small>
                    Explore stays <ArrowRight size={14} aria-hidden="true" />
                  </small>
                </span>
              </Link>
            ))}
          </div>
        ) : !state.loading && !state.error ? (
          <p className="empty-state">New destinations will appear as homes are listed.</p>
        ) : null}
      </section>

      <section className="wrap featured-section" aria-labelledby="featured-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Handpicked places</p>
            <h2 id="featured-heading">Stays worth a closer look</h2>
          </div>
          <Link to="/stays" className="inline-link">
            See all stays <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <HomeGrid
          homes={state.homes.slice(0, 4)}
          loading={state.loading}
          error={state.error}
          onRetry={() => setReloadKey((key) => key + 1)}
        />
      </section>

      <section className="benefit-section">
        <div className="wrap">
          <p className="eyebrow">A clearer way to plan</p>
          <h2>Thoughtful details at every step</h2>
          <div className="benefit-grid">
            <article>
              <span>01</span>
              <h3>Browse real homes</h3>
              <p>
                See each listing’s location, nightly price, and details before you book.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Know the dates</h3>
              <p>Search with dates to check them against confirmed stays.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Manage your booking</h3>
              <p>
                View reservations and cancel eligible upcoming stays from your account.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="wrap journal-preview" aria-labelledby="journal-preview-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">From the journal</p>
            <h2 id="journal-preview-heading">Ideas for your next trip</h2>
          </div>
          <Link to="/journal" className="inline-link">
            Visit the journal <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="journal-card-grid">
          {journalArticles.slice(0, 3).map((article) => (
            <article className="journal-card" key={article.slug}>
              <p className="eyebrow">{article.category}</p>
              <h3>
                <Link to={`/journal/${article.slug}`}>{article.title}</Link>
              </h3>
              <p>{article.summary}</p>
              <Link className="inline-link" to={`/journal/${article.slug}`}>
                Read article <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {user?.userType === 'admin' && (
        <section className="wrap hosting-promo">
          <div>
            <p className="eyebrow">Hosting tools</p>
            <h2>Have a home to share?</h2>
            <p>Manage your listings and their details from your host tools.</p>
          </div>
          <Link to="/admin" className="primary-button">
            Manage my listings <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      )}
    </main>
  );
}
