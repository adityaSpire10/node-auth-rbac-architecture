const db = require('../models');
const ApiError = require('../utils/ApiError');

const { Roles } = db;

const listRoles = async () => {
  return Roles.findAll({ order: [['role_name', 'ASC']] });
};

const getRoleById = async (id) => {
  const role = await Roles.findByPk(id);
  if (!role) throw ApiError.notFound('Role not found');
  return role;
};

const createRole = async ({ name, description }) => {
  const existing = await Roles.findOne({ where: { role_name: name } });
  if (existing) throw ApiError.conflict(`Role "${name}" already exists`);
  return Roles.create({ role_name: name.toLowerCase().trim(), description });
};

const updateRole = async (id, dto) => {
  const role = await Roles.findByPk(id);
  if (!role) throw ApiError.notFound('Role not found');
  await role.update(dto);
  return role;
};

const deleteRole = async (id) => {
  const role = await Roles.findByPk(id);
  if (!role) throw ApiError.notFound('Role not found');

  // Protect certain role names of your choice
  const PROTECTED = ['admin', 'user'];
  const roleName = role.role_name || '';
  if (PROTECTED.includes(roleName.toLowerCase())) throw ApiError.forbidden('Cannot delete a protected role');

  await role.destroy();
};

module.exports = { listRoles, getRoleById, createRole, updateRole, deleteRole };
