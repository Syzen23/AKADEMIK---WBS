// src/modules/memos/memos.service.js
const memoRepo = require('./memos.repository');
const tasksRepo = require('../tasks/tasks.repository');
const projectsRepo = require('../projects/projects.repository');
const { invalidateCache } = require('../../utils/cache');

const createMemo = async (userId, { title, content }) => {
  if (!title || !title.trim()) {
    const error = new Error('Judul catatan wajib diisi.');
    error.statusCode = 400;
    throw error;
  }
  if (!content || !content.trim()) {
    const error = new Error('Isi catatan wajib diisi.');
    error.statusCode = 400;
    throw error;
  }

  return memoRepo.createMemo({
    user_id: userId,
    title: title.trim(),
    content: content.trim(),
  });
};

const getMemos = async (userId) => {
  return memoRepo.findMemosByUserId(userId);
};

const getMemoById = async (userId, memoId) => {
  const memo = await memoRepo.findMemoById(memoId);
  if (!memo) {
    const error = new Error('Catatan tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }
  if (memo.user_id !== userId) {
    const error = new Error('Anda tidak memiliki akses ke catatan ini.');
    error.statusCode = 403;
    throw error;
  }
  return memo;
};

const updateMemo = async (userId, memoId, { title, content }) => {
  await getMemoById(userId, memoId);
  return memoRepo.updateMemo(memoId, {
    title: title ? title.trim() : undefined,
    content: content ? content.trim() : undefined,
  });
};

const deleteMemo = async (userId, memoId) => {
  await getMemoById(userId, memoId);
  await memoRepo.deleteMemo(memoId);
};

const convertMemoToTask = async (userId, memoId, { project_id, stage_id, priority, due_date, estimated_hours }) => {
  const memo = await getMemoById(userId, memoId);

  if (!project_id) {
    const error = new Error('Proyek tujuan wajib dipilih.');
    error.statusCode = 400;
    throw error;
  }

  if (!stage_id) {
    const error = new Error('Tahap WBS wajib dipilih.');
    error.statusCode = 400;
    throw error;
  }

  // Verify user is member of project
  const members = await projectsRepo.getProjectMembers(project_id);
  const isMember = members.some((m) => m.id === userId || m.user_id === userId);
  if (!isMember) {
    const error = new Error('Anda bukan anggota dari ruang proyek ini.');
    error.statusCode = 403;
    throw error;
  }

  // Create the task
  const task = await tasksRepo.createTask({
    project_id,
    stage_id,
    assigned_to: userId,
    title: memo.title,
    description: memo.content,
    estimated_hours: estimated_hours || 0,
    priority: priority || 'Medium',
    due_date: due_date || null,
  });

  // Mark memo as converted
  const updatedMemo = await memoRepo.markMemoAsConverted(memoId, {
    linked_project_id: project_id,
    linked_task_id: task.id,
  });

  // Invalidate Redis dashboard cache for this project
  await invalidateCache([
    `dashboard:${project_id}`,
    `workload:${project_id}`,
    `critical_path:${project_id}`,
  ]);

  return { task, memo: updatedMemo };
};

module.exports = {
  createMemo,
  getMemos,
  getMemoById,
  updateMemo,
  deleteMemo,
  convertMemoToTask,
};
