// React
import { useState } from 'react';

// External libraries
import { useLocation, useNavigate } from 'react-router-dom';

// Local files
import { createBooking } from '../api/bookingsApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FieldError } from './FieldError';

// Books a home for the selected dates and guest count.
export function BookingForm({ home }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

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
      showToast('Your stay is booked.');
      navigate('/bookings');
    } catch (error) {
      setErrors(error.errors || {});
      showToast(error.message);
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
        <input name="checkIn" type="date" required />
      </label>
      <FieldError message={errors.checkIn || errors.dates} />
      <label>
        Check-out
        <input name="checkOut" type="date" required />
      </label>
      <FieldError message={errors.checkOut || errors.dates} />
      <label>
        Guests
        <input name="guests" type="number" min="1" defaultValue="1" required />
      </label>
      <FieldError message={errors.guests} />
      <button className="primary-button" type="submit" disabled={sending}>
        {sending ? 'Booking...' : user ? 'Confirm booking' : 'Log in to book'}
      </button>
    </form>
  );
}
