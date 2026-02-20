import {
  logExercise,
  removeClientExercise,
} from "@/app/(client)/workouts/[scheduledWorkoutId]/actions";
import ExerciseModal from "@/app/components/exercise/ExerciseModal";
import { getPercentageForReps } from "@/app/utils/oneRepMax/getPercentageForReps";
import {
  buildPerformedFromPrescribed,
  renderPrescribed,
} from "@/app/utils/workoutFunctions";
import { Exercise } from "@/types/exercise";
import { Performed, Prescribed } from "@/types/prescribed";
import { Ellipsis, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SubstitutionModal from "../exercise/SubstitutionModal";

export function ExerciseLogger({
  exercise,
  prescribed,
  performed,
  workoutLogId,
  clientId,
  sectionId,
  disabled,
  notes,
  isClientAdded = false,
  exerciseLogId,
  onChange,
}: {
  exercise: Exercise;
  prescribed: Prescribed;
  performed?: Performed;
  workoutLogId: string | null;
  clientId: string;
  sectionId?: string | undefined;
  disabled: boolean;
  notes?: string | null;
  isClientAdded?: boolean;
  exerciseLogId?: string;
  onChange: (data: {
    exerciseId: string;
    prescribed: Prescribed;
    performed: Performed;
    note: string;
    sectionId?: string | null;
  }) => void;
}) {
  const router = useRouter();
  const [performedState, setPerformedState] = useState<Performed>(
    performed ?? buildPerformedFromPrescribed(prescribed),
  );

  const [hasSaved, setHasSaved] = useState(false);
  const [openSubModal, setOpenSubModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [note, setNote] = useState("");
  const [openExerciseId, setOpenExerciseId] = useState<string | null>(null);
  const [oneRepMax, setOneRepMax] = useState<number | null>(null);

  function updatePerformed<K extends keyof Performed>(
    updater: (prev: Performed) => Performed,
  ) {
    setHasSaved(false);
    setPerformedState((prev) => updater(prev));
  }
  const performedRef = useRef(performed);
  const noteRef = useRef(note);
  const hasSavedRef = useRef(hasSaved);

  useEffect(() => {
    onChange({
      exerciseId: exercise.id,
      prescribed,
      performed: performedState,
      note,
      sectionId: sectionId ?? null,
    });
  }, [performedState, note]);

  useEffect(() => {
    performedRef.current = performed;
    noteRef.current = note;
    hasSavedRef.current = hasSaved;
  }, [performed, note, hasSaved]);

  const hasRegisteredRef = useRef(false);

  useEffect(() => {
    async function loadOneRepMax() {
      const res = await fetch(
        `/api/one-rep-max?clientId=${clientId}&exerciseId=${exercise.id}`,
      );
      const data = await res.json();
      setOneRepMax(data.oneRepMax);
    }

    loadOneRepMax();
  }, [clientId, exercise.id]);

  return (
    <li className="rounded-xl border border-gray-200 bg-white p-4 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between cursor-pointer group">
        <h4
          className="font-semibold text-gray-900 group-hover:underline"
          onClick={() => setOpenExerciseId(exercise.id)}
        >
          {exercise.name}
        </h4>
        <div className="flex flex-row gap-2">
          {/* Substitution */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenSubModal(true);
            }}
            className="text-xs text-black-600"
          >
            <Ellipsis size={14} />
          </button>

          {isClientAdded && !disabled && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (!exerciseLogId || !workoutLogId) return;

                if (!confirm("Remove this exercise from your workout?")) return;

                await removeClientExercise(exerciseLogId);
                router.refresh();
              }}
              className="text-xs text-red-600 hover:underline"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
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
          {prescribed.kind === "timed" && performedState.kind === "timed" && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium w-24 text-gray-700">
                Time
              </label>
              <input
                type="number"
                className="w-28 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={performedState.duration}
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
          {(performedState.kind === "strength" ||
            performedState.kind === "hybrid") && (
            <div className="space-y-3">
              {performedState.sets.map((set, index) => {
                const reps = set.reps;
                const recommendedWeight =
                  oneRepMax && reps
                    ? Math.round(oneRepMax * getPercentageForReps(reps))
                    : null;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2"
                  >
                    <span className="text-sm font-medium w-14 text-gray-700">
                      Set {index + 1}
                    </span>

                    {/* Reps */}
                    <input
                      type="number"
                      className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-sm"
                      value={set.reps}
                      onChange={(e) => {
                        setHasSaved(false);
                        setPerformedState((prev) => {
                          if (
                            prev.kind !== "strength" &&
                            prev.kind !== "hybrid"
                          )
                            return prev;

                          const sets = [...prev.sets];
                          sets[index] = {
                            ...sets[index],
                            reps: Number(e.target.value),
                          };

                          return { ...prev, sets };
                        });
                      }}
                    />
                    <span className="text-sm text-gray-500">reps</span>

                    {/* Weight */}
                    <input
                      type="number"
                      className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm"
                      value={set.weight ?? ""}
                      placeholder={
                        recommendedWeight
                          ? `${recommendedWeight}`
                          : "Enter weight"
                      }
                      onFocus={() => {
                        if (!set.weight && recommendedWeight) {
                          setHasSaved(false);
                          setPerformedState((prev) => {
                            if (
                              prev.kind !== "strength" &&
                              prev.kind !== "hybrid"
                            )
                              return prev;

                            const sets = [...prev.sets];
                            sets[index] = {
                              ...sets[index],
                              weight: recommendedWeight,
                            };

                            return { ...prev, sets };
                          });
                        }
                      }}
                      onChange={(e) => {
                        setHasSaved(false);
                        setPerformedState((prev) => {
                          if (
                            prev.kind !== "strength" &&
                            prev.kind !== "hybrid"
                          )
                            return prev;

                          const sets = [...prev.sets];
                          sets[index] = {
                            ...sets[index],
                            weight: e.target.value
                              ? Number(e.target.value)
                              : null,
                          };

                          return { ...prev, sets };
                        });
                      }}
                    />
                    <span className="text-sm text-gray-500">lb</span>
                  </div>
                );
              })}
            </div>
          )}
          {/* CORE & MOBILITY */}
          {(performedState.kind === "core" ||
            performedState.kind === "mobility") && (
            <div className="space-y-3">
              {/* Sets */}
              <div className="space-y-2">
                {(() => {
                  const firstDuration = performedState.sets[0]?.duration;
                  const sameDuration =
                    firstDuration != null &&
                    performedState.sets.every(
                      (s) => s.duration === firstDuration,
                    );

                  return performedState.sets.map((set, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 flex-wrap gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-500 w-10">
                          Set {index + 1}
                        </span>

                        {/* Reps (optional) */}
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={set.reps ?? ""}
                            onChange={(e) => {
                              setHasSaved(false);
                              setPerformedState((prev) => {
                                if (
                                  prev.kind !== "core" &&
                                  prev.kind !== "mobility"
                                )
                                  return prev;

                                const sets = [...prev.sets];
                                sets[index] = {
                                  ...sets[index],
                                  reps: e.target.value
                                    ? Number(e.target.value)
                                    : 0,
                                };

                                return { ...prev, sets };
                              });
                            }}
                            placeholder="—"
                            className="w-14 rounded-md border border-gray-300 px-2 py-1 text-sm
                focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                          <span className="text-xs text-gray-500">reps</span>

                          {sameDuration && firstDuration != null && (
                            <span className="text-xs text-gray-400">
                              • {firstDuration}s
                            </span>
                          )}
                        </div>

                        {/* Weight (optional, de-emphasized) */}
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={set.weight ?? ""}
                            onChange={(e) => {
                              setHasSaved(false);
                              setPerformedState((prev) => {
                                if (
                                  prev.kind !== "core" &&
                                  prev.kind !== "mobility"
                                )
                                  return prev;

                                const sets = [...prev.sets];
                                sets[index] = {
                                  ...sets[index],
                                  weight: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                };

                                return { ...prev, sets };
                              });
                            }}
                            placeholder="bw / lb"
                            className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm
                focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                          <span className="text-xs text-gray-400">lb</span>
                        </div>
                      </div>

                      {/* Cue */}
                      <span className="text-xs text-gray-400 italic">
                        controlled
                      </span>

                      {/* Duration per set */}
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={set.duration ?? ""}
                          onChange={(e) => {
                            setHasSaved(false);
                            setPerformedState((prev) => {
                              if (
                                prev.kind !== "core" &&
                                prev.kind !== "mobility"
                              )
                                return prev;

                              const sets = [...prev.sets];
                              sets[index] = {
                                ...sets[index],
                                duration: e.target.value
                                  ? Number(e.target.value)
                                  : 0,
                              };

                              return { ...prev, sets };
                            });
                          }}
                          placeholder="sec"
                          className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm
              focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="text-xs text-gray-500">sec</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Bodyweight */}
          {performedState.kind === "bodyweight" && (
            <div className="space-y-3">
              {performedState.sets.map((set, index) => (
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
                    onChange={(e) => {
                      setHasSaved(false);
                      setPerformedState((prev) => {
                        if (prev.kind !== "bodyweight") return prev;

                        const sets = [...prev.sets];
                        sets[index] = { reps: Number(e.target.value) };

                        return { kind: "bodyweight", sets };
                      });
                    }}
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
            <div className="text-sm text-gray-500 italic bg-green-50 border rounded-lg px-3 py-2">
              Coach notes: {notes}
            </div>
          )}

          {/* Save */}
          <div className="pt-1">
            <button
              disabled={isSaving}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
                hasSaved
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={async () => {
                if (!workoutLogId) return;

                setIsSaving(true);

                await logExercise(
                  workoutLogId,
                  exercise.id,
                  prescribed,
                  performedState,
                  note,
                  sectionId,
                );

                setIsSaving(false);
                setHasSaved(true);
                hasSavedRef.current = true;
              }}
            >
              {hasSaved ? "Saved ✓" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Exercise info Modal */}
      {openExerciseId && (
        <ExerciseModal
          exerciseId={openExerciseId}
          clientId={clientId}
          onClose={() => setOpenExerciseId(null)}
        />
      )}

      {/* Substitution modal */}
      {openSubModal && workoutLogId && (
        <SubstitutionModal
          exerciseId={exercise.id}
          workoutLogId={workoutLogId}
          sectionId={sectionId}
          prescribed={prescribed}
          onClose={() => setOpenSubModal(false)}
        />
      )}
    </li>
  );
}
