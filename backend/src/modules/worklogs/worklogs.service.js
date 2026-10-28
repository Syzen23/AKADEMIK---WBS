// src/modules/worklogs/worklogs.service.js
const worklogsRepo = require('./worklogs.repository');
const tasksRepo = require('../tasks/tasks.repository');
const { invalidateCachePattern } = require('../../utils/cache');

const addWorkLog = async (taskId, userId, body) => {
  const task = await tasksRepo.findTaskById(taskId);
  if (!task) throw { statusCode: 404, message: 'Task not found.' };

  // Enforce max 4 distinct contributors limit per task
  const existingContributors = await worklogsRepo.countDistinctContributors(taskId);
  const isAlreadyContributor = existingContributors.includes(userId);

  if (!isAlreadyContributor && existingContributors.length >= 4) {
    throw {
      statusCode: 400,
      message: 'Batas maksimal pelaksana untuk satu tugas adalah 4 orang.',
    };
  }

  const log = await worklogsRepo.createWorkLog({
    task_id: taskId,
    user_id: userId,
    ...body,
  });

  // If task has no primary assignee yet, auto-assign this user!
  if (!task.assigned_to) {
    await tasksRepo.updateTask(taskId, { assigned_to: userId });
  }

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
