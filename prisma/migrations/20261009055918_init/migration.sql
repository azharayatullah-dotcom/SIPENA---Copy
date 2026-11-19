CREATE TABLE "Peserta" (
    "id" TEXT NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "nisn" TEXT NOT NULL,
    "kelas" TEXT NOT NULL,
    "asal_sekolah" TEXT NOT NULL,
    "no_wa" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Peserta_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Lomba" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "gambar" TEXT NOT NULL,
    "kuota" INTEGER NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "biaya" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Lomba_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Pendaftaran" (
    "id" TEXT NOT NULL,
    "nomor_registrasi" TEXT NOT NULL,
    "pesertaId" TEXT NOT NULL,
    "lombaId" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_mime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "alasan_penolakan" TEXT,
    "qr_token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    CONSTRAINT "Pendaftaran_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Peserta_nisn_key" ON "Peserta"("nisn");
CREATE INDEX "Peserta_nisn_idx" ON "Peserta"("nisn");
CREATE UNIQUE INDEX "Pendaftaran_nomor_registrasi_key" ON "Pendaftaran"("nomor_registrasi");
CREATE UNIQUE INDEX "Pendaftaran_qr_token_key" ON "Pendaftaran"("qr_token");
CREATE INDEX "Pendaftaran_status_idx" ON "Pendaftaran"("status");
CREATE INDEX "Pendaftaran_nomor_registrasi_idx" ON "Pendaftaran"("nomor_registrasi");
CREATE UNIQUE INDEX "Pendaftaran_pesertaId_lombaId_key" ON "Pendaftaran"("pesertaId", "lombaId");
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

ALTER TABLE "Pendaftaran" ADD CONSTRAINT "Pendaftaran_pesertaId_fkey"
FOREIGN KEY ("pesertaId") REFERENCES "Peserta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Pendaftaran" ADD CONSTRAINT "Pendaftaran_lombaId_fkey"
FOREIGN KEY ("lombaId") REFERENCES "Lomba"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
