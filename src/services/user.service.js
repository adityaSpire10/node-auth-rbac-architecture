const { Op } = require('sequelize');
const db = require('../models');
const ApiError = require('../utils/ApiError');

const { Users, Roles } = db;

// ── List users (paginated + filterable) ───────────────────────
const listUsers = async ({ page = 1, limit = 20, search, is_active }) => {
  const offset = (page - 1) * limit;
  const where = {};

  if (search) {
    where[Op.or] = [
      { first_name: { [Op.like]: `%${search}%` } },
      { last_name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  if (is_active !== undefined) where.is_active = is_active;

  const { count, rows } = await Users.findAndCountAll({
    where,
    include: [{ model: Roles, attributes: ['id', 'name', 'description'], through: { attributes: [] } }],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    users: rows,
    pagination: {
      total: count,
      page,
      limit,
      pages: Math.ceil(count / limit),
    },
  };
};

// ── Get single user ───────────────────────────────────────────
const getUserById = async (id) => {
  const user = await Users.findByPk(id, {
    include: [{ model: Roles, attributes: ['id', 'name', 'description'], through: { attributes: [] }, as: 'Roles' }],
  });
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

// ── Update user ───────────────────────────────────────────────
const updateUser = async (id, dto, requesterId, requesterRoles = []) => {
  const user = await Users.findByPk(id);
  if (!user) throw ApiError.notFound('User not found');

  // Only admin or self can update
  const isAdmin = requesterRoles.includes('admin');
  if (!isAdmin && requesterId !== id) throw ApiError.forbidden('Cannot update another user');

  await user.update(dto);
  return getUserById(id);
};

// ── Toggle active status (admin only) ─────────────────────────
const toggleUserStatus = async (id) => {
  const user = await Users.findByPk(id);
  if (!user) throw ApiError.notFound('User not found');
  await user.update({ is_active: !user.is_active });
  return user;
};

// ── Assign roles to user (admin only) ────────────────────────
const assignRoles = async (userId, roleIds) => {
  const user = await Users.findByPk(userId);
  if (!user) throw ApiError.notFound('User not found');

  const roles = await Roles.findAll({ where: { id: roleIds } });
  if (roles.length !== roleIds.length) throw ApiError.badRequest('One or more roles not found');

  await user.setRoles(roles);
  return getUserById(userId);
};

// ── Delete user (soft) ────────────────────────────────────────
const deleteUser = async (id) => {
  const user = await Users.findByPk(id);
  if (!user) throw ApiError.notFound('User not found');
  await user.destroy();
};

module.exports = { listUsers, getUserById, updateUser, toggleUserStatus, assignRoles, deleteUser };
