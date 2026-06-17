import { isSuperAdmin, requireAdmin } from "@/lib/auth";
import { backupPath, isValidBackupFilename, openBackupStream } from "@/lib/backups";
import { fail } from "@/lib/http";
import { stat } from "fs/promises";
import { NextRequest } from "next/server";
import { Readable } from "stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request: NextRequest, context: { params: Promise<{ filename: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!isSuperAdmin(admin.rol)) return fail("No autorizado.", 403);

    const { filename } = await context.params;
    if (!isValidBackupFilename(filename)) return fail("Nombre de backup invalido.", 400);

    const filePath = backupPath(filename);
    const info = await stat(filePath);
    const stream = await openBackupStream(filename);

    return new Response(Readable.toWeb(stream) as ReadableStream, {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Length": String(info.size),
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo descargar el backup.";
    return fail(message, message === "No autorizado." ? 401 : 404);
  }
}
