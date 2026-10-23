// React

// External libraries

// Local files

// Collects trip details and submits them as URL search parameters.
export function SearchBar({ initial = {}, onSubmit, compact = false, busy = false }) {
  function handleSubmit(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    onSubmit(Object.fromEntries([...values].filter(([, value]) => value !== '')));
  }

  return (
    <form
      className={`search-panel${compact ? ' search-panel-compact' : ''}`}
      onSubmit={handleSubmit}
    >
      <label>
        Where are you going?
        <input name="q" defaultValue={initial.q || ''} placeholder="City or home name" />
      </label>
      <label>
        Check-in
        <input name="checkIn" type="date" defaultValue={initial.checkIn || ''} />
      </label>
      <label>
        Check-out
        <input name="checkOut" type="date" defaultValue={initial.checkOut || ''} />
      </label>
      <label>
        Guests
        <input
          name="guests"
          type="number"
          min="1"
          defaultValue={initial.guests || ''}
          placeholder="2"
        />
      </label>
      <button className="primary-button" type="submit" disabled={busy}>
        {busy ? 'Searching…' : 'Search stays'}
      </button>
    </form>
  );
}
