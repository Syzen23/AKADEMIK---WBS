// src/modules/memos/memos.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./memos.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Memos
 *   description: Catatan Cepat / Memo seminar dan kuliah mahasiswa
 */

/**
 * @swagger
 * /api/memos:
 *   get:
 *     summary: Dapatkan semua catatan memo pribadi user
 *     tags: [Memos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil memuat daftar memo
 *   post:
 *     summary: Buat catatan cepat baru
 *     tags: [Memos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Memo berhasil disimpan
 */
router.route('/')
  .get(controller.getMemos)
  .post(controller.createMemo);

/**
 * @swagger
 * /api/memos/{memoId}:
 *   put:
 *     summary: Perbarui catatan memo
 *     tags: [Memos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Memo berhasil diperbarui
 *   delete:
 *     summary: Hapus catatan memo
 *     tags: [Memos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Memo berhasil dihapus
 */
router.route('/:memoId')
  .put(controller.updateMemo)
  .delete(controller.deleteMemo);

/**
 * @swagger
 * /api/memos/{memoId}/convert:
 *   post:
 *     summary: Konversi catatan memo menjadi tugas proyek WBS
 *     tags: [Memos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - stage_id
 *             properties:
 *               project_id:
 *                 type: string
 *               stage_id:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *               due_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Berhasil dikonversi menjadi tugas proyek
 */
router.post('/:memoId/convert', controller.convertMemoToTask);

module.exports = router;
