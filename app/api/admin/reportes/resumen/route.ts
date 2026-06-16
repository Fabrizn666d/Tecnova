import { requireAdmin } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    const [productos, repuestos, categorias, cotizaciones, proyectos, banners, usuarios, leads, reclamaciones] = await Promise.all([
      prisma.product.count({ where: { tipo: "producto" } }),
      prisma.product.count({ where: { tipo: "repuesto" } }),
      prisma.category.count(),
      prisma.quote.count(),
      prisma.project.count(),
      prisma.banner.count(),
      prisma.adminUser.count(),
      prisma.lead.count(),
      prisma.complaint.count(),
    ]);
    const topProductos = await prisma.product.findMany({
      where: { tipo: "producto" },
      take: 10,
      orderBy: [{ cotizaciones: "desc" }, { vistas: "desc" }],
      select: { id: true, nombre: true, vistas: true, cotizaciones: true },
    });
    return ok({
      productos,
      repuestos,
      categorias,
      cotizaciones,
      proyectos,
      banners,
      usuarios,
      leads,
      reclamaciones,
      topProductos,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No autorizado.", 401);
  }
}
