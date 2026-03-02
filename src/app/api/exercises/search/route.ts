import { prisma } from "@/lib/prisma";
import { ExerciseType, Prisma } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  const enumMatch = Object.values(ExerciseType).find(
    (v) => v.toLowerCase() === q?.toLowerCase(),
  );

  const token = await getToken({
    req: req as NextRequest,
    secret: process.env.NEXTAUTH_SECRET!,
  });

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // console.log("Token: ", token);

  let trainerFilter: Prisma.ExerciseWhereInput | undefined;

  if (token.role === "TRAINER") {
    // Trainer + Client → only their exercises OR global exercises
    trainerFilter = {
      OR: [{ trainerId: token.id }, { trainerId: null }],
    };
  } else if (token.role === "CLIENT") {
    //Client → only their exercises, trainer exercises, OR global exercises
    trainerFilter = {
      OR: [
        { trainerId: token.id },
        { trainerId: token.trainerId },
        { trainerId: null },
      ],
    };
  } else {
    // Admin can see everything
    trainerFilter = undefined;
  }

  const searchFilter: Prisma.ExerciseWhereInput | undefined = q
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

  const where: Prisma.ExerciseWhereInput = {
    AND: [
      ...(searchFilter ? [searchFilter] : []),
      ...(trainerFilter ? [trainerFilter] : []),
    ],
  };

  const exercises = await prisma.exercise.findMany({
    where,
    orderBy: { name: "asc" },
    take: 20,
  });

  return NextResponse.json(exercises);
}
