import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: { workoutId: string } }
) {
  const formData = await req.formData()
  const exerciseId = formData.get("exerciseId")

  if (!exerciseId || typeof exerciseId !== "string") {
    return NextResponse.json({ error: "Invalid exercise" }, { status: 400 })
  }

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
  })

  if (!exercise) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 })
  }

  const count = await prisma.workoutExercise.count({
    where: { workoutId: params.workoutId },
  })

  await prisma.workoutExercise.create({
    data: {
      workoutId: params.workoutId,
      exerciseId,
      order: count + 1,
      prescribed: {},
    },
  })

  return NextResponse.redirect(
    `/programs/${params.workoutId}/edit`
  )
}
