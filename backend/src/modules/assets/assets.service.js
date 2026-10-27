// src/modules/assets/assets.service.js
const assetsRepo = require('./assets.repository');

const addAsset = async (projectId, body) => {
  return assetsRepo.createAsset({ ...body, project_id: projectId });
};

const getAssets = async (projectId) => {
  return assetsRepo.findAssetsByProjectId(projectId);
};

const deleteAsset = async (assetId) => {
  await assetsRepo.deleteAsset(assetId);
};

module.exports = { addAsset, getAssets, deleteAsset };
