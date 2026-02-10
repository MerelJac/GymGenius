import { prisma } from "@/lib/prisma";
import { subWeeks } from "date-fns";

export async function getClientProgressSummary(clientId: string) {
  const sixWeeksAgo = subWeeks(new Date(), 6);

  // Pull 1RM history within 6 weeks (plus 1 earlier for baseline safety)
  const logs = await prisma.exerciseOneRepMax.findMany({
    where: {
      clientId,
      recordedAt: {
        gte: sixWeeksAgo,
      },
    },
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
    {
      exerciseName: string;
      oneRepMaxes: number[];
    }
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

  // Compute largest delta per exercise
  const strength = Array.from(byExercise.values())
    .map(({ exerciseName, oneRepMaxes }) => {
      if (oneRepMaxes.length < 2) return null;

      let maxDelta = 0;
      let previous = 0;
      let current = 0;

      for (let i = 1; i < oneRepMaxes.length; i++) {
        const delta = oneRepMaxes[i] - oneRepMaxes[i - 1];

        if (delta > maxDelta) {
          maxDelta = delta;
          previous = oneRepMaxes[i - 1];
          current = oneRepMaxes[i];
        }
      }

      if (maxDelta <= 0) return null;

      return {
        exerciseName,
        previous1RM: Math.round(previous),
        current1RM: Math.round(current),
        delta: Math.round(maxDelta),
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
    )
    // Sort by biggest gain
    .sort((a, b) => b.delta - a.delta)
    // Limit to top 8
    .slice(0, 8);

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
