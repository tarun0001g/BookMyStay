// Core modules
const crypto = require('crypto');

// External modules

// Local modules
const { sendError } = require('../utility/apiResponse');

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Requires a session token header for API writes and accepts legacy form tokens.
function csrf(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(24).toString('hex');
  }

  if (MUTATING_METHODS.has(req.method)) {
    const isApiRequest =
      req.originalUrl === '/api' || req.originalUrl.startsWith('/api/');
    const token = isApiRequest
      ? req.get('X-CSRF-Token')
      : req.get('X-CSRF-Token') || req.body?._csrf || req.query._csrf;
    if (!token || token !== req.session.csrfToken) {
      if (isApiRequest) {
        return sendError(res, 403, 'Invalid security token.');
      }

      return res.status(403).send('Invalid security token. Please reload the page.');
    }
  }

  next();
}

module.exports = csrf;
