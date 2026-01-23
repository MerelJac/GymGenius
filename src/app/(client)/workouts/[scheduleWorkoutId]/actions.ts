"use server";

import { Performed, Prescribed } from "@/types/prescribed";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function startWorkout(scheduledWorkoutId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const log = await prisma.workoutLog.create({
    data: {
      clientId: session.user.id,
      scheduledId: scheduledWorkoutId,
      status: "IN_PROGRESS",
      startedAt: new Date(),
    },
  });

  await prisma.scheduledWorkout.update({
    where: { id: scheduledWorkoutId },
    data: { status: "IN_PROGRESS" },
  });

  return log.id;
}

export async function stopWorkout(workoutLogId: string) {
  await prisma.workoutLog.update({
    where: { id: workoutLogId },
    data: {
      status: "COMPLETED",
      endedAt: new Date(),
    },
  });
}

export async function logExercise(
  workoutLogId: string,
  exerciseId: string,
  prescribed: Prescribed,
  performed: Performed,
  note?: string
) {
  await prisma.exerciseLog.create({
    data: {
      workoutLogId,
      exerciseId,
      prescribed,
      performed,
      substitutionReason: note || null
    },
  });
}
