"use server";

import { Performed, Prescribed } from "@/types/prescribed";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function startWorkout(scheduledId: string) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  // 1️⃣ Check for existing log
  const existing = await prisma.workoutLog.findFirst({
    where: { scheduledId },
  });

  if (existing) {
    return existing.id;
  }

  // 2️⃣ Create ONE log
  const log = await prisma.workoutLog.create({
    data: {
      scheduledId,
      clientId: session.user.id,
      status: "IN_PROGRESS",
      startedAt: new Date(),
    },
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
