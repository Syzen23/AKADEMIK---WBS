// src/config/db.js
const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';
const isSupabase = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase.com');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction || isSupabase ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL client connected');
});

// Non-fatal error handler: Supabase pooler (PgBouncer) routinely closes idle connections.
// NEVER call process.exit(1) here in a serverless or pooled environment!
pool.on('error', (err) => {
  console.warn('⚠️ PostgreSQL pool notice (client discarded):', err.message);
});

module.exports = pool;
