// /app/api/one-rep-max/route.ts
import { NextResponse } from "next/server";
import { getLatestOneRepMax } from "@/app/utils/oneRepMax/getLatestOneRepMax";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const exerciseId = searchParams.get("exerciseId");

  if (!clientId || !exerciseId) {
    return NextResponse.json({ oneRepMax: null });
  }

  const oneRepMax = await getLatestOneRepMax(clientId, exerciseId);
  return NextResponse.json({ oneRepMax });
}
