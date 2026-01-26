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
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">
    <h2 className="text-xl font-semibold text-gray-900">Substitutions</h2>

    {/* Existing substitutions */}
    {exercise.substitutionsFrom.length > 0 ? (
      <div className="space-y-4">
        {exercise.substitutionsFrom.map((sub) => (
          <div
            key={sub.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="font-medium text-gray-900">
                  {sub.substituteExercise.name}
                </div>
                {sub.note && (
                  <div className="text-sm text-gray-600 mt-1">
                    {sub.note}
                  </div>
                )}
              </div>

              <form action={removeSubstitution} className="mt-2 sm:mt-0">
                <input type="hidden" name="id" value={sub.id} />
                <input type="hidden" name="exerciseId" value={exercise.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md border border-red-200 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Remove
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 italic py-4">
        No substitutions added yet.
      </p>
    )}

    {/* Add new substitution */}
    <div className="border-t pt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Add Substitution</h3>

      <form action={addSubstitution} className="space-y-5">
        <input type="hidden" name="exerciseId" value={exercise.id} />

        <div>
          <label htmlFor="substituteId" className="block text-sm font-medium text-gray-700 mb-1.5">
            Substitute Exercise
          </label>
          <select
            id="substituteId"
            name="substituteId"
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition shadow-sm bg-white"
          >
            <option value="">Select an exercise...</option>
            {allExercises
              .filter((e) => e.id !== exercise.id)
              .map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1.5">
            Note (optional)
          </label>
          <textarea
            id="note"
            name="note"
            placeholder="e.g. Use dumbbells if no barbell available"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition shadow-sm resize-y"
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition shadow-sm"
        >
          Add Substitution
        </button>
      </form>
    </div>
  </div>
);
}
