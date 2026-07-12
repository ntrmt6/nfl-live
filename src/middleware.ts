import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/auth-constants";

// Lightweight presence check only (edge runtime can't use jsonwebtoken).
// Full JWT verification happens server-side in src/app/admin/layout.tsx.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const hasSession = req.cookies.has(ADMIN_COOKIE_NAME);
  if (!hasSession) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
