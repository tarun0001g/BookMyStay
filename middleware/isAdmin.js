// Core modules

// External modules

// Local modules
const { sendError } = require('../utility/apiResponse');

// Restricts admin API routes to administrator accounts.
function isAdmin(req, res, next) {
  if (req.session?.user?.userType === 'admin') {
    return next();
  }

  return sendError(res, 403, 'Administrator access is required.');
}

module.exports = isAdmin;
