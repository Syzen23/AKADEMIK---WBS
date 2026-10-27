// src/modules/tasks/tasks.controller.js
const service = require('./tasks.service');
const { sendSuccess, sendError } = require('../../utils/response');

const createTask = async (req, res, next) => {
  try {
    const task = await service.createTask(req.params.projectId, req.body);
    return sendSuccess(res, 'Task created.', task, 201);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.message, err.statusCode);
    next(err);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const tasks = await service.getTasks(req.params.projectId, req.query);
    return sendSuccess(res, 'Tasks retrieved.', tasks);
  } catch (err) {
    next(err);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await service.getTaskById(req.params.taskId);
    return sendSuccess(res, 'Task retrieved.', task);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.message, err.statusCode);
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await service.updateTask(
      req.params.taskId,
      req.body,
      req.user.id,
      req.projectRole
    );
    return sendSuccess(res, 'Task updated.', task);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.message, err.statusCode);
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    await service.deleteTask(req.params.taskId);
    return sendSuccess(res, 'Task deleted.');
  } catch (err) {
    if (err.statusCode) return sendError(res, err.message, err.statusCode);
    next(err);
  }
};

const addDependency = async (req, res, next) => {
  try {
    const dep = await service.addDependency(req.params.taskId, req.body.prerequisite_task_id);
    return sendSuccess(res, 'Dependency added.', dep, 201);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.message, err.statusCode);
    next(err);
  }
};

const removeDependency = async (req, res, next) => {
  try {
    await service.removeDependency(req.params.taskId, req.params.prerequisiteTaskId);
    return sendSuccess(res, 'Dependency removed.');
  } catch (err) {
    next(err);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const data = await service.getDashboard(req.params.projectId);
    return sendSuccess(res, 'Dashboard data retrieved.', data);
  } catch (err) {
    next(err);
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask, addDependency, removeDependency, getDashboard };
