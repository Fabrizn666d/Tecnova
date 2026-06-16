import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(_request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const product = await prisma.product.update({
      where: { slug },
      data: { vistas: { increment: 1 } },
    }).catch(() => null);
    if (!product) return fail("Producto no encontrado.", 404);
    return ok({ vistas: product.vistas });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo registrar la vista.");
  }
}
