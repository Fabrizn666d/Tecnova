import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const project = await prisma.project.findFirst({ where: { slug, activo: true } });
  if (!project) return fail("Proyecto no encontrado.", 404);
  return ok(project);
}
