// Core modules

// External modules
const { body } = require('express-validator');

// Local modules

// Normalizes email addresses before signup and login lookups.
function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

// Validates and sanitizes fields submitted by POST /api/auth/signup.
const signupValidator = [
  body('firstName')
    .trim()
    .isLength({ min: 3 })
    .matches(/^[A-Za-z]+$/),
  body('lastName')
    .trim()
    .isLength({ min: 2 })
    .matches(/^[A-Za-z]+$/),
  body('email').customSanitizer(normalizeEmail).isEmail(),
  body('password')
    .isLength({ min: 8 })
    .matches(/[a-z]/)
    .matches(/[A-Z]/)
    .matches(/[!@#$%&*(),.?":{}|<>]/),
  body('confirmPassword').custom((value, { req }) => value === req.body.password),
  body('terms').custom((value) => value === 'on' || value === true),
];

module.exports = { signupValidator, normalizeEmail };
