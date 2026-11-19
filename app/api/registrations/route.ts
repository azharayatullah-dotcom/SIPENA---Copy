import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { del, put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import {
  INVALID_FILE_FORMAT_MESSAGE,
  INVALID_FILE_SIZE_MESSAGE,
  INVALID_IDENTITY_MESSAGE,
  MAX_UPLOAD_BYTES,
  registrationSchema,
  sniffUploadMimeType,
  uploadExtensionMatchesMime
} from "@/lib/registration-validation";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const requestsByAddress = new Map<string, number[]>();

function getClientAddress(request: NextRequest): string {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function isRateLimited(address: string): boolean {
  const now = Date.now();
  const key = requestsByAddress.has(address) || requestsByAddress.size < 999 ? address : "__overflow__";
  const activeRequests = (requestsByAddress.get(key) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );
  if (activeRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    requestsByAddress.set(key, activeRequests);
    return true;
  }
  activeRequests.push(now);
  requestsByAddress.set(key, activeRequests);

  if (requestsByAddress.size > 1000) {
    requestsByAddress.forEach((timestamps, key) => {
      if (timestamps.every((timestamp) => now - timestamp >= RATE_LIMIT_WINDOW_MS)) {
        requestsByAddress.delete(key);
      }
    });
  }
  return false;
}

function stringField(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

export async function POST(request: NextRequest) {
  if (isRateLimited(getClientAddress(request))) {
    return NextResponse.json(
      { message: "Terlalu banyak percobaan pendaftaran. Silakan coba kembali beberapa menit lagi." },
      { status: 429 }
    );
  }

  const contentLength = Number.parseInt(request.headers.get("content-length") ?? "", 10);
  if (Number.isFinite(contentLength) && contentLength > MAX_UPLOAD_BYTES + 128 * 1024) {
    return NextResponse.json({ message: INVALID_FILE_SIZE_MESSAGE }, { status: 413 });
  }

  let form: FormData;
  try {
    const reader = request.body?.getReader();
    if (!reader) {
      return NextResponse.json({ message: "Formulir tidak dapat dibaca. Silakan coba kembali." }, { status: 400 });
    }
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    const maxRequestBytes = MAX_UPLOAD_BYTES + 128 * 1024;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxRequestBytes) {
        void reader.cancel().catch((error: unknown) => {
          console.error("Gagal menghentikan unggahan yang melebihi batas:", error);
        });
        return NextResponse.json({ message: INVALID_FILE_SIZE_MESSAGE }, { status: 413 });
      }
      chunks.push(value);
    }
    const requestBody = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      requestBody.set(chunk, offset);
      offset += chunk.byteLength;
    }
    form = await new Response(requestBody, {
      headers: { "Content-Type": request.headers.get("content-type") ?? "" }
    }).formData();
  } catch (error) {
    console.error("Gagal membaca formulir pendaftaran:", error);
    return NextResponse.json({ message: "Formulir tidak dapat dibaca. Silakan coba kembali." }, { status: 400 });
  }

  const fields = {
    nama_lengkap: stringField(form, "nama_lengkap"),
    nisn: stringField(form, "nisn"),
    kelas: stringField(form, "kelas"),
    asal_sekolah: stringField(form, "asal_sekolah"),
    no_wa: stringField(form, "no_wa"),
    id_lomba: stringField(form, "id_lomba")
  };

  if (!fields.nama_lengkap.trim() || !fields.kelas.trim() || !fields.no_wa.trim() || !fields.id_lomba.trim()) {
    return NextResponse.json({ message: INVALID_IDENTITY_MESSAGE }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(fields);
  if (!parsed.success) {
    const message = parsed.error.issues.some((issue) => issue.path[0] === "nisn")
      ? "Peringatan: NISN harus berupa 5 sampai 20 angka."
      : "Peringatan: Lengkapi seluruh data pendaftaran dengan benar.";
    return NextResponse.json({ message }, { status: 400 });
  }

  const uploaded = form.get("file_berkas");
  if (!(uploaded instanceof File) || uploaded.size === 0) {
    return NextResponse.json({ message: "Peringatan: Berkas pendaftaran wajib diunggah." }, { status: 400 });
  }
  if (uploaded.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ message: INVALID_FILE_SIZE_MESSAGE }, { status: 400 });
  }
  if (!/\.(jpg|jpeg|png|pdf)$/i.test(uploaded.name)) {
    return NextResponse.json({ message: INVALID_FILE_FORMAT_MESSAGE }, { status: 400 });
  }

  const bytes = new Uint8Array(await uploaded.arrayBuffer());
  const mimeType = sniffUploadMimeType(bytes);
  if (!mimeType || !uploadExtensionMatchesMime(uploaded.name, mimeType)) {
    return NextResponse.json({ message: INVALID_FILE_FORMAT_MESSAGE }, { status: 400 });
  }

  const competition = await prisma.lomba.findUnique({
    where: { id: parsed.data.id_lomba },
    select: { id: true, aktif: true }
  });
  if (!competition || !competition.aktif) {
    return NextResponse.json({ message: "Lomba tidak ditemukan atau pendaftarannya sudah ditutup." }, { status: 400 });
  }

  const extension = mimeType === "image/jpeg" ? ".jpg" : mimeType === "image/png" ? ".png" : ".pdf";
  const filename = `${randomUUID()}${extension}`;
  let blobUrl: string | null = null;
  try {
    const blob = await put(`registrations/${filename}`, Buffer.from(bytes), {
      access: "private",
      addRandomSuffix: false,
      contentType: mimeType
    });
    blobUrl = blob.url;
  } catch (error) {
    console.error("Gagal menyimpan berkas pendaftaran:", error);
    return NextResponse.json(
      { message: "Berkas belum dapat disimpan. Silakan coba kembali." },
      { status: 500 }
    );
  }

  try {
    const registration = await prisma.$transaction(async (transaction) => {
      const participant = await transaction.peserta.upsert({
        where: { nisn: parsed.data.nisn },
        update: {
          nama_lengkap: parsed.data.nama_lengkap,
          kelas: parsed.data.kelas,
          asal_sekolah: parsed.data.asal_sekolah,
          no_wa: parsed.data.no_wa
        },
        create: {
          nama_lengkap: parsed.data.nama_lengkap,
          nisn: parsed.data.nisn,
          kelas: parsed.data.kelas,
          asal_sekolah: parsed.data.asal_sekolah,
          no_wa: parsed.data.no_wa
        }
      });
      const duplicate = await transaction.pendaftaran.findFirst({
        where: { pesertaId: participant.id, lombaId: competition.id },
        select: { id: true }
      });
      if (duplicate) {
        throw new Error("DUPLICATE_REGISTRATION");
      }

      const year = new Date().getFullYear();
      const prefix = `SIP-${year}-`;
      const latest = await transaction.pendaftaran.findFirst({
        where: { nomor_registrasi: { startsWith: prefix } },
        orderBy: { nomor_registrasi: "desc" },
        select: { nomor_registrasi: true }
      });
      const nextNumber = latest
        ? Number.parseInt(latest.nomor_registrasi.slice(prefix.length), 10) + 1
        : 1;
      const nomor_registrasi = `${prefix}${String(nextNumber).padStart(3, "0")}`;

      return transaction.pendaftaran.create({
        data: {
          nomor_registrasi,
          pesertaId: participant.id,
          lombaId: competition.id,
          file_path: `registrations/${filename}`,
          file_mime: mimeType,
          qr_token: randomUUID()
        },
        select: { nomor_registrasi: true }
      });
    });

    return NextResponse.json(
      {
        message: "Pendaftaran berhasil dikirim dan menunggu verifikasi panitia.",
        nomor_registrasi: registration.nomor_registrasi
      },
      { status: 201 }
    );
  } catch (error) {
    if (blobUrl) {
      try {
        await del(blobUrl);
      } catch (cleanupError) {
        console.error("Gagal membersihkan berkas pendaftaran yang tidak tersimpan:", cleanupError);
      }
    }

    if (error instanceof Error && error.message === "DUPLICATE_REGISTRATION") {
      return NextResponse.json({ message: "NISN ini sudah terdaftar pada lomba yang sama." }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { message: "Pendaftaran sedang diproses. Periksa kembali sebelum mencoba ulang." },
        { status: 409 }
      );
    }

    console.error("Gagal menyimpan pendaftaran:", error);
    return NextResponse.json(
      { message: "Pendaftaran belum dapat disimpan. Silakan coba kembali." },
      { status: 500 }
    );
  }
}
