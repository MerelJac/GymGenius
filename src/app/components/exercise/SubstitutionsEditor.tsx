"use client";

import {
  addSubstitution,
  removeSubstitution,
} from "@/app/(trainer)/exercises/[exerciseId]/edit/actions";
import { Exercise, ExerciseSubstitution } from "@prisma/client";
import { useState } from "react";
import { ExerciseSearch } from "../workout/ExerciseSearch";

export default function SubstitutionsEditor({
  exercise
}: {
  exercise: Exercise & {
    substitutionsFrom: (ExerciseSubstitution & {
      substituteExercise: Exercise;
    })[];
  };
}) {
  const EMPTY_EXERCISE: Exercise = {
    id: "",
    name: "",
    type: "STRENGTH",
    equipment: null,
    muscleGroup: null,
    videoUrl: null,
    notes: null,
    trainerId: null,
  };

  const [showSearch, setShowSearch] = useState(false);
  const [selectedExercise, setSelectedExercise] =
    useState<Exercise>(EMPTY_EXERCISE);

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
                    <div className="text-sm text-gray-600 mt-1">{sub.note}</div>
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
        <p className="text-gray-500 italic py-4">No substitutions added yet.</p>
      )}

      {/* Add new substitution */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Add Substitution
        </h3>

        <form action={addSubstitution} className="space-y-5">
          <input type="hidden" name="exerciseId" value={exercise.id} />

          <div className="relative">
            <label
              htmlFor="substituteId"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Substitute Exercise
            </label>

            {/* Hidden value sent to server */}
            <input
              type="hidden"
              name="substituteId"
              value={selectedExercise?.id ?? ""}
              required
            />

            {/* Trigger */}
            {!selectedExercise.id ? (
              <button
                type="button"
                onClick={() => setShowSearch(true)}
                className="w-full flex justify-between items-center px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:border-blue-500 transition"
              >
                <span className="text-gray-500">Search for an exercise…</span>
                <span className="text-sm text-blue-600">Browse</span>
              </button>
            ) : (
              <div className="flex justify-between items-center px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                <div>
                  <div className="font-medium">{selectedExercise.name}</div>
                  <div className="text-xs text-gray-500">
                    {selectedExercise.type} • {selectedExercise.muscleGroup}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedExercise(EMPTY_EXERCISE)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Change
                </button>
              </div>
            )}

            {/* Search dropdown */}
            {showSearch && (
              <div className="absolute z-50 mt-2 w-full bg-white border rounded-md shadow-lg p-4">
                <ExerciseSearch
                  onSelect={(ex) => {
                    if (ex.id === exercise.id) return; // prevent self-substitution

                    setSelectedExercise({
                      id: ex.id,
                      name: ex.name,
                      type: ex.type,
                      equipment: ex.equipment ?? null,
                      muscleGroup: ex.muscleGroup ?? null,
                      videoUrl: ex.videoUrl ?? null,
                      notes: ex.notes ?? null,
                      trainerId: ex.trainerId ?? null,
                    });

                    setShowSearch(false);
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="note"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
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
