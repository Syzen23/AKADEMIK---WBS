// src/modules/auth/auth.controller.js
const authService = require('./auth.service');
const { sendSuccess, sendError } = require('../../utils/response');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return sendSuccess(res, 'Registration successful.', user, 201);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.message, err.statusCode);
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return sendSuccess(res, 'Login successful.', result);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.message, err.statusCode);
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    return sendSuccess(res, 'Profile retrieved.', user);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.message, err.statusCode);
    next(err);
  }
};

module.exports = { register, login, getProfile };
