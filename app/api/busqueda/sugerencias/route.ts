import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q")?.trim() || "";
    if (q.length < 2) return ok([]);
    const [products, spareParts, services, brands] = await Promise.all([
      prisma.product.findMany({
        where: { activo: true, tipo: "producto", nombre: { contains: q } },
        select: { nombre: true, slug: true },
        take: 5,
      }),
      prisma.product.findMany({
        where: { activo: true, tipo: "repuesto", nombre: { contains: q } },
        select: { nombre: true, slug: true },
        take: 5,
      }),
      prisma.service.findMany({
        where: { activo: true, nombre: { contains: q } },
        select: { nombre: true, slug: true },
        take: 4,
      }),
      prisma.brand.findMany({
        where: { activo: true, nombre: { contains: q } },
        select: { nombre: true },
        take: 4,
      }),
    ]);

    return ok([
      ...products.map((item) => ({ ...item, tipo: "producto", href: `/productos/${item.slug}` })),
      ...spareParts.map((item) => ({ ...item, tipo: "repuesto", href: `/repuestos/${item.slug}` })),
      ...services.map((item) => ({ ...item, tipo: "servicio", href: `/servicios/${item.slug}` })),
      ...brands.map((item) => ({ nombre: item.nombre, tipo: "marca", href: `/productos?marca=${encodeURIComponent(item.nombre)}` })),
    ]);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudieron cargar sugerencias.");
  }
}
