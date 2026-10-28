// src/modules/stages/stages.controller.js
const service = require('./stages.service');
const { sendSuccess, sendError } = require('../../utils/response');

const createStage = async (req, res, next) => {
  try {
    const stage = await service.createStage(req.params.projectId, req.body);
    return sendSuccess(res, 'Stage created.', stage, 201);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.message, err.statusCode);
    next(err);
  }
};

const getStages = async (req, res, next) => {
  try {
    const stages = await service.getStages(req.params.projectId);
    return sendSuccess(res, 'Stages retrieved.', stages);
  } catch (err) {
    next(err);
  }
};

const updateStage = async (req, res, next) => {
  try {
    const stage = await service.updateStage(req.params.stageId, req.body);
    return sendSuccess(res, 'Stage updated.', stage);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.message, err.statusCode);
    next(err);
  }
};

const deleteStage = async (req, res, next) => {
  try {
    await service.deleteStage(req.params.stageId);
    return sendSuccess(res, 'Stage deleted.');
  } catch (err) {
    if (err.statusCode) return sendError(res, err.message, err.statusCode);
    next(err);
  }
};

const applyTemplate = async (req, res, next) => {
  try {
    const stages = await service.applyTemplate(req.params.projectId);
    return sendSuccess(res, 'Template tahapan WBS berhasil diterapkan.', stages, 201);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.message, err.statusCode);
    next(err);
  }
};

module.exports = { createStage, getStages, updateStage, deleteStage, applyTemplate };
