# Sipena — Sistem Pendaftaran Lomba

Aplikasi pendaftaran lomba sekolah SMA Kartika XIX-1 Bandung. Saat ini tahap awal mencakup setup Next.js, database SQLite beserta data contoh, katalog lomba, halaman detail, dan antarmuka formulir siswa.

## Persyaratan

- Node.js 18 atau lebih baru
- npm

Untuk produksi, aplikasi menggunakan PostgreSQL dan Vercel Blob sebagai penyimpanan berkas.

## Instalasi dan menjalankan

```bash
npm install
Copy-Item .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Contoh `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
LOCAL_DATABASE_URL="file:./dev.db"
AUTH_SECRET="local-development-secret-change-before-deploy-2026"
```

Local commands use `LOCAL_DATABASE_URL` (SQLite); production uses `DATABASE_URL` (PostgreSQL). Replace the PostgreSQL placeholder in Vercel's project environment variables. Set `BLOB_READ_WRITE_TOKEN` in Vercel for uploads.

Kredensial admin untuk seed: **admin / admin123**. Ganti kata sandi sebelum aplikasi digunakan lebih lanjut.

## Database

- `npm run db:migrate` — siapkan database SQLite lokal.
- `npm run db:seed` — isi tiga lomba, akun admin, dan 15 pendaftar contoh.
- `npm run db:studio` — buka Prisma Studio.

## Status pengerjaan

Fitur siswa mendukung pendaftaran dengan validasi ukuran dan signature berkas, serta penyimpanan upload privat. Dashboard panitia menyediakan login, statistik, pencarian, filter, dan verifikasi status.

## Deploy

Untuk Vercel:
1. Buat database PostgreSQL, misalnya Neon atau Vercel Postgres, lalu tambahkan connection string sebagai `DATABASE_URL`.
2. Buat Vercel Blob Store dan tambahkan `BLOB_READ_WRITE_TOKEN`.
3. Tambahkan `AUTH_SECRET` acak minimal 32 karakter.
4. Deploy repository. Build menjalankan migrasi PostgreSQL.
5. Jalankan seed dari terminal lokal menggunakan `DATABASE_URL` PostgreSQL produksi: `npx prisma db seed --schema prisma/schema.prisma`.
