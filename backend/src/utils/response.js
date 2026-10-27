// src/utils/response.js

/**
 * Send a standardized success response
 * @param {object} res - Express response object
 * @param {string} message
 * @param {any} data
 * @param {number} statusCode
 */
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

/**
 * Send a standardized error response
 * @param {object} res - Express response object
 * @param {string} message
 * @param {number} statusCode
 * @param {array} errors
 */
const sendError = (res, message, statusCode = 500, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
