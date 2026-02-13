"use server";

import { Performed, Prescribed } from "@/types/prescribed";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateOneRepMax } from "@/app/utils/oneRepMax/calculateOneRepMax";
import { buildPerformedFromPrescribed } from "@/app/utils/workoutFunctions";
import { redirect } from "next/navigation";
import { sendAdditionalWorkoutEmailToTrainer } from "@/lib/email-templates/additionalWorkoutEmailToTrainer";
import { sendCompletedWorkoutEmailToTrainer } from "@/lib/email-templates/completedWorkoutToTrainer";

export async function startWorkout(scheduledId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return redirect("/login");

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

export async function alertTrainerOfCompletedWorkout(
  clientId: string,
  workoutLogId: string,
) {
  const client = await prisma.user.findUnique({
    where: { id: clientId },
    include: {
      profile: true,
    },
  });

  const trainer = client?.trainerId
    ? await prisma.user.findUnique({
        where: { id: client.trainerId },
        select: {
          email: true,
        },
      })
    : null;

  //  workout log id > get program id.
  const workoutLog = await prisma.workoutLog.findUnique({
    where: { id: workoutLogId },
    include: {
      scheduled: {
        include: {
          workout: {
            include: {
              program: true,
            },
          },
        },
      },
    },
  });

  if (!trainer?.email || !client?.profile?.firstName || !workoutLog?.endedAt) {
    return;
  }

  try {
    if (workoutLog?.scheduled?.workout?.program) {
      await sendCompletedWorkoutEmailToTrainer(
        trainer.email,
        client.profile.firstName,
        workoutLog.scheduled.workout.name,
        workoutLog.scheduled.workout.program.name,
        workoutLog.endedAt!,
      );
    } else {
      await sendAdditionalWorkoutEmailToTrainer(
        trainer.email,
        client.profile.firstName,
        "Strength Training",
        workoutLog.endedAt!,
      );
    }
  } catch (error) {
    console.error(
      "❌ Failed to send completed workout email to trainer",
      error,
    );
  }
}

export async function logExercise(
  workoutLogId: string,
  exerciseId: string,
  prescribed: Prescribed,
  performed: Performed,
  note?: string,
  sectionId?: string | null,
) {
  const exisitngLog = await prisma.exerciseLog.findFirst({
    where: {
      workoutLogId,
      exerciseId,
      sectionId: sectionId ?? null, 
    },
  });

  let exerciseLog;

  if (exisitngLog) {
    exerciseLog = await prisma.exerciseLog.update({
      where: { id: exisitngLog.id },
      data: {
        performed,
        prescribed,
        substitutionReason: note || null,
      },
    });
  } else {
    exerciseLog = await prisma.exerciseLog.create({
      data: {
        workoutLogId,
        exerciseId,
        prescribed,
        performed,
        substitutionReason: note || null,
        sectionId,
      },
    });
  }
  console.log('Exercise Log' , exerciseLog)

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

      // Only track if 1RM is better than before
      if (workoutLog?.clientId) {
        const latest = await prisma.exerciseOneRepMax.findFirst({
          where: {
            clientId: workoutLog.clientId,
            exerciseId,
          },
          orderBy: { recordedAt: "desc" },
        });

        if (!latest || oneRepMax > latest.oneRepMax) {
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return redirect("/login");
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
