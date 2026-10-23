// External modules
const { query } = require('express-validator');
const { AMENITIES, PROPERTY_TYPES } = require('../models/home');
const { isValidBooking, parseBookingDates } = require('../utility/bookingUtility');

// Validates filters accepted by GET /api/homes.
const homeSearchValidator = [
  query('q').optional().isString().isLength({ max: 100 }),
  query('minPrice').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  query('maxPrice')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .custom((maxPrice, { req }) => {
      if (!req.query.minPrice) {
        return true;
      }

      return Number(maxPrice) >= Number(req.query.minPrice);
    }),
  query('propertyType').optional().isIn(PROPERTY_TYPES),
  query('amenities')
    .optional()
    .isString()
    .bail()
    .custom((value) => value.split(',').every((item) => AMENITIES.includes(item))),
  query('minRating').optional().isFloat({ min: 0, max: 5 }),
  query('guests').optional().isInt({ min: 1, max: 16 }),
  query('checkIn').optional().isISO8601({ strict: true, strictSeparator: true }),
  query('checkOut')
    .optional()
    .isISO8601({ strict: true, strictSeparator: true })
    .custom((checkOut, { req }) => {
      if (!req.query.checkIn) return false;
      const dates = parseBookingDates(req.query.checkIn, checkOut);
      return Boolean(dates && isValidBooking(dates));
    }),
  query('checkIn').custom((checkIn, { req }) => {
    if (checkIn === undefined && req.query.checkOut === undefined) return true;
    return Boolean(req.query.checkOut);
  }),
  query('sort').optional().isIn(['price', 'priceDesc', 'rating']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 12 }),
];

module.exports = homeSearchValidator;
