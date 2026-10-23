// React
import { useEffect, useState } from 'react';

// External libraries
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

// Local files
import { getHomes } from '../api/homesApi';
import { HomeGrid } from '../components/HomeGrid';
import { SearchBar } from '../components/SearchBar';

// Presents trip search and the first four featured homes.
export function HomePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [state, setState] = useState({ homes: [], loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getHomes(new URLSearchParams('limit=4'), { signal: controller.signal })
      .then((result) => setState({ homes: result.homes, loading: false, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setState({ homes: [], loading: false, error });
        }
      });
    return () => controller.abort();
  }, [reloadKey]);

  function search(values) {
    const query = new URLSearchParams(values);
    navigate(`/stays?${query.toString()}`);
  }

  return (
    <main className="wrap page-main">
      <section className="home-intro">
        <h1 tabIndex="-1">Find a stay that feels like yours</h1>
        <p>Thoughtful homes for weekends away and longer stays.</p>
        <SearchBar initial={{ q: params.get('q') }} onSubmit={search} />
      </section>
      <section className="featured-section" aria-labelledby="featured-heading">
        <div className="section-heading">
          <h2 id="featured-heading">A few places to start</h2>
          <Link to="/stays">Browse all stays</Link>
        </div>
        <HomeGrid {...state} onRetry={() => setReloadKey((key) => key + 1)} />
      </section>
    </main>
  );
}
