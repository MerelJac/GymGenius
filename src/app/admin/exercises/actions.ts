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
    return { success: false, message: "Cannot merge exercises of different types." };
  }
await prisma.$transaction(async (tx) => {
  await tx.exerciseLog.updateMany({
    where: { exerciseId: sourceId },
    data: { exerciseId: targetId },
  });

  await tx.workoutExercise.updateMany({
    where: { exerciseId: sourceId },
    data: { exerciseId: targetId },
  });

  await tx.exerciseOneRepMax.updateMany({
    where: { exerciseId: sourceId },
    data: { exerciseId: targetId },
  });

  await tx.exerciseSubstitution.updateMany({
    where: { exerciseId: sourceId },
    data: { exerciseId: targetId },
  });

  await tx.exerciseSubstitution.updateMany({
    where: { substituteId: sourceId },
    data: { substituteId: targetId },
  });

  await tx.exerciseSubstitution.deleteMany({
    where: { exerciseId: targetId, substituteId: targetId },
  });

  // Verify nothing still points to sourceId before deleting
  const remainingLogs = await tx.exerciseLog.count({
    where: { exerciseId: sourceId },
  });
  const remainingWorkoutExercises = await tx.workoutExercise.count({
    where: { exerciseId: sourceId },
  });
  const remaining1RMs = await tx.exerciseOneRepMax.count({
    where: { exerciseId: sourceId },
  });

  if (remainingLogs > 0 || remainingWorkoutExercises > 0 || remaining1RMs > 0) {
    return { success: false, message: "Merge failed due to remaining references to source exercise." };
  }

  await tx.exercise.delete({ where: { id: sourceId } });
});
}