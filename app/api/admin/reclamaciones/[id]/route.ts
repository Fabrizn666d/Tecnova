import { deleteAdmin, getAdmin, updateAdmin } from "@/lib/admin-handlers";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return getAdmin(request, "reclamaciones", context);
}

export function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return updateAdmin(request, "reclamaciones", context);
}

export function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return deleteAdmin(request, "reclamaciones", context);
}
