"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

export async function addSubstitution(formData: FormData) {
  const exerciseId = formData.get("exerciseId") as string;
  const substituteId = formData.get("substituteId") as string;
  const note = formData.get("note") as string | null;

  if (!exerciseId || !substituteId) return;
  if (exerciseId === substituteId) {
    throw new Error("Exercise cannot substitute itself");
  }

  await prisma.exerciseSubstitution.create({
    data: {
      exerciseId,
      substituteId,
      note: note || undefined,
    },
  });

  revalidatePath(`/exercises/${exerciseId}/edit`);
}

export async function removeSubstitution(formData: FormData) {
  const id = formData.get("id") as string;
  const exerciseId = formData.get("exerciseId") as string;

  if (!id) return;

  await prisma.exerciseSubstitution.delete({
    where: { id },
  });

  revalidatePath(`/exercises/${exerciseId}/edit`);
}

export async function deleteExercise(formData: FormData) {
  const exerciseId = formData.get("exerciseId") as string;

  if (!exerciseId) {
    return notFound();
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return notFound();
  }

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    select: { trainerId: true },
  });

  if (!exercise) {
    return notFound();
  }

  const isAdmin = session.user.role === "ADMIN";
  const isOwner = exercise.trainerId === session.user.id;

  if (!isAdmin && !isOwner) {
    return notFound();
  }

  await prisma.exercise.delete({
    where: { id: exerciseId },
  });

  redirect("/exercises");
}
