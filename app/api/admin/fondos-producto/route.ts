import { requireAdmin } from "@/lib/auth";
import { listBackgroundImages, saveBackgroundImage } from "@/lib/background-images";
import { fail, ok } from "@/lib/http";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await requireAdmin();
    const backgrounds = await listBackgroundImages();
    const response = ok({ backgrounds });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudieron cargar los fondos.");
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("Archivo no recibido.");
    const background = await saveBackgroundImage(file);
    const response = ok({ background }, { status: 201 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo subir el fondo.");
  }
}
