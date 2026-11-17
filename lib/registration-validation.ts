import { z } from "zod";

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
export const INVALID_IDENTITY_MESSAGE = "Peringatan: Semua kolom isian identitas wajib diisi!";
export const INVALID_FILE_SIZE_MESSAGE = "Peringatan: Ukuran file berkas maksimal 2 MB!";
export const INVALID_FILE_FORMAT_MESSAGE = "Peringatan: Format berkas harus berupa Gambar atau PDF!";

export const registrationSchema = z.object({
  nama_lengkap: z.string().trim().min(1).max(100),
  nisn: z.string().trim().regex(/^\d{5,20}$/),
  kelas: z.string().trim().min(1).max(20),
  asal_sekolah: z.string().trim().min(1).max(150),
  no_wa: z.string().trim().min(1).max(30),
  id_lomba: z.string().trim().min(1).max(100)
});

export type RegistrationFields = z.infer<typeof registrationSchema>;

export function simpanPendaftaranLomba(
  nama_lengkap: string,
  kelas: string,
  no_wa: string,
  id_lomba: string,
  file_berkas: File | null
): string | null {
  if (!nama_lengkap.trim() || !kelas.trim() || !no_wa.trim() || !id_lomba.trim()) {
    return INVALID_IDENTITY_MESSAGE;
  }

  if (!file_berkas) {
    return "Peringatan: Berkas pendaftaran wajib diunggah.";
  }

  if (file_berkas.size > MAX_UPLOAD_BYTES) {
    return INVALID_FILE_SIZE_MESSAGE;
  }

  if (!/\.(jpg|jpeg|png|pdf)$/i.test(file_berkas.name)) {
    return INVALID_FILE_FORMAT_MESSAGE;
  }

  return null;
}

export function sniffUploadMimeType(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  const pdfHeader = new TextDecoder().decode(bytes.slice(0, 1024));
  if (pdfHeader.includes("%PDF-")) {
    return "application/pdf";
  }

  return null;
}

export function uploadExtensionMatchesMime(filename: string, mimeType: string): boolean {
  const extension = filename.toLowerCase().split(".").pop();
  if (mimeType === "image/jpeg") return extension === "jpg" || extension === "jpeg";
  if (mimeType === "image/png") return extension === "png";
  if (mimeType === "application/pdf") return extension === "pdf";
  return false;
}
