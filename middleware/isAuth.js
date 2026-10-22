// Core modules

// External modules

// Local modules
const { sendError } = require('../utility/apiResponse');

// Requires a signed-in user for API routes.
function isAuth(req, res, next) {
  if (req.session?.user) {
    return next();
  }

  return sendError(res, 401, 'You must be logged in.');
}

module.exports = isAuth;
