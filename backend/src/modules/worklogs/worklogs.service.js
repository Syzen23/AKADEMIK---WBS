// src/modules/worklogs/worklogs.service.js
const worklogsRepo = require('./worklogs.repository');
const tasksRepo = require('../tasks/tasks.repository');
const { invalidateCachePattern } = require('../../utils/cache');

const addWorkLog = async (taskId, userId, body) => {
  const task = await tasksRepo.findTaskById(taskId);
  if (!task) throw { statusCode: 404, message: 'Task not found.' };

  const log = await worklogsRepo.createWorkLog({
    task_id: taskId,
    user_id: userId,
    ...body,
  });

  await invalidateCachePattern(`project:${task.project_id}:*`);
  return log;
};

const getWorkLogsByTask = async (taskId) => {
  return worklogsRepo.findWorkLogsByTaskId(taskId);
};

const getWorkLogsByProject = async (projectId) => {
  return worklogsRepo.findWorkLogsByProjectId(projectId);
};

const deleteWorkLog = async (logId) => {
  await worklogsRepo.deleteWorkLog(logId);
};

module.exports = { addWorkLog, getWorkLogsByTask, getWorkLogsByProject, deleteWorkLog };
