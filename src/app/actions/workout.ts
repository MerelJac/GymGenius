// src/app/actions/workouts.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function addAdditionalWorkout(
  clientId: string,
  data: {
    typeId: string;
    duration?: number;
    distance?: number;
    notes?: string;
    performedAt: Date;
  }
) {
  await prisma.additionalWorkout.create({
    data: {
      clientId,
      ...data,
    },
  });
}
