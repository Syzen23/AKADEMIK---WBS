// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { sendError } = require('./utils/response');

// Route modules
const authRoutes = require('./modules/auth/auth.routes');
const projectsRoutes = require('./modules/projects/projects.routes');
const stagesRoutes = require('./modules/stages/stages.routes');
const tasksRoutes = require('./modules/tasks/tasks.routes');
const worklogsRoutes = require('./modules/worklogs/worklogs.routes');
const assetsRoutes = require('./modules/assets/assets.routes');

const app = express();

// ── Security & Logging Middleware ──────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Swagger Docs ───────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Akademik WBS API Docs',
  customCss: '.swagger-ui .topbar { background-color: #1e293b; }',
}));

// ── Health Check ───────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Akademik WBS API is running.', timestamp: new Date().toISOString() });
});

// ── API Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);

// Nested routes under /api/projects/:projectId
app.use('/api/projects/:projectId/stages', stagesRoutes);
app.use('/api/projects/:projectId/tasks', tasksRoutes);
app.use('/api/projects/:projectId/tasks/:taskId/logs', worklogsRoutes);
app.use('/api/projects/:projectId/assets', assetsRoutes);

// Project-level work logs summary & Dashboard
const worklogsController = require('./modules/worklogs/worklogs.controller');
const tasksController = require('./modules/tasks/tasks.controller');
const { authenticate } = require('./middleware/auth.middleware');
const { requireMember } = require('./middleware/role.middleware');

app.get('/api/projects/:projectId/dashboard', authenticate, requireMember, tasksController.getDashboard);
app.get('/api/projects/:projectId/logs', authenticate, requireMember, worklogsController.getWorkLogsByProject);

// ── 404 Handler ────────────────────────────────────────────
app.use((req, res) => {
  return sendError(res, `Route ${req.method} ${req.originalUrl} not found.`, 404);
});

// ── Global Error Handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An internal server error occurred.'
    : err.message || 'An internal server error occurred.';
  return sendError(res, message, statusCode);
});

module.exports = app;
