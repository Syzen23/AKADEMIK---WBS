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
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Swagger UI and external assets
  })
);

const normalizeOrigin = (urlStr) => {
  if (!urlStr) return '';
  const trimmed = urlStr.trim();
  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    return parsed.origin;
  } catch {
    return trimmed.replace(/\/.*$/, '');
  }
};

const rawClientUrl = process.env.CLIENT_URL || '';
const configuredOrigins = rawClientUrl
  ? rawClientUrl.split(',').map(normalizeOrigin).filter(Boolean)
  : [];

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultOrigins]));

const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // Check configured origins
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    // Automatically allow preview/production Vercel deployments of this app
    if (origin.endsWith('.vercel.app') || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    console.warn(`[CORS Blocked] Origin: ${origin}. Configured: ${JSON.stringify(allowedOrigins)}`);
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
});

app.use(corsMiddleware);

// Fast preflight responder: immediately ends OPTIONS requests with 204
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Swagger Docs ───────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Akademik WBS API Docs',
  customCss: '.swagger-ui .topbar { background-color: #1e293b; }',
}));

// ── Health & Root Check ────────────────────────────────────
app.get(['/', '/api'], (req, res) => {
  res.json({
    success: true,
    message: 'Akademik WBS API is online.',
    timestamp: new Date().toISOString(),
  });
});

app.get(['/health', '/api/health'], (req, res) => {
  res.json({ success: true, message: 'Akademik WBS API is running.', timestamp: new Date().toISOString() });
});

// Project-level work logs summary & Dashboard controllers
const worklogsController = require('./modules/worklogs/worklogs.controller');
const tasksController = require('./modules/tasks/tasks.controller');
const { authenticate } = require('./middleware/auth.middleware');
const { requireMember } = require('./middleware/role.middleware');

// ── API Routes (Dual mounted: with /api and without /api for Vercel Serverless compatibility)
const registerRoutes = (prefix = '') => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/projects`, projectsRoutes);
  app.use(`${prefix}/projects/:projectId/stages`, stagesRoutes);
  app.use(`${prefix}/projects/:projectId/tasks`, tasksRoutes);
  app.use(`${prefix}/projects/:projectId/tasks/:taskId/logs`, worklogsRoutes);
  app.use(`${prefix}/projects/:projectId/assets`, assetsRoutes);
  app.get(`${prefix}/projects/:projectId/dashboard`, authenticate, requireMember, tasksController.getDashboard);
  app.get(`${prefix}/projects/:projectId/logs`, authenticate, requireMember, worklogsController.getWorkLogsByProject);
};

registerRoutes('/api');
registerRoutes(''); // Mounts directly under root as well

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
