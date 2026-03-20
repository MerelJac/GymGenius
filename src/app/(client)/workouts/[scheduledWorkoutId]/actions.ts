"use server";

import { Performed, Prescribed } from "@/types/prescribed";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateOneRepMax } from "@/app/utils/oneRepMax/calculateOneRepMax";
import { buildPerformedFromPrescribed } from "@/app/utils/workoutFunctions";
import { notFound, redirect } from "next/navigation";
import { sendAdditionalWorkoutEmailToTrainer } from "@/lib/email-templates/additionalWorkoutEmailToTrainer";
import { sendCompletedWorkoutEmailToTrainer } from "@/lib/email-templates/completedWorkoutToTrainer";
import { Prisma, WorkoutLog } from "@prisma/client";
import { sendCreatedWorkoutForLaterEmailToTrainer } from "@/lib/email-templates/createdWorkoutForLaterEmailToTrainer";

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

export async function startBuildingWorkout(scheduledId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return redirect("/login");

  return await prisma.$transaction(async (tx) => {
    // 1️⃣ Check for existing ACTIVE log
    const existingLog = await tx.workoutLog.findFirst({
      where: {
        scheduledId,
        endedAt: null,
        status: "BUILDING",
      },
    });

    if (existingLog) {
      return existingLog.id;
    }

    // 2️⃣ Update scheduled workout status
    await tx.scheduledWorkout.update({
      where: { id: scheduledId },
      data: {
        status: "BUILDING",
      },
    });

    // 3️⃣ Create or reactivate workout log
    const log = await tx.workoutLog.upsert({
      where: { scheduledId },
      update: {
        status: "BUILDING",
        startedAt: new Date(),
        endedAt: null,
      },
      create: {
        scheduledId,
        clientId: session.user.id,
        status: "BUILDING",
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

export async function saveWorkoutForLater(workoutLogId: string) {
  await prisma.$transaction(async (tx) => {
    // 1️⃣ SCHEDULE the workout log
    const log = await tx.workoutLog.update({
      where: { id: workoutLogId },
      data: {
        status: "SCHEDULED",
        startedAt: null,
        endedAt: null, // reset timestamps
      },
    });

    // 2️⃣ Mark the scheduled workout as SCHEDULED
    await tx.scheduledWorkout.update({
      where: { id: log.scheduledId },
      data: {
        status: "SCHEDULED",
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

export async function alertTrainerOfCreateForLaterWorkout(
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
    console.log(
      "Workout Program: ",
      workoutLog?.scheduled?.workout?.program?.id,
    );
    if (workoutLog?.scheduled?.workout?.program?.id.startsWith("__")) {
      // CLINET CREATED WORKOUTS FOR LATER
      await sendCreatedWorkoutForLaterEmailToTrainer(
        trainer.email,
        client.profile.firstName,
        workoutLog.scheduled.workout.name,
        workoutLog.scheduled.workout.program.name,
        workoutLog.endedAt!,
      );
    } else if (workoutLog?.scheduled?.workout?.program) {
      await sendCompletedWorkoutEmailToTrainer(
        // CLIENT COMPLETED SCHEUDELD WORKOUT
        trainer.email,
        client.profile.firstName,
        workoutLog.scheduled.workout.name,
        workoutLog.scheduled.workout.program.name,
        workoutLog.endedAt!,
      );
    } else {
      await sendAdditionalWorkoutEmailToTrainer(
        // CLIENT COMPELTE ADDITIONAL WORKOUT
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

  console.log("Exisitng performend: ", exisitngLog?.performed);
  console.log("Incoming performed: ", performed);

  if (exisitngLog && exisitngLog?.performed !== performed) {
    exerciseLog = await prisma.exerciseLog.update({
      where: { id: exisitngLog.id },
      data: {
        performed,
        prescribed,
        substitutionReason: exisitngLog.substitutionReason,
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
        order: await prisma.exerciseLog.count({
          where: { workoutLogId, sectionId: sectionId ?? null },
        }),
      },
    });
  }
  console.log("Exercise Log", exerciseLog);

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
      track1RMifBetter(workoutLog as WorkoutLog, exerciseId, oneRepMax);
    }
  }

  return exerciseLog;
}
// PRIVATE helper for 1RM tracking - used elsewhere too
export async function track1RMifBetter( workoutLog: WorkoutLog, exerciseId: string, oneRepMax: number) {
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
// app/(client)/workouts/[scheduledWorkoutId]/addExercise.ts
export async function addExerciseToWorkout(
  workoutLogId: string,
  exerciseId: string,
  prescribed: Prescribed,
  sectionId?: string,
) {
  const performed = buildPerformedFromPrescribed(prescribed);

  // Count existing logs in this section to determine order
  const count = await prisma.exerciseLog.count({
    where: { workoutLogId, sectionId: sectionId ?? null },
  });

  console.log(
    "workoutLogId",
    workoutLogId,
    "exerciseId",
    exerciseId,
    "sectionId",
    sectionId,
    "prescribed",
    prescribed,
    "performed",
    performed,
  );
  await prisma.exerciseLog.create({
    data: {
      workoutLogId,
      exerciseId,
      sectionId,
      order: count,
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
    return { success: false, error: "Cannot remove substituted exercises" };
  }

  await prisma.exerciseLog.delete({
    where: { id: exerciseLogId },
  });
}

export async function rerunWorkout(scheduledWorkoutId: string) {
  const original = await prisma.scheduledWorkout.findUnique({
    where: { id: scheduledWorkoutId },
    include: {
      workoutLogs: {
        orderBy: { startedAt: "desc" },
        take: 1,
        include: {
          exercises: true,
        },
      },
    },
  });

  if (!original) {
    return { success: false, error: "Scheduled workout not found" };
  }

  const lastLog = original.workoutLogs[0];

  // 1️⃣ Create new scheduled workout
  const newScheduled = await prisma.scheduledWorkout.create({
    data: {
      workoutId: original.workoutId,
      clientId: original.clientId,
      scheduledDate: new Date(),
      status: "IN_PROGRESS",
    },
  });

  // 2️⃣ Create new workout log
  const newLog = await prisma.workoutLog.create({
    data: {
      clientId: original.clientId,
      scheduledId: newScheduled.id,
      status: "IN_PROGRESS",
      startedAt: new Date(),
    },
  });

  // 3️⃣ Copy exercises from previous workout
  if (lastLog?.exercises?.length) {
    await prisma.exerciseLog.createMany({
      data: lastLog.exercises.map((ex) => ({
        workoutLogId: newLog.id,
        exerciseId: ex.exerciseId,
        sectionId: ex.sectionId,
        order: ex.order,
        prescribed: ex.prescribed as Prisma.InputJsonValue,
        performed: ex.performed as Performed,
        substitutedFrom: ex.substitutedFrom,
        substitutionReason: ex.substitutionReason,
      })),
    });
  }

  redirect(`/workouts/${newScheduled.id}`);
}

export async function deleteClientWorkout(
  scheduledWorkoutId: string,
  workoutId: string,
) {
  const session = await getServerSession(authOptions);
  const clientId = session?.user?.id;
  if (!clientId) {
    console.log("Unauthorized attempt to delete workout");
    return notFound();
  }

  // Verify ownership
  const scheduled = await prisma.scheduledWorkout.findUnique({
    where: { id: scheduledWorkoutId },
  });
  if (!scheduled || scheduled.clientId !== clientId) {
    console.log("Unauthorized attempt to delete workout");
    return notFound();
  }

  // Delete in order to respect FK constraints
  await prisma.$transaction([
    prisma.exerciseLog.deleteMany({
      where: { workoutLog: { scheduledId: scheduledWorkoutId } },
    }),
    prisma.workoutLog.deleteMany({
      where: { scheduledId: scheduledWorkoutId },
    }),
    prisma.scheduledWorkout.deleteMany({
      where: { workoutId },
    }),
    prisma.workoutExercise.deleteMany({
      where: { workoutTemplate: { id: workoutId } },
    }),
    prisma.workoutSection.deleteMany({
      where: { workoutId },
    }),
    prisma.workoutTemplate.delete({
      where: { id: workoutId },
    }),
  ]);

  redirect("/dashboard");
}
