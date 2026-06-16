import type { NextRequest } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return Response.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400, details?: unknown) {
  return Response.json({ ok: false, message, details }, { status });
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("El cuerpo JSON no es válido.");
  }
}

export function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

export function parsePagination(searchParams: URLSearchParams) {
  const pagina = Math.max(Number(searchParams.get("pagina") || 1), 1);
  const limite = Math.min(Math.max(Number(searchParams.get("limite") || 24), 1), 100);
  return { pagina, limite, skip: (pagina - 1) * limite };
}
