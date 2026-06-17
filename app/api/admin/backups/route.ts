import { isSuperAdmin, requireAdmin } from "@/lib/auth";
import { createManualBackup, listBackups } from "@/lib/backups";
import { fail, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!isSuperAdmin(admin.rol)) return fail("No autorizado.", 403);
    return ok({ items: await listBackups() });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No autorizado.", 401);
  }
}

export async function POST() {
  try {
    const admin = await requireAdmin();
    if (!isSuperAdmin(admin.rol)) return fail("No autorizado.", 403);
    const backup = await createManualBackup();
    return ok({ item: backup, message: "Backup creado correctamente" }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el backup.";
    return fail(message, message === "No autorizado." ? 401 : 500);
  }
}
