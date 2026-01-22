// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET

  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not set")
  }

  const token = await getToken({
    req,
    secret
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
