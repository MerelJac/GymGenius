// src/app/api/workouts/substitute/route.ts
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      workoutLogId,
      sectionId,
      oldExerciseId,
      newExerciseId,
      prescribed,
    } = await req.json();

    console.log("old ex:", oldExerciseId);
    console.log("new ex:", newExerciseId);
    console.log("workoutlogId:", workoutLogId);
    console.log("sectionId:", sectionId);
    console.log("Presecribed", prescribed);
    if (!workoutLogId || !oldExerciseId || !newExerciseId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Find the existing log row
    let existingLog = await prisma.exerciseLog.findFirst({
      where: {
        workoutLogId,
        sectionId,
        exerciseId: oldExerciseId,
      },
    });

    console.log("exisitng log:", existingLog);

    if (!existingLog) {
      existingLog = await prisma.exerciseLog.create({
        data: {
          workoutLogId,
          exerciseId: oldExerciseId,
          sectionId,
          prescribed: prescribed
            ? (prescribed as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          performed: Prisma.JsonNull,
          substitutionReason: oldExerciseId,
        },
      });
    }

    const oldExercise = await prisma.exercise.findFirst({
      where: {
        id: oldExerciseId,
      },
    });

    // Update the log
    await prisma.exerciseLog.update({
      where: {
        id: existingLog.id, // MUST use unique ID
      },
      data: {
        exerciseId: newExerciseId,
        substitutedFrom: oldExerciseId,
        substitutionReason: oldExercise
          ? `Substituted from ${oldExercise.name}`
          : "Client substituted exercise",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Substitution error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
