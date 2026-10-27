// src/utils/generateInviteCode.js
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a random alphanumeric invite code of specified length
 * @param {number} length - default 8
 * @returns {string}
 */
const generateInviteCode = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const uuid = uuidv4().replace(/-/g, '');
  let code = '';
  for (let i = 0; i < length; i++) {
    const index = parseInt(uuid[i * 2] + uuid[i * 2 + 1], 16) % chars.length;
    code += chars[index];
  }
  return code;
};

module.exports = { generateInviteCode };
