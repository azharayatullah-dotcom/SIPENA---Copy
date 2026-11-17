import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const verificationSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("APPROVED") }),
  z.object({ status: z.literal("REJECTED"), alasan_penolakan: z.string().trim().min(1).max(500) })
]);

type RouteContext = { params: { id: string } };

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Silakan masuk sebagai panitia." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    console.error("Permintaan verifikasi tidak dapat dibaca:", error);
    return NextResponse.json({ message: "Data verifikasi tidak valid." }, { status: 400 });
  }
  const parsed = verificationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Pilih status verifikasi yang valid dan isi alasan jika pendaftaran ditolak." },
      { status: 400 }
    );
  }

  const existing = await prisma.pendaftaran.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ message: "Data pendaftar tidak ditemukan." }, { status: 404 });
  }

  const registration = await prisma.pendaftaran.update({
    where: { id: params.id },
    data: {
      status: parsed.data.status,
      alasan_penolakan: parsed.data.status === "REJECTED" ? parsed.data.alasan_penolakan : null,
      verifiedAt: new Date()
    },
    select: { id: true, status: true, alasan_penolakan: true }
  });

  return NextResponse.json({ message: "Status pendaftaran berhasil diperbarui.", pendaftar: registration });
}
