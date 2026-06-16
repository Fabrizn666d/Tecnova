import { getCurrentAdmin } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return fail("No autenticado.", 401);
  return ok(admin);
}
