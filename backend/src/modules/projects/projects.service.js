// src/modules/projects/projects.service.js
const projectsRepo = require('./projects.repository');
const { generateInviteCode } = require('../../utils/generateInviteCode');
const { invalidateCachePattern } = require('../../utils/cache');

const createProject = async (userId, body) => {
  let invite_code;
  let attempts = 0;
  // Ensure unique invite code
  do {
    invite_code = generateInviteCode(8);
    const existing = await projectsRepo.findProjectByInviteCode(invite_code);
    if (!existing) break;
    attempts++;
  } while (attempts < 5);

  const project = await projectsRepo.createProject({
    ...body,
    invite_code,
    leader_id: userId,
  });

  await invalidateCachePattern(`user:${userId}:projects`);
  return project;
};

const getMyProjects = async (userId) => {
  return projectsRepo.findProjectsByUserId(userId);
};

const getProjectById = async (projectId) => {
  const project = await projectsRepo.findProjectById(projectId);
  if (!project) throw { statusCode: 404, message: 'Project not found.' };
  return project;
};

const updateProject = async (projectId, body) => {
  const project = await projectsRepo.updateProject(projectId, body);
  if (!project) throw { statusCode: 404, message: 'Project not found.' };
  return project;
};

const deleteProject = async (projectId) => {
  const project = await projectsRepo.findProjectById(projectId);
  if (!project) throw { statusCode: 404, message: 'Project not found.' };
  await projectsRepo.deleteProject(projectId);
  await invalidateCachePattern(`project:${projectId}:*`);
};

const joinByInviteCode = async (userId, invite_code) => {
  const project = await projectsRepo.findProjectByInviteCode(invite_code);
  if (!project) throw { statusCode: 404, message: 'Invalid invite code.' };

  const member = await projectsRepo.addMember(project.id, userId);
  if (!member) throw { statusCode: 409, message: 'You are already a member of this project.' };

  await invalidateCachePattern(`user:${userId}:projects`);
  return { project, role: 'member' };
};

const getProjectMembers = async (projectId) => {
  return projectsRepo.getProjectMembers(projectId);
};

const removeMember = async (projectId, targetUserId, requesterId) => {
  if (targetUserId === requesterId) {
    throw { statusCode: 400, message: 'Leaders cannot remove themselves.' };
  }
  await projectsRepo.removeMember(projectId, targetUserId);
  await invalidateCachePattern(`project:${projectId}:*`);
};

module.exports = {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  joinByInviteCode,
  getProjectMembers,
  removeMember,
};
