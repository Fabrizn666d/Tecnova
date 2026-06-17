import { createAdmin, listAdmin } from "@/lib/admin-handlers";
import { requireAdmin } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { cleanPublicAssetPath } from "@/lib/sanitize";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    const imageKeys = new Set(["logo_principal", "logo_footer", "favicon", "libro_imagen", "nosotros_imagen"]);
    const updates = await Promise.all(
      Object.entries(input).map(([clave, valor]) => {
        const normalizedValue = imageKeys.has(clave) ? cleanPublicAssetPath(valor) || "" : String(valor);
        return (
        prisma.setting.upsert({
          where: { clave },
          update: { valor: normalizedValue },
          create: { clave, valor: normalizedValue, grupo: "general" },
        })
        );
      })
    );
    return ok(updates);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo actualizar configuración.");
  }
}
