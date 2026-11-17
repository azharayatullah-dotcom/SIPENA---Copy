-- CreateTable
CREATE TABLE "Peserta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama_lengkap" TEXT NOT NULL,
    "nisn" TEXT NOT NULL,
    "kelas" TEXT NOT NULL,
    "asal_sekolah" TEXT NOT NULL,
    "no_wa" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Lomba" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "gambar" TEXT NOT NULL,
    "kuota" INTEGER NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "biaya" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Pendaftaran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomor_registrasi" TEXT NOT NULL,
    "pesertaId" TEXT NOT NULL,
    "lombaId" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_mime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "alasan_penolakan" TEXT,
    "qr_token" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" DATETIME,
    CONSTRAINT "Pendaftaran_pesertaId_fkey" FOREIGN KEY ("pesertaId") REFERENCES "Peserta" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Pendaftaran_lombaId_fkey" FOREIGN KEY ("lombaId") REFERENCES "Lomba" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Peserta_nisn_key" ON "Peserta"("nisn");

-- CreateIndex
CREATE INDEX "Peserta_nisn_idx" ON "Peserta"("nisn");

-- CreateIndex
CREATE UNIQUE INDEX "Pendaftaran_nomor_registrasi_key" ON "Pendaftaran"("nomor_registrasi");

-- CreateIndex
CREATE UNIQUE INDEX "Pendaftaran_qr_token_key" ON "Pendaftaran"("qr_token");

-- CreateIndex
CREATE INDEX "Pendaftaran_status_idx" ON "Pendaftaran"("status");

-- CreateIndex
CREATE INDEX "Pendaftaran_nomor_registrasi_idx" ON "Pendaftaran"("nomor_registrasi");

-- CreateIndex
CREATE UNIQUE INDEX "Pendaftaran_pesertaId_lombaId_key" ON "Pendaftaran"("pesertaId", "lombaId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");
