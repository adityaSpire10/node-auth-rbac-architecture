const { verifyAccessToken } = require('../utils/jwtHelper');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Extracts Bearer token from Authorization header.
 * Falls back to session-based userId for session-only flows.
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) throw ApiError.unauthorized('Access token required');

    const payload = verifyAccessToken(token); // throws on invalid/expired
    req.user = payload; // { sub, email, roles, iat, exp }
    next();
  } catch (err) {
    // Pass ApiErrors through; convert others to 401
    if (err.isOperational) return next(err);
    return ApiResponse.unauthorized(res, 'Authentication failed');
  }
};

module.exports = { authenticate };
