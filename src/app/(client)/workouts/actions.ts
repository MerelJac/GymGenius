"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createAdditionalStrengthWorkout(
  clientId: string,
  name: string,
) {
  // 1. Get client
  const client = await prisma.user.findUnique({
    where: { id: clientId },
    include: {
      profile: true,
    },
  });

  if (!client || !client.trainerId) {
    return null;
  }

  const clientName = client.profile?.firstName || "Client";
  // 2. Find or create program
  let program = await prisma.program.findFirst({
    where: {
      id: `__client-workouts-${clientId}`,
      trainerId: client.trainerId,
    },
  });

  //   filter it out later with
  //   where: {
  //   NOT: {
  //     id: { startsWith: "__" }
  //   }
  // }

  // IF NOT FOUND, CREATE
  if (!program) {
    program = await prisma.program.create({
      data: {
        name: `${clientName}'s Workouts'`,
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
    include: {
      profile: true
    }
  });

  if (!client || !client.trainerId) {
    return null;
  }
  const clientName = client.profile?.firstName || "Client";
  // 2. Find or create program
  let program = await prisma.program.findFirst({
    where: {
      id: `__client-workouts-${clientId}`,
      trainerId: client.trainerId,
    },
  });

  //   filter it out later with
  //   where: {
  //   NOT: {
  //     id: { startsWith: "__" }
  //   }
  // }

  if (!program) {
    program = await prisma.program.create({
      data: {
        name: `${clientName}'s Workouts'`,
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
