"use server";

import { prisma } from "@/lib/prisma";
import { buildExerciseData } from "../utils/exercise/buildExerciseData";

export async function createExerciseAction(formData: FormData) {
  const data = buildExerciseData(formData);

  return prisma.exercise.create({
    data,
  });
}

