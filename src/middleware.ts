// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/billing",
  "/api/billing/access",
  "/api/auth",
  "/_next",
  "/favicon.ico",
];

export async function middleware(req: NextRequest) {

    const { pathname } = req.nextUrl;

  // ✅ Skip middleware for public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 🔒 Not logged in
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const trainerOnlyPaths = ["/exercises", "/programs", "/trainer"];

  const isTrainerRoute = trainerOnlyPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path),
  );

  // Check access via API (or duplicate logic here for edge-compatible check)
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/billing/access`, {
    headers: { cookie: req.headers.get("cookie") ?? "" },
  });
  const { hasAccess } = await res.json();
  console.log("has access: ", hasAccess)

  if (!hasAccess) return NextResponse.redirect(new URL("/billing", req.url));

  // 🔒 Role guard
  if (
    isTrainerRoute &&
    (!token || (token.role !== "TRAINER" && token.role !== "ADMIN"))
  ) {
    console.log(
      `Blocked ${req.nextUrl.pathname} — role was: ${token?.role ?? "MISSING"}`,
    );
    return NextResponse.redirect(new URL("/client", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/exercises/:path*", "/programs/:path*", "/trainer/:path*",  "/client/:path*",],
};
