"use server";

import { prisma } from "@/lib/prisma";
import { buildExerciseData } from "../utils/exercise/buildExerciseData";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createExerciseAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user) throw new Error("Unauthorized");

  // console.log("Session user:", session.user);
  const trainerId =
    session.user.role === "TRAINER"
      ? session.user.id
      : (session.user.trainerId ?? null);

  console.log("Creating exercise with trainerId:", trainerId);
  const data = buildExerciseData(formData);

  return prisma.exercise.create({
    data: {
      ...data,
      trainerId,
    },
  });
}
