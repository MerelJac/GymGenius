// src/app/api/workouts/status/[workoutId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ workoutId: string }> }
) {
  const { workoutId } = await context.params;

  console.log("changing status for workout id: ", workoutId)
  if (!workoutId || typeof workoutId !== "string") {
    return NextResponse.json({ error: "Invalid workoutId" }, { status: 400 });
  }

  const body = await req.json();
  const { newStatus } = body;

  const allowedStatuses = ["COMPLETED", "SKIPPED", "SCHEDULED"];

  if (!allowedStatuses.includes(newStatus)) {
    return NextResponse.json(
      { error: "Invalid status value" },
      { status: 400 }
    );
  }

  const workout = await prisma.scheduledWorkout.findUnique({
    where: { id: workoutId },
  });

  if (!workout) {
    return NextResponse.json(
      { error: "Workout not found" },
      { status: 404 }
    );
  }

  // Update scheduled workout
  await prisma.scheduledWorkout.update({
    where: { id: workoutId },
    data: { status: newStatus },
  });

  // Update workout log if it exists
  await prisma.workoutLog.updateMany({
    where: { scheduledId: workoutId },
    data: { status: newStatus },
  });

  return NextResponse.json({ success: true });
}