// src/modules/assets/assets.controller.js
const service = require('./assets.service');
const { sendSuccess, sendError } = require('../../utils/response');

const addAsset = async (req, res, next) => {
  try {
    const asset = await service.addAsset(req.params.projectId, req.body);
    return sendSuccess(res, 'Asset added.', asset, 201);
  } catch (err) {
    next(err);
  }
};

const getAssets = async (req, res, next) => {
  try {
    const assets = await service.getAssets(req.params.projectId);
    return sendSuccess(res, 'Assets retrieved.', assets);
  } catch (err) {
    next(err);
  }
};

const deleteAsset = async (req, res, next) => {
  try {
    await service.deleteAsset(req.params.assetId);
    return sendSuccess(res, 'Asset deleted.');
  } catch (err) {
    next(err);
  }
};

module.exports = { addAsset, getAssets, deleteAsset };
