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

export async function createWorkoutForLater(clientId: string, name: string) {
  // 1. Get client
  const client = await prisma.user.findUnique({
    where: { id: clientId },
  });

  if (!client || !client.trainerId) {
    return null;
  }

  // 2. Find or create program
  let program = await prisma.program.findFirst({
    where: {
      name: `__client-workouts-${clientId}`,
      id: `__client-workouts-${clientId}`,
      trainerId: client.trainerId,
    },
  });

//   filter it out later with 
//   where: {
//   NOT: {
//     name: { startsWith: "__" }
//   }
// }

  if (!program) {
    program = await prisma.program.create({
      data: {
        name: `__client-workouts-${clientId}`,
        id: `__client-workouts-${clientId}`,
        trainer: {
          connect: { id: client.trainerId },
        },
      },
    });
  }

  // 3. Create workout template
  const template = await prisma.workoutTemplate.create({
    data: {
      name,
      programId: program.id,
      order: 9999,
      day: "MONDAY",
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

  // 4. Create scheduled workout
  const scheduled = await prisma.scheduledWorkout.create({
    data: {
      workoutId: template.id,
      clientId,
      scheduledDate: new Date(),
      status: "READY_TO_BUILD",
    },
  });

  redirect(`/workouts/${scheduled.id}`);
}
