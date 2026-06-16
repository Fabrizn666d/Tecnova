import { fail, ok, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { cleanOptionalText, cleanText } from "@/lib/sanitize";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

type QuoteInput = {
  productId?: string;
  items?: { productId?: string; cantidad?: number }[];
  fuente?: string;
  mensaje?: string;
  nombre?: string;
  telefono?: string;
  email?: string;
};

export async function POST(request: NextRequest) {
  try {
    const input = await readJson<QuoteInput>(request);
    const productId = cleanOptionalText(input.productId, 100);
    const telefono = cleanOptionalText(input.telefono, 60);
    const email = cleanOptionalText(input.email, 160);
    const items = Array.isArray(input.items)
      ? input.items
          .map((item) => ({
            productId: cleanOptionalText(item.productId, 100),
            cantidad: Math.max(Number(item.cantidad || 1), 1),
          }))
          .filter((item): item is { productId: string; cantidad: number } => Boolean(item.productId))
      : productId
        ? [{ productId, cantidad: 1 }]
        : [];

    if (!telefono && !email) {
      return fail("Indica al menos un teléfono, WhatsApp o correo para contactarte.");
    }

    const quote = await prisma.quote.create({
      data: {
        fuente: cleanText(input.fuente || "web", 40),
        mensaje: cleanOptionalText(input.mensaje, 1200),
        nombre: cleanOptionalText(input.nombre, 120),
        telefono,
        email,
        items: items.length ? { create: items } : undefined,
      },
    });

    await Promise.all(
      items.map((item) =>
        prisma.product
          .update({
            where: { id: item.productId },
            data: { cotizaciones: { increment: item.cantidad } },
          })
          .catch(() => null)
      )
    );

    return ok(quote, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo registrar la cotización.");
  }
}
