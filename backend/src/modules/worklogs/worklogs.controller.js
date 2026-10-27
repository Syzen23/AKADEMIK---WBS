// src/modules/worklogs/worklogs.controller.js
const service = require('./worklogs.service');
const { sendSuccess, sendError } = require('../../utils/response');

const addWorkLog = async (req, res, next) => {
  try {
    const log = await service.addWorkLog(req.params.taskId, req.user.id, req.body);
    return sendSuccess(res, 'Work log added.', log, 201);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.message, err.statusCode);
    next(err);
  }
};

const getWorkLogsByTask = async (req, res, next) => {
  try {
    const logs = await service.getWorkLogsByTask(req.params.taskId);
    return sendSuccess(res, 'Work logs retrieved.', logs);
  } catch (err) {
    next(err);
  }
};

const getWorkLogsByProject = async (req, res, next) => {
  try {
    const logs = await service.getWorkLogsByProject(req.params.projectId);
    return sendSuccess(res, 'Work logs retrieved.', logs);
  } catch (err) {
    next(err);
  }
};

const deleteWorkLog = async (req, res, next) => {
  try {
    await service.deleteWorkLog(req.params.logId);
    return sendSuccess(res, 'Work log deleted.');
  } catch (err) {
    next(err);
  }
};

module.exports = { addWorkLog, getWorkLogsByTask, getWorkLogsByProject, deleteWorkLog };
