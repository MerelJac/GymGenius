import { logExercise } from "@/app/(client)/workouts/[scheduledWorkoutId]/actions";
import {
  buildPerformedFromPrescribed,
  renderPrescribed,
} from "@/app/utils/workoutFunctions";
import { Exercise } from "@/types/exercise";
import { Performed, Prescribed } from "@/types/prescribed";
import Link from "next/link";
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

  function updatePerformed<K extends keyof Performed>(
    updater: (prev: Performed) => Performed,
  ) {
    setPerformed((prev) => updater(prev));
  }

  return (
    <li className="border p-3 rounded space-y-3">
      <Link href={"/dashboard"}>Back </Link>
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

          {(performed.kind === "strength" || performed.kind === "hybrid") && (
            <div className="space-y-2">
              {performed.sets.map((set, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-sm w-12">Set {index + 1}</span>

                  <input
                    type="number"
                    className="border p-1 w-16 text-sm"
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

                  <span className="text-sm">reps</span>

                  <input
                    type="number"
                    className="border p-1 w-20 text-sm"
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

                  <span className="text-sm">lb</span>
                </div>
              ))}
            </div>
          )}

          {performed.kind === "bodyweight" && (
            <div className="space-y-2">
              {performed.sets.map((set, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-sm w-12">Set {index + 1}</span>

                  <input
                    type="number"
                    className="border p-1 w-16 text-sm"
                    value={set.reps}
                    onChange={(e) =>
                      setPerformed((prev) => {
                        if (prev.kind !== "bodyweight") return prev;

                        const sets = [...prev.sets];
                        sets[index] = {
                          reps: Number(e.target.value),
                        };

                        return { kind: "bodyweight", sets };
                      })
                    }
                  />

                  <span className="text-sm">reps</span>
                </div>
              ))}
            </div>
          )}

          {performed.kind === "timed" && (
            <input
              type="number"
              className="border p-1 w-24 text-sm"
              value={performed.duration}
              onChange={(e) =>
                setPerformed({
                  kind: "timed",
                  duration: Number(e.target.value),
                })
              }
            />
          )}

          {/* Optional note */}
          <input
            placeholder="Notes (optional)"
            className="border p-1 w-full text-sm"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {notes && (
            <div className="text-sm text-gray-500 italic">
              Coach notes: {notes}
            </div>
          )}
          <button
            className="text-sm underline"
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
      )}
    </li>
  );
}
