// Core modules

// External modules

// Local modules

// Sends the API's shared error response shape.
function sendError(res, status, message, errors = {}) {
  return res.status(status).json({ message, errors });
}

// Converts express-validator results into field-keyed messages.
function validationErrors(result) {
  return result.array().reduce((errors, error) => {
    if (!errors[error.path]) {
      errors[error.path] = error.msg;
    }
    return errors;
  }, {});
}

module.exports = { sendError, validationErrors };
