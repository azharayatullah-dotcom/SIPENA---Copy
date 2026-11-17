import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Silakan masuk sebagai panitia." }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const search = searchParams.get("search")?.trim().slice(0, 100) ?? "";
  const status = searchParams.get("status") ?? "";
  const lombaId = searchParams.get("lombaId") ?? "";
  const where = {
    ...(status && ["PENDING", "APPROVED", "REJECTED"].includes(status) ? { status } : {}),
    ...(lombaId ? { lombaId } : {}),
    ...(search
      ? {
          OR: [
            { peserta: { nama_lengkap: { contains: search } } },
            { peserta: { nisn: { contains: search } } },
            { nomor_registrasi: { contains: search } }
          ]
        }
      : {})
  };

  const [total, pending, filteredTotal, registrations, competitions] = await Promise.all([
    prisma.pendaftaran.count(),
    prisma.pendaftaran.count({ where: { status: "PENDING" } }),
    prisma.pendaftaran.count({ where }),
    prisma.pendaftaran.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * 10,
      take: 10,
      select: {
        id: true,
        nomor_registrasi: true,
        status: true,
        alasan_penolakan: true,
        file_path: true,
        createdAt: true,
        peserta: { select: { nama_lengkap: true, nisn: true, no_wa: true } },
        lomba: { select: { id: true, nama: true } }
      }
    }),
    prisma.lomba.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true } })
  ]);

  return NextResponse.json({
    statistik: { total, pending },
    pendaftar: registrations,
    lomba: competitions,
    halaman: page,
    totalHalaman: Math.max(1, Math.ceil(filteredTotal / 10)),
    totalHasil: filteredTotal
  });
}
