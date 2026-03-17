"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prescribed } from "@/types/prescribed";
import { Prisma } from "@prisma/client";
import { WorkoutDay } from "@/types/enums";
import { getNextDateForDay } from "@/app/utils/getNextDateForDay";
import { formatDateFromInput } from "@/app/utils/format/formatDateFromInput";

function runRevalidate(programId: string) {
  revalidatePath(`/trainer/programs/${programId}`);
}

export async function createWorkout(programId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

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
  return { ok: true };
}

export async function deleteWorkoutExercise(
  programId: string,
  workoutExerciseId: string,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }
  await prisma.workoutExercise.delete({
    where: { id: workoutExerciseId },
  });

  runRevalidate(programId);
  return { ok: true };
}
export async function addWorkoutExercise(
  programId: string,
  workoutId: string,
  sectionId: string,
  exerciseId: string,
  prescribed: Prescribed,
  notes?: string,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

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
  return { ok: true };
}

export async function reorderWorkouts(programId: string, orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.workoutTemplate.update({
        where: { id },
        data: { order: index },
      }),
    ),
  );
    revalidatePath(`/trainer/programs/${programId}`);
  return { ok: true };
}

export async function copyWorkoutToProgram(
  workoutId: string,
  targetProgramId: string,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { ok: false, error: "Unauthorized" };

  // Get the source workout with all its sections and exercises
  const source = await prisma.workoutTemplate.findUnique({
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

  if (!source) return { ok: false, error: "Workout not found" };

  // Get current workout count in target program for ordering
  const existingCount = await prisma.workoutTemplate.count({
    where: { programId: targetProgramId },
  });

  // Create the workout copy with sections and exercises
  await prisma.workoutTemplate.create({
    data: {
      programId: targetProgramId,
      name: source.name,
      order: existingCount,
      day: source.day,
      workoutSections: {
        create: source.workoutSections.map((section) => ({
          title: section.title,
          order: section.order,
          exercises: {
            create: section.exercises.map((ex) => ({
              exerciseId: ex.exerciseId,
              order: ex.order,
              prescribed: ex.prescribed ?? {},
              notes: ex.notes,
            })),
          },
        })),
      },
    },
  });

    revalidatePath(`/trainer/programs/${targetProgramId}`);
  return { ok: true };
}

export async function updateWorkoutName(
  programId: string,
  workoutId: string,
  name: string,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  await prisma.workoutTemplate.update({
    where: { id: workoutId },
    data: { name },
  });

  runRevalidate(programId);
  return { ok: true };
}
export async function deleteWorkout(programId: string, workoutId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  await prisma.$transaction([
    // 1️⃣ Delete workout exercises
    prisma.workoutExercise.deleteMany({
      where: {
        section: {
          workoutId,
        },
      },
    }),

    // 2️⃣ Delete workout sections
    prisma.workoutSection.deleteMany({
      where: {
        workoutId,
      },
    }),

    // 3️⃣ Delete scheduled workouts for all clients
    prisma.scheduledWorkout.deleteMany({
      where: {
        workoutId,
      },
    }),

    // 4️⃣ Delete the workout template
    prisma.workoutTemplate.delete({
      where: {
        id: workoutId,
        programId, // extra safety
      },
    }),
  ]);

  revalidatePath(`/trainer/programs/${programId}`);
  return { ok: true };
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

  if (!workout) {
    return { ok: false, error: "Workout not found" };
  }

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

  return { ok: true, workoutId: newWorkout.id };
}
export async function removeProgramFromClient(
  programId: string,
  clientId: string,
) {
  console.log("Hitting removeProgramFromClient ");
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }
  console.log("authorized");

  // 1️⃣ Get workout template IDs for this program
  const workouts = await prisma.workoutTemplate.findMany({
    where: { programId },
    select: { id: true },
  });

  console.log("found workouts: ", workouts);

  if (workouts.length === 0) {
    console.log("No workouts found, returning.");
    return { ok: true, removed: 0 };
  }

  const workoutIds = workouts.map((w) => w.id);
  console.log("workout Ids ", workoutIds);
  // 2️⃣ Find scheduled workouts that are safe to remove
  const scheduledToRemove = await prisma.scheduledWorkout.findMany({
    where: {
      clientId,
      workoutId: { in: workoutIds },
      status: {
        in: ["SCHEDULED", "IN_PROGRESS", "SKIPPED"],
      },
    },
    select: { id: true },
  });

  if (scheduledToRemove.length === 0) {
    return { ok: true, removed: 0 };
  }

  console.log("📋 scheduledToRemove count:", scheduledToRemove.length);
  console.log("📋 scheduledToRemove:", scheduledToRemove);

  if (scheduledToRemove.length === 0) {
    // Also fetch WITHOUT status filter to see what's actually there
    const allScheduled = await prisma.scheduledWorkout.findMany({
      where: { clientId, workoutId: { in: workoutIds } },
      select: { id: true, status: true, workoutId: true },
    });
    console.log(
      "⚠️ No removable workouts found. All scheduled workouts for this client+program:",
      allScheduled,
    );
    return { ok: true, removed: 0 };
  }

  const scheduledIds = scheduledToRemove.map((s) => s.id);

  // 3️⃣ Transaction: delete logs first, then scheduled workouts
  const result = await prisma.$transaction(async (tx) => {
    // 1. Find workout log IDs first
    const workoutLogs = await tx.workoutLog.findMany({
      where: { scheduledId: { in: scheduledIds } },
      select: { id: true },
    });
    const workoutLogIds = workoutLogs.map((l) => l.id);
    console.log("🗑️ workoutLogIds to delete:", workoutLogIds);

    // 2. Delete exercise logs first (child of workoutLog)
    const deletedExerciseLogs = await tx.exerciseLog.deleteMany({
      where: { workoutLogId: { in: workoutLogIds } },
    });
    console.log("🗑️ deleted exerciseLogs:", deletedExerciseLogs.count);

    // 3. Delete workout logs
    const deletedWorkoutLogs = await tx.workoutLog.deleteMany({
      where: { id: { in: workoutLogIds } },
    });
    console.log("🗑️ deleted workoutLogs:", deletedWorkoutLogs.count);

    // 4. Delete scheduled workouts
    const deleted = await tx.scheduledWorkout.deleteMany({
      where: { id: { in: scheduledIds } },
    });
    console.log("🗑️ deleted scheduledWorkouts:", deleted.count);

    return deleted.count;
  });

  console.log("result ", result);
  revalidatePath(`/trainer/programs/${programId}`);

  return {
    ok: true,
    removed: result,
  };
}

export async function assignProgramToClient(
  programId: string,
  clientId: string,
  startDate: Date,
) {
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: { workouts: { orderBy: { day: "asc" } } },
  });

  if (!program) return { ok: false, error: "Program not found" };

  // const dayOrder = [
  //   "SUNDAY",
  //   "MONDAY",
  //   "TUESDAY",
  //   "WEDNESDAY",
  //   "THURSDAY",
  //   "FRIDAY",
  //   "SATURDAY",
  // ];

  // Sort workouts by day of week using intended order
  const sorted = [...program.workouts].sort((a, b) => a.order - b.order);

  let cursor = formatDateFromInput(startDate);

  for (const workout of sorted) {
    const scheduledDate = getNextDateForDay(cursor, workout.day);
    console.log("Adding schedule date:", scheduledDate);
    console.log("For Client:", clientId);
    console.log("For wokroutId:", workout.id);
    await prisma.scheduledWorkout.create({
      data: {
        workoutId: workout.id,
        clientId,
        scheduledDate,
      },
    });
    // Advance cursor to the day after this scheduled date
    // so next iteration doesn't re-use the same week
    cursor =  formatDateFromInput(scheduledDate);
    cursor.setDate(cursor.getDate() + 1);
  }

  return { ok: true };
}
export async function updateWorkoutDay(
  programId: string,
  workoutId: string,
  day: WorkoutDay,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  await prisma.workoutTemplate.update({
    where: { id: workoutId },
    data: { day },
  });

  revalidatePath(`/programs/${programId}`);
  return { ok: true };
}

export async function createWorkoutSection(
  programId: string,
  workoutId: string,
  title: string,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const section = await prisma.$transaction(async (tx) => {
    const maxOrder = await tx.workoutSection.aggregate({
      where: { workoutId },
      _max: { order: true },
    });

    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    return tx.workoutSection.create({
      data: {
        workoutId,
        title,
        order: nextOrder,
      },
    });
  });

  revalidatePath(`/trainer/programs/${programId}`);
  return section;
}

export async function updateWorkoutSectionTitle(
  programId: string,
  sectionId: string,
  title: string,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  await prisma.workoutSection.update({
    where: { id: sectionId },
    data: { title },
  });

  revalidatePath(`/trainer/programs/${programId}`);
}

export async function moveWorkoutExercise(
  programId: string,
  workoutExerciseId: string,
  newSectionId: string,
) {
  const newOrder = await prisma.workoutExercise.count({
    where: { sectionId: newSectionId },
  });

  await prisma.workoutExercise.update({
    where: { id: workoutExerciseId },
    data: {
      sectionId: newSectionId,
      order: newOrder,
    },
  });

  revalidatePath(`/trainer/programs/${programId}`);
  return { ok: true };
}
export async function reorderWorkoutSections(
  workoutId: string,
  sectionIdsInOrder: string[],
) {
  await prisma.$transaction(async (tx) => {
    // 1️⃣ Move all sections to a safe temp range
    await Promise.all(
      sectionIdsInOrder.map((id, index) =>
        tx.workoutSection.update({
          where: { id },
          data: { order: index + 1000 }, // temp offset
        }),
      ),
    );

    // 2️⃣ Assign final order
    await Promise.all(
      sectionIdsInOrder.map((id, index) =>
        tx.workoutSection.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );
  });
  return { ok: true };
}

export async function reorderExercisesInSection(
  programId: string,
  sectionId: string,
  orderedExerciseIds: string[],
) {
  // 1️⃣ Fetch exercises to validate ownership
  const exercises = await prisma.workoutExercise.findMany({
    where: {
      id: { in: orderedExerciseIds },
      section: {
        id: sectionId,
        workout: {
          programId,
        },
      },
    },
    select: { id: true },
  });

  // 2️⃣ Safety check
  if (exercises.length !== orderedExerciseIds.length) {
    return { ok: false, error: "Invalid exercise reorder request" };
  }

  // 3️⃣ Persist order atomically
  await prisma.$transaction(
    orderedExerciseIds.map((id, index) =>
      prisma.workoutExercise.update({
        where: { id },
        data: { order: index },
      }),
    ),
  );

  revalidatePath(`/trainer/programs/${programId}`);
  return { ok: true };
}

export async function deleteWorkoutSection(
  programId: string,
  sectionId: string,
) {
  // Safety check: section belongs to program
  const section = await prisma.workoutSection.findFirst({
    where: {
      id: sectionId,
      workout: {
        programId,
      },
    },
    include: { exercises: true },
  });

  if (!section) return { ok: false };

  // OPTION A: delete exercises + section
  await prisma.$transaction([
    prisma.workoutExercise.deleteMany({
      where: { sectionId },
    }),
    prisma.workoutSection.delete({
      where: { id: sectionId },
    }),
  ]);

  // OPTIONAL: reorder remaining sections
  const remaining = await prisma.workoutSection.findMany({
    where: {
      workout: {
        programId,
      },
    },
    orderBy: { order: "asc" },
  });

  await Promise.all(
    remaining.map((s, i) =>
      prisma.workoutSection.update({
        where: { id: s.id },
        data: { order: i },
      }),
    ),
  );
  return { ok: true };
}

export async function appendProgramWorkoutsToClient(
  programId: string,
  clientId: string,
) {
  // 1️⃣ Get all workout templates for the program
  const templates = await prisma.workoutTemplate.findMany({
    where: { programId },
    orderBy: { order: "asc" },
  });

  // 2️⃣ Get already scheduled workouts for this client + program
  const scheduled = await prisma.scheduledWorkout.findMany({
    where: {
      clientId,
      workout: {
        programId,
      },
    },
    select: {
      workoutId: true,
      scheduledDate: true,
    },
    orderBy: {
      scheduledDate: "desc",
    },
  });

  const scheduledWorkoutIds = new Set(scheduled.map((s) => s.workoutId));

  // 3️⃣ Find templates that are NOT yet scheduled
  const missingTemplates = templates.filter(
    (t) => !scheduledWorkoutIds.has(t.id),
  );

  if (missingTemplates.length === 0) {
    return { ok: true, added: 0 };
  }

  // 4️⃣ Decide where to place new workouts
  // Strategy: append after the last scheduled workout
  const lastDate = scheduled[0]?.scheduledDate ?? new Date();

  let cursorDate = new Date(lastDate);

  const creations = missingTemplates.map((template) => {
    // find the next date that matches the template's preferred day
    const scheduledDate = getNextDateForDay(cursorDate, template.day);

    // advance cursor so the NEXT workout doesn't reuse the same date
    cursorDate = new Date(scheduledDate);
    cursorDate.setDate(cursorDate.getDate() + 1);

    return prisma.scheduledWorkout.create({
      data: {
        clientId,
        workoutId: template.id,
        scheduledDate,
        status: "SCHEDULED",
      },
    });
  });

  await prisma.$transaction(creations);

  return {
    ok: true,
    added: missingTemplates.length,
  };
}
