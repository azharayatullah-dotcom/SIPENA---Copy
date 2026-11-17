import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "sipena_admin";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET harus diatur dan memiliki minimal 32 karakter.");
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminToken(adminId: string, username: string): Promise<string> {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuer("sipena")
    .setAudience("sipena-admin")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getAuthSecret());
}

export async function getAdminSession(): Promise<{ id: string; username: string } | null> {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getAuthSecret(), {
      issuer: "sipena",
      audience: "sipena-admin",
      algorithms: ["HS256"]
    });
    if (typeof payload.sub !== "string" || typeof payload.username !== "string") return null;
    return { id: payload.sub, username: payload.username };
  } catch {
    return null;
  }
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DURATION_SECONDS
  };
}
