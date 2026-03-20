// app/api/clients/[clientId]/exercises/[exerciseId]/logs/[logId]/route.ts
import { calculateOneRepMax } from "@/app/utils/oneRepMax/calculateOneRepMax";
import { prisma } from "@/lib/prisma";
import {
  HybridPerformed,
  Performed,
  StrengthPerformed,
} from "@/types/prescribed";
import { NextResponse } from "next/server";

// Best estimated 1RM across all sets in a performed object
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

  // Verify this log belongs to the client before writing
  const existing = await prisma.exerciseLog.findFirst({
    where: { id: logId, workoutLog: { clientId } },
    include: {
      workoutLog: { select: { endedAt: true } },
    },
  });

  console.log("[PATCH log] Existing log:", existing);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.exerciseLog.update({
    where: { id: logId },
    data: { performed: body.performed },
  });

  console.log("[PATCH log] Updated log:", updated);

  const kind = body.performed.kind;
  if (kind === "strength" || kind === "hybrid") {
    const newOrm = bestOneRepMax(
      body.performed as StrengthPerformed | HybridPerformed
    );
    console.log("[PATCH log] New best 1RM from updated sets:", newOrm);

    if (newOrm > 0) {
      const workoutEndedAt = existing.workoutLog.endedAt;
      console.log("[PATCH log] Workout endedAt:", workoutEndedAt);

      if (workoutEndedAt) {
        // Find the day boundaries for the workout date so we can match
        // the 1RM record that was originally created on that same day
        const dayStart = new Date(workoutEndedAt);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(workoutEndedAt);
        dayEnd.setHours(23, 59, 59, 999);

        const existingOrmRecord = await prisma.exerciseOneRepMax.findFirst({
          where: {
            clientId,
            exerciseId: updated.exerciseId,
            recordedAt: { gte: dayStart, lte: dayEnd },
          },
        });

        console.log(
          "[PATCH log] Existing 1RM record for this workout date:",
          existingOrmRecord
        );

        if (existingOrmRecord) {
          // A 1RM was already recorded on this workout day — update it to
          // reflect the corrected sets rather than blindly keeping the old value
          console.log(
            `[PATCH log] Updating existing 1RM record ${existingOrmRecord.id}: ${existingOrmRecord.oneRepMax} → ${newOrm}`
          );
          await prisma.exerciseOneRepMax.update({
            where: { id: existingOrmRecord.id },
            data: { oneRepMax: newOrm },
          });
        } else {
          // No 1RM recorded for this workout day yet — create one if it's a
          // genuine new best (e.g. editing a log from a day that predates 1RM tracking)
          const allTimeBest = await prisma.exerciseOneRepMax.findFirst({
            where: { clientId, exerciseId: updated.exerciseId },
            orderBy: { oneRepMax: "desc" },
          });

          console.log("[PATCH log] All-time best 1RM:", allTimeBest);

          if (!allTimeBest || newOrm > allTimeBest.oneRepMax) {
            console.log(
              `[PATCH log] New all-time best — creating 1RM record: ${newOrm}`
            );
            await prisma.exerciseOneRepMax.create({
              data: {
                clientId,
                exerciseId: updated.exerciseId,
                oneRepMax: newOrm,
                recordedAt: workoutEndedAt,
              },
            });
          } else {
            console.log(
              "[PATCH log] Not a new best, skipping 1RM creation"
            );
          }
        }
      }
    }
  }

  console.log("[PATCH log] Done");
  return NextResponse.json(updated);
}