"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
