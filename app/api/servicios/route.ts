import { ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  return ok(await prisma.service.findMany({ where: { activo: true }, orderBy: { orden: "asc" } }));
}
