// src/utils/generateInviteCode.js
const crypto = require('crypto');

/**
 * Generate a random alphanumeric invite code of specified length
 * @param {number} length - default 8
 * @returns {string}
 */
const generateInviteCode = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
};

module.exports = { generateInviteCode };
