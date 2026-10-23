// External modules
const { body } = require('express-validator');

// Validates date and guest fields submitted to POST /api/bookings.
const bookingValidator = [
  body('checkIn').isISO8601({ strict: true, strictSeparator: true }),
  body('checkOut').isISO8601({ strict: true, strictSeparator: true }),
  body('guests').isInt({ min: 1 }),
];

module.exports = bookingValidator;
