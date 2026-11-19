import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: { filename: string } };

export async function GET(_request: Request, { params }: RouteContext) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Silakan masuk sebagai panitia." }, { status: 401 });
  }
  if (!/^[0-9a-f-]{36}\.(jpg|png|pdf)$/.test(params.filename)) {
    return NextResponse.json({ message: "Berkas tidak ditemukan." }, { status: 404 });
  }

  const registration = await prisma.pendaftaran.findFirst({
    where: {
      OR: [
        { file_path: params.filename },
        { file_path: `registrations/${params.filename}` }
      ]
    },
    select: { file_mime: true }
  });
  if (!registration) {
    return NextResponse.json({ message: "Berkas tidak ditemukan." }, { status: 404 });
  }

  try {
    const result = await get(`registrations/${params.filename}`, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return NextResponse.json({ message: "Berkas tidak dapat dibuka." }, { status: 404 });
    }
    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": registration.file_mime,
        "Content-Disposition": `inline; filename="${params.filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    console.error("Gagal membaca berkas peserta:", error);
    return NextResponse.json({ message: "Berkas tidak dapat dibuka." }, { status: 500 });
  }
}
