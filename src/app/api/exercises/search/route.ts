import { prisma } from "@/lib/prisma";
import { ExerciseType, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  const enumMatch = Object.values(ExerciseType).find(
    (v) => v.toLowerCase() === q?.toLowerCase(),
  );

  const where: Prisma.ExerciseWhereInput | undefined = q
    ? {
        OR: [
          {
            name: {
              contains: q,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            muscleGroup: {
              contains: q,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          ...(enumMatch
            ? [
                {
                  type: {
                    equals: enumMatch,
                  },
                },
              ]
            : []),
        ],
      }
    : undefined;

  const exercises = await prisma.exercise.findMany({
    where,
    orderBy: { name: "asc" },
    take: 20,
  });

  return NextResponse.json(exercises);
}
