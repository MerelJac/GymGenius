// src/app/api/workouts/additional/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const types = await prisma.additionalWorkoutType.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(types);
}
