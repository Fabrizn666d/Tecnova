import { fail, ok, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { cleanOptionalText } from "@/lib/sanitize";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const input = await readJson<{ nombre?: string; telefono?: string; email?: string; mensaje?: string }>(request);
    const nombre = cleanOptionalText(input.nombre, 120);
    const telefono = cleanOptionalText(input.telefono, 60);
    const email = cleanOptionalText(input.email, 160);
    const mensaje = cleanOptionalText(input.mensaje, 1200) || "Consulta enviada desde la web.";

    const [lead, quote] = await Promise.all([
      prisma.lead.create({
        data: {
          fuente: "contacto",
          nombre,
          telefono,
          email,
          consulta: mensaje,
        },
      }),
      prisma.quote.create({
        data: {
          fuente: "formulario",
          nombre,
          telefono,
          email,
          mensaje,
        },
      }),
    ]);

    return ok({ lead, quote }, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo enviar el formulario.");
  }
}
