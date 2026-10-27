// src/modules/stages/stages.service.js
const stagesRepo = require('./stages.repository');

const createStage = async (projectId, body) => {
  return stagesRepo.createStage({ ...body, project_id: projectId });
};

const getStages = async (projectId) => {
  return stagesRepo.findStagesByProjectId(projectId);
};

const updateStage = async (stageId, body) => {
  const stage = await stagesRepo.updateStage(stageId, body);
  if (!stage) throw { statusCode: 404, message: 'Stage not found.' };
  return stage;
};

const deleteStage = async (stageId) => {
  const stage = await stagesRepo.findStageById(stageId);
  if (!stage) throw { statusCode: 404, message: 'Stage not found.' };
  await stagesRepo.deleteStage(stageId);
};

module.exports = { createStage, getStages, updateStage, deleteStage };
