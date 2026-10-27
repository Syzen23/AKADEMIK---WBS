// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Akademik WBS API',
      version: '1.0.0',
      description:
        'REST API untuk Sistem Manajemen Proyek Akademik Mahasiswa Berbasis WBS & Pelacakan Dependensi.',
      contact: {
        name: 'Akademik WBS Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.js'],
};

module.exports = swaggerJsdoc(options);
