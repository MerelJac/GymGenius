// src/app/api/exercises/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const exercise = await prisma.exercise.findUnique({
    where: { id },
    include: {
      substitutionsFrom: {
        include: {
          substituteExercise: true,
        },
      },
    },
  });

  if (!exercise) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: exercise.id,
    name: exercise.name,
    type: exercise.type,
    equipment: exercise.equipment,
    notes: exercise.notes,
    videoUrl: exercise.videoUrl,
    substitutions: exercise.substitutionsFrom.map((sub) => ({
      id: sub.id,
      name: sub.substituteExercise.name,
      note: sub.note,
    })),
  });
}
