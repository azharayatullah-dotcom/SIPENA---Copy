import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const competitions = [
  {
    id: "desain-grafis",
    nama: "Lomba Desain Grafis",
    deskripsi:
      "Tuangkan ide kreatifmu dalam karya visual digital yang inspiratif. Buat desain orisinal dengan tema lingkungan sekolah yang lebih baik.",
    gambar: "/images/desain-grafis.jpg",
    kuota: 40,
    aktif: true
  },
  {
    id: "kompetisi-poster",
    nama: "Kompetisi Poster",
    deskripsi:
      "Sampaikan pesan positif melalui poster yang kuat, komunikatif, dan menarik. Terbuka untuk seluruh siswa SMA Kartika XIX-1 Bandung.",
    gambar: "/images/kompetisi-poster.jpg",
    kuota: 50,
    aktif: true
  },
  {
    id: "lomba-fotografi",
    nama: "Lomba Fotografi",
    deskripsi:
      "Abadikan cerita dan momen terbaik di sekitarmu. Kirimkan satu foto orisinal dengan komposisi dan cerita yang berkesan.",
    gambar: "/images/lomba-fotografi.jpg",
    kuota: 30,
    aktif: true
  }
];

const sampleNames = [
  "Aditya Pratama",
  "Nadia Putri",
  "Rizky Ramadhan",
  "Salsabila Zahra",
  "Farhan Maulana",
  "Citra Lestari",
  "Dimas Saputra",
  "Alya Maharani",
  "Fajar Nugraha",
  "Intan Permata",
  "Rafi Akbar",
  "Nabila Azzahra",
  "Galih Firmansyah",
  "Putri Amelia",
  "Bagas Setiawan"
];

const sampleStatuses = [
  "APPROVED",
  "PENDING",
  "REJECTED",
  "APPROVED",
  "PENDING",
  "APPROVED",
  "PENDING",
  "REJECTED",
  "APPROVED",
  "PENDING",
  "APPROVED",
  "PENDING",
  "REJECTED",
  "APPROVED",
  "PENDING"
];

async function main() {
  for (const competition of competitions) {
    await prisma.lomba.upsert({
      where: { id: competition.id },
      update: competition,
      create: competition
    });
  }

  const password_hash = await bcrypt.hash("admin123", 10);
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: { password_hash },
    create: { username: "admin", password_hash }
  });

  for (let index = 0; index < sampleNames.length; index += 1) {
    const nama_lengkap = sampleNames[index];
    const nisn = `202600${String(index + 1).padStart(4, "0")}`;
    const peserta = await prisma.peserta.upsert({
      where: { nisn },
      update: {},
      create: {
        nama_lengkap,
        nisn,
        kelas: `XI-${(index % 5) + 1}`,
        asal_sekolah: "SMA Kartika XIX-1 Bandung",
        no_wa: `0812345678${String(index).padStart(2, "0")}`
      }
    });

    const competition = competitions[index % competitions.length];
    const nomor_registrasi = `SIP-2026-${String(index + 1).padStart(3, "0")}`;
    await prisma.pendaftaran.upsert({
      where: { nomor_registrasi },
      update: {},
      create: {
        nomor_registrasi,
        pesertaId: peserta.id,
        lombaId: competition.id,
        file_path: `seed/${nomor_registrasi}.pdf`,
        file_mime: "application/pdf",
        status: sampleStatuses[index],
        alasan_penolakan:
          sampleStatuses[index] === "REJECTED" ? "Berkas contoh perlu diperbarui." : null,
        qr_token: `seed-token-${nomor_registrasi}`
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
