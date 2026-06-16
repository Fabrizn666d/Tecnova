import { createAdmin, listAdmin } from "@/lib/admin-handlers";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export function GET(request: NextRequest) {
  return listAdmin(request, "productos");
}

export function POST(request: NextRequest) {
  return createAdmin(request, "productos");
}
