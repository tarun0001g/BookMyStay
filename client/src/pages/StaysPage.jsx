// React

// External libraries
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

// Local files
import { HomeGrid } from '../components/HomeGrid';
import { SearchBar } from '../components/SearchBar';
import { useHomes } from '../hooks/useHomes';

const propertyTypes = ['cottage', 'villa', 'farmhouse', 'apartment'];
const amenityOptions = [
  ['wifi', 'Wi-Fi'],
  ['pool', 'Pool'],
  ['kitchen', 'Kitchen'],
  ['parking', 'Parking'],
  ['pet-friendly', 'Pet friendly'],
];

// Displays URL-backed search filters, listing results, and pagination.
export function StaysPage() {
  const [params, setParams] = useSearchParams();
  const { homes, total, totalPages, loading, error, retry } = useHomes(params);
  const page = Number(params.get('page') || 1);
  const query = useMemo(() => Object.fromEntries(params), [params]);

  function update(values) {
    const next = new URLSearchParams(params);
    [
      'q',
      'checkIn',
      'checkOut',
      'guests',
      'minPrice',
      'maxPrice',
      'sort',
      'propertyType',
      'amenities',
      'minRating',
    ].forEach((key) => next.delete(key));
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
      <nav className="quick-filters" aria-label="Popular filters">
        <Link to="/stays?propertyType=villa">Villas</Link>
        <Link to="/stays?propertyType=farmhouse">Farmhouses</Link>
        <Link to="/stays?amenities=pet-friendly">Pet friendly</Link>
        <Link to="/stays?amenities=pool">Pool</Link>
        <Link to="/stays?maxPrice=1999">Under ₹1,999</Link>
      </nav>
      <SearchBar
        key={params.toString()}
        initial={query}
        onSubmit={update}
        compact
        busy={loading}
      >
        <div className="stay-filter-panel">
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
              <option value="price">Price: low to high</option>
              <option value="priceDesc">Price: high to low</option>
              <option value="rating">Highest rating</option>
            </select>
          </label>
          <label>
            Property type
            <select name="propertyType" defaultValue={query.propertyType || ''}>
              <option value="">Any type</option>
              {propertyTypes.map((type) => (
                <option value={type} key={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Minimum rating
            <select name="minRating" defaultValue={query.minRating || ''}>
              <option value="">Any rating</option>
              <option value="4">4.0+</option>
              <option value="4.5">4.5+</option>
            </select>
          </label>
          <fieldset className="amenity-options search-amenities">
            <legend>Amenities</legend>
            {amenityOptions.map(([value, label]) => (
              <label key={value}>
                <input
                  type="checkbox"
                  name="amenities"
                  value={value}
                  defaultChecked={query.amenities?.split(',').includes(value)}
                />
                {label}
              </label>
            ))}
          </fieldset>
        </div>
      </SearchBar>
      <div className="results-heading">
        <div>
          <h2>Available stays</h2>
          {!loading && !error && (
            <p>
              {total} {total === 1 ? 'stay' : 'stays'}
            </p>
          )}
        </div>
        {params.size > 0 && (
          <button className="text-button" type="button" onClick={() => setParams({})}>
            Clear all filters
          </button>
        )}
      </div>
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
