import { prisma } from "@/lib/prisma";
import { Exercise } from "@/types/exercise";

export default async function WorkoutBuilderPage({
  params,
}: {
  params: { workoutId: string };
}) {
  const workout = await prisma.workoutTemplate.findUnique({
    where: { id: params.workoutId },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
    },
  });

  const exercises = await prisma.exercise.findMany({
    orderBy: { name: "asc" },
  });

  if (!workout) return null;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">
        Edit Workout: {workout.name}
      </h1>

      {/* Exercise Picker */}
      <form action={`/api/workouts/${workout.id}/add`} method="POST">
        <select name="exerciseId">
          {exercises.map((ex: Exercise) => (
            <option key={ex.id} value={ex.id}>
              {ex.name} ({ex.type})
            </option>
          ))}
        </select>

        <button type="submit">Add Exercise</button>
      </form>

      {/* Current Exercises */}
      <ul className="mt-6 space-y-4">
        {workout.exercises.map((we) => (
          <li key={we.id} className="border p-4">
            <strong>{we.exercise.name}</strong>
            <div className="text-sm text-gray-500">{we.exercise.type}</div>

            <pre className="text-xs mt-2">
              {JSON.stringify(we.prescribed, null, 2)}
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
