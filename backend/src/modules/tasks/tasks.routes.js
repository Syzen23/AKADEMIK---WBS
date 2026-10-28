// src/modules/tasks/tasks.routes.js
const router = require('express').Router({ mergeParams: true });
const { body, query } = require('express-validator');
const controller = require('./tasks.controller');
const { validate } = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireLeader, requireMember } = require('../../middleware/role.middleware');

/**
 * @openapi
 * tags:
 *   name: Tasks
 *   description: Task management and Kanban operations
 */

/**
 * @openapi
 * /projects/{projectId}/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Get all tasks for a project (supports filtering)
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: stage_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [To Do, In Progress, Blocked, Done] }
 *       - in: query
 *         name: assigned_to
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of tasks with dependencies
 *   post:
 *     tags: [Tasks]
 *     summary: Create a new task (leader only)
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [stage_id, title]
 *             properties:
 *               stage_id:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               assigned_to:
 *                 type: string
 *                 format: uuid
 *               estimated_hours:
 *                 type: number
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *               due_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Task created
 */
router.get('/', authenticate, requireMember, controller.getTasks);
router.post(
  '/',
  authenticate,
  requireLeader,
  [
    body('stage_id').isUUID().withMessage('Valid stage_id is required.'),
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('assigned_to').optional({ nullable: true, checkFalsy: true }).isUUID().withMessage('Invalid assigned_to UUID.'),
    body('estimated_hours').optional({ nullable: true, checkFalsy: true }).isDecimal().withMessage('estimated_hours must be a decimal.'),
    body('priority').optional({ nullable: true, checkFalsy: true }).isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority.'),
    body('due_date').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('due_date must be a valid date.'),
  ],
  validate,
  controller.createTask
);

/**
 * @openapi
 * /projects/{projectId}/dashboard:
 *   get:
 *     tags: [Tasks]
 *     summary: Get dashboard data (workload + critical path) - Redis cached
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Dashboard with workload per member and 3 critical path tasks
 */
router.get('/dashboard', authenticate, requireMember, controller.getDashboard);

/**
 * @openapi
 * /projects/{projectId}/tasks/{taskId}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get a specific task
 *     responses:
 *       200:
 *         description: Task detail
 *   patch:
 *     tags: [Tasks]
 *     summary: Update a task (leader can update all; member can only update their own task's status)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [To Do, In Progress, Blocked, Done]
 *               title:
 *                 type: string
 *               assigned_to:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Task updated
 *       422:
 *         description: Unfinished dependencies block Done status
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task (leader only)
 *     responses:
 *       200:
 *         description: Task deleted
 */
router.get('/:taskId', authenticate, requireMember, controller.getTaskById);
router.patch(
  '/:taskId',
  authenticate,
  requireMember,
  [
    body('title').optional().trim().notEmpty().withMessage('Judul tugas tidak boleh kosong.'),
    body('description').optional({ nullable: true }),
    body('stage_id').optional({ nullable: true, checkFalsy: true }).isUUID().withMessage('Invalid stage_id UUID.'),
    body('status').optional({ nullable: true, checkFalsy: true }).isIn(['To Do', 'In Progress', 'Blocked', 'Done']).withMessage('Invalid status.'),
    body('priority').optional({ nullable: true, checkFalsy: true }).isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority.'),
    body('assigned_to').optional({ nullable: true, checkFalsy: true }).isUUID().withMessage('Invalid assigned_to UUID.'),
    body('estimated_hours').optional({ nullable: true, checkFalsy: true }).isDecimal(),
    body('due_date').optional({ nullable: true }),
  ],
  validate,
  controller.updateTask
);
router.delete('/:taskId', authenticate, requireLeader, controller.deleteTask);

/**
 * @openapi
 * /projects/{projectId}/tasks/{taskId}/dependencies:
 *   post:
 *     tags: [Tasks]
 *     summary: Add a prerequisite dependency to a task (leader only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [prerequisite_task_id]
 *             properties:
 *               prerequisite_task_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Dependency added
 *       400:
 *         description: Circular dependency or self-dependency
 * /projects/{projectId}/tasks/{taskId}/dependencies/{prerequisiteTaskId}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Remove a dependency (leader only)
 *     responses:
 *       200:
 *         description: Dependency removed
 */
router.post(
  '/:taskId/dependencies',
  authenticate,
  requireLeader,
  [body('prerequisite_task_id').isUUID().withMessage('Valid prerequisite_task_id is required.')],
  validate,
  controller.addDependency
);
router.delete('/:taskId/dependencies/:prerequisiteTaskId', authenticate, requireLeader, controller.removeDependency);

module.exports = router;
