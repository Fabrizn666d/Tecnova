import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "tecnova-admin-token";

function secretKey() {
  const secret = process.env.JWT_SECRET || "dev-secret-tecnova-cambiar-en-produccion-32";
  return new TextEncoder().encode(secret);
}

async function hasValidToken(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secretKey());
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPanelPath = pathname.startsWith("/panel-tecnova");
  const panelBase = isPanelPath ? "/panel-tecnova" : "/admin";
  const isLoginPath = pathname === `${panelBase}/login`;
  const admin = await hasValidToken(request);

  if (!admin && !isLoginPath) {
    return NextResponse.redirect(new URL(`${panelBase}/login`, request.url));
  }

  if (admin && isLoginPath) {
    return NextResponse.redirect(new URL(panelBase, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/panel-tecnova/:path*"],
};
