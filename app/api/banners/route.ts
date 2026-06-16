import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const posicion = request.nextUrl.searchParams.get("posicion") || "hero";
    const now = new Date();
    const items = await prisma.banner.findMany({
      where: {
        activo: true,
        posicion,
        OR: [{ fechaInicio: null }, { fechaInicio: { lte: now } }],
        AND: [{ OR: [{ fechaFin: null }, { fechaFin: { gte: now } }] }],
      },
      orderBy: { orden: "asc" },
    });
    return ok(items);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudieron cargar los banners.");
  }
}
