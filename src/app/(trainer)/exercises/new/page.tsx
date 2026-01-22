import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ExerciseType } from "@/types/exercise"

export default function NewExercisePage() {
  async function createExercise(formData: FormData) {
    "use server"

  
    const typeValue = formData.get("type")

    if (
      typeValue !== "STRENGTH" &&
      typeValue !== "TIMED" &&
      typeValue !== "HYBRID" &&
      typeValue !== "BODYWEIGHT"
    ) {
      throw new Error("Invalid exercise type")
    }

    const type: ExerciseType = typeValue

    await prisma.exercise.create({
      data: {
        name: String(formData.get("name")),
        type,
        equipment: String(formData.get("equipment") || ""),
        notes: String(formData.get("notes") || ""),
      },
    })
  }
  return (
    <form action={createExercise} className="space-y-4">
      <h1 className="text-xl font-semibold">New Exercise</h1>

      <input name="name" placeholder="Exercise name" />

      <select name="type">
        <option value="STRENGTH">Strength</option>
        <option value="TIMED">Timed</option>
        <option value="HYBRID">Hybrid</option>
        <option value="BODYWEIGHT">Bodyweight</option>
      </select>

      <input name="equipment" placeholder="Equipment (optional)" />
      <textarea name="notes" placeholder="Notes / cues" />

      <button type="submit">Save Exercise</button>
    </form>
  )
}
