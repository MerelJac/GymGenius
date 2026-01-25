"use client";

import { addSubstitution , removeSubstitution} from "@/app/(trainer)/exercises/[exerciseId]/edit/actions";
import { Exercise, ExerciseSubstitution } from "@prisma/client";

export default function SubstitutionsEditor({
  exercise,
  allExercises,
}: {
  exercise: Exercise & {
    substitutionsFrom: (ExerciseSubstitution & {
      substituteExercise: Exercise;
    })[];
  };
  allExercises: Exercise[];
}) {
  return (
    <div className="border-t pt-4 mt-6">
      <h2 className="font-semibold mb-2">Substitutions</h2>

      {/* Existing substitutions */}
      <ul className="space-y-2 mb-4">
        {exercise.substitutionsFrom.map((sub) => (
          <li key={sub.id} className="border p-3 rounded">
            <div className="font-medium">
              {sub.substituteExercise.name}
            </div>

            {sub.note && (
              <div className="text-sm text-gray-600 mt-1">
                {sub.note}
              </div>
            )}

            <form action={removeSubstitution} className="mt-2">
              <input type="hidden" name="id" value={sub.id} />
              <input
                type="hidden"
                name="exerciseId"
                value={exercise.id}
              />
              <button className="text-sm text-red-600 underline">
                Remove
              </button>
            </form>
          </li>
        ))}
      </ul>

      {/* Add substitution */}
      <form action={addSubstitution} className="space-y-2">
        <input
          type="hidden"
          name="exerciseId"
          value={exercise.id}
        />

        <label className="block text-sm font-medium">
          Substitute Exercise
        </label>
        <select
          name="substituteId"
          required
          className="border p-2 w-full"
        >
          <option value="">Select an exercise</option>
          {allExercises
            .filter((e) => e.id !== exercise.id)
            .map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
        </select>

        <label className="block text-sm font-medium">
          Note (optional)
        </label>
        <textarea
          name="note"
          className="border p-2 w-full"
          placeholder="e.g. Use dumbbells if barbell unavailable"
        />

        <button className="border px-4 py-2 rounded">
          Add Substitution
        </button>
      </form>
    </div>
  );
}
