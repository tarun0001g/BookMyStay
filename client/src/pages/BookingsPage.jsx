// React
import { useCallback, useEffect, useState } from 'react';

// External libraries
import { Link } from 'react-router-dom';

// Local files
import { cancelBooking, getBookings } from '../api/bookingsApi';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/formatPrice';
import { formatDate } from '../utils/formatDate';

// Lists bookings and allows cancellation of future confirmed stays.
export function BookingsPage() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pending, setPending] = useState('');
  const load = useCallback(
    () => getBookings().then((result) => setBookings(result.bookings)),
    [],
  );
  useEffect(() => {
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [load]);
  async function cancel(id) {
    setPending(id);
    try {
      const result = await cancelBooking(id);
      setBookings((items) =>
        items.map((item) =>
          item._id === id ? { ...item, status: result.booking.status } : item,
        ),
      );
      showToast('Booking cancelled.');
    } catch (err) {
      showToast(err.message);
    } finally {
      setPending('');
    }
  }
  return (
    <main className="wrap page-main">
      <h1 tabIndex="-1">Your bookings</h1>
      {loading && <p role="status">Loading bookings...</p>}
      {error && (
        <div className="notice" role="alert">
          {error}{' '}
          <button
            className="text-button"
            onClick={() => {
              setLoading(true);
              setError('');
              load()
                .catch((err) => setError(err.message))
                .finally(() => setLoading(false));
            }}
          >
            Try again
          </button>
        </div>
      )}
      {!loading && !error && !bookings.length && (
        <p className="empty-state">
          No bookings yet. <Link to="/stays">Find a stay</Link>
        </p>
      )}
      <div className="booking-list">
        {bookings.map((booking) => (
          <article className="booking-card" key={booking._id}>
            <h2>
              {booking.home ? (
                <Link to={`/stays/${booking.home._id}`}>{booking.home.houseName}</Link>
              ) : (
                'Listing unavailable'
              )}
            </h2>
            <p>
              {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)} ·{' '}
              {booking.guests} guests · {booking.nights} nights
            </p>
            <p>
              <strong>{formatPrice(booking.totalPrice)}</strong> · {booking.status}
            </p>
            {booking.status === 'confirmed' &&
              booking.checkIn.slice(0, 10) >= localToday() && (
                <button
                  className="secondary-button"
                  disabled={pending === booking._id}
                  onClick={() => cancel(booking._id)}
                >
                  {pending === booking._id ? 'Cancelling...' : 'Cancel booking'}
                </button>
              )}
          </article>
        ))}
      </div>
    </main>
  );
}

// Matches the server's local calendar day check for same-day cancellations.
function localToday() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}
