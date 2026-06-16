import { fail, ok, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { cleanOptionalText, cleanText } from "@/lib/sanitize";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const input = await readJson<Record<string, unknown>>(request);
    if (String(input.aceptacion || "") !== "true") {
      return fail("Debes aceptar el tratamiento de datos para registrar la solicitud.");
    }
    if (!cleanOptionalText(input.telefono, 60) && !cleanOptionalText(input.email, 160)) {
      return fail("Indica al menos un teléfono o correo para responder tu solicitud.");
    }
    const complaint = await prisma.complaint.create({
      data: {
        nombre: cleanText(input.nombre, 120),
        documento: cleanText(input.documento, 40),
        telefono: cleanOptionalText(input.telefono, 60),
        email: cleanOptionalText(input.email, 160),
        direccion: cleanOptionalText(input.direccion, 220),
        tipo: cleanText(input.tipo || "reclamo", 40),
        productoServicio: cleanOptionalText(input.productoServicio, 180),
        monto: Number.isFinite(Number(input.monto)) ? Number(input.monto) : null,
        detalle: cleanText(input.detalle, 3000),
        pedido: cleanText(input.pedido, 2000),
      },
    });

    return ok(complaint, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo registrar la reclamación.");
  }
}
