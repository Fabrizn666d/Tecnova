import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const items = await prisma.category.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
      include: { _count: { select: { productos: true } } },
    });
    return ok(items);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudieron cargar las categorías.");
  }
}
