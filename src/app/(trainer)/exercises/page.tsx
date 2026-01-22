import { prisma } from "@/lib/prisma"
import { Exercise } from "@/types/exercise"

export default async function ExerciseLibraryPage() {
  const exercises = await prisma.exercise.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Exercise Library</h1>
        <a href="/exercises/new">Add Exercise</a>
      </div>

      <ul className="space-y-2">
        {exercises.map((ex: Exercise) => (
          <li key={ex.id} className="border p-3 flex justify-between">
            <div>
              <div className="font-medium">{ex.name}</div>
              <div className="text-sm text-gray-500">{ex.type}</div>
            </div>

            <a href={`/exercises/${ex.id}/edit`}>Edit</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
