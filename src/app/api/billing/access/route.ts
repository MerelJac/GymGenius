// app/api/billing/access/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserAccess } from "@/lib/billing/access";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ hasAccess: false });
  const access = await getUserAccess(session.user.id);
  return NextResponse.json(access);
}