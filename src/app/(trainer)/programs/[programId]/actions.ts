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
  exerciseId: string,
  prescribed: Prescribed,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const order = await prisma.workoutExercise.count({
    where: { workoutId },
  });

  await prisma.workoutExercise.create({
    data: {
      workoutId,
      exerciseId,
      order,
      prescribed,
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
    where: { workoutId },
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
      exercises: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!workout) throw new Error("Workout not found");

  const newWorkout = await prisma.workoutTemplate.create({
    data: {
      programId,
      name: `${workout.name} (Copy)`,
      order: workout.order + 1,
      exercises: {
        create: workout.exercises.map((we) => ({
          order: we.order,
          prescribed: we.prescribed as Prisma.InputJsonValue, 
          exercise: {
            connect: { id: we.exerciseId },
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
