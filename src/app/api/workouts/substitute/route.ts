import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      workoutLogId,
      sectionId,
      oldExerciseId,
      newExerciseId,
    } = await req.json();

    if (!workoutLogId || !oldExerciseId || !newExerciseId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the existing log row
    const existingLog = await prisma.exerciseLog.findFirst({
      where: {
        workoutLogId,
        sectionId,
        exerciseId: oldExerciseId,
      },
    });

    if (!existingLog) {
      return NextResponse.json(
        { error: "Exercise log not found" },
        { status: 404 }
      );
    }

    // Update the log
    await prisma.exerciseLog.update({
      where: {
        id: existingLog.id, // MUST use unique ID
      },
      data: {
        exerciseId: newExerciseId,
        substitutedFrom: oldExerciseId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Substitution error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}