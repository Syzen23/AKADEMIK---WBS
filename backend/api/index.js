// backend/api/index.js
// Vercel Serverless Function entry point
require('dotenv').config();
const app = require('../src/app');

module.exports = (req, res) => {
  return app(req, res);
};
