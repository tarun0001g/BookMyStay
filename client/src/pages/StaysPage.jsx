// React

// External libraries
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

// Local files
import { HomeGrid } from '../components/HomeGrid';
import { SearchBar } from '../components/SearchBar';
import { useHomes } from '../hooks/useHomes';

// Displays URL-backed search filters, listing results, and pagination.
export function StaysPage() {
  const [params, setParams] = useSearchParams();
  const { homes, totalPages, loading, error, retry } = useHomes(params);
  const page = Number(params.get('page') || 1);
  const query = useMemo(() => Object.fromEntries(params), [params]);

  function update(values) {
    const next = new URLSearchParams(params);
    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    });
    next.delete('page');
    setParams(next);
  }

  return (
    <main className="wrap page-main">
      <h1 tabIndex="-1">Find your stay</h1>
      <SearchBar
        key={params.toString()}
        initial={query}
        onSubmit={update}
        compact
        busy={loading}
      />
      <form
        key={params.toString()}
        className="filters"
        onSubmit={(event) => {
          event.preventDefault();
          update(Object.fromEntries(new FormData(event.currentTarget)));
        }}
      >
        <label>
          Minimum price
          <input
            name="minPrice"
            type="number"
            min="0"
            defaultValue={query.minPrice || ''}
          />
        </label>
        <label>
          Maximum price
          <input
            name="maxPrice"
            type="number"
            min="0"
            defaultValue={query.maxPrice || ''}
          />
        </label>
        <label>
          Sort by
          <select name="sort" defaultValue={query.sort || 'price'}>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
          </select>
        </label>
        <button className="secondary-button" type="submit" disabled={loading}>
          Apply filters
        </button>
      </form>
      <HomeGrid homes={homes} loading={loading} error={error} onRetry={retry} />
      {!loading && !error && (
        <nav className="pagination" aria-label="Search pages">
          <button
            className="secondary-button"
            type="button"
            disabled={loading || page <= 1}
            onClick={() => setParams({ ...query, page: String(page - 1) })}
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            className="secondary-button"
            type="button"
            disabled={loading || page >= totalPages}
            onClick={() => setParams({ ...query, page: String(page + 1) })}
          >
            Next
          </button>
        </nav>
      )}
    </main>
  );
}
