const { Op } = require('sequelize');
const db = require('../models');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwtHelper');
const ApiError = require('../utils/ApiError');
const config = require('../config');

const { Users, Roles, RefreshToken } = db;

const buildTokenPayload = (user, roles) => ({
  sub: user.id,
  email: user.email,
  roles: roles.map((r) => r.role_name || r.roleName || r.name),
});

const storeRefreshToken = async (token, userId, req) => {
  const decoded = verifyRefreshToken(token);
  await RefreshToken.create({
    user_id: userId,
    token,
    expires_at: new Date(decoded.exp * 1000),
    ip_address: req.ip,
    user_agent: req.headers['user-agent'] || null,
  });
};

// ── Register ──────────────────────────────────────────────────
const register = async (dto, req) => {
  const existing = await Users.findOne({ where: { email: dto.email } });
  if (existing) throw ApiError.conflict('Email already registered');

  const user = await Users.create(dto);

  // Assign default 'user' role
  const defaultRole = await Roles.findOne({ where: { role_name: 'user' } });
  if (defaultRole) await user.addRoles(defaultRole);

  const roles = await user.getRoles();
  const tokens = generateTokenPair(buildTokenPayload(user, roles));
  await storeRefreshToken(tokens.refreshToken, user.id, req);

  return { user, tokens };
};

// ── Login ─────────────────────────────────────────────────────
const login = async ({ email, password }, req) => {
  const user = await Users.findOne({
    where: { email },
    include: [{ model: Roles, attributes: ["id", "role_name", "status"], through: { attributes: [] }, as: 'Roles' }],
  });

  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.is_active) throw ApiError.forbidden('Account is disabled');

  await user.update({ last_login_at: new Date() });

  const tokens = generateTokenPair(buildTokenPayload(user, user.Roles || []));
  await storeRefreshToken(tokens.refreshToken, user.id, req);

  return { user, tokens };
};

// ── Refresh Tokens ────────────────────────────────────────────
const refreshTokens = async (token, req) => {
  const decoded = verifyRefreshToken(token); // throws if invalid/expired

  const storedToken = await RefreshToken.findOne({
    where: { token, user_id: decoded.sub, is_revoked: false },
  });

  if (!storedToken || storedToken.isExpired()) {
    throw ApiError.unauthorized('Refresh token is invalid or expired');
  }

  // Rotate: revoke old token
  await storedToken.update({ is_revoked: true, revoked_at: new Date() });

  const user = await Users.findByPk(decoded.sub, {
    include: [{ model: Roles, attributes: ["id", "role_name", "status"], through: { attributes: [] }, as: 'Roles' }],
  });

  if (!user || !user.is_active) throw ApiError.unauthorized('User not found or disabled');

  const newTokens = generateTokenPair(buildTokenPayload(user, user.Roles || []));
  await storeRefreshToken(newTokens.refreshToken, user.id, req);

  return newTokens;
};

// ── Logout ────────────────────────────────────────────────────
const logout = async (token) => {
  if (!token) return;
  await RefreshToken.update({ is_revoked: true }, { where: { token } });
};

// ── Logout All Sessions ───────────────────────────────────────
const logoutAll = async (userId) => {
  await RefreshToken.update({ is_revoked: true }, { where: { user_id: userId } });
};

// ── Change Password ───────────────────────────────────────────
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await Users.findByPk(userId);
  if (!user) throw ApiError.notFound('User not found');

  const valid = await user.comparePassword(currentPassword);
  if (!valid) throw ApiError.badRequest('Current password is incorrect');

  await user.update({ password: newPassword });
  // Revoke all refresh tokens for security
  await RefreshToken.update({ is_revoked: true, revoked_at: new Date() }, { where: { user_id: userId } });
};

// ── Get Me ────────────────────────────────────────────────────
const getMe = async (userId) => {
  const user = await Users.findByPk(userId, {
    include: [{ model: Roles, attributes: ["id", "role_name"], through: { attributes: [] }, as: 'Roles' }],
  });
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

module.exports = { register, login, refreshTokens, logout, logoutAll, changePassword, getMe };
