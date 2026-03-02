const roleService = require('../services/role.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Joi = require('joi');

const roleSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  description: Joi.string().optional().allow(null, ''),
});

const listRoles = async (req, res, next) => {
  try {
    const roles = await roleService.listRoles();
    return ApiResponse.success(res, roles);
  } catch (err) {
    next(err);
  }
};

const getRoleById = async (req, res, next) => {
  try {
    const role = await roleService.getRoleById(req.params.id);
    return ApiResponse.success(res, role);
  } catch (err) {
    next(err);
  }
};

const createRole = async (req, res, next) => {
  try {
    const { error, value } = roleSchema.validate(req.body, { abortEarly: false });
    if (error) throw ApiError.badRequest('Validation failed', error.details.map((d) => d.message));

    const role = await roleService.createRole(value);
    return ApiResponse.created(res, role, 'Role created');
  } catch (err) {
    next(err);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const { error, value } = roleSchema.validate(req.body, { abortEarly: false });
    if (error) throw ApiError.badRequest('Validation failed', error.details.map((d) => d.message));

    const role = await roleService.updateRole(req.params.id, value);
    return ApiResponse.success(res, role, 'Role updated');
  } catch (err) {
    next(err);
  }
};

const deleteRole = async (req, res, next) => {
  try {
    await roleService.deleteRole(req.params.id);
    return ApiResponse.success(res, null, 'Role deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { listRoles, getRoleById, createRole, updateRole, deleteRole };
