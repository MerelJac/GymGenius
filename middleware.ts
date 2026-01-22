import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "@auth/core/jwt"

export async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET

  if (!secret) {
    throw new Error("AUTH_SECRET is not set")
  }

  const token = await getToken({
    req,
    secret,
    salt: "gymgenius-auth", // 👈 REQUIRED IN v5
  })

  // Not logged in
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const isTrainerRoute = req.nextUrl.pathname.startsWith("/trainer")

  // Role guard
  if (isTrainerRoute && token.role !== "TRAINER") {
    return NextResponse.redirect(new URL("/client", req.url))
  }

  return NextResponse.next()
}
