// src/modules/projects/projects.repository.js
const pool = require('../../config/db');

const createProject = async ({ title, course_name, description, invite_code, leader_id, deadline }) => {
  const result = await pool.query(
    `INSERT INTO projects (title, course_name, description, invite_code, leader_id, deadline)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [title, course_name, description, invite_code, leader_id, deadline]
  );
  return result.rows[0];
};

const findProjectById = async (id) => {
  const result = await pool.query(
    `SELECT p.*, u.name AS leader_name, u.email AS leader_email
     FROM projects p
     JOIN users u ON u.id = p.leader_id
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const findProjectByInviteCode = async (invite_code) => {
  const result = await pool.query(
    'SELECT * FROM projects WHERE invite_code = $1',
    [invite_code]
  );
  return result.rows[0] || null;
};

const findProjectsByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT p.*, pm.role AS my_role, u.name AS leader_name
     FROM projects p
     JOIN project_members pm ON pm.project_id = p.id
     JOIN users u ON u.id = p.leader_id
     WHERE pm.user_id = $1
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return result.rows;
};

const updateProject = async (id, { title, course_name, description, deadline }) => {
  const result = await pool.query(
    `UPDATE projects
     SET title = COALESCE($1, title),
         course_name = COALESCE($2, course_name),
         description = COALESCE($3, description),
         deadline = COALESCE($4, deadline)
     WHERE id = $5
     RETURNING *`,
    [title, course_name, description, deadline, id]
  );
  return result.rows[0] || null;
};

const deleteProject = async (id) => {
  await pool.query('DELETE FROM projects WHERE id = $1', [id]);
};

const getProjectMembers = async (projectId) => {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.avatar_url, pm.role, pm.joined_at
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = $1
     ORDER BY pm.role DESC, pm.joined_at ASC`,
    [projectId]
  );
  return result.rows;
};

const addMember = async (projectId, userId) => {
  const result = await pool.query(
    `INSERT INTO project_members (project_id, user_id, role)
     VALUES ($1, $2, 'member')
     ON CONFLICT (project_id, user_id) DO NOTHING
     RETURNING *`,
    [projectId, userId]
  );
  return result.rows[0] || null;
};

const removeMember = async (projectId, userId) => {
  await pool.query(
    `UPDATE tasks SET assigned_to = NULL WHERE project_id = $1 AND assigned_to = $2`,
    [projectId, userId]
  );
  await pool.query(
    `DELETE FROM project_members WHERE project_id = $1 AND (user_id = $2 OR id = $2) AND role != 'leader'`,
    [projectId, userId]
  );
};

module.exports = {
  createProject,
  findProjectById,
  findProjectByInviteCode,
  findProjectsByUserId,
  updateProject,
  deleteProject,
  getProjectMembers,
  addMember,
  removeMember,
};
