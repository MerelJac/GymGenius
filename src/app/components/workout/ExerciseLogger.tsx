import { logExercise } from "@/app/(client)/workouts/[scheduleWorkoutId]/actions";
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
}: {
  exercise: Exercise;
  prescribed: Prescribed;
  workoutLogId: string | null;
  disabled: boolean;
}) {
  const [performed, setPerformed] = useState<Performed>(
    buildPerformedFromPrescribed(prescribed)
  );
  const [note, setNote] = useState("");

  function updatePerformed<K extends keyof Performed>(
    updater: (prev: Performed) => Performed
  ) {
    setPerformed((prev) => updater(prev));
  }

  return (
    <li className="border p-3 rounded space-y-3">
      <div className="font-medium">{exercise.name}</div>

      {/* Prescribed */}
      <div className="text-sm text-gray-600">
        Prescribed: {renderPrescribed(prescribed)}
      </div>

      {/* Logging UI */}
      {!disabled && (
        <div className="space-y-2">
          {prescribed.kind === "timed" && performed.kind === "timed" && (
            <div className="flex gap-2 items-center">
              <label className="text-sm w-24">Time</label>
              <input
                type="number"
                className="border p-1 w-24 text-sm"
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

          {(prescribed.kind === "strength" ||
            prescribed.kind === "hybrid" ||
            prescribed.kind === "bodyweight") &&
            performed.kind !== "timed" && (
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm">Sets</label>
                  <input
                    type="number"
                    className="border p-1 w-16 text-sm"
                    value={performed.sets}
                    onChange={(e) =>
                      updatePerformed((prev) => ({
                        ...prev,
                        sets: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm">Reps</label>
                  <input
                    type="number"
                    className="border p-1 w-16 text-sm"
                    value={performed.reps}
                    onChange={(e) =>
                      updatePerformed((prev) => ({
                        ...prev,
                        reps: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                {"weight" in performed && (
                  <div>
                    <label className="block text-sm">Weight</label>
                    <input
                      type="number"
                      className="border p-1 w-20 text-sm"
                      value={performed.weight ?? ""}
                      onChange={(e) =>
                        updatePerformed((prev) => ({
                          ...prev,
                          weight: e.target.value
                            ? Number(e.target.value)
                            : null,
                        }))
                      }
                    />
                  </div>
                )}
              </div>
            )}

          {/* Optional note */}
          <input
            placeholder="Notes (optional)"
            className="border p-1 w-full text-sm"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button
            className="text-sm underline"
            onClick={() =>
              workoutLogId &&
              logExercise(
                workoutLogId,
                exercise.id,
                prescribed,
                performed,
                note
              )
            }
          >
            Save
          </button>
        </div>
      )}
    </li>
  );
}
