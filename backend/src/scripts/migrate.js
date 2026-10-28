// src/scripts/migrate.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const runMigration = async () => {
  const sqlPath = path.join(__dirname, '../../migrations/001_init_schema.sql');
  console.log('🔄 Membaca file migrasi:', sqlPath);

  try {
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('🚀 Menjalankan migrasi database ke Supabase PostgreSQL...');
    await pool.query(sql);
    console.log('✅ Migrasi database berhasil! Semua tabel, indeks, dan trigger telah aktif.\n');
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat migrasi:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigration();
