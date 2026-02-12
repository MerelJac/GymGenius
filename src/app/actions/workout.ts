// src/app/actions/workouts.ts
"use server";

import { sendAdditionalWorkoutEmailToTrainer } from "@/lib/email-templates/additionalWorkoutEmailToTrainer";
import { prisma } from "@/lib/prisma";

export async function addAdditionalWorkout(
  clientId: string,
  data: {
    typeId: string;
    duration?: number;
    distance?: number;
    notes?: string;
    performedAt: Date;
  },
) {
  await prisma.additionalWorkout.create({
    data: {
      clientId,
      ...data,
    },
  });

  const workoutType = await prisma.additionalWorkoutType.findUnique({
    where: { id: data.typeId },
  });
  const client = await prisma.user.findUnique({
    where: { id: clientId },
    include: {
      profile: true,
    },
  });

  const trainer = client?.trainerId
    ? await prisma.user.findUnique({
        where: { id: client.trainerId },
        select: {
          email: true,
        },
      })
    : null;

  if (!trainer?.email || !client?.profile?.firstName || !workoutType?.name) {
    return;
  }

  try {
    await sendAdditionalWorkoutEmailToTrainer(
      trainer.email,
      client.profile.firstName,
      workoutType.name,
      data.performedAt,
    );

    console.log("Sent additional workout email to trainer", client.email);
  } catch (error) {
    console.error(
      "❌ Failed to send additional workout email to trainer",
      error,
    );
  }
}
