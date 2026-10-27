// src/modules/stages/stages.routes.js
const router = require('express').Router({ mergeParams: true });
const { body } = require('express-validator');
const controller = require('./stages.controller');
const { validate } = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireLeader, requireMember } = require('../../middleware/role.middleware');

/**
 * @openapi
 * tags:
 *   name: Stages
 *   description: WBS Stage management (project phases)
 */

/**
 * @openapi
 * /projects/{projectId}/stages:
 *   get:
 *     tags: [Stages]
 *     summary: Get all stages for a project
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of stages with task counts
 *   post:
 *     tags: [Stages]
 *     summary: Create a new stage (leader only)
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Analisis
 *               stage_order:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Stage created
 */
router.get('/', authenticate, requireMember, controller.getStages);
router.post(
  '/',
  authenticate,
  requireLeader,
  [
    body('name').trim().notEmpty().withMessage('Stage name is required.'),
    body('stage_order').optional().isInt({ min: 1 }).withMessage('Stage order must be positive integer.'),
  ],
  validate,
  controller.createStage
);

/**
 * @openapi
 * /projects/{projectId}/stages/{stageId}:
 *   put:
 *     tags: [Stages]
 *     summary: Update a stage (leader only)
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: stageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Stage updated
 *   delete:
 *     tags: [Stages]
 *     summary: Delete a stage (leader only)
 *     responses:
 *       200:
 *         description: Stage deleted
 */
router.put('/:stageId', authenticate, requireLeader, controller.updateStage);
router.delete('/:stageId', authenticate, requireLeader, controller.deleteStage);

module.exports = router;
