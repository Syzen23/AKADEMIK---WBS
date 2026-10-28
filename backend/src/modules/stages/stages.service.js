// src/modules/stages/stages.service.js
const stagesRepo = require('./stages.repository');
const { invalidateCachePattern } = require('../../utils/cache');

const createStage = async (projectId, body) => {
  const stage = await stagesRepo.createStage({ ...body, project_id: projectId });
  await invalidateCachePattern(`project:${projectId}:*`);
  return stage;
};

const getStages = async (projectId) => {
  return stagesRepo.findStagesByProjectId(projectId);
};

const updateStage = async (stageId, body) => {
  const stage = await stagesRepo.updateStage(stageId, body);
  if (!stage) throw { statusCode: 404, message: 'Stage not found.' };
  await invalidateCachePattern(`project:${stage.project_id}:*`);
  return stage;
};

const deleteStage = async (stageId) => {
  const stage = await stagesRepo.findStageById(stageId);
  if (!stage) throw { statusCode: 404, message: 'Stage not found.' };
  await stagesRepo.deleteStage(stageId);
  await invalidateCachePattern(`project:${stage.project_id}:*`);
};

const applyTemplate = async (projectId) => {
  const defaultStages = [
    { name: 'Analisis Kebutuhan & SRS', stage_order: 1 },
    { name: 'Desain Arsitektur & UI/UX', stage_order: 2 },
    { name: 'Implementasi & Coding Fitur', stage_order: 3 },
    { name: 'Pengujian & Dokumentasi Akhir', stage_order: 4 },
  ];

  const created = [];
  for (const st of defaultStages) {
    const s = await stagesRepo.createStage({ project_id: projectId, ...st });
    created.push(s);
  }
  await invalidateCachePattern(`project:${projectId}:*`);
  return created;
};

module.exports = { createStage, getStages, updateStage, deleteStage, applyTemplate };
