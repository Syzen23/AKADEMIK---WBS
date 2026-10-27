// src/modules/projects/projects.routes.js
const router = require('express').Router();
const { body, param } = require('express-validator');
const controller = require('./projects.controller');
const { validate } = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireLeader, requireMember } = require('../../middleware/role.middleware');

/**
 * @openapi
 * tags:
 *   name: Projects
 *   description: Project management
 */

/**
 * @openapi
 * /projects:
 *   get:
 *     tags: [Projects]
 *     summary: Get all projects for authenticated user
 *     responses:
 *       200:
 *         description: List of projects
 *   post:
 *     tags: [Projects]
 *     summary: Create a new project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, course_name]
 *             properties:
 *               title:
 *                 type: string
 *               course_name:
 *                 type: string
 *               description:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Project created
 */
router.get('/', authenticate, controller.getMyProjects);
router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('course_name').trim().notEmpty().withMessage('Course name is required.'),
    body('deadline').optional().isISO8601().withMessage('Deadline must be a valid date.'),
  ],
  validate,
  controller.createProject
);

/**
 * @openapi
 * /projects/join:
 *   post:
 *     tags: [Projects]
 *     summary: Join a project via invite code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [invite_code]
 *             properties:
 *               invite_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Joined successfully
 *       404:
 *         description: Invalid invite code
 */
router.post(
  '/join',
  authenticate,
  [body('invite_code').trim().notEmpty().withMessage('Invite code is required.')],
  validate,
  controller.joinProject
);

/**
 * @openapi
 * /projects/{projectId}:
 *   get:
 *     tags: [Projects]
 *     summary: Get a specific project
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Project detail
 *       403:
 *         description: Not a member
 *       404:
 *         description: Project not found
 *   put:
 *     tags: [Projects]
 *     summary: Update a project (leader only)
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Project updated
 *   delete:
 *     tags: [Projects]
 *     summary: Delete a project (leader only)
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Project deleted
 */
router.get('/:projectId', authenticate, requireMember, controller.getProjectById);
router.put('/:projectId', authenticate, requireLeader, controller.updateProject);
router.delete('/:projectId', authenticate, requireLeader, controller.deleteProject);

/**
 * @openapi
 * /projects/{projectId}/members:
 *   get:
 *     tags: [Projects]
 *     summary: Get all members of a project
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of members
 * /projects/{projectId}/members/{memberId}:
 *   delete:
 *     tags: [Projects]
 *     summary: Remove a member from project (leader only)
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Member removed
 */
router.get('/:projectId/members', authenticate, requireMember, controller.getMembers);
router.delete('/:projectId/members/:memberId', authenticate, requireLeader, controller.removeMember);

module.exports = router;
