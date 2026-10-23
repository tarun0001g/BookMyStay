// React

// External libraries

// Local files
import { apiRequest } from './apiClient';

// Lists the current user's bookings.
export function getBookings() {
  return apiRequest('/api/bookings');
}

// Books the selected home and dates for the current user.
export function createBooking(values) {
  return apiRequest('/api/bookings', { method: 'POST', body: values });
}

// Cancels one future booking owned by the current user.
export function cancelBooking(bookingId) {
  return apiRequest(`/api/bookings/${encodeURIComponent(bookingId)}/cancel`, {
    method: 'POST',
    body: {},
  });
}
