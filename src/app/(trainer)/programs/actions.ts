// src/app/(trainer)/programs/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function deleteProgram(programId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

    // delete children first (or rely on cascade if configured)
  await prisma.scheduledWorkout.deleteMany({
    where: {
      workout: {
        programId,
      },
    },
  });

  // delete children first (or rely on cascade if configured)
  await prisma.workoutExercise.deleteMany({
    where: {
      workout: {
        programId,
      },
    },
  });

  await prisma.workoutTemplate.deleteMany({
    where: { programId },
  });

  await prisma.program.delete({
    where: { id: programId },
  });

  revalidatePath("/programs");
}

export async function duplicateProgram(programId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      trainer: true,
      workouts: {
        orderBy: { order: "asc" },
        include: {
          exercises: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!program) throw new Error("Program not found");

  const newProgram = await prisma.program.create({
    data: {
      name: `${program.name} (Copy)`,
      trainer: {
        connect: { id: program.trainerId },
      },
      workouts: {
        create: program.workouts.map((w) => ({
          name: w.name,
          order: w.order,
          exercises: {
            create: w.exercises.map((we) => ({
              order: we.order,
              prescribed: we.prescribed as Prisma.InputJsonValue,
              exercise: {
                connect: { id: we.exerciseId },
              },
            })),
          },
        })),
      },
    },
  });

  revalidatePath("/programs");
  return newProgram.id;
}


export async function updateProgramName(programId: string, name: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.program.update({
    where: { id: programId },
    data: { name },
  });

  revalidatePath("/programs");
}