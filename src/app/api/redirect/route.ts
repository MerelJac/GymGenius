import { NextResponse } from "next/server"
import { getToken } from "@auth/core/jwt"

export async function GET(req: Request) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET!,
    salt: "gymgenius-auth",
  })

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (token.role === "TRAINER") {
    return NextResponse.redirect(new URL("/trainer/dashboard", req.url))
  }

  return NextResponse.redirect(new URL("/client/dashboard", req.url))
}
