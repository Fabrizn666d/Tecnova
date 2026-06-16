import { ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const items = await prisma.category.findMany({
    where: { activo: true },
    orderBy: { orden: "asc" },
    include: { _count: { select: { productos: true } } },
  });
  return ok(items);
}
