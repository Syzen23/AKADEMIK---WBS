// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'akademik_wbs_default_jwt_secret_key_2026';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // { id, email, name }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired. Please login again.', 401);
    }
    return sendError(res, 'Invalid token.', 401);
  }
};

module.exports = { authenticate };
