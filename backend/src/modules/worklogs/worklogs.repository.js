// src/modules/worklogs/worklogs.repository.js
const pool = require('../../config/db');

const createWorkLog = async ({ task_id, user_id, hours_spent, activity_notes }) => {
  const result = await pool.query(
    `INSERT INTO work_logs (task_id, user_id, hours_spent, activity_notes)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [task_id, user_id, hours_spent, activity_notes]
  );
  return result.rows[0];
};

const findWorkLogsByTaskId = async (task_id) => {
  const result = await pool.query(
    `SELECT wl.*, u.name AS user_name, u.avatar_url
     FROM work_logs wl
     JOIN users u ON u.id = wl.user_id
     WHERE wl.task_id = $1
     ORDER BY wl.logged_at DESC`,
    [task_id]
  );
  return result.rows;
};

const findWorkLogsByProjectId = async (project_id) => {
  const result = await pool.query(
    `SELECT wl.*, u.name AS user_name, t.title AS task_title
     FROM work_logs wl
     JOIN users u ON u.id = wl.user_id
     JOIN tasks t ON t.id = wl.task_id
     WHERE t.project_id = $1
     ORDER BY wl.logged_at DESC`,
    [project_id]
  );
  return result.rows;
};

const countDistinctContributors = async (task_id) => {
  const result = await pool.query(
    `SELECT DISTINCT user_id FROM work_logs WHERE task_id = $1`,
    [task_id]
  );
  return result.rows.map((r) => r.user_id);
};

const deleteWorkLog = async (id) => {
  await pool.query('DELETE FROM work_logs WHERE id = $1', [id]);
};

module.exports = {
  createWorkLog,
  findWorkLogsByTaskId,
  findWorkLogsByProjectId,
  deleteWorkLog,
  countDistinctContributors,
};
