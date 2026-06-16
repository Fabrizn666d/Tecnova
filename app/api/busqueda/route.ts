import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q")?.trim() || "";
    if (q.length < 2) return ok({ productos: [], repuestos: [], categorias: [], servicios: [], marcas: [] });
    const [productos, repuestos, categorias, servicios, marcas] = await Promise.all([
      prisma.product.findMany({
        where: {
          activo: true,
          tipo: "producto",
          OR: [
            { nombre: { contains: q } },
            { descripcionCorta: { contains: q } },
            { marca: { contains: q } },
            { modelo: { contains: q } },
            { tags: { contains: q } },
          ],
        },
        include: { category: true },
        take: 12,
      }),
      prisma.product.findMany({
        where: {
          activo: true,
          tipo: "repuesto",
          OR: [
            { nombre: { contains: q } },
            { descripcionCorta: { contains: q } },
            { marca: { contains: q } },
            { modelo: { contains: q } },
            { tags: { contains: q } },
          ],
        },
        include: { category: true },
        take: 12,
      }),
      prisma.category.findMany({ where: { activo: true, nombre: { contains: q } }, take: 6 }),
      prisma.service.findMany({ where: { activo: true, nombre: { contains: q } }, take: 6 }),
      prisma.brand.findMany({ where: { activo: true, nombre: { contains: q } }, take: 6 }),
    ]);
    return ok({ productos, repuestos, categorias, servicios, marcas });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo realizar la búsqueda.");
  }
}
