import { createAdmin, listAdmin } from "@/lib/admin-handlers";
import { requireAdmin } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export function GET(request: NextRequest) {
  return listAdmin(request, "configuracion");
}

export function POST(request: NextRequest) {
  return createAdmin(request, "configuracion");
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const input = await readJson<Record<string, string>>(request);
    const updates = await Promise.all(
      Object.entries(input).map(([clave, valor]) =>
        prisma.setting.upsert({
          where: { clave },
          update: { valor: String(valor) },
          create: { clave, valor: String(valor), grupo: "general" },
        })
      )
    );
    return ok(updates);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo actualizar configuración.");
  }
}
