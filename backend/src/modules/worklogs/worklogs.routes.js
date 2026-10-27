// src/modules/worklogs/worklogs.routes.js
const router = require('express').Router({ mergeParams: true });
const { body } = require('express-validator');
const controller = require('./worklogs.controller');
const { validate } = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireMember } = require('../../middleware/role.middleware');

/**
 * @openapi
 * tags:
 *   name: WorkLogs
 *   description: Work hour logging for tasks
 */

/**
 * @openapi
 * /projects/{projectId}/tasks/{taskId}/logs:
 *   post:
 *     tags: [WorkLogs]
 *     summary: Add a work log entry for a task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [hours_spent]
 *             properties:
 *               hours_spent:
 *                 type: number
 *                 example: 2.5
 *               activity_notes:
 *                 type: string
 *                 example: Implemented login page UI
 *     responses:
 *       201:
 *         description: Work log added
 *   get:
 *     tags: [WorkLogs]
 *     summary: Get all work logs for a task
 *     responses:
 *       200:
 *         description: List of work logs
 */
router.post(
  '/',
  authenticate,
  requireMember,
  [
    body('hours_spent')
      .isDecimal({ decimal_digits: '1,2' })
      .withMessage('hours_spent must be a positive decimal.')
      .custom((v) => parseFloat(v) > 0)
      .withMessage('hours_spent must be greater than 0.'),
    body('activity_notes').optional().isString(),
  ],
  validate,
  controller.addWorkLog
);
router.get('/', authenticate, requireMember, controller.getWorkLogsByTask);

/**
 * @openapi
 * /projects/{projectId}/tasks/{taskId}/logs/{logId}:
 *   delete:
 *     tags: [WorkLogs]
 *     summary: Delete a work log entry
 *     responses:
 *       200:
 *         description: Work log deleted
 */
router.delete('/:logId', authenticate, requireMember, controller.deleteWorkLog);

module.exports = router;
