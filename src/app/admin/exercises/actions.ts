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
}export async function mergeExercises(sourceId: string, targetId: string) {
  const [source, target] = await Promise.all([
    prisma.exercise.findUniqueOrThrow({ where: { id: sourceId } }),
    prisma.exercise.findUniqueOrThrow({ where: { id: targetId } }),
  ]);

  if (source.type !== target.type) {
    return { success: false, message: "Cannot merge exercises of different types." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const targetLogs = await tx.exerciseLog.findMany({
        where: { exerciseId: targetId },
        select: { workoutLogId: true },
      });
      const targetWorkoutLogIds = new Set(targetLogs.map((l) => l.workoutLogId));

      await tx.exerciseLog.deleteMany({
        where: { exerciseId: sourceId, workoutLogId: { in: [...targetWorkoutLogIds] } },
      });
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
      await tx.exercise.delete({ where: { id: sourceId } });
    });
  } catch (error) {
    console.error(error);
    return { success: false, message:  "Merge failed." };
  }

  return { success: true, message: `Merged "${source.name}" into "${target.name}".` };
}