import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    return ok(await prisma.brand.findMany({ where: { activo: true }, orderBy: { orden: "asc" } }));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudieron cargar las marcas.");
  }
}
