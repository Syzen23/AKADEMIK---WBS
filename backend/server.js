// server.js - Entry point
require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test DB connection
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL connection verified');

    // Connect Redis
    await connectRedis();

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`\n🚀 Akademik WBS API is running`);
      console.log(`   ├── Server  : http://localhost:${PORT}`);
      console.log(`   ├── Health  : http://localhost:${PORT}/health`);
      console.log(`   └── API Docs: http://localhost:${PORT}/api-docs\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
