// React

// External libraries

// Local files

// Collects trip details and submits them as URL search parameters.
export function SearchBar({
  initial = {},
  onSubmit,
  compact = false,
  busy = false,
  children,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const checkIn = form.elements.checkIn;
    const checkOut = form.elements.checkOut;
    const invalidDates = Boolean(
      (checkIn.value && !checkOut.value) ||
      (!checkIn.value && checkOut.value) ||
      (checkIn.value && checkOut.value && checkOut.value <= checkIn.value),
    );
    checkOut.setCustomValidity(
      invalidDates ? 'Choose a check-in and a later check-out date.' : '',
    );
    if (!form.reportValidity()) return;
    const values = new FormData(event.currentTarget);
    const query = {};
    for (const [key, value] of values) {
      if (!value) continue;
      if (Object.hasOwn(query, key)) {
        query[key] = Array.isArray(query[key])
          ? [...query[key], value]
          : [query[key], value];
      } else {
        query[key] = value;
      }
    }
    if (Array.isArray(query.amenities)) query.amenities = query.amenities.join(',');
    onSubmit(query);
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
        <input
          name="checkIn"
          type="date"
          min={today()}
          defaultValue={initial.checkIn || ''}
          onChange={(event) => {
            const checkOut = event.currentTarget.form.elements.checkOut;
            checkOut.min = event.currentTarget.value || today();
            checkOut.setCustomValidity('');
            if (checkOut.value && checkOut.value <= event.currentTarget.value)
              checkOut.value = '';
          }}
        />
      </label>
      <label>
        Check-out
        <input
          name="checkOut"
          type="date"
          min={initial.checkIn || today()}
          defaultValue={initial.checkOut || ''}
        />
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
      {children}
      <button className="primary-button" type="submit" disabled={busy}>
        {busy ? 'Searching…' : 'Search stays'}
      </button>
    </form>
  );
}

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
