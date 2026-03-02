const userService = require('../services/user.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { updateUserSchema, assignRolesSchema, listUsersSchema } = require('../validations/user.validator');

const listUsers = async (req, res, next) => {
  try {
    const { error, value } = listUsersSchema.validate(req.query);
    if (error) throw ApiError.badRequest('Invalid query params', error.details.map((d) => d.message));

    const result = await userService.listUsers(value);
    return ApiResponse.success(res, result);
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return ApiResponse.success(res, user);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { error, value } = updateUserSchema.validate(req.body, { abortEarly: false });
    if (error) throw ApiError.badRequest('Validation failed', error.details.map((d) => d.message));

    const user = await userService.updateUser(req.params.id, value, req.user.sub, req.user.roles);
    return ApiResponse.success(res, user, 'User updated');
  } catch (err) {
    next(err);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await userService.toggleUserStatus(req.params.id);
    return ApiResponse.success(res, user, `User ${user.is_active ? 'activated' : 'deactivated'}`);
  } catch (err) {
    next(err);
  }
};

const assignRoles = async (req, res, next) => {
  try {
    const { error, value } = assignRolesSchema.validate(req.body, { abortEarly: false });
    if (error) throw ApiError.badRequest('Validation failed', error.details.map((d) => d.message));

    const user = await userService.assignRoles(req.params.id, value.roleIds);
    return ApiResponse.success(res, user, 'Roles assigned');
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    return ApiResponse.success(res, null, 'User deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, getUserById, updateUser, toggleUserStatus, assignRoles, deleteUser };
