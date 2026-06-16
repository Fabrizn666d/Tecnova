import { fail, ok, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { cleanOptionalText, cleanText } from "@/lib/sanitize";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const input = await readJson<{
      productId?: string;
      fuente?: string;
      mensaje?: string;
      nombre?: string;
      telefono?: string;
      email?: string;
    }>(request);
    const productId = cleanOptionalText(input.productId, 100);
    const quote = await prisma.quote.create({
      data: {
        fuente: cleanText(input.fuente || "whatsapp", 40),
        mensaje: cleanOptionalText(input.mensaje, 1200),
        nombre: cleanOptionalText(input.nombre, 120),
        telefono: cleanOptionalText(input.telefono, 60),
        email: cleanOptionalText(input.email, 160),
        items: productId ? { create: [{ productId }] } : undefined,
      },
    });
    if (productId) {
      await prisma.product.update({
        where: { id: productId },
        data: { cotizaciones: { increment: 1 } },
      }).catch(() => null);
    }
    return ok(quote, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo registrar la cotización.");
  }
}
