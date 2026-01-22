import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function NewWorkoutPage({
  params,
}: {
  params: { programId: string }
}) {
  const exercises = await prisma.exercise.findMany()

  async function createWorkout(formData: FormData) {
    "use server"

    const workout = await prisma.workoutTemplate.create({
      data: {
        programId: params.programId,
        name: String(formData.get("name")),
        order: 1,
      },
    })

    // Add exercises later (next step)
    redirect(`/trainer/programs/${params.programId}`)
  }

  return (
    <form action={createWorkout}>
      <h1>New Workout</h1>
      <input name="name" placeholder="Workout name" />

      <p>Select exercises (v1 coming next)</p>

      <button type="submit">Create Workout</button>
    </form>
  )
}
