// External modules
const { body } = require('express-validator');
const { AMENITIES, PROPERTY_TYPES } = require('../models/home');

// Validates home fields before POST /admin/add-home and POST /admin/edit-home.
const homeValidator = [
  body('houseName').trim().isLength({ min: 3, max: 100 }),
  body('location').trim().isLength({ min: 2, max: 100 }),
  body('price').isFloat({ min: 0 }),
  body('rating').isFloat({ min: 0, max: 5 }),
  body('description').trim().isLength({ min: 10, max: 1000 }),
  body('propertyType').optional().isIn(PROPERTY_TYPES),
  body('amenities')
    .optional()
    .customSanitizer((value) => (Array.isArray(value) ? value : [value]))
    .isArray()
    .custom((values) => values.every((value) => AMENITIES.includes(value))),
  body('guestCapacity').optional().isInt({ min: 1, max: 16 }),
];

module.exports = homeValidator;
