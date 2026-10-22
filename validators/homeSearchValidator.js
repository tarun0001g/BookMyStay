// Core modules

// External modules
const { query } = require('express-validator');

// Local modules

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
  query('sort').optional().isIn(['price', 'rating']),
  query('page').optional().isInt({ min: 1 }),
];

module.exports = homeSearchValidator;
