const ApiError = require('../utils/ApiError');

/**
 * Role-based access control middleware.
 * Usage: authorize('admin', 'moderator')
 * Requires authenticate() to run first (sets req.user).
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized('Not authenticated'));

    const userRoles = req.user.roles || [];
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return next(ApiError.forbidden(`Requires one of: [${allowedRoles.join(', ')}]`));
    }

    next();
  };
};

module.exports = { authorize };
