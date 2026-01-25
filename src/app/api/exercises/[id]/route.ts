// src/app/api/exercises/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  const exercise = await prisma.exercise.findUnique({
    where: { id: params.id },
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
