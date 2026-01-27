"use server";

import { prisma } from "@/lib/prisma";
import { parseExerciseType } from "@/lib/exerciseValidation";

export async function createExerciseAction(formData: FormData) {
  const type = parseExerciseType(formData.get("type"));

  return prisma.exercise.create({
    data: {
      name: String(formData.get("name")),
      type,
      equipment: String(formData.get("equipment") || ""),
      videoUrl: String(formData.get("videoUrl") || ""),
      notes: String(formData.get("notes") || ""),
    },
  });
}
