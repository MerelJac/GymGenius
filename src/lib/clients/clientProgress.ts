import { prisma } from "@/lib/prisma";

/**
 * Returns strength + body progress deltas for dashboard display
 */
export async function getClientProgressSummary(clientId: string) {
  // ----------------------------
  // STRENGTH (estimated 1RM)
  // ----------------------------

  // Pull recent exercise logs with sets
  const logs = await prisma.exerciseLog.findMany({
    where: {
      workoutLog: {
        clientId,
        status: "COMPLETED",
      },
    },
    include: {
      exercise: true,
    },
  });

  // Group by exercise
  const byExercise = new Map<string, number[]>();

  for (const log of logs) {
    const performed = log.performed as {
      kind?: string;
      reps?: number;
      weight?: number | null;
    } | null;

    if (!performed) continue;
    if (performed.kind !== "strength") continue;
    if (!performed.weight || !performed.reps) continue;

    const est1RM = performed.weight * (1 + performed.reps / 30);

    const arr = byExercise.get(log.exercise.name) ?? [];
    arr.push(est1RM);
    byExercise.set(log.exercise.name, arr);
  }
  const strength = Array.from(byExercise.entries())
    .map(([exerciseName, rms]) => {
      if (rms.length < 2) return null;

      const sorted = rms.sort((a, b) => a - b);

      return {
        exerciseName,
        previous1RM: Math.round(sorted[sorted.length - 2]),
        current1RM: Math.round(sorted[sorted.length - 1]),
      };
    })
    .filter(
      (
        v,
      ): v is {
        exerciseName: string;
        previous1RM: number;
        current1RM: number;
      } => v !== null,
    );

  // ----------------------------
  // BODY CHECK-INS
  // ----------------------------

  const checkIns = await prisma.bodyMetric.findMany({
    where: { clientId },
    orderBy: { recordedAt: "desc" },
    take: 2,
  });

  const weight =
    checkIns.length === 2 && checkIns[0].weight && checkIns[1].weight
      ? {
          current: checkIns[0].weight,
          previous: checkIns[1].weight,
        }
      : null;

  const bodyFat =
    checkIns.length === 2 && checkIns[0].bodyFat && checkIns[1].bodyFat
      ? {
          current: checkIns[0].bodyFat,
          previous: checkIns[1].bodyFat,
        }
      : null;

  return {
    strength,
    weight,
    bodyFat,
  };
}
