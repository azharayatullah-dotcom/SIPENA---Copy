import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminCookieOptions, ADMIN_COOKIE_NAME, createAdminToken } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200)
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    console.error("Permintaan login admin tidak dapat dibaca:", error);
    return NextResponse.json({ message: "Data login tidak valid." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Masukkan username dan kata sandi." }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({ where: { username: parsed.data.username } });
  if (!admin || !(await bcrypt.compare(parsed.data.password, admin.password_hash))) {
    return NextResponse.json({ message: "Username atau kata sandi salah." }, { status: 401 });
  }

  try {
    const token = await createAdminToken(admin.id, admin.username);
    const response = NextResponse.json({ message: "Login berhasil." });
    response.cookies.set(ADMIN_COOKIE_NAME, token, adminCookieOptions());
    return response;
  } catch (error) {
    console.error("Gagal membuat sesi admin:", error);
    return NextResponse.json({ message: "Login belum dapat diproses." }, { status: 500 });
  }
}
