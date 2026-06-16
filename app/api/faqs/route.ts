import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { repairText } from "@/lib/text";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const categoria = request.nextUrl.searchParams.get("categoria");
    const items = await prisma.fAQ.findMany({
        where: { activo: true, ...(categoria ? { categoria } : {}) },
        orderBy: { orden: "asc" },
      });
    return ok(items.map((item) => ({ ...item, pregunta: repairText(item.pregunta), respuesta: repairText(item.respuesta) })));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudieron cargar las preguntas frecuentes.");
  }
}
