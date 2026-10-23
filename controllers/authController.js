// Core modules
const crypto = require('crypto');

// External modules
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Local modules
const User = require('../models/user');
const { signupValidator, normalizeEmail } = require('../validators/authValidator');
const { sendError, validationErrors } = require('../utility/apiResponse');

const SESSION_SAVE_ERROR = 'Could not save the session.';

// Sends the CSRF token used by the single-page client for mutations.
exports.getCsrfToken = (req, res) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(24).toString('hex');
  }
  return res.status(200).json({ csrfToken: req.session.csrfToken });
};

// Returns the signed-in user's public session details for GET /api/auth/me.
exports.getCurrentUser = (req, res) => {
  if (!req.session.user) {
    return sendError(res, 401, 'You must be logged in.');
  }

  return res.status(200).json({ user: req.session.user });
};

// Creates a guest account through POST /api/auth/signup.
exports.signup = [
  ...signupValidator,
  async (req, res, next) => {
    const validationResultData = validationResult(req);

    if (!validationResultData.isEmpty()) {
      return sendError(
        res,
        422,
        'Please correct the highlighted fields.',
        validationErrors(validationResultData),
      );
    }

    try {
      const user = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: normalizeEmail(req.body.email),
        password: await bcrypt.hash(req.body.password, 12),
        userType: 'guest',
      });

      return res.status(201).json({
        user: publicUser(user),
        message: 'Account created.',
      });
    } catch (error) {
      if (error.code === 11000) {
        return sendError(res, 422, 'An account with that email already exists.', {
          email: 'An account with that email already exists.',
        });
      }

      return next(error);
    }
  },
];

// Starts an authenticated session through POST /api/auth/login.
exports.login = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email });
    const passwordMatches =
      user && (await bcrypt.compare(req.body.password || '', user.password));

    if (!passwordMatches) {
      return sendError(res, 422, 'Invalid email or password.', {
        email: 'Invalid email or password.',
      });
    }

    await regenerateSession(req);
    req.session.user = publicUser(user);
    req.session.csrfToken = crypto.randomBytes(24).toString('hex');
    await saveSession(req);

    return res.status(200).json({
      user: req.session.user,
      csrfToken: req.session.csrfToken,
    });
  } catch (error) {
    return next(error);
  }
};

// Ends the active session through POST /api/auth/logout.
exports.logout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logged out.' });
  });
};

// Returns only the fields safe to expose to the client.
function publicUser(user) {
  return {
    _id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    userType: user.userType,
  };
}

// Wraps session regeneration in a promise for async route handlers.
function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

// Persists login state before sending a successful response.
function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) {
        reject(new Error(SESSION_SAVE_ERROR, { cause: error }));
        return;
      }

      resolve();
    });
  });
}
