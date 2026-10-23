// React
import { useMemo, useState } from 'react';

// External libraries
import { useLocation, useNavigate } from 'react-router-dom';

// Local files
import { createBooking } from '../api/bookingsApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/formatPrice';
import { FieldError } from './FieldError';

// Books a home for the selected dates and guest count.
export function BookingForm({ home }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const nights = useMemo(() => {
    if (!dates.checkIn || !dates.checkOut) return 0;
    return Math.max(
      0,
      (new Date(`${dates.checkOut}T00:00:00`) - new Date(`${dates.checkIn}T00:00:00`)) /
        86400000,
    );
  }, [dates]);

  async function submit(event) {
    event.preventDefault();
    if (!user) {
      navigate('/login', {
        state: { from: `${location.pathname}#booking` },
      });
      return;
    }
    setSending(true);
    setErrors({});
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await createBooking({ ...values, homeId: home._id });
      showToast('Your stay is booked.', { type: 'success' });
      navigate('/bookings');
    } catch (error) {
      setErrors(error.errors || {});
      showToast(error.message, { type: 'error' });
    } finally {
      setSending(false);
    }
  }

  return (
    <form id="booking" className="booking-form" onSubmit={submit}>
      <h2>Book this stay</h2>
      {!user && <p className="muted">Log in to confirm your booking.</p>}
      <label>
        Check-in
        <input
          name="checkIn"
          type="date"
          min={today()}
          required
          onChange={(event) =>
            setDates((value) => ({ ...value, checkIn: event.target.value, checkOut: '' }))
          }
        />
      </label>
      <FieldError message={errors.checkIn || errors.dates} />
      <label>
        Check-out
        <input
          name="checkOut"
          type="date"
          min={dates.checkIn || today()}
          required
          onChange={(event) =>
            setDates((value) => ({ ...value, checkOut: event.target.value }))
          }
        />
      </label>
      <FieldError message={errors.checkOut || errors.dates} />
      <label>
        Guests
        <input
          name="guests"
          type="number"
          min="1"
          max={home.guestCapacity || 16}
          defaultValue="1"
          required
        />
      </label>
      <FieldError message={errors.guests} />
      {nights > 0 && (
        <p className="booking-estimate">
          {nights} {nights === 1 ? 'night' : 'nights'} · estimated total{' '}
          <strong>{formatPrice(nights * home.price)}</strong>
        </p>
      )}
      <button className="primary-button" type="submit" disabled={sending}>
        {sending ? 'Booking...' : user ? 'Confirm booking' : 'Log in to book'}
      </button>
    </form>
  );
}

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
