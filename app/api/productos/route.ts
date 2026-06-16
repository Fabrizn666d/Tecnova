import { ok, parsePagination } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const { pagina, limite, skip } = parsePagination(searchParams);
  const q = searchParams.get("q")?.trim();
  const categoria = searchParams.get("categoria")?.trim();
  const marca = searchParams.get("marca")?.trim();
  const tipo = searchParams.get("tipo")?.trim() || "producto";
  const condicion = searchParams.get("condicion")?.trim();
  const estado = searchParams.get("estado")?.trim();
  const disponibilidad = searchParams.get("disponibilidad")?.trim();
  const destacado = searchParams.get("destacado");
  const nuevo = searchParams.get("nuevo");
  const precioMinParam = searchParams.get("precioMin");
  const precioMaxParam = searchParams.get("precioMax");
  const precioMin = Number(precioMinParam);
  const precioMax = Number(precioMaxParam);
  const orden = searchParams.get("orden") || "relevantes";

  const orderBy =
    orden === "recientes"
      ? [{ createdAt: "desc" as const }]
      : orden === "cotizados"
        ? [{ cotizaciones: "desc" as const }, { vistas: "desc" as const }]
        : orden === "precio-asc"
          ? [{ precio: "asc" as const }]
          : orden === "precio-desc"
            ? [{ precio: "desc" as const }]
            : [{ destacado: "desc" as const }, { ordenDestacado: "asc" as const }, { createdAt: "desc" as const }];

  const where = {
    activo: true,
    ...(tipo !== "todos" ? { tipo } : {}),
    ...(categoria ? { category: { slug: categoria } } : {}),
    ...(marca ? { marca: { contains: marca } } : {}),
    ...(condicion || estado ? { condicion: condicion || estado } : {}),
    ...(disponibilidad ? { disponible: disponibilidad === "disponible" || disponibilidad === "true" } : {}),
    ...(destacado ? { destacado: destacado === "true" } : {}),
    ...(nuevo ? { nuevo: nuevo === "true" } : {}),
    ...((precioMinParam && Number.isFinite(precioMin)) || (precioMaxParam && Number.isFinite(precioMax))
      ? {
          precio: {
            ...(precioMinParam && Number.isFinite(precioMin) ? { gte: precioMin } : {}),
            ...(precioMaxParam && Number.isFinite(precioMax) ? { lte: precioMax } : {}),
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { nombre: { contains: q } },
            { descripcionCorta: { contains: q } },
            { marca: { contains: q } },
            { modelo: { contains: q } },
            { tags: { contains: q } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip,
      take: limite,
    }),
    prisma.product.count({ where }),
  ]);

  return ok({ items, total, pagina, limite });
}
