// src/modules/projects/projects.controller.js
const service = require('./projects.service');
const { sendSuccess, sendError } = require('../../utils/response');

const createProject = async (req, res, next) => {
  try {
    const project = await service.createProject(req.user.id, req.body);
    return sendSuccess(res, 'Project created successfully.', project, 201);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.message, err.statusCode);
    next(err);
  }
};

const getMyProjects = async (req, res, next) => {
  try {
    const projects = await service.getMyProjects(req.user.id);
    return sendSuccess(res, 'Projects retrieved.', projects);
  } catch (err) {
    next(err);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await service.getProjectById(req.params.projectId);
    return sendSuccess(res, 'Project retrieved.', project);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.message, err.statusCode);
    next(err);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await service.updateProject(req.params.projectId, req.body);
    return sendSuccess(res, 'Project updated.', project);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.message, err.statusCode);
    next(err);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    await service.deleteProject(req.params.projectId);
    return sendSuccess(res, 'Project deleted.');
  } catch (err) {
    if (err.statusCode) return sendError(res, err.message, err.statusCode);
    next(err);
  }
};

const joinProject = async (req, res, next) => {
  try {
    const result = await service.joinByInviteCode(req.user.id, req.body.invite_code);
    return sendSuccess(res, 'Joined project successfully.', result);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.message, err.statusCode);
    next(err);
  }
};

const getMembers = async (req, res, next) => {
  try {
    const members = await service.getProjectMembers(req.params.projectId);
    return sendSuccess(res, 'Members retrieved.', members);
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    await service.removeMember(req.params.projectId, req.params.memberId, req.user.id);
    return sendSuccess(res, 'Member removed.');
  } catch (err) {
    if (err.statusCode) return sendError(res, err.message, err.statusCode);
    next(err);
  }
};

module.exports = {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  joinProject,
  getMembers,
  removeMember,
};
