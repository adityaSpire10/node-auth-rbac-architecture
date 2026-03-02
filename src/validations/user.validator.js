const Joi = require('joi');

const updateUserSchema = Joi.object({
  first_name: Joi.string().trim().min(1).max(100).optional(),
  last_name: Joi.string().trim().min(1).max(100).optional(),
  phone: Joi.string().optional().allow(null, ''),
  avatar_url: Joi.string().uri().optional().allow(null, ''),
}).min(1);

const assignRolesSchema = Joi.object({
  roleIds: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
});

const listUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().optional(),
  is_active: Joi.boolean().optional(),
});

module.exports = { updateUserSchema, assignRolesSchema, listUsersSchema };
