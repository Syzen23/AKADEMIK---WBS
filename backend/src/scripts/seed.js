// src/scripts/seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { createClient } = require('redis');

const seed = async () => {
  console.log('🌱 Memulai proses seeding data simulasi akademik...');

  try {
    // 1. Bersihkan data lama secara cascade
    console.log('🧹 Membersihkan data sebelumnya...');
    await pool.query(`
      TRUNCATE TABLE users, projects, project_members, project_assets, stages, tasks, task_dependencies, work_logs 
      RESTART IDENTITY CASCADE;
    `);

    // 2. Buat Users (Password: password123)
    console.log('👤 Membuat user mahasiswa...');
    const passwordHash = await bcrypt.hash('password123', 10);

    const userLeader = await pool.query(
      `INSERT INTO users (name, email, password_hash, avatar_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        'Arya Wijaya (Leader)',
        'leader@akademik.ac.id',
        passwordHash,
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Arya',
      ]
    );

    const userBudi = await pool.query(
      `INSERT INTO users (name, email, password_hash, avatar_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        'Budi Santoso (Frontend Dev)',
        'budi@akademik.ac.id',
        passwordHash,
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
      ]
    );

    const userSiti = await pool.query(
      `INSERT INTO users (name, email, password_hash, avatar_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        'Siti Rahma (Backend Dev)',
        'siti@akademik.ac.id',
        passwordHash,
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
      ]
    );

    const leaderId = userLeader.rows[0].id;
    const budiId = userBudi.rows[0].id;
    const sitiId = userSiti.rows[0].id;

    // 3. Buat Project Capstone
    console.log('📁 Membuat proyek capstone...');
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + 14); // 2 minggu ke depan

    const projectRes = await pool.query(
      `INSERT INTO projects (title, course_name, description, invite_code, leader_id, deadline)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        'Sistem Manajemen Proyek Akademik Berbasis WBS',
        'Rekayasa Perangkat Lunak Terapan (RPLT-401)',
        'Capstone project akhir semester untuk memecahkan bottleneck pengerjaan tugas akhir dengan struktur WBS & pelacakan dependensi.',
        'AKAD2026',
        leaderId,
        deadlineDate,
      ]
    );

    const projectId = projectRes.rows[0].id;

    // Project members: Arya auto-inserted by trigger as leader. Tambahkan Budi & Siti
    await pool.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, 'member'), ($1, $3, 'member')
       ON CONFLICT (project_id, user_id) DO NOTHING`,
      [projectId, budiId, sitiId]
    );

    // 4. Buat Project Assets (Figma, GitHub, Docs, GDrive)
    console.log('🔗 Menautkan asset proyek...');
    await pool.query(
      `INSERT INTO project_assets (project_id, title, asset_type, asset_url)
       VALUES 
       ($1, 'Repositori Source Code GitHub', 'github', 'https://github.com/akademik-team/wbs-capstone-system'),
       ($1, 'Desain Prototipe UI/UX High-Fi', 'figma', 'https://www.figma.com/design/akademik-wbs-ui-mockup'),
       ($1, 'Dokumen Software Requirement Specification (SRS)', 'docs', 'https://docs.google.com/document/d/akademik-srs-spec'),
       ($1, 'Folder Drive Berkas Hasil Wawancara', 'gdrive', 'https://drive.google.com/drive/folders/akademik-project-docs')`,
      [projectId]
    );

    // 5. Buat Tahapan WBS (Stages)
    console.log('🪜 Membuat tahapan WBS (Stages)...');
    const stage1 = await pool.query(
      `INSERT INTO stages (project_id, name, stage_order) VALUES ($1, $2, $3) RETURNING id`,
      [projectId, '1. Analisis & Spesifikasi Kebutuhan', 1]
    );
    const stage2 = await pool.query(
      `INSERT INTO stages (project_id, name, stage_order) VALUES ($1, $2, $3) RETURNING id`,
      [projectId, '2. Desain UI/UX & Arsitektur Sistem', 2]
    );
    const stage3 = await pool.query(
      `INSERT INTO stages (project_id, name, stage_order) VALUES ($1, $2, $3) RETURNING id`,
      [projectId, '3. Implementasi Frontend & Backend', 3]
    );
    const stage4 = await pool.query(
      `INSERT INTO stages (project_id, name, stage_order) VALUES ($1, $2, $3) RETURNING id`,
      [projectId, '4. Pengujian & Deployment', 4]
    );

    const s1Id = stage1.rows[0].id;
    const s2Id = stage2.rows[0].id;
    const s3Id = stage3.rows[0].id;
    const s4Id = stage4.rows[0].id;

    // 6. Buat Tasks
    console.log('📌 Membuat tasks dengan estimasi jam kerja...');
    const dueSoon = new Date();
    dueSoon.setDate(dueSoon.getDate() + 3);

    const dueNextWeek = new Date();
    dueNextWeek.setDate(dueNextWeek.getDate() + 7);

    // Stage 1 Tasks (Done)
    const t1 = await pool.query(
      `INSERT INTO tasks (project_id, stage_id, assigned_to, title, description, estimated_hours, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, 'Done', 'High', $7) RETURNING id`,
      [projectId, s1Id, leaderId, 'Identifikasi Kebutuhan Fungsional & WBS Scope', 'Mendefinisikan ruang lingkup pengerjaan sistem dan batasan capstone.', 8.0, dueSoon]
    );

    const t2 = await pool.query(
      `INSERT INTO tasks (project_id, stage_id, assigned_to, title, description, estimated_hours, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, 'Done', 'High', $7) RETURNING id`,
      [projectId, s1Id, sitiId, 'Penyusunan Skema Relasi Database & ERD', 'Merancang skema 8 tabel di PostgreSQL Supabase.', 10.0, dueSoon]
    );

    // Stage 2 Tasks (Done & In Progress)
    const t3 = await pool.query(
      `INSERT INTO tasks (project_id, stage_id, assigned_to, title, description, estimated_hours, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, 'Done', 'Medium', $7) RETURNING id`,
      [projectId, s2Id, budiId, 'Desain Wireframe & Design System Tailwind', 'Membuat komponen dasar UI, warna HSL, dan layout responsif.', 12.0, dueSoon]
    );

    const t4 = await pool.query(
      `INSERT INTO tasks (project_id, stage_id, assigned_to, title, description, estimated_hours, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, 'Done', 'High', $7) RETURNING id`,
      [projectId, s2Id, sitiId, 'Setup Express REST API Boilerplate', 'Inisialisasi Controller-Service-Repository pattern dan middleware.', 6.0, dueSoon]
    );

    // Stage 3 Tasks (In Progress, Critical Path candidates)
    const t5 = await pool.query(
      `INSERT INTO tasks (project_id, stage_id, assigned_to, title, description, estimated_hours, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, 'In Progress', 'Critical', $7) RETURNING id`,
      [projectId, s3Id, sitiId, 'Pengembangan RESTful API & In-Memory Redis Caching', 'Implementasi endpoint WBS, validasi dependensi, dan dashboard query.', 18.0, dueSoon]
    );

    const t6 = await pool.query(
      `INSERT INTO tasks (project_id, stage_id, assigned_to, title, description, estimated_hours, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, 'In Progress', 'High', $7) RETURNING id`,
      [projectId, s3Id, budiId, 'Slicing UI Dashboard & Kanban Board', 'Pembuatan papan Kanban interaktif dan kartu tugas visual.', 16.0, dueSoon]
    );

    // Task T7: Tergantung pada T5 dan T6 (Status To Do)
    const t7 = await pool.query(
      `INSERT INTO tasks (project_id, stage_id, assigned_to, title, description, estimated_hours, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, 'To Do', 'Critical', $7) RETURNING id`,
      [projectId, s3Id, budiId, 'Integrasi Frontend TanStack Query ke REST API', 'Koneksi data async, cache optimistic updates pada drag and drop.', 14.0, dueNextWeek]
    );

    // Stage 4 Tasks (To Do, depends on T7)
    const t8 = await pool.query(
      `INSERT INTO tasks (project_id, stage_id, assigned_to, title, description, estimated_hours, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, 'To Do', 'Medium', $7) RETURNING id`,
      [projectId, s4Id, leaderId, 'End-to-End User Testing & Verifikasi Dependensi', 'Pengujian skenario dependency blocking dan presentasi demo.', 8.0, dueNextWeek]
    );

    const t5Id = t5.rows[0].id;
    const t6Id = t6.rows[0].id;
    const t7Id = t7.rows[0].id;
    const t8Id = t8.rows[0].id;

    // 7. Buat Dependensi Antar Tugas (Task Locking Rule)
    console.log('🔒 Mengatur dependensi antar-tugas (Task Dependencies)...');
    // T7 (Integrasi) tidak bisa dikerjakan/Done sebelum T5 (Backend) dan T6 (Frontend UI) selesai
    await pool.query(
      `INSERT INTO task_dependencies (task_id, prerequisite_task_id) VALUES ($1, $2), ($1, $3)`,
      [t7Id, t5Id, t6Id]
    );
    // T8 (E2E Testing) butuh T7 (Integrasi) selesai
    await pool.query(
      `INSERT INTO task_dependencies (task_id, prerequisite_task_id) VALUES ($1, $2)`,
      [t8Id, t7Id]
    );

    // 8. Catat Work Logs (Kontribusi Kerja)
    console.log('⏱️ Mencatat log jam kerja mahasiswa (Work Logs)...');
    await pool.query(
      `INSERT INTO work_logs (task_id, user_id, hours_spent, activity_notes)
       VALUES
       ($1, $2, 4.0, 'Analisis dokumen acuan kurikulum dan pembagian modul WBS'),
       ($1, $2, 4.0, 'Finalisasi rincian estimasi jam kerja bersama anggota tim'),
       ($3, $4, 5.0, 'Pembuatan wireframe dasar dan alur sistem Kanban'),
       ($3, $4, 6.5, 'Slicing design system dengan Tailwind CSS'),
       ($5, $6, 8.0, 'Konfigurasi Express router, Swagger JSDoc, dan migrasi tabel'),
       ($5, $6, 4.5, 'Implementasi validasi dependensi dan integrasi Redis cache')`,
      [
        t1.rows[0].id, leaderId,
        t3.rows[0].id, budiId,
        t5Id, sitiId,
      ]
    );

    // 9. Bersihkan Cache Redis untuk proyek ini
    console.log('⚡ Membersihkan Redis cache...');
    if (process.env.REDIS_URL) {
      try {
        const redisClient = createClient({ url: process.env.REDIS_URL });
        await redisClient.connect();
        await redisClient.del(`project:${projectId}:dashboard`);
        await redisClient.quit();
        console.log('✅ Redis cache invalidated.');
      } catch (err) {
        console.log('⚠️ Redis skip flush:', err.message);
      }
    }

    console.log('\n🎉 SUCCESS! Database berhasil di-seed.');
    console.log('====================================================');
    console.log('Akun Tersedia untuk Login:');
    console.log('1. Leader   : leader@akademik.ac.id | password123');
    console.log('2. Frontend : budi@akademik.ac.id   | password123');
    console.log('3. Backend  : siti@akademik.ac.id   | password123');
    console.log('----------------------------------------------------');
    console.log('Kode Invite Proyek: AKAD2026');
    console.log('====================================================\n');
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat seeding:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seed();
