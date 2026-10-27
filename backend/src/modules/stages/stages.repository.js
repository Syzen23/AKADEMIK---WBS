// src/modules/stages/stages.repository.js
const pool = require('../../config/db');

const createStage = async ({ project_id, name, stage_order }) => {
  const result = await pool.query(
    `INSERT INTO stages (project_id, name, stage_order)
     VALUES ($1, $2, $3) RETURNING *`,
    [project_id, name, stage_order]
  );
  return result.rows[0];
};

const findStagesByProjectId = async (project_id) => {
  const result = await pool.query(
    `SELECT s.*, COUNT(t.id)::int AS task_count
     FROM stages s
     LEFT JOIN tasks t ON t.stage_id = s.id
     WHERE s.project_id = $1
     GROUP BY s.id
     ORDER BY s.stage_order ASC`,
    [project_id]
  );
  return result.rows;
};

const findStageById = async (id) => {
  const result = await pool.query('SELECT * FROM stages WHERE id = $1', [id]);
  return result.rows[0] || null;
};

const updateStage = async (id, { name, stage_order }) => {
  const result = await pool.query(
    `UPDATE stages
     SET name = COALESCE($1, name),
         stage_order = COALESCE($2, stage_order)
     WHERE id = $3 RETURNING *`,
    [name, stage_order, id]
  );
  return result.rows[0] || null;
};

const deleteStage = async (id) => {
  await pool.query('DELETE FROM stages WHERE id = $1', [id]);
};

module.exports = { createStage, findStagesByProjectId, findStageById, updateStage, deleteStage };
