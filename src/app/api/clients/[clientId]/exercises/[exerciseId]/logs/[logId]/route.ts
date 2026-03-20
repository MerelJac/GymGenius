// app/api/clients/[clientId]/exercises/[exerciseId]/logs/[logId]/route.ts
import { track1RMifBetter } from "@/app/(client)/workouts/[scheduledWorkoutId]/actions";
import { calculateOneRepMax } from "@/app/utils/oneRepMax/calculateOneRepMax";
import { prisma } from "@/lib/prisma";
import { HybridPerformed, Performed, StrengthPerformed } from "@/types/prescribed";
import { NextResponse } from "next/server";

// Best estimated 1RM across all sets
function bestOneRepMax(performed: StrengthPerformed | HybridPerformed): number {
  return performed.sets.reduce((best, set) => {
    if (!set.reps || !set.weight) return best;
    const orm = calculateOneRepMax(set.reps, set.weight);
    return orm > best ? orm : best;
  }, 0);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ clientId: string; logId: string }> }
) {
  const { clientId, logId } = await context.params;
  const body: { performed: Performed } = await req.json();

  // Verify ownership before writing
  const existing = await prisma.exerciseLog.findFirst({
    where: { id: logId, workoutLog: { clientId } },
  });

  console.log("Existing log for verification:", existing); // Debug log
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.exerciseLog.update({
    where: { id: logId },
    data: { performed: body.performed },
  });

  console.log("Updated log:", updated); // Debug log
  // Track 1RM only for strength/hybrid where weight × reps exists
  const kind = body.performed.kind;
  if (kind === "strength" || kind === "hybrid") {
    const newOrm = bestOneRepMax(body.performed as StrengthPerformed | HybridPerformed);
    const oldOrm = bestOneRepMax(existing.performed as unknown as StrengthPerformed | HybridPerformed);

    if (newOrm > 0 && newOrm !== oldOrm) {
      // Fetch workoutLog to pass to track1RMifBetter (it needs the full object for clientId)
      const workoutLog = await prisma.workoutLog.findUnique({
        where: { id: existing.workoutLogId },
      });
      console.log("Tracking 1RM - workoutLog:", workoutLog, "exerciseId:", updated.exerciseId, "newOrm:", newOrm); // Debug log
      if (workoutLog) {
        await track1RMifBetter(workoutLog, updated.exerciseId, newOrm);
        console.log("1RM tracking complete"); // Debug log
      }

    }
  }

  return NextResponse.json(updated);
}