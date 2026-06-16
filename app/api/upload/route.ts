import { requireAdmin } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/http";
import { deleteUpload, saveUpload } from "@/lib/upload";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const form = await request.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "general");
    if (!(file instanceof File)) return fail("Archivo no recibido.");
    const url = await saveUpload(file, folder);
    return ok({ url });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo subir el archivo.");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const input = await readJson<{ path: string }>(request);
    await deleteUpload(input.path);
    return ok({ deleted: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo eliminar el archivo.");
  }
}
