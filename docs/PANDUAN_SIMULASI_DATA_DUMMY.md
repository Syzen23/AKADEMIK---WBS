# PANDUAN SIMULASI PENGUJIAN DENGAN DATA DUMMY & DAFTAR PERINTAH PENTING
## Sistem Manajemen Proyek Akademik Mahasiswa Berbasis WBS & Pelacakan Dependensi

Dokumen ini memuat panduan lengkap untuk melakukan pengujian simulasi sistem menggunakan dataset dummy realistis, daftar akun pengujian, skenario alur kerja akademik, serta daftar perintah penting (*command cheatsheet*) untuk mengelola backend, frontend, database, dan cache.

---

## 1. DAFTAR PERINTAH PENTING (COMMAND CHEATSHEET)

Sistem ini terdiri dari dua direktori utama: `backend/` (Express.js & Supabase PostgreSQL) dan `frontend/` (React Vite & Tailwind CSS).

### A. Perintah Database & Seeding Data Dummy (Backend)
Jalankan di direktori `backend/`:

| Perintah | Deskripsi | Kapan Digunakan |
| :--- | :--- | :--- |
| `npm run db:seed` | **Mereset database dan mengisi ulang seluruh data dummy simulasi** (User, Proyek Capstone, Tahap WBS, Tasks, Dependensi, Assets, dan Work Logs) serta membersihkan cache Redis. | **Direkomendasikan setiap kali Anda ingin memulai sesi simulasi dari kondisi bersih (*fresh state*).** |
| `npm run db:migrate` | Menjalankan file DDL migrasi schema `001_init_schema.sql` (membuat 8 tabel, constraint foreign key, trigger `project_members`, dan indexes). | Saat inisialisasi awal database baru atau setelah reset schema. |

### B. Perintah Menjalankan Server Pengembangan (Dev Server)

#### 1. Menjalankan Backend API:
```bash
cd backend
npm run dev
```
* Backend berjalan di: `http://localhost:5000`
* Dokumentasi Swagger OpenAPI: `http://localhost:5000/api-docs`

#### 2. Menjalankan Frontend App:
```bash
cd frontend
npm run dev
```
* Aplikasi web Frontend dapat diakses di: `http://localhost:5173`

### C. Perintah Build & Quality Check (Frontend)
Jalankan di direktori `frontend/`:

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run build` | Melakukan kompilasi bundle frontend production menggunakan Vite. Digunakan untuk memastikan 0 syntax error dan type-safe. |
| `npm run preview` | Menjalankan server lokal untuk menguji hasil bundle build production (`dist/`). |
| `npm run lint` | Menjalankan linter `oxlint` untuk audit performa dan kebersihan kode JavaScript/React. |

### D. Perintah Sekaligus (One-Liner untuk PowerShell di Windows)
Jika Anda membuka terminal PowerShell baru di root folder proyek:

- **Reset Data & Seed Ulang:**
  ```powershell
  cd backend; npm run db:seed; cd ..
  ```
- **Kompilasi Frontend:**
  ```powershell
  cd frontend; npm run build; cd ..
  ```

---

## 2. KREDENSIAL AKUN SIMULASI MAHASISWA

Setelah menjalankan `npm run db:seed`, sistem telah menyediakan 3 akun mahasiswa dengan peran yang berbeda:

| Nama Pengguna | Email | Password | Peran (*Role*) | Tanggung Jawab Simulasi |
| :--- | :--- | :--- | :--- | :--- |
| **Arya Wijaya** | `leader@akademik.ac.id` | `password123` | **`leader`** (Ketua Proyek) | Pembuat ruang proyek, mengatur tahap WBS, menetapkan dependensi tugas, membagi tugas, mengeluarkan anggota, dan menghapus proyek. |
| **Budi Santoso** | `budi@akademik.ac.id` | `password123` | **`member`** (Frontend Dev) | Mengerjakan tugas antarmuka visual, memindahkan kartu tugas di Kanban, dan mencatat log jam kerja. |
| **Siti Rahma** | `siti@akademik.ac.id` | `password123` | **`member`** (Backend Dev) | Mengerjakan endpoint REST API dan Redis cache, mencatat jam kerja, dan klaim tugas. |

### Informasi Proyek Capstone Dummy yang Terbentuk:
- **Judul Proyek:** `Sistem Manajemen Proyek Akademik Berbasis WBS`
- **Mata Kuliah:** `Rekayasa Perangkat Lunak Terapan (RPLT-401)`
- **Kode Undangan (Invite Code):** `AKAD2026`
- **Tenggat Waktu Proyek:** 14 hari dari hari ini

---

## 3. SKENARIO SIMULASI PENGUJIAN LANGKAH DEMI LANGKAH

Berikut adalah skenario realistis untuk memvalidasi seluruh fungsionalitas sistem:

### Skenario 1: Simulasi Peran Ketua Proyek (Leader)
1. **Login sebagai Leader:**
   - Buka `http://localhost:5173/login`
   - Masukkan email: `leader@akademik.ac.id` dan password: `password123`.
2. **Eksplorasi Halaman Home / Overview:**
   - Amati *Project Overview Card* yang memuat ringkasan progres Capstone (persentase selesai, tugas dalam proses, total jam kerja tercatat).
   - Periksa **Canvas Kalender Deadline**: Lihat penandaan titik oranye/hijau pada tanggal-tanggal target tugas.
3. **Mengatur Dekomposisi WBS (Tahapan):**
   - Klik tab navigasi **Struktur WBS** di sidebar kiri.
   - Perhatikan 4 tahapan standar: *Analisis*, *Desain*, *Implementasi*, dan *Pengujian*.
   - Coba tambah tahapan baru (misal: `"5. Penyusunan Laporan Akhir & Publikasi"`).
4. **Membuat Tugas Baru & Estimasi Jam:**
   - Klik tombol **Tambah Tugas Baru** di sidebar atau tombol **+ Tugas** di pojok kanan atas.
   - Isi judul tugas, pilih tahap WBS, estimasi jam (misal `6.0`), prioritas (`High`), dan tentukan tanggal target penyelesaian.
5. **Mengatur Dependensi Antartugas (*Dependency Locking*):**
   - Pada kartu tugas yang baru dibuat, klik menu aksi (titik tiga `...`) lalu pilih **Kunci Dependensi (Prasyarat)**.
   - Pilih salah satu tugas prasyarat yang belum selesai.
6. **Manajemen Anggota Tim:**
   - Klik tab **Anggota Tim**.
   - Lihat daftar mahasiswa (Arya, Budi, Siti).
   - Uji tombol **Keluarkan** (*UserMinus*) pada anggota untuk menguji fitur tendang anggota yang tidak aktif / salah masuk.
7. **Menguji Hapus Ruang Proyek:**
   - Klik tombol **Hapus Proyek** di Overview atau Sidebar, amati dialog peringatan konfirmasi penghapusan permanen (*ConfirmModal*), lalu tekan **Batal** untuk membatalkan.

---

### Skenario 2: Simulasi Peran Anggota Tim (Member)
1. **Login sebagai Budi Santoso:**
   - Logout dari akun Leader, lalu login dengan: `budi@akademik.ac.id` | `password123`.
2. **Papan Kanban Interaktif:**
   - Buka menu **Papan Kanban**.
   - Perhatikan bahwa Budi **tidak memiliki akses** untuk mengedit pengaturan proyek atau menghapus proyek (hak istimewa Leader disembunyikan secara visual dan dibatasi di backend).
   - Geser atau pindahkan tugas berstatus `To Do` ke kolom `In Progress`.
3. **Validasi Aturan Kunci Dependensi (*Business Rule Validation*):**
   - Cari tugas `Integrasi Frontend TanStack Query ke REST API` (Tugas T7).
   - Coba pindahkan status tugas ini langsung menjadi `Done`.
   - **Hasil yang Diharapkan:** Sistem akan menolak perubahan dan memunculkan notifikasi peringatan:
     > *"Tugas ini terkunci karena tugas prasyarat belum selesai!"*
     *(Karena tugas Backend T5 dan Frontend T6 masih berstatus In Progress)*.
4. **Mencatat Jam Kerja (Work Log):**
   - Klik tombol **Catat Jam** atau ikon jam pada kartu tugas milik Budi.
   - Masukkan durasi jam (contoh: `3.5` jam) dan catatan aktivitas (misal: *"Menghubungkan hook React Query dengan pagination"*).
   - Simpan dan amati total jam kerja yang otomatis terakumulasi.
5. **Menguji Bergabung ke Proyek Lain via Invite Code:**
   - Masuk ke menu `http://localhost:5173/projects`.
   - Klik tombol **Gabung Proyek**.
   - Masukkan kode undangan (misal: `AKAD2026`), jika sudah bergabung sistem akan memberi respon validasi yang tepat.

---

### Skenario 3: Memeriksa Dasbor Beban Kerja, Jalur Kritis & Redis Cache
1. **Masuk ke Menu Beban Kerja & Jalur Kritis:**
   - Klik menu **Beban Kerja & Jalur Kritis** di sidebar.
2. **Pantau 3 Tugas Jalur Kritis (*Critical Path*):**
   - Amati 3 tugas kritis penentu kelulusan proyek yang teridentifikasi otomatis oleh algoritma sistem berdasarkan bobot estimasi jam kerja dan rantai dependensi terpanjang.
3. **Verifikasi Performa Redis Caching:**
   - Buka DevTools browser (F12) tab *Network*.
   - Refresh halaman atau panggil endpoint dasbor. Permintaan pertama akan memproses query agregasi ke PostgreSQL dan menyimpannya ke Redis. Permintaan kedua akan merespons dalam hitungan milidetik (*cache hit*).
   - Setiap ada pemindahan kartu di Kanban atau pencatatan jam kerja baru, cache Redis akan di-invalidasi secara otomatis.

---

### Skenario 4: Pengujian REST API via Swagger OpenAPI
1. Buka browser dan arahkan ke: `http://localhost:5000/api-docs`
2. Di Swagger UI, Anda dapat menguji seluruh kontrak API:
   - `POST /auth/login` untuk mendapatkan Bearer Token JWT.
   - Klik tombol **Authorize** di kanan atas Swagger dan masukkan token: `Bearer <token_anda>`.
   - Jalankan uji coba endpoint WBS:
     - `GET /projects/{projectId}/stages`
     - `GET /projects/{projectId}/tasks`
     - `GET /projects/{projectId}/dashboard` (Melihat hasil kalkulasi beban harian dan jalur kritis).
     - `POST /projects/{projectId}/tasks/{taskId}/work-logs`

---

## 4. PENANGANAN MASALAH UMUM (TROUBLESHOOTING)

| Gejala Masalah | Penyebab Umum | Solusi Cepat |
| :--- | :--- | :--- |
| **Data uji coba berantakan setelah banyak percobaan** | Banyak data dummy telah diubah statusnya menjadi Done atau dihapus. | Buka terminal di folder `backend/` lalu ketik: `npm run db:seed`. Database dan cache akan kembali rapi seperti semula. |
| **Port 5000 atau 5173 sudah digunakan (*EADDRINUSE*)** | Ada proses Node.js / Vite lama yang masih berjalan di latar belakang. | Matikan proses di PowerShell: `Stop-Process -Name node -Force` lalu jalankan ulang `npm run dev`. |
| **Muncul pesan peringatan koneksi Redis skip** | Layanan Redis lokal atau Upstash tidak dapat dijangkau. | Sistem telah dilengkapi mekanisme *graceful fallback*: jika Redis offline, query akan langsung diarahkan ke PostgreSQL tanpa menyebabkan crash pada aplikasi. |

---

## 5. FITUR PERSISTENSI MENU & HALAMAN (REFRESH-PROOF)

Sistem telah dilengkapi dengan mekanisme **Two-Layer State Persistence** untuk mencegah halaman kembali ke menu default saat di-refresh:
1. **URL Search Parameter (`?tab=...`):** Setiap kali Anda berpindah menu (misal: Papan Kanban, Struktur WBS, Beban Kerja & Kritis, Berkas, Anggota), URL akan otomatis disinkronkan (contoh: `/projects/:id?tab=kanban`). Jika Anda menekan `F5`, browser akan memuat langsung tab tersebut.
2. **LocalStorage Backup:** Posisi menu terakhir untuk setiap proyek disimpan secara independen di browser. Ketika Anda membuka kembali proyek dari daftar utama, sistem akan otomatis melanjutkan ke menu terakhir yang Anda buka.
3. **Sidebar Collapse Memory:** Status posisi sidebar (terbuka atau menciut) juga disimpan secara otomatis sehingga tata letak antarmuka tetap konsisten saat dimuat ulang.

---

*Dokumen ini dibuat otomatis sebagai panduan operasional proyek akademik AKADEMIK WBS.*
