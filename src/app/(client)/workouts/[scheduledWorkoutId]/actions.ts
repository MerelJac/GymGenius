"use server";

import { Performed, Prescribed } from "@/types/prescribed";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function startWorkout(scheduledId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  return await prisma.$transaction(async (tx) => {
    // 1️⃣ Check for existing ACTIVE log
    const existingLog = await tx.workoutLog.findFirst({
      where: {
        scheduledId,
        endedAt: null,
        status: "IN_PROGRESS",
      },
    });

    if (existingLog) {
      return existingLog.id;
    }

    // 2️⃣ Update scheduled workout status
    await tx.scheduledWorkout.update({
      where: { id: scheduledId },
      data: {
        status: "IN_PROGRESS",
      },
    });

    // 3️⃣ Create or reactivate workout log
    const log = await tx.workoutLog.upsert({
      where: { scheduledId },
      update: {
        status: "IN_PROGRESS",
        startedAt: new Date(),
        endedAt: null,
      },
      create: {
        scheduledId,
        clientId: session.user.id,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    return log.id;
  });
}


export async function stopWorkout(workoutLogId: string) {
  await prisma.$transaction(async (tx) => {
    // 1️⃣ Complete the workout log
    const log = await tx.workoutLog.update({
      where: { id: workoutLogId },
      data: {
        status: "COMPLETED",
        endedAt: new Date(),
      },
    });

    // 2️⃣ Mark the scheduled workout as completed
    await tx.scheduledWorkout.update({
      where: { id: log.scheduledId },
      data: {
        status: "COMPLETED",
      },
    });
  });
}


export async function logExercise(
  workoutLogId: string,
  exerciseId: string,
  prescribed: Prescribed,
  performed: Performed,
  note?: string,
) {
  await prisma.exerciseLog.create({
    data: {
      workoutLogId,
      exerciseId,
      prescribed,
      performed,
      substitutionReason: note || null,
    },
  });
}
