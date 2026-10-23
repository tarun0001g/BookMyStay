// External modules
const { body } = require('express-validator');

// Validates home fields before POST /admin/add-home and POST /admin/edit-home.
const homeValidator = [
  body('houseName').trim().isLength({ min: 3, max: 100 }),
  body('location').trim().isLength({ min: 2, max: 100 }),
  body('price').isFloat({ min: 0 }),
  body('rating').isFloat({ min: 0, max: 5 }),
  body('description').trim().isLength({ min: 10, max: 1000 }),
];

module.exports = homeValidator;
