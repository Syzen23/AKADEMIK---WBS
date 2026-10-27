// src/modules/tasks/tasks.repository.js
const pool = require('../../config/db');

const createTask = async ({ project_id, stage_id, assigned_to, title, description, estimated_hours, priority, due_date }) => {
  const result = await pool.query(
    `INSERT INTO tasks (project_id, stage_id, assigned_to, title, description, estimated_hours, priority, due_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [project_id, stage_id, assigned_to, title, description, estimated_hours || 0, priority || 'Medium', due_date]
  );
  return result.rows[0];
};

const findTasksByProjectId = async (project_id, filters = {}) => {
  let query = `
    SELECT t.*,
           u.name AS assigned_to_name,
           u.avatar_url AS assigned_to_avatar,
           s.name AS stage_name,
           COALESCE(
             json_agg(
               json_build_object('id', dep.id, 'title', dep.title, 'status', dep.status)
             ) FILTER (WHERE dep.id IS NOT NULL),
             '[]'
           ) AS dependencies
    FROM tasks t
    LEFT JOIN users u ON u.id = t.assigned_to
    LEFT JOIN stages s ON s.id = t.stage_id
    LEFT JOIN task_dependencies td ON td.task_id = t.id
    LEFT JOIN tasks dep ON dep.id = td.prerequisite_task_id
    WHERE t.project_id = $1
  `;
  const params = [project_id];
  let paramIndex = 2;

  if (filters.stage_id) {
    query += ` AND t.stage_id = $${paramIndex++}`;
    params.push(filters.stage_id);
  }
  if (filters.status) {
    query += ` AND t.status = $${paramIndex++}`;
    params.push(filters.status);
  }
  if (filters.assigned_to) {
    query += ` AND t.assigned_to = $${paramIndex++}`;
    params.push(filters.assigned_to);
  }

  query += ` GROUP BY t.id, u.name, u.avatar_url, s.name ORDER BY t.created_at ASC`;

  const result = await pool.query(query, params);
  return result.rows;
};

const findTaskById = async (id) => {
  const result = await pool.query(
    `SELECT t.*,
            u.name AS assigned_to_name,
            u.avatar_url AS assigned_to_avatar,
            s.name AS stage_name
     FROM tasks t
     LEFT JOIN users u ON u.id = t.assigned_to
     LEFT JOIN stages s ON s.id = t.stage_id
     WHERE t.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const updateTask = async (id, fields) => {
  const setClauses = [];
  const params = [];
  let i = 1;

  const allowed = ['title', 'description', 'stage_id', 'assigned_to', 'estimated_hours', 'status', 'priority', 'due_date'];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = $${i++}`);
      params.push(fields[key]);
    }
  }

  if (setClauses.length === 0) return null;

  params.push(id);
  const result = await pool.query(
    `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
    params
  );
  return result.rows[0] || null;
};

const deleteTask = async (id) => {
  await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
};

// Dependencies
const addDependency = async (task_id, prerequisite_task_id) => {
  const result = await pool.query(
    `INSERT INTO task_dependencies (task_id, prerequisite_task_id)
     VALUES ($1, $2) RETURNING *`,
    [task_id, prerequisite_task_id]
  );
  return result.rows[0];
};

const removeDependency = async (task_id, prerequisite_task_id) => {
  await pool.query(
    'DELETE FROM task_dependencies WHERE task_id = $1 AND prerequisite_task_id = $2',
    [task_id, prerequisite_task_id]
  );
};

const getUnfinishedDependencies = async (task_id) => {
  const result = await pool.query(
    `SELECT td.prerequisite_task_id, t.title, t.status
     FROM task_dependencies td
     JOIN tasks t ON t.id = td.prerequisite_task_id
     WHERE td.task_id = $1 AND t.status != 'Done'`,
    [task_id]
  );
  return result.rows;
};

// Dashboard / Cache queries
const getWorkloadByUser = async (project_id) => {
  const result = await pool.query(
    `SELECT
       u.id AS user_id,
       u.name,
       u.avatar_url,
       COUNT(t.id) FILTER (WHERE t.status != 'Done')::int AS active_tasks,
       COALESCE(SUM(t.estimated_hours) FILTER (WHERE t.status != 'Done'), 0) AS total_estimated_hours,
       COALESCE(SUM(wl.hours_spent), 0) AS total_logged_hours
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     LEFT JOIN tasks t ON t.assigned_to = u.id AND t.project_id = $1
     LEFT JOIN work_logs wl ON wl.user_id = u.id AND wl.task_id = t.id
     WHERE pm.project_id = $1
     GROUP BY u.id, u.name, u.avatar_url
     ORDER BY total_estimated_hours DESC`,
    [project_id]
  );
  return result.rows;
};

const getCriticalPathTasks = async (project_id) => {
  // Critical = High/Critical priority, not Done, ordered by proximity to due_date
  const result = await pool.query(
    `SELECT t.*, u.name AS assigned_to_name,
            EXTRACT(EPOCH FROM (t.due_date - NOW())) / 3600 AS hours_until_due
     FROM tasks t
     LEFT JOIN users u ON u.id = t.assigned_to
     WHERE t.project_id = $1
       AND t.status != 'Done'
       AND t.priority IN ('High', 'Critical')
       AND t.due_date IS NOT NULL
     ORDER BY t.due_date ASC, t.priority DESC
     LIMIT 3`,
    [project_id]
  );
  return result.rows;
};

module.exports = {
  createTask,
  findTasksByProjectId,
  findTaskById,
  updateTask,
  deleteTask,
  addDependency,
  removeDependency,
  getUnfinishedDependencies,
  getWorkloadByUser,
  getCriticalPathTasks,
};
