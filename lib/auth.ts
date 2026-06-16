import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "tecnova-admin-token";

type AdminToken = {
  userId: string;
  email: string;
  rol: string;
};

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "EDITOR";

export function normalizeAdminRole(role?: string | null): AdminRole {
  const normalized = String(role || "ADMIN").trim().toUpperCase().replace(/-/g, "_");
  if (normalized === "SUPERADMIN" || normalized === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (normalized === "EDITOR") return "EDITOR";
  return "ADMIN";
}

export function isSuperAdmin(role?: string | null) {
  return normalizeAdminRole(role) === "SUPER_ADMIN";
}

function secretKey() {
  const secret = process.env.JWT_SECRET || "dev-secret-tecnova-cambiar-en-produccion-32";
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(payload: AdminToken) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secretKey());
}

export async function verifyAdminToken(token?: string) {
  if (!token) return null;
  try {
    const verified = await jwtVerify(token, secretKey());
    const payload = verified.payload as AdminToken;
    const user = await prisma.adminUser.findUnique({ where: { id: payload.userId } });
    if (!user?.activo) return null;
    return { id: user.id, nombre: user.nombre, email: user.email, rol: normalizeAdminRole(user.rol) };
  } catch {
    return null;
  }
}

export async function getCurrentAdmin() {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("No autorizado.");
  return admin;
}

export async function getAdminFromRequest(request: NextRequest) {
  return verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
}

export async function checkPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: (process.env.NEXT_PUBLIC_APP_URL || "").startsWith("https://"),
    path: "/",
    maxAge: 60 * 60 * 8,
  };
}
