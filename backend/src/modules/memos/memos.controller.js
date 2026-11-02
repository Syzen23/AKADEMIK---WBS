// src/modules/memos/memos.controller.js
const service = require('./memos.service');
const { sendSuccess } = require('../../utils/response');

const createMemo = async (req, res, next) => {
  try {
    const memo = await service.createMemo(req.user.id, req.body);
    return sendSuccess(res, 'Catatan berhasil disimpan.', memo, 201);
  } catch (err) {
    next(err);
  }
};

const getMemos = async (req, res, next) => {
  try {
    const memos = await service.getMemos(req.user.id);
    return sendSuccess(res, 'Daftar catatan berhasil dimuat.', memos);
  } catch (err) {
    next(err);
  }
};

const updateMemo = async (req, res, next) => {
  try {
    const memo = await service.updateMemo(req.user.id, req.params.memoId, req.body);
    return sendSuccess(res, 'Catatan berhasil diperbarui.', memo);
  } catch (err) {
    next(err);
  }
};

const deleteMemo = async (req, res, next) => {
  try {
    await service.deleteMemo(req.user.id, req.params.memoId);
    return sendSuccess(res, 'Catatan berhasil dihapus.');
  } catch (err) {
    next(err);
  }
};

const convertMemoToTask = async (req, res, next) => {
  try {
    const result = await service.convertMemoToTask(req.user.id, req.params.memoId, req.body);
    return sendSuccess(res, 'Catatan berhasil dikonversi menjadi tugas proyek.', result, 201);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createMemo,
  getMemos,
  updateMemo,
  deleteMemo,
  convertMemoToTask,
};
