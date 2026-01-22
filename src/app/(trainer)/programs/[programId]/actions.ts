"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { Prescribed } from "@/types/prescribed"

function runRevalidate(programId: string) {
  revalidatePath(`/trainer/programs/${programId}`)
}

export async function createWorkout(programId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const order = await prisma.workoutTemplate.count({
    where: { programId },
  })

  await prisma.workoutTemplate.create({
    data: {
      programId,
      name: "New Workout",
      order,
    },
  })

  runRevalidate(programId)
}

export async function deleteWorkoutExercise(
  programId: string,
  workoutExerciseId: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.workoutExercise.delete({
    where: { id: workoutExerciseId },
  })

  runRevalidate(programId)
}

export async function addWorkoutExercise(
  programId: string,
  workoutId: string,
  exerciseId: string,
  prescribed: Prescribed
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const order = await prisma.workoutExercise.count({
    where: { workoutId },
  })

  await prisma.workoutExercise.create({
    data: {
      workoutId,
      exerciseId,
      order,
      prescribed,
    },
  })

  runRevalidate(programId)
}

export async function updateWorkoutName(
  programId: string,
  workoutId: string,
  name: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.workoutTemplate.update({
    where: { id: workoutId },
    data: { name },
  })

  runRevalidate(programId)
}
