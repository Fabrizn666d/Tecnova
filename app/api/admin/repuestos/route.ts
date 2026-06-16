import { createAdmin, listAdmin } from "@/lib/admin-handlers";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export function GET(request: NextRequest) {
  return listAdmin(request, "repuestos");
}

export function POST(request: NextRequest) {
  return createAdmin(request, "repuestos");
}
