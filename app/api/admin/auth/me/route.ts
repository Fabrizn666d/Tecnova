import { getCurrentAdmin } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return fail("No autenticado.", 401);
    return ok(admin);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo validar la sesión.", 401);
  }
}
