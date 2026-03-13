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

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // redirect logged-in users away from /
  if (pathname === "/" && token) {
    if (token.role === "CLIENT") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/trainer", req.url));
  }

  // Skip middleware for public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 🔒 Not logged in
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const trainerOnlyPaths = ["/exercises", "/programs", "/trainer"];

  const isTrainerRoute = trainerOnlyPaths.some((path) =>
    pathname.startsWith(path),
  );

  // console.log("Middleware: Checking access for", pathname, "with role", token.role);
  // console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

  // Check access via API
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/billing/access`, {
    headers: { cookie: req.headers.get("cookie") ?? "" },
  });

  const { hasAccess } = await res.json();

  if (!hasAccess) {
    return NextResponse.redirect(new URL("/billing", req.url));
  }

  // 🔒 Role guard
  if (
    isTrainerRoute &&
    (token.role !== "TRAINER" && token.role !== "ADMIN")
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/exercises/:path*",
    "/programs/:path*",
    "/trainer/:path*",
    "/client/:path*",
  ],
};