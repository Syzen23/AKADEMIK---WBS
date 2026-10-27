// src/modules/assets/assets.repository.js
const pool = require('../../config/db');

const createAsset = async ({ project_id, title, asset_type, asset_url }) => {
  const result = await pool.query(
    `INSERT INTO project_assets (project_id, title, asset_type, asset_url)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [project_id, title, asset_type, asset_url]
  );
  return result.rows[0];
};

const findAssetsByProjectId = async (project_id) => {
  const result = await pool.query(
    `SELECT * FROM project_assets WHERE project_id = $1 ORDER BY created_at DESC`,
    [project_id]
  );
  return result.rows;
};

const deleteAsset = async (id) => {
  await pool.query('DELETE FROM project_assets WHERE id = $1', [id]);
};

module.exports = { createAsset, findAssetsByProjectId, deleteAsset };
