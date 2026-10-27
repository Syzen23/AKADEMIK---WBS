# PANDUAN KONTEKS AI AGENT (AGENTS.md)

# Sistem Manajemen Proyek Akademik Mahasiswa Berbasis WBS & Pelacakan Dependensi

Dokumen ini adalah acuan mutlak bagi AI Agent dalam memahami konteks bisnis, arsitektur data, tumpukan teknologi, dan batasan fungsional sistem. Jangan menyimpang dari aturan teknis dan entitas yang didefinisikan di sini.

---

## 1. DESKRIPSI & MASALAH BISNIS

Sistem ini dirancang untuk menyelesaikan _task paralysis_, _social loafing_ (ketimpangan kerja kelompok), dan kebuntuan pengerjaan (_bottleneck_) pada tugas akhir semester mahasiswa perguruan tinggi.

Fokus inti sistem:

1. Mendekomposisi proyek akademik berskala besar ke dalam hierarki _Work Breakdown Structure_ (WBS) terukur dengan estimasi jam kerja.
2. Memodelkan relasi dependensi antartugas (Tugas B terkunci jika Tugas A belum selesai).
3. Menampilkan dasbor beban kerja harian, jalur kritis (_critical path_), dan metrik kontribusi kerja anggota kelompok secara transparan.

---

## 2. TUMPUKAN TEKNOLOGI (TECH STACK)

- **Frontend:** React.js, Tailwind CSS, TanStack Query (React Query)
- **Backend:** Node.js, Express.js (RESTful API), Swagger / OpenAPI
- **Database & Cache:** PostgreSQL (Supabase), Redis (Upstash / Local Redis)
- **Testing & Tools:** Postman

---

## 3. PERAN PENGGUNA (USER ROLES)

Sistem memiliki 2 tingkatan hak akses dalam sebuah proyek:

1. **`leader` (Project Leader):** Pembuat ruang proyek. Memiliki kontrol penuh untuk mengedit proyek, membuat tahapan WBS (_stages_), mengatur dependensi tugas, dan membagikan tugas (_assign task_).
2. **`member` (Team Member):** Mahasiswa yang bergabung via `invite_code`. Hanya berhak melihat proyek, memperbarui status pengerjaan tugas miliknya di papan Kanban (_To Do, In Progress, Blocked, Done_), dan mencatat log jam kerja (_work logs_).

---

## 4. ATURAN BISNIS KRUSIAL (BUSINESS RULES)

1. **Validasi Dependensi:** Sebuah tugas (`tasks`) TIDAK BISA dipindahkan statusnya menjadi `Done` jika masih memiliki relasi aktif di tabel `task_dependencies` di mana `prerequisite_task_id` belum berstatus `Done`.
2. **Kalkulasi Beban & Caching:** Perhitungan beban jam kerja harian/mingguan dan 3 tugas jalur kritis disajikan ke dasbor dengan memanfaatkan Redis sebagai _in-memory cache_. Cache wajib di-_invalidate_ setiap ada perubahan status atau penugasan tugas baru.
3. **Penyimpanan Aset:** Dokumen, Figma, dan GitHub hanya disimpan berupa tautan URL valid (`asset_url`) di tabel `project_assets`. Tidak ada penyimpanan berkas fisik lokal (_no file blob upload_).
4. **Tanpa Modul Uang & Chat:** Tidak ada fitur transaksi uang/QRIS dan tidak ada _real-time chat_.

---

## 5. SKEMA BASIS DATA (POSTGRESQL RELATIONAL SCHEMA)

### Entitas & Definisi Kolom:

1. **`users`**
   - `id`: UUID (Primary Key, default: `gen_random_uuid()`)
   - `name`: VARCHAR(255) NOT NULL
   - `email`: VARCHAR(255) UNIQUE NOT NULL
   - `password_hash`: VARCHAR(255) NOT NULL
   - `avatar_url`: TEXT NULL
   - `created_at`: TIMESTAMPTZ DEFAULT NOW()

2. **`projects`**
   - `id`: UUID (Primary Key, default: `gen_random_uuid()`)
   - `title`: VARCHAR(255) NOT NULL
   - `course_name`: VARCHAR(255) NOT NULL
   - `description`: TEXT NULL
   - `invite_code`: VARCHAR(16) UNIQUE NOT NULL
   - `leader_id`: UUID NOT NULL REFERENCES `users(id)` ON DELETE CASCADE
   - `deadline`: TIMESTAMPTZ NULL
   - `created_at`: TIMESTAMPTZ DEFAULT NOW()

3. **`project_members`**
   - `id`: UUID (Primary Key, default: `gen_random_uuid()`)
   - `project_id`: UUID NOT NULL REFERENCES `projects(id)` ON DELETE CASCADE
   - `user_id`: UUID NOT NULL REFERENCES `users(id)` ON DELETE CASCADE
   - `role`: VARCHAR(20) DEFAULT 'member' CHECK (`role` IN ('leader', 'member'))
   - `joined_at`: TIMESTAMPTZ DEFAULT NOW()
   - _Constraint:_ UNIQUE(`project_id`, `user_id`)

4. **`project_assets`**
   - `id`: UUID (Primary Key, default: `gen_random_uuid()`)
   - `project_id`: UUID NOT NULL REFERENCES `projects(id)` ON DELETE CASCADE
   - `title`: VARCHAR(255) NOT NULL
   - `asset_type`: VARCHAR(50) NOT NULL (e.g., 'github', 'figma', 'gdrive', 'docs')
   - `asset_url`: TEXT NOT NULL
   - `created_at`: TIMESTAMPTZ DEFAULT NOW()

5. **`stages`**
   - `id`: UUID (Primary Key, default: `gen_random_uuid()`)
   - `project_id`: UUID NOT NULL REFERENCES `projects(id)` ON DELETE CASCADE
   - `name`: VARCHAR(100) NOT NULL (e.g., 'Analisis', 'Desain', 'Implementasi')
   - `stage_order`: INT NOT NULL DEFAULT 1
   - `created_at`: TIMESTAMPTZ DEFAULT NOW()

6. **`tasks`**
   - `id`: UUID (Primary Key, default: `gen_random_uuid()`)
   - `project_id`: UUID NOT NULL REFERENCES `projects(id)` ON DELETE CASCADE
   - `stage_id`: UUID NOT NULL REFERENCES `stages(id)` ON DELETE CASCADE
   - `assigned_to`: UUID NULL REFERENCES `users(id)` ON DELETE SET NULL
   - `title`: VARCHAR(255) NOT NULL
   - `description`: TEXT NULL
   - `estimated_hours`: DECIMAL(5,2) DEFAULT 0.00
   - `status`: VARCHAR(20) DEFAULT 'To Do' CHECK (`status` IN ('To Do', 'In Progress', 'Blocked', 'Done'))
   - `priority`: VARCHAR(20) DEFAULT 'Medium' CHECK (`priority` IN ('Low', 'Medium', 'High', 'Critical'))
   - `due_date`: TIMESTAMPTZ NULL
   - `created_at`: TIMESTAMPTZ DEFAULT NOW()

7. **`task_dependencies`**
   - `id`: UUID (Primary Key, default: `gen_random_uuid()`)
   - `task_id`: UUID NOT NULL REFERENCES `tasks(id)` ON DELETE CASCADE
   - `prerequisite_task_id`: UUID NOT NULL REFERENCES `tasks(id)` ON DELETE CASCADE
   - `created_at`: TIMESTAMPTZ DEFAULT NOW()
   - _Constraint:_ Check agar `task_id` != `prerequisite_task_id` dan UNIQUE(`task_id`, `prerequisite_task_id`)

8. **`work_logs`**
   - `id`: UUID (Primary Key, default: `gen_random_uuid()`)
   - `task_id`: UUID NOT NULL REFERENCES `tasks(id)` ON DELETE CASCADE
   - `user_id`: UUID NOT NULL REFERENCES `users(id)` ON DELETE CASCADE
   - `hours_spent`: DECIMAL(5,2) NOT NULL
   - `activity_notes`: TEXT NULL
   - `logged_at`: TIMESTAMPTZ DEFAULT NOW()

---

## 6. STANDAR POLA KODE & KONTRAK

- **Backend:**
  - REST API Controller-Service-Repository pattern.
  - Dokumentasikan setiap route menggunakan dekorator/spek JSDoc Swagger OpenAPI 3.0.
  - Respons JSON standar: `{ "success": true, "message": "...", "data": ... }` atau `{ "success": false, "message": "...", "errors": ... }`.
- **Frontend:**
  - Komponen modular React dengan Tailwind CSS.
  - Setiap interaksi data asynchronous wajib dibungkus dalam kustom hook TanStack Query (`useQuery`, `useMutation`).
  - Optimistic update digunakan saat pengguna memindahkan kartu di Kanban Board.
