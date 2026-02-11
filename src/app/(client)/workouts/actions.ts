"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createAdditionalStrengthWorkout(
  clientId: string,
  name: string,
) {
  // 1️⃣ Create a standalone WorkoutTemplate
  const template = await prisma.workoutTemplate.create({
    // NOTE program and program ID are null
    data: {
      name,
      order: 9999, // doesn't matter, not tied to program
      day: "MONDAY", // arbitrary
      workoutSections: {
        create: [
          {
            title: "Main",
            order: 0,
          },
        ],
      },
    },
  });

  // 2️⃣ Create ScheduledWorkout
  const scheduled = await prisma.scheduledWorkout.create({
    data: {
      workoutId: template.id,
      clientId,
      scheduledDate: new Date(),
      status: "SCHEDULED",
    },
  });

  redirect(`/workouts/${scheduled.id}`);
}
