# Sipena — Sistem Pendaftaran Lomba

Aplikasi pendaftaran lomba sekolah SMA Kartika XIX-1 Bandung. Saat ini tahap awal mencakup setup Next.js, database SQLite beserta data contoh, katalog lomba, halaman detail, dan antarmuka formulir siswa.

## Persyaratan

- Node.js 18 atau lebih baru
- npm

SQLite berjalan sebagai file lokal; tidak memerlukan server database eksternal.

## Instalasi dan menjalankan

```bash
npm install
Copy-Item .env.example .env
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Contoh `.env`:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="replace-with-a-long-random-secret-at-least-32-characters"
```

Kredensial admin untuk seed lokal: **admin / admin123**. Ganti kata sandi sebelum aplikasi digunakan lebih lanjut.

## Database

- `npm run db:migrate` — jalankan migrasi Prisma.
- `npm run db:seed` — isi tiga lomba, akun admin, dan 15 pendaftar contoh.
- `npm run db:studio` — buka Prisma Studio.

## Status pengerjaan

Fitur siswa mendukung pendaftaran dengan validasi ukuran dan signature berkas, serta penyimpanan upload privat. Dashboard panitia menyediakan login, statistik, pencarian, filter, dan verifikasi status.

## Deploy

Untuk VPS, siapkan Node.js, isi `DATABASE_URL`, jalankan migrasi dan seed, lalu `npm run build` dan `npm start`. Untuk Vercel, gunakan database persisten yang dapat diakses dari deployment. SQLite lokal tidak sesuai untuk filesystem deployment yang sementara atau banyak instance; gunakan PostgreSQL untuk produksi.
