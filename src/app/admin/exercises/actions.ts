"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

import { redirect } from "next/navigation";

export async function approveExercise(id: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.exercise.update({
    where: { id },
    data: {
      trainerId: null,
    },
  });
}

export async function mergeExercises(sourceId: string, targetId: string) {
  const [source, target] = await Promise.all([
    prisma.exercise.findUniqueOrThrow({ where: { id: sourceId } }),
    prisma.exercise.findUniqueOrThrow({ where: { id: targetId } }),
  ]);

  if (source.type !== target.type) {
    throw new Error("Cannot merge exercises of different types.");
  }

  await prisma.$transaction([
    // Repoint all exercise logs
    prisma.exerciseLog.updateMany({
      where: { exerciseId: sourceId },
      data: { exerciseId: targetId },
    }),
    // Repoint workout exercises
    prisma.workoutExercise.updateMany({
      where: { exerciseId: sourceId },
      data: { exerciseId: targetId },
    }),
    // Repoint 1RM records
    prisma.exerciseOneRepMax.updateMany({
      where: { exerciseId: sourceId },
      data: { exerciseId: targetId },
    }),
    // Repoint substitutions (both sides)
    prisma.exerciseSubstitution.updateMany({
      where: { exerciseId: sourceId },
      data: { exerciseId: targetId },
    }),
    prisma.exerciseSubstitution.updateMany({
      where: { substituteId: sourceId },
      data: { substituteId: targetId },
    }),
    // Delete duplicate substitutions that now have exerciseId === substituteId
    // or violate the unique constraint — safest to delete source's remaining refs
    prisma.exerciseSubstitution.deleteMany({
      where: {
        OR: [
          { exerciseId: targetId, substituteId: targetId },
        ],
      },
    }),
    // Delete the source exercise
    prisma.exercise.delete({ where: { id: sourceId } }),
  ]);
}