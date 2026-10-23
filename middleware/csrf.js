// Local modules
const { sendError } = require('../utility/apiResponse');

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Requires the session token header for API writes.
function csrf(req, res, next) {
  if (MUTATING_METHODS.has(req.method)) {
    const token = req.get('X-CSRF-Token');
    if (!token || token !== req.session.csrfToken) {
      return sendError(res, 403, 'Invalid security token.');
    }
  }

  next();
}

module.exports = csrf;
