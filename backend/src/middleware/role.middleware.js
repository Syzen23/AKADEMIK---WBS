// src/middleware/role.middleware.js
const pool = require('../config/db');
const { sendError } = require('../utils/response');

/**
 * Checks if the authenticated user is the leader of the project
 * req.params.projectId must be available
 */
const requireLeader = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT role FROM project_members
       WHERE project_id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'You are not a member of this project.', 403);
    }

    if (result.rows[0].role !== 'leader') {
      return sendError(res, 'Only project leaders can perform this action.', 403);
    }

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Checks if the authenticated user is a member (any role) of the project
 */
const requireMember = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT role FROM project_members
       WHERE project_id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'You are not a member of this project.', 403);
    }

    req.projectRole = result.rows[0].role; // attach role for downstream use
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireLeader, requireMember };
