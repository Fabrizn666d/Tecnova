import { requireAdmin } from "@/lib/auth";
import { deleteBackgroundImage, listBackgroundImages, saveBackgroundImage } from "@/lib/background-images";
import { fail } from "@/lib/http";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await requireAdmin();
    const backgrounds = await listBackgroundImages();
    const response = Response.json({ ok: true, data: { backgrounds, items: backgrounds }, backgrounds, items: backgrounds });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("[fondos-producto] error listando fondos", error);
    return fail(error instanceof Error ? error.message : "No se pudieron cargar los fondos.");
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("No se recibio una imagen valida.");
    if (file.size <= 0) return fail("La imagen recibida esta vacia.");
    console.info("[fondos-producto] archivo recibido", {
      name: file.name || "sin-nombre",
      type: file.type || "sin-mime",
      size: file.size,
      cwd: process.cwd(),
    });
    const background = await saveBackgroundImage(file);
    const response = Response.json(
      {
        ok: true,
        name: background.name,
        url: background.url,
        data: {
          name: background.name,
          url: background.url,
          background,
          item: background,
        },
        background,
        item: background,
      },
      { status: 201 }
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("[fondos-producto] error subiendo fondo", error);
    return fail(error instanceof Error ? error.message : "No se pudo subir el fondo.");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const filename = request.nextUrl.searchParams.get("filename") || "";
    const force = request.nextUrl.searchParams.get("force") === "true";
    const result = await deleteBackgroundImage(filename, force);
    const response = Response.json({ ok: true, data: result, ...result });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("[fondos-producto] error eliminando fondo", error);
    return fail(error instanceof Error ? error.message : "No se pudo eliminar el fondo.");
  }
}
