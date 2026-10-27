// src/modules/auth/auth.service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepo = require('./auth.repository');

const register = async ({ name, email, password }) => {
  const existing = await authRepo.findUserByEmail(email);
  if (existing) {
    throw { statusCode: 409, message: 'Email already registered.' };
  }

  const password_hash = await bcrypt.hash(password, 12);
  const user = await authRepo.createUser({ name, email, password_hash });
  return user;
};

const login = async ({ email, password }) => {
  const user = await authRepo.findUserByEmail(email);
  if (!user) {
    throw { statusCode: 401, message: 'Invalid email or password.' };
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw { statusCode: 401, message: 'Invalid email or password.' };
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const { password_hash, ...userWithoutHash } = user;
  return { user: userWithoutHash, token };
};

const getProfile = async (userId) => {
  const user = await authRepo.findUserById(userId);
  if (!user) throw { statusCode: 404, message: 'User not found.' };
  return user;
};

module.exports = { register, login, getProfile };
