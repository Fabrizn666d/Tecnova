import { ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const categoria = request.nextUrl.searchParams.get("categoria");
  return ok(
    await prisma.fAQ.findMany({
      where: { activo: true, ...(categoria ? { categoria } : {}) },
      orderBy: { orden: "asc" },
    })
  );
}
