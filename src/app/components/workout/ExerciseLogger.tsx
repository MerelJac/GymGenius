import { logExercise } from "@/app/(client)/workouts/[scheduledWorkoutId]/actions";
import ExerciseModal from "@/app/components/exercise/ExerciseModal";
import {
  buildPerformedFromPrescribed,
  renderPrescribed,
} from "@/app/utils/workoutFunctions";
import { Exercise } from "@/types/exercise";
import { Performed, Prescribed } from "@/types/prescribed";
import { useState } from "react";

export function ExerciseLogger({
  exercise,
  prescribed,
  workoutLogId,
  disabled,
  notes,
}: {
  exercise: Exercise;
  prescribed: Prescribed;
  workoutLogId: string | null;
  disabled: boolean;
  notes?: string | null;
}) {
  const [performed, setPerformed] = useState<Performed>(
    buildPerformedFromPrescribed(prescribed),
  );
  const [note, setNote] = useState("");
  const [openExerciseId, setOpenExerciseId] = useState<string | null>(null);

  function updatePerformed<K extends keyof Performed>(
    updater: (prev: Performed) => Performed,
  ) {
    setPerformed((prev) => updater(prev));
  }

 return (
  <li className="rounded-xl border border-gray-200 bg-white p-4 space-y-4 shadow-sm">
    {/* Header */}
    <div
      className="flex items-center justify-between cursor-pointer group"
      onClick={() => setOpenExerciseId(exercise.id)}
    >
      <h4 className="font-semibold text-gray-900 group-hover:underline">
        {exercise.name}
      </h4>
      <span className="text-xs text-gray-400 group-hover:text-gray-600">
        View
      </span>
    </div>

    {/* Prescribed */}
    <div className="text-sm text-gray-600 bg-gray-50 border rounded-lg px-3 py-2">
      <span className="font-medium text-gray-700">Prescribed:</span>{" "}
      {renderPrescribed(prescribed)}
    </div>

    {/* Logging UI */}
    {!disabled && (
      <div className="space-y-4">
        {/* Timed */}
        {prescribed.kind === "timed" && performed.kind === "timed" && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium w-24 text-gray-700">
              Time
            </label>
            <input
              type="number"
              className="w-28 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={performed.duration}
              onChange={(e) =>
                updatePerformed(() => ({
                  kind: "timed",
                  duration: Number(e.target.value),
                }))
              }
            />
            <span className="text-sm text-gray-500">seconds</span>
          </div>
        )}

        {/* Strength / Hybrid */}
        {(performed.kind === "strength" || performed.kind === "hybrid") && (
          <div className="space-y-3">
            {performed.sets.map((set, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2"
              >
                <span className="text-sm font-medium w-14 text-gray-700">
                  Set {index + 1}
                </span>

                <input
                  type="number"
                  className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-sm"
                  value={set.reps}
                  onChange={(e) =>
                    setPerformed((prev) => {
                      if (prev.kind !== "strength" && prev.kind !== "hybrid")
                        return prev;

                      const sets = [...prev.sets];
                      sets[index] = {
                        ...sets[index],
                        reps: Number(e.target.value),
                      };

                      return { ...prev, sets };
                    })
                  }
                />
                <span className="text-sm text-gray-500">reps</span>

                <input
                  type="number"
                  className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm"
                  value={set.weight ?? ""}
                  onChange={(e) =>
                    setPerformed((prev) => {
                      if (prev.kind !== "strength" && prev.kind !== "hybrid")
                        return prev;

                      const sets = [...prev.sets];
                      sets[index] = {
                        ...sets[index],
                        weight: e.target.value
                          ? Number(e.target.value)
                          : null,
                      };

                      return { ...prev, sets };
                    })
                  }
                />
                <span className="text-sm text-gray-500">lb</span>
              </div>
            ))}
          </div>
        )}

        {/* Bodyweight */}
        {performed.kind === "bodyweight" && (
          <div className="space-y-3">
            {performed.sets.map((set, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2"
              >
                <span className="text-sm font-medium w-14 text-gray-700">
                  Set {index + 1}
                </span>

                <input
                  type="number"
                  className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-sm"
                  value={set.reps}
                  onChange={(e) =>
                    setPerformed((prev) => {
                      if (prev.kind !== "bodyweight") return prev;

                      const sets = [...prev.sets];
                      sets[index] = { reps: Number(e.target.value) };

                      return { kind: "bodyweight", sets };
                    })
                  }
                />
                <span className="text-sm text-gray-500">reps</span>
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        <input
          placeholder="Notes (optional)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        {notes && (
          <div className="text-sm text-gray-500 italic bg-gray-50 border rounded-lg px-3 py-2">
            Coach notes: {notes}
          </div>
        )}

        {/* Save */}
        <div className="pt-1">
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            onClick={() =>
              workoutLogId &&
              logExercise(
                workoutLogId,
                exercise.id,
                prescribed,
                performed,
                note,
              )
            }
          >
            Save
          </button>
        </div>
      </div>
    )}

    {/* Modal */}
    {openExerciseId && (
      <ExerciseModal
        exerciseId={openExerciseId}
        onClose={() => setOpenExerciseId(null)}
      />
    )}
  </li>
);

}
