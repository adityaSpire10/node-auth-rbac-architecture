const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const {
  registerSchema,
  loginSchema,
  refreshSchema,
  changePasswordSchema,
} = require('../validations/auth.validator');
const ApiError = require('../utils/ApiError');

const register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) throw ApiError.badRequest('Validation failed', error.details.map((d) => d.message));

    const { user, tokens } = await authService.register(value, req);

    // Store refresh token in session as well
    req.session.refreshToken = tokens.refreshToken;
    req.session.userId = user.id;

    return ApiResponse.created(res, { user, tokens }, 'Registration successful');
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) throw ApiError.badRequest('Validation failed', error.details.map((d) => d.message));

    const { user, tokens } = await authService.login(value, req);

    req.session.refreshToken = tokens.refreshToken;
    req.session.userId = user.id;

    return ApiResponse.success(res, { user, tokens }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const refreshTokens = async (req, res, next) => {
  try {
    // Accept token from body OR session
    const token = req.body.refreshToken || req.session.refreshToken;
    if (!token) throw ApiError.unauthorized('Refresh token required');

    const newTokens = await authService.refreshTokens(token, req);

    req.session.refreshToken = newTokens.refreshToken;

    return ApiResponse.success(res, newTokens, 'Tokens refreshed');
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.body.refreshToken || req.session.refreshToken;
    await authService.logout(token);

    req.session.destroy();

    return ApiResponse.success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

const logoutAll = async (req, res, next) => {
  try {
    await authService.logoutAll(req.user.sub);
    req.session.destroy();
    return ApiResponse.success(res, null, 'All sessions terminated');
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body, { abortEarly: false });
    if (error) throw ApiError.badRequest('Validation failed', error.details.map((d) => d.message));

    await authService.changePassword(req.user.sub, value);

    req.session.destroy();
    return ApiResponse.success(res, null, 'Password changed. Please log in again.');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.sub);
    return ApiResponse.success(res, user);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refreshTokens, logout, logoutAll, changePassword, getMe };
