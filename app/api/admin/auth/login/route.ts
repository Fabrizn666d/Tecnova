import { ADMIN_COOKIE, adminCookieOptions, checkPassword, signAdminToken } from "@/lib/auth";
import { fail, getClientIp, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { cleanText } from "@/lib/sanitize";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const input = await readJson<{ email?: string; password?: string }>(request);
    const email = cleanText(input.email, 160).toLowerCase();
    const password = String(input.password || "");

    const since = new Date(Date.now() - 15 * 60 * 1000);
    const failedAttempts = await prisma.loginAttempt.count({
      where: { email, ip, success: false, createdAt: { gte: since } },
    });

    if (failedAttempts >= 5) {
      return fail("Demasiados intentos. Vuelve a intentar en 15 minutos.", 429);
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });
    const valid = user?.activo ? await checkPassword(password, user.password) : false;

    await prisma.loginAttempt.create({ data: { email, ip, success: Boolean(valid) } });

    if (!user || !valid) {
      return fail("Credenciales inválidas.", 401);
    }

    await prisma.adminUser.update({ where: { id: user.id }, data: { ultimoAcceso: new Date() } });
    const token = await signAdminToken({ userId: user.id, email: user.email, rol: user.rol });
    const response = NextResponse.json({
      ok: true,
      data: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
    });
    response.cookies.set(ADMIN_COOKIE, token, adminCookieOptions());
    return response;
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo iniciar sesión.", 400);
  }
}
