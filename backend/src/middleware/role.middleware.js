'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Restricts route access to specific roles.
 * Must be used AFTER the `protect` middleware.
 *
 * @param {...string} roles - Allowed roles (e.g. 'admin', 'customer')
 */
const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user?.role)) {
    return next(
      ApiError.forbidden(
        `Role '${req.user?.role}' is not authorised to access this resource`
      )
    );
  }
  next();
};

module.exports = { authorize };
