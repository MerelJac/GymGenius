"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

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

    revalidatePath(`/programs/${programId}`);
}

export async function updateWorkoutName(
  workoutId: string,
  name: string
) {
  await prisma.workoutTemplate.update({
    where: { id: workoutId },
    data: { name },
  })
}



export async function addWorkoutExercise(
  programId: string,
  workoutId: string,
  exerciseId: string,
  prescribed: any
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

  // 🔥 ensures server + optimistic stay in sync
  revalidatePath(`/programs/${programId}`)
}
