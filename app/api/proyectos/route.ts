import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const categoria = request.nextUrl.searchParams.get("categoria");
    const items = await prisma.project.findMany({
      where: { activo: true, ...(categoria ? { categoria } : {}) },
      orderBy: [{ destacado: "desc" }, { orden: "asc" }],
    });
    return ok(items);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudieron cargar los proyectos.");
  }
}
