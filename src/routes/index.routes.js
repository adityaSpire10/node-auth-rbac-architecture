const express = require("express");
const api = express.Router();

api.use('/auth', require('./auth.routes'));
api.use('/users', require('./user.routes'));
api.use('/roles', require('./role.routes'));

module.exports = api;