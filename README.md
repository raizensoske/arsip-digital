# Sistem Arsip Digital — UPTD Jalan dan Jembatan

Sistem Arsip Digital untuk **UPTD Jalan dan Jembatan, Dinas Bina Marga dan Bina Konstruksi (BMBK) Provinsi Lampung**. Mengelola surat masuk, surat keluar, dokumen proyek, laporan, dan foto dokumentasi secara terpusat dengan akses berbasis peran (ADMIN / STAFF).

## Fitur

- **Dashboard** — statistik arsip, distribusi per kategori (bar chart), arsip terbaru
- **Arsip Dokumen** — CRUD + upload multi-file (PDF/JPG/PNG/DOCX, max 30 MB/file), pencarian, filter kategori, sorting & pagination
- **Detail Arsip** — viewer file (image inline, PDF iframe), download, hapus dengan konfirmasi
- **Cetak Laporan** — filter rentang tanggal & kategori, summary per kategori, cetak via window.print
- **Kelola User** (ADMIN) — tambah/edit/hapus user, validasi username & password
- **Auth & RBAC** — NextAuth Credentials + bcrypt, middleware guard, STAFF tidak bisa akses /users
- **Tema Terang/Gelap** — persist localStorage, anti-flash script di layout.tsx

## Prasyarat

- Node.js 20+
- npm

## Cara Menjalankan (Lokal)

```bash
# 1. Install
npm install

# 2. Env — copy dan isi
# wajib: NEXTAUTH_SECRET (generate: openssl rand -base64 32)
#       NEXTAUTH_URL=http://localhost:3000

# 3. Database (SQLite: prisma/dev.db)
npx prisma migrate dev
npm run seed

# 4. Dev server
npm run dev   # http://localhost:3000

# 5. Build check
npm run build
```

## Akun Default (dari seed)

| Username | Password | Role  |
|----------|----------|-------|
| admin    | admin123 | ADMIN |
| staff    | staff123 | STAFF |

Ganti password setelah login pertama. Seed ada di prisma/seed.js (5 kategori default).

## Catatan & Limitasi (untuk Laporan KP)

- **DB SQLite** — cocok untuk KP / single-instance. Untuk produksi multi-user, migrasi ke PostgreSQL.
- **Upload** — disimpan di public/uploads (filesystem). Untuk scale, pertimbangkan object storage (S3/R2).
- **NEXTAUTH_SECRET** — wajib di-set via .env; tidak ada fallback hardcoded (akan error jika kosong — sengaja untuk keamanan).

## Lisensi

Internal UPTD — tidak untuk distribusi publik.
