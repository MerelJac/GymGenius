"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prescribed } from "@/types/prescribed";
import { Prisma } from "@prisma/client";
import { WorkoutDay } from "@/types/enums";
import { getNextDateForDay } from "@/app/utils/getNextDateForDay";

function runRevalidate(programId: string) {
  revalidatePath(`/trainer/programs/${programId}`);
}

export async function createWorkout(programId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const order = await prisma.workoutTemplate.count({
    where: { programId },
  });

  await prisma.workoutTemplate.create({
    data: {
      programId,
      name: "New Workout",
      order,
      workoutSections: {
        create: {
          title: "Main",
          order: 0,
        },
      },
    },
  });

  runRevalidate(programId);
}

export async function deleteWorkoutExercise(
  programId: string,
  workoutExerciseId: string,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.workoutExercise.delete({
    where: { id: workoutExerciseId },
  });

  runRevalidate(programId);
}
export async function addWorkoutExercise(
  programId: string,
  workoutId: string,
  sectionId: string,
  exerciseId: string,
  prescribed: Prescribed,
  notes?: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const order = await prisma.workoutExercise.count({
    where: { sectionId },
  });

  await prisma.workoutExercise.create({
    data: {
      sectionId,
      exerciseId,
      order,
      prescribed,
      notes: notes || null,
    },
  });

  runRevalidate(programId);
}
export async function updateWorkoutName(
  programId: string,
  workoutId: string,
  name: string,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.workoutTemplate.update({
    where: { id: workoutId },
    data: { name },
  });

  runRevalidate(programId);
}

export async function deleteWorkout(programId: string, workoutId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  await prisma.workoutExercise.deleteMany({
    where: { section: { workoutId } },
  });

  await prisma.workoutTemplate.delete({
    where: { id: workoutId },
  });

  revalidatePath(`/trainer/programs/${programId}`);
}
export async function duplicateWorkout(programId: string, workoutId: string) {
  const workout = await prisma.workoutTemplate.findUnique({
    where: { id: workoutId },
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
  });

  if (!workout) throw new Error("Workout not found");

  const newWorkout = await prisma.workoutTemplate.create({
    data: {
      programId,
      name: `${workout.name} (Copy)`,
      order: workout.order + 1,
      day: workout.day,

      workoutSections: {
        create: workout.workoutSections.map((section) => ({
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
    },
  });

  revalidatePath(`/programs/${programId}`);
  return newWorkout.id;
}


export async function assignProgramToClient(
  programId: string,
  clientId: string,
  startDate: Date
) {
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: { workouts: true },
  });

  if (!program) throw new Error("Program not found");

  for (const workout of program.workouts) {
    const scheduledDate = getNextDateForDay(
      startDate,
      workout.day
    );

    await prisma.scheduledWorkout.create({
      data: {
        workoutId: workout.id,
        clientId,
        scheduledDate,
      },
    });
  }
}

export async function updateWorkoutDay(
  programId: string,
  workoutId: string,
  day: WorkoutDay
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.workoutTemplate.update({
    where: { id: workoutId },
    data: { day},
  })

  revalidatePath(`/programs/${programId}`)
}

export async function createWorkoutSection(
  programId: string,
  workoutId: string,
  title: string,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const order = await prisma.workoutSection.count({
    where: { workoutId },
  });

  const section = await prisma.workoutSection.create({
    data: {
      workoutId,
      title,
      order,
    },
  });

  revalidatePath(`/trainer/programs/${programId}`);

  return section; // ✅ IMPORTANT
}

export async function updateWorkoutSectionTitle(
  programId: string,
  sectionId: string,
  title: string,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.workoutSection.update({
    where: { id: sectionId },
    data: { title },
  });

  revalidatePath(`/trainer/programs/${programId}`);
}
