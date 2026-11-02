// src/modules/memos/memos.repository.js
const pool = require('../../config/db');

const createMemo = async ({ user_id, title, content }) => {
  const result = await pool.query(
    `INSERT INTO personal_memos (user_id, title, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [user_id, title, content]
  );
  return result.rows[0];
};

const findMemosByUserId = async (user_id) => {
  const result = await pool.query(
    `SELECT m.*,
            p.title AS linked_project_title,
            t.title AS linked_task_title,
            t.status AS linked_task_status
     FROM personal_memos m
     LEFT JOIN projects p ON p.id = m.linked_project_id
     LEFT JOIN tasks t ON t.id = m.linked_task_id
     WHERE m.user_id = $1
     ORDER BY m.created_at DESC`,
    [user_id]
  );
  return result.rows;
};

const findMemoById = async (id) => {
  const result = await pool.query(
    `SELECT m.*, p.title AS linked_project_title
     FROM personal_memos m
     LEFT JOIN projects p ON p.id = m.linked_project_id
     WHERE m.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const updateMemo = async (id, { title, content }) => {
  const result = await pool.query(
    `UPDATE personal_memos
     SET title = COALESCE($1, title),
         content = COALESCE($2, content),
         updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [title, content, id]
  );
  return result.rows[0] || null;
};

const deleteMemo = async (id) => {
  await pool.query('DELETE FROM personal_memos WHERE id = $1', [id]);
};

const markMemoAsConverted = async (id, { linked_project_id, linked_task_id }) => {
  const result = await pool.query(
    `UPDATE personal_memos
     SET is_converted = TRUE,
         linked_project_id = $1,
         linked_task_id = $2,
         updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [linked_project_id, linked_task_id, id]
  );
  return result.rows[0];
};

module.exports = {
  createMemo,
  findMemosByUserId,
  findMemoById,
  updateMemo,
  deleteMemo,
  markMemoAsConverted,
};
