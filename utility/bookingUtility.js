// Core modules

// External modules

// Local modules

const MAX_NIGHTS = 30;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

// Parses strict calendar dates and calculates their night count.
function parseBookingDates(checkIn, checkOut) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn || '')) {
    return null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkOut || '')) {
    return null;
  }

  const start = new Date(`${checkIn}T00:00:00.000Z`);
  const end = new Date(`${checkOut}T00:00:00.000Z`);
  const nights = (end - start) / MILLISECONDS_PER_DAY;

  if (start.toISOString().slice(0, 10) !== checkIn) {
    return null;
  }
  if (end.toISOString().slice(0, 10) !== checkOut) {
    return null;
  }

  return { start, end, nights };
}

// Checks date order, maximum stay length, and whether check-in is in the future.
function isValidBooking(dates) {
  const checkInDate = dates.start.toISOString().slice(0, 10);
  return checkInDate >= todayKey() && dates.nights >= 1 && dates.nights <= MAX_NIGHTS;
}

// Confirms that a booking starts today or later before allowing cancellation.
function isFutureCheckIn(checkIn) {
  return checkIn.toISOString().slice(0, 10) >= todayKey();
}

// Formats the current local calendar day for timezone-safe date comparisons.
function todayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

module.exports = { isFutureCheckIn, isValidBooking, parseBookingDates };
