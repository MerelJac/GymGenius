// src/middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  console.log("Middleware — token:", JSON.stringify(token, null, 2));
  // 🔒 Not logged in
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const trainerOnlyPaths = [
    "/exercises",
    "/programs",
    "/trainer",
  ]

  const isTrainerRoute = trainerOnlyPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  )

  // 🔒 Role guard
if (isTrainerRoute && token.role !== "TRAINER") {
  console.log(`Blocked ${req.nextUrl.pathname} — role was: ${token?.role ?? "MISSING"}`);
  return NextResponse.redirect(new URL("/client", req.url));
}

// Temporary debug route guard
if (req.nextUrl.pathname.startsWith("/exercises")) {
  return NextResponse.json({
    message: "Debug",
    pathname: req.nextUrl.pathname,
    role: token?.role,
    fullToken: token,
  });
}

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/exercises/:path*",
    "/programs/:path*",
    "/trainer/:path*",
  ],
}
