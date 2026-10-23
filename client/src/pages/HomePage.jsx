// React
import { useEffect, useState } from 'react';

// External libraries
import { useNavigate, useSearchParams } from 'react-router-dom';

// Local files
import { getHomes } from '../api/homesApi';
import { HomeGrid } from '../components/HomeGrid';
import { SearchBar } from '../components/SearchBar';

// Presents trip search and the first four featured homes.
export function HomePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [state, setState] = useState({ homes: [], loading: true, error: null });

  useEffect(() => {
    getHomes(new URLSearchParams())
      .then((result) =>
        setState({ homes: result.homes.slice(0, 4), loading: false, error: null }),
      )
      .catch((error) => setState({ homes: [], loading: false, error }));
  }, []);

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
          <a href="/stays">Browse all stays</a>
        </div>
        <HomeGrid {...state} onRetry={() => window.location.reload()} />
      </section>
    </main>
  );
}
