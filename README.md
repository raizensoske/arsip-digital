# ARUNIKA — Arsip UPTD Jalan dan Jembatan Bina Konstruksi

Sistem Arsip Digital **ARUNIKA** untuk **UPTD Jalan dan Jembatan, Dinas Bina Marga dan Bina Konstruksi (BMBK) Provinsi Lampung**.

## Fitur

- **Dashboard** — statistik, distribusi per kategori, arsip terbaru
- **Arsip Dokumen** — CRUD + upload multi-file (PDF/JPG/PNG/DOCX, max 30 MB/file), pencarian, filter, pagination
- **Detail Arsip** — viewer (image inline, PDF iframe), download, hapus
- **Cetak Laporan** — filter tanggal & kategori, summary, window.print
- **Kelola User** (ADMIN) — tambah/edit/hapus, validasi
- **Auth & RBAC** — NextAuth Credentials + bcrypt, middleware guard
- **Tema Terang/Gelap** — persist localStorage

## Lokal (dev)

```bash
npm install
# .env — wajib:
# NEXTAUTH_SECRET=... (openssl rand -base64 32)
# NEXTAUTH_URL=http://localhost:3000
# DATABASE_URL=postgresql://... (Neon/Supabase)  ATAU file:./dev.db jika masih SQLite
npx prisma migrate dev   # pertama kali
npm run seed             # admin/admin123, staff/staff123 + 5 kategori
npm run dev              # http://localhost:3000
npm run build            # cek build
```

| Username | Password | Role  |
|----------|----------|-------|
| admin    | admin123 | ADMIN |
| staff    | staff123 | STAFF |

## Deploy ke Vercel (Postgres + Blob)

**1. Buat database Postgres gratis:**
- Neon: https://neon.tech → Create Project → copy connection string (`postgresql://...?sslmode=require`)
- Atau Supabase / Vercel Postgres

**2. Import project di Vercel:**
- https://vercel.com/new → Import `raizensoske/arsip-digital` → Framework: Next.js

**3. Set Environment Variables di Vercel (Project → Settings → Environment Variables):**
```
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://<nama-app>.vercel.app
BLOB_READ_WRITE_TOKEN=<akan auto-terisi setelah add Blob store, atau generate di Vercel>
```

**4. Enable Vercel Blob untuk upload persisten:**
- Vercel Dashboard → Project → Storage → Create Store → Blob → Connect to project
- `BLOB_READ_WRITE_TOKEN` akan otomatis ter-inject. Tanpa ini, upload di Vercel akan hilang tiap deploy (fallback lokal tidak persisten di serverless).

**5. Deploy:**
- Push ke master auto-deploy, atau klik Deploy.
- Setelah deploy sukses, jalankan sekali (via Vercel → Storage/Browser atau lokal dengan DATABASE_URL prod):
```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npm run seed
```

**Catatan upload:**
- `src/lib/server-utils.ts` otomatis pakai `@vercel/blob` jika `BLOB_READ_WRITE_TOKEN` ada, fallback ke `public/uploads` untuk lokal.
- Pastikan Vercel Blob store sudah dikonek sebelum upload di production.

## Env

Lihat `.env.example`. Jangan commit `.env` (sudah di .gitignore).
