"use server";

import { Performed, Prescribed } from "@/types/prescribed";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateOneRepMax } from "@/app/utils/oneRepMax/calculateOneRepMax";
import { buildPerformedFromPrescribed } from "@/app/utils/workoutFunctions";
import {  redirect } from "next/navigation";

export async function startWorkout(scheduledId: string) {
  const session = await getServerSession(authOptions);
  console.log(session, 'session')
 if (!session?.user?.id) return  redirect("/login");

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
  const exerciseLog = await prisma.exerciseLog.create({
    data: {
      workoutLogId,
      exerciseId,
      prescribed,
      performed,
      substitutionReason: note || null,
    },
  });

  // ── 1RM tracking ─────────────────────────────
  if (performed.kind === "strength" || performed.kind === "hybrid") {
    const candidateOneRMs = performed.sets
      .filter(
        (set) =>
          typeof set.weight === "number" &&
          set.weight > 0 &&
          typeof set.reps === "number" &&
          set.reps > 0,
      )
      .map((set) => calculateOneRepMax(set.weight!, set.reps));

    if (candidateOneRMs.length > 0) {
      const oneRepMax = Math.max(...candidateOneRMs);

      console.log("Tracking 1RM", oneRepMax);

      const workoutLog = await prisma.workoutLog.findUnique({
        where: { id: workoutLogId },
        select: { clientId: true },
      });

      if (workoutLog?.clientId) {
        await prisma.exerciseOneRepMax.create({
          data: {
            clientId: workoutLog.clientId,
            exerciseId,
            oneRepMax,
          },
        });
      }
    }
  }

  return exerciseLog;
}

// app/(client)/workouts/[scheduledWorkoutId]/addExercise.ts
export async function addExerciseToWorkout(
  workoutLogId: string,
  exerciseId: string,
  prescribed: Prescribed,
  sectionId?: string,
) {
  const performed = buildPerformedFromPrescribed(prescribed);

  await prisma.exerciseLog.create({
    data: {
      workoutLogId,
      exerciseId,
      sectionId,
      prescribed,
      performed,
      substitutionReason: "Client added exercise",
    },
  });
}

export async function removeClientExercise(exerciseLogId: string) {
    console.log('starting deleting exericise', exerciseLogId)
  const session = await getServerSession();
    console.log(session, 'session')
  if (!session?.user?.id) return  redirect("/login");
  console.log('deleting exericise', exerciseLogId)
  const log = await prisma.exerciseLog.findUnique({
    where: { id: exerciseLogId },
    include: {
      workoutLog: true,
    },
  });

  if (!log) throw new Error("Exercise log not found");

  // 🔐 Ownership check
  if (log.workoutLog.clientId !== session.user.id) {
    throw new Error("Forbidden");
  }

  // 🔐 Only allow removal if it was client-added
  if (log.substitutedFrom) {
    throw new Error("Cannot remove substituted exercises");
  }

  await prisma.exerciseLog.delete({
    where: { id: exerciseLogId },
  });
}
