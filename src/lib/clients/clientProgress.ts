import { prisma } from "@/lib/prisma";

export async function getClientProgressSummary(clientId: string) {
  // Pull all recorded 1RM values
  const logs = await prisma.exerciseOneRepMax.findMany({
    where: { clientId },
    include: {
      exercise: true,
    },
    orderBy: {
      recordedAt: "asc",
    },
  });

  // Group by exercise
  const byExercise = new Map<
    string,
    { exerciseName: string; oneRepMaxes: number[] }
  >();

  for (const log of logs) {
    const key = log.exerciseId;

    if (!byExercise.has(key)) {
      byExercise.set(key, {
        exerciseName: log.exercise.name,
        oneRepMaxes: [],
      });
    }

    byExercise.get(key)!.oneRepMaxes.push(log.oneRepMax);
  }

  // Build progress deltas
  const strength = Array.from(byExercise.values())
    .map(({ exerciseName, oneRepMaxes }) => {
      if (oneRepMaxes.length < 2) return null;

      const previous = oneRepMaxes[oneRepMaxes.length - 2];
      const current = oneRepMaxes[oneRepMaxes.length - 1];

      return {
        exerciseName,
        previous1RM: Math.round(previous),
        current1RM: Math.round(current),
        delta: Math.round(current - previous),
      };
    })
    .filter(
      (
        v,
      ): v is {
        exerciseName: string;
        previous1RM: number;
        current1RM: number;
        delta: number;
      } => v !== null,
    ).slice(0, 5); // Limit to 5 most recent


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
