// src/modules/assets/assets.routes.js
const router = require('express').Router({ mergeParams: true });
const { body } = require('express-validator');
const controller = require('./assets.controller');
const { validate } = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireLeader, requireMember } = require('../../middleware/role.middleware');

/**
 * @openapi
 * tags:
 *   name: Assets
 *   description: Project asset links (GitHub, Figma, GDrive, Docs)
 */

/**
 * @openapi
 * /projects/{projectId}/assets:
 *   get:
 *     tags: [Assets]
 *     summary: Get all assets for a project
 *     responses:
 *       200:
 *         description: List of assets
 *   post:
 *     tags: [Assets]
 *     summary: Add a new asset link (leader only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, asset_type, asset_url]
 *             properties:
 *               title:
 *                 type: string
 *                 example: GitHub Repository
 *               asset_type:
 *                 type: string
 *                 enum: [github, figma, gdrive, docs, other]
 *               asset_url:
 *                 type: string
 *                 format: uri
 *                 example: https://github.com/org/repo
 *     responses:
 *       201:
 *         description: Asset added
 * /projects/{projectId}/assets/{assetId}:
 *   delete:
 *     tags: [Assets]
 *     summary: Delete an asset (leader only)
 *     responses:
 *       200:
 *         description: Asset deleted
 */
router.get('/', authenticate, requireMember, controller.getAssets);
router.post(
  '/',
  authenticate,
  requireLeader,
  [
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('asset_type').isIn(['github', 'figma', 'gdrive', 'docs', 'other']).withMessage('Invalid asset_type.'),
    body('asset_url').isURL().withMessage('Valid URL is required.'),
  ],
  validate,
  controller.addAsset
);
router.delete('/:assetId', authenticate, requireLeader, controller.deleteAsset);

module.exports = router;
