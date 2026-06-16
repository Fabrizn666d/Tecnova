import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const product = await prisma.product.findFirst({
    where: { slug, activo: true, tipo: "producto" },
    include: { category: true },
  });
  if (!product) return fail("Producto no encontrado.", 404);
  const related = await prisma.product.findMany({
    where: { activo: true, tipo: "producto", categoryId: product.categoryId, id: { not: product.id } },
    take: 4,
    include: { category: true },
  });
  return ok({ product, related });
}
