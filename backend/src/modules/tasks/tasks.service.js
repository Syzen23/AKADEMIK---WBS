const tasksRepo = require('./tasks.repository');
const stagesRepo = require('../stages/stages.repository');
const { getCache, setCache, invalidateCachePattern } = require('../../utils/cache');

const CACHE_TTL = 300; // 5 min

const createTask = async (projectId, body) => {
  const stage = await stagesRepo.findStageById(body.stage_id);
  if (!stage || stage.project_id !== projectId) {
    throw { statusCode: 400, message: 'Tahap WBS tidak valid atau telah dihapus.' };
  }

  const task = await tasksRepo.createTask({ ...body, project_id: projectId });
  await invalidateCachePattern(`project:${projectId}:*`);
  return task;
};

const getTasks = async (projectId, filters) => {
  return tasksRepo.findTasksByProjectId(projectId, filters);
};

const getTaskById = async (taskId) => {
  const task = await tasksRepo.findTaskById(taskId);
  if (!task) throw { statusCode: 404, message: 'Task not found.' };
  return task;
};

const updateTask = async (taskId, body, requesterId, projectRole) => {
  const task = await tasksRepo.findTaskById(taskId);
  if (!task) throw { statusCode: 404, message: 'Task not found.' };

  // Members can only update status on their tasks, or claim unassigned tasks
  if (projectRole === 'member') {
    const isClaiming = !task.assigned_to && body.assigned_to === requesterId && Object.keys(body).length === 1;
    if (!isClaiming) {
      if (task.assigned_to !== requesterId) {
        throw { statusCode: 403, message: 'You can only update your own assigned tasks.' };
      }
      // Members can only change status — not reassign or change other fields
      const allowedFields = ['status'];
      const requestedFields = Object.keys(body);
      const forbidden = requestedFields.filter((f) => !allowedFields.includes(f));
      if (forbidden.length > 0) {
        throw { statusCode: 403, message: `Members cannot update: ${forbidden.join(', ')}.` };
      }
    }
  }

  if (body.stage_id) {
    const stage = await stagesRepo.findStageById(body.stage_id);
    if (!stage || stage.project_id !== task.project_id) {
      throw { statusCode: 400, message: 'Tahap WBS tujuan tidak valid atau telah dihapus.' };
    }
  }

  // BUSINESS RULE: Validate dependencies before marking Done
  if (body.status === 'Done' && task.status !== 'Done') {
    const blockers = await tasksRepo.getUnfinishedDependencies(taskId);
    if (blockers.length > 0) {
      throw {
        statusCode: 422,
        message: `Cannot mark as Done. Unfinished prerequisite tasks: ${blockers.map((b) => `"${b.title}"`).join(', ')}.`,
      };
    }
  }

  const updated = await tasksRepo.updateTask(taskId, body);

  // BUSINESS RULE: If a task was previously 'Done' and is now moved away from 'Done' (e.g. Blocked, To Do, In Progress),
  // all downstream tasks that depended on it and were 'Done' must be demoted to 'Blocked'
  if (task.status === 'Done' && body.status && body.status !== 'Done') {
    await tasksRepo.demoteDependentDoneTasks(taskId);
  }

  await invalidateCachePattern(`project:${task.project_id}:*`);
  return updated;
};

const deleteTask = async (taskId) => {
  const task = await tasksRepo.findTaskById(taskId);
  if (!task) throw { statusCode: 404, message: 'Task not found.' };
  await tasksRepo.deleteTask(taskId);
  await invalidateCachePattern(`project:${task.project_id}:*`);
};

const addDependency = async (taskId, prerequisiteTaskId) => {
  if (taskId === prerequisiteTaskId) {
    throw { statusCode: 400, message: 'A task cannot depend on itself.' };
  }

  // Prevent circular dependency (A→B and B→A)
  const reverseCheck = await tasksRepo.getUnfinishedDependencies(prerequisiteTaskId);
  const isCircular = reverseCheck.some((d) => d.prerequisite_task_id === taskId);
  if (isCircular) {
    throw { statusCode: 400, message: 'Circular dependency detected.' };
  }

  const dep = await tasksRepo.addDependency(taskId, prerequisiteTaskId);
  const task = await tasksRepo.findTaskById(taskId);
  if (task) await invalidateCachePattern(`project:${task.project_id}:*`);
  return dep;
};

const removeDependency = async (taskId, prerequisiteTaskId) => {
  await tasksRepo.removeDependency(taskId, prerequisiteTaskId);
  const task = await tasksRepo.findTaskById(taskId);
  if (task) await invalidateCachePattern(`project:${task.project_id}:*`);
};

const getDashboard = async (projectId) => {
  const cacheKey = `project:${projectId}:dashboard`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const [workload, criticalPath] = await Promise.all([
    tasksRepo.getWorkloadByUser(projectId),
    tasksRepo.getCriticalPathTasks(projectId),
  ]);

  const data = { workload, criticalPath };
  await setCache(cacheKey, data, CACHE_TTL);
  return data;
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addDependency,
  removeDependency,
  getDashboard,
};
