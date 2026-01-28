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

  await prisma.$transaction(async (tx) => {
    // 1️⃣ Exercise logs (lowest level)
    await tx.exerciseLog.deleteMany({
      where: {
        workoutLog: {
          scheduled: {
            workout: { programId },
          },
        },
      },
    });

    // 2️⃣ Workout logs
    await tx.workoutLog.deleteMany({
      where: {
        scheduled: {
          workout: { programId },
        },
      },
    });

    // 3️⃣ Scheduled workouts
    await tx.scheduledWorkout.deleteMany({
      where: {
        workout: { programId },
      },
    });

    // 4️⃣ Workout exercises (templates)
    await tx.workoutExercise.deleteMany({
      where: {
        section: {
          workout: { programId },
        },
      },
    });

    // 5️⃣ Workout sections
    await tx.workoutSection.deleteMany({
      where: {
        workout: { programId },
      },
    });

    // 6️⃣ Workout templates
    await tx.workoutTemplate.deleteMany({
      where: { programId },
    });

    // 7️⃣ Program
    await tx.program.delete({
      where: { id: programId },
    });
  });

  revalidatePath("/programs");
}

export async function duplicateProgram(programId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      workouts: {
        orderBy: { order: "asc" },
        include: {
          workoutSections: {
            orderBy: { order: "asc" },
            include: {
              exercises: {
                orderBy: { order: "asc" },
              },
            },
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
          day: w.day,

          workoutSections: {
            create: w.workoutSections.map((section) => ({
              title: section.title,
              order: section.order,

              exercises: {
                create: section.exercises.map((we) => ({
                  order: we.order,
                  prescribed: we.prescribed as Prisma.InputJsonValue,
                  notes: we.notes,
                  exercise: we.exerciseId
                    ? { connect: { id: we.exerciseId } }
                    : undefined,
                })),
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
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  await prisma.program.update({
    where: { id: programId },
    data: { name },
  });

  revalidatePath("/programs");
  return { ok: true };
}

export async function updateProgramNote(programId: string, notes: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  await prisma.program.update({
    where: { id: programId },
    data: { notes: notes.trim() || null },
  });

  revalidatePath(`/trainer/programs/${programId}`);

  return { ok: true };
}
