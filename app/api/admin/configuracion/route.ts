import { requireAdmin } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { cleanPublicAssetPath } from "@/lib/sanitize";
import { getSettingsMap } from "@/lib/settings";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await requireAdmin();
    const settings = await getSettingsMap();
    const items = Object.entries(settings).map(([clave, valor]) => ({ clave, valor }));
    return ok({ items, total: items.length, pagina: 1, limite: items.length });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo cargar configuración.", 401);
  }
}

export function POST() {
  return fail("Usa Guardar configuración para actualizar campos.", 405);
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const input = await readJson<Record<string, string>>(request);
    const imageKeys = new Set(["logo_principal", "logo_footer", "favicon", "libro_imagen", "nosotros_imagen"]);
    const entries = Object.entries(input).filter(([, valor]) => typeof valor !== "undefined");
    const updates = await Promise.all(
      entries.map(([clave, valor]) => {
        const normalizedValue = imageKeys.has(clave) ? cleanPublicAssetPath(valor) || "" : String(valor);
        return prisma.setting.upsert({
          where: { clave },
          update: { valor: normalizedValue },
          create: { clave, valor: normalizedValue, grupo: "general" },
        });
      })
    );
    return ok(updates);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo actualizar configuración.");
  }
}
