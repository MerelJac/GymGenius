// app/api/exercises/[id]/substitutions/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: exerciseId } = await context.params;

    const substitutions = await prisma.exercise.findMany({
      where: {
        substitutionsTo: {
          some: {
            exerciseId: exerciseId,
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(substitutions);
  } catch (err) {
    console.error("Substitution route error:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}