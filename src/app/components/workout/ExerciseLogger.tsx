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
import { Ellipsis } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SubstitutionModal from "../exercise/SubstitutionModal";
import { SetInput, SetRow } from "./WorkoutComponents";

export function ExerciseLogger({
  exercise,
  prescribed,
  performed,
  workoutLogId,
  clientId,
  sectionId,
  disabled,
  order,
  notes,
  status,
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
  order: number;
  notes?: string | null;
  status?: string;
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
  const isBuilding = status === "BUILDING";
  const isInputDisabled = disabled || isBuilding;
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

  const handleAddSet = () => {
    updatePerformed((prev) => {
      if (prev.kind === "strength") {
        return { ...prev, sets: [...prev.sets, { reps: 0, weight: null }] };
      }
      if (prev.kind === "hybrid") {
        return {
          ...prev,
          sets: [...prev.sets, { reps: 0, weight: null, duration: null }],
        };
      }
      if (prev.kind === "core" || prev.kind === "mobility") {
        return {
          ...prev,
          sets: [...prev.sets, { reps: 0, weight: null, duration: 0 }],
        };
      }
      if (prev.kind === "bodyweight") {
        return { ...prev, sets: [...prev.sets, { reps: 0 }] };
      }
      return prev;
    });
  };
  // console.log("building status: ", status);
  // console.log("isBuilding status: ", isBuilding);
  // console.log("disabled status: ", disabled);
  // console.log("isdisabled status: ", isInputDisabled);

  return (
    <div className="card">
      <div className="card-header">
        <span
          className="card-title"
          onClick={() => setOpenExerciseId(exercise.id)}
        >
          {exercise.name}
        </span>
        <div className="icon-btns">
          {/* Substitution */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenSubModal(true);
            }}
            className="icon-btn"
          >
            <Ellipsis size={14} />
          </button>

          {isClientAdded && !isInputDisabled && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (!exerciseLogId || !workoutLogId) return;

                if (!confirm("Remove this exercise from your workout?")) return;

                await removeClientExercise(exerciseLogId);
                router.refresh();
              }}
              className="icon-btn danger"
            >
              🗑
            </button>
          )}
        </div>
      </div>

      {/* Prescribed */}
      <div className="prescribed">
        <span className="label">Prescribed:</span>{" "}
        {renderPrescribed(prescribed)}
      </div>

      {/* Logging UI */}
      {!isInputDisabled && (
        <div className="space-y-4">
          {/* Strength  */}
          {performedState.kind === "strength" && (
            <div className="space-y-2">
              {performedState.sets.map((set, index) => {
                const recommendedWeight =
                  oneRepMax && set.reps
                    ? Math.round(oneRepMax * getPercentageForReps(set.reps))
                    : null;
                return (
                  <SetRow key={index} index={index}>
                    <div className="grid grid-cols-2 gap-2">
                      <SetInput
                        label="Reps"
                        value={set.reps}
                        onChange={(val) => {
                          setHasSaved(false);
                          setPerformedState((prev) => {
                            if (prev.kind !== "strength") return prev;
                            const sets = [...prev.sets];
                            sets[index] = { ...sets[index], reps: val ?? 0 };
                            return { ...prev, sets };
                          });
                        }}
                      />
                      <SetInput
                        label={`lb${recommendedWeight ? ` (rec: ${recommendedWeight})` : ""}`}
                        value={set.weight}
                        placeholder={
                          recommendedWeight ? `${recommendedWeight}` : "—"
                        }
                        onFocus={() => {
                          if (!set.weight && recommendedWeight) {
                            setHasSaved(false);
                            setPerformedState((prev) => {
                              if (prev.kind !== "strength") return prev;
                              const sets = [...prev.sets];
                              sets[index] = {
                                ...sets[index],
                                weight: recommendedWeight,
                              };
                              return { ...prev, sets };
                            });
                          }
                        }}
                        onChange={(val) => {
                          setHasSaved(false);
                          setPerformedState((prev) => {
                            if (prev.kind !== "strength") return prev;
                            const sets = [...prev.sets];
                            sets[index] = { ...sets[index], weight: val };
                            return { ...prev, sets };
                          });
                        }}
                      />
                    </div>
                  </SetRow>
                );
              })}
            </div>
          )}
          {performedState.kind === "hybrid" && (
            <div className="space-y-2">
              {performedState.sets.map((set, index) => {
                const recommendedWeight =
                  oneRepMax && set.reps
                    ? Math.round(oneRepMax * getPercentageForReps(set.reps))
                    : null;
                return (
                  <SetRow key={index} index={index}>
                    <div className="grid grid-cols-3 gap-2">
                      <SetInput
                        label="Reps"
                        value={set.reps}
                        onChange={(val) => {
                          setHasSaved(false);
                          setPerformedState((prev) => {
                            if (prev.kind !== "hybrid") return prev;
                            const sets = [...prev.sets];
                            sets[index] = { ...sets[index], reps: val ?? 0 };
                            return { ...prev, sets };
                          });
                        }}
                      />
                      <SetInput
                        label={`lb${recommendedWeight ? ` (rec: ${recommendedWeight})` : ""}`}
                        value={set.weight}
                        placeholder={
                          recommendedWeight ? `${recommendedWeight}` : "—"
                        }
                        onFocus={() => {
                          if (!set.weight && recommendedWeight) {
                            setHasSaved(false);
                            setPerformedState((prev) => {
                              if (prev.kind !== "hybrid") return prev;
                              const sets = [...prev.sets];
                              sets[index] = {
                                ...sets[index],
                                weight: recommendedWeight,
                              };
                              return { ...prev, sets };
                            });
                          }
                        }}
                        onChange={(val) => {
                          setHasSaved(false);
                          setPerformedState((prev) => {
                            if (prev.kind !== "hybrid") return prev;
                            const sets = [...prev.sets];
                            sets[index] = { ...sets[index], weight: val };
                            return { ...prev, sets };
                          });
                        }}
                      />
                      <SetInput
                        label="Sec"
                        value={set.duration}
                        placeholder="—"
                        onChange={(val) => {
                          setHasSaved(false);
                          setPerformedState((prev) => {
                            if (prev.kind !== "hybrid") return prev;
                            const sets = [...prev.sets];
                            sets[index] = { ...sets[index], duration: val };
                            return { ...prev, sets };
                          });
                        }}
                      />
                    </div>
                  </SetRow>
                );
              })}
            </div>
          )}
          {/* CORE & MOBILITY */}
          {(performedState.kind === "core" ||
            performedState.kind === "mobility") && (
            <div className="space-y-2">
              {performedState.sets.map((set, index) => {
                const recommendedWeight =
                  oneRepMax && set.reps
                    ? Math.round(oneRepMax * getPercentageForReps(set.reps))
                    : null;
                return (
                  <SetRow key={index} index={index}>
                    <div className="grid grid-cols-3 gap-2">
                      <SetInput
                        label="Reps"
                        value={set.reps}
                        onChange={(val) => {
                          setHasSaved(false);
                          setPerformedState((prev) => {
                            if (
                              prev.kind !== "core" &&
                              prev.kind !== "mobility"
                            )
                              return prev;
                            const sets = [...prev.sets];
                            sets[index] = { ...sets[index], reps: val ?? 0 };
                            return { ...prev, sets };
                          });
                        }}
                      />
                      <SetInput
                        label={`lb${recommendedWeight ? ` (rec: ${recommendedWeight})` : ""}`}
                        value={set.weight}
                        placeholder={
                          recommendedWeight ? `${recommendedWeight}` : "—"
                        }
                        onFocus={() => {
                          if (!set.weight && recommendedWeight) {
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
                                weight: recommendedWeight,
                              };
                              return { ...prev, sets };
                            });
                          }
                        }}
                        onChange={(val) => {
                          setHasSaved(false);
                          setPerformedState((prev) => {
                            if (
                              prev.kind !== "core" &&
                              prev.kind !== "mobility"
                            )
                              return prev;
                            const sets = [...prev.sets];
                            sets[index] = { ...sets[index], weight: val };
                            return { ...prev, sets };
                          });
                        }}
                      />
                      <SetInput
                        label="Sec"
                        value={set.duration}
                        placeholder="—"
                        onChange={(val) => {
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
                              duration: val ?? 0,
                            };
                            return { ...prev, sets };
                          });
                        }}
                      />
                    </div>
                  </SetRow>
                );
              })}
            </div>
          )}
          {/* Bodyweight */}
          {performedState.kind === "bodyweight" && (
            <div className="space-y-2">
              {performedState.sets.map((set, index) => {
                return (
                  <SetRow key={index} index={index}>
                    <div className="grid grid-cols-2 gap-2">
                      <SetInput
                        label="Reps"
                        value={set.reps}
                        onChange={(val) => {
                          setHasSaved(false);
                          setPerformedState((prev) => {
                            if (prev.kind !== "bodyweight") return prev;
                            const sets = [...prev.sets];
                            sets[index] = { ...sets[index], reps: val ?? 0 };
                            return { ...prev, sets };
                          });
                        }}
                      />
                    </div>
                  </SetRow>
                );
              })}
            </div>
          )}
          {/* Times */}
          {performedState.kind === "timed" && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium w-24 text-muted">
                Time
              </label>
              <input
                type="number"
                className="w-28 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={performedState.duration || ""}
                onChange={(e) =>
                  updatePerformed(() => ({
                    kind: "timed",
                    duration: Number(e.target.value),
                  }))
                }
                onBlur={(e) => {
                  if (e.target.value === "" || e.target.value === "0") {
                    updatePerformed(() => ({ kind: "timed", duration: 0 }));
                  }
                }}
              />
              <span className="text-sm text-muted">seconds</span>
            </div>
          )}
          {performedState.kind !== "timed" && (
            <button
              className="text-[10px] uppercase tracking-widest font-semibold text-muted text-right w-full"
              onClick={handleAddSet}
            >
              + Add set
            </button>
          )}{" "}
          {/* Notes */}
          <input
            placeholder="Notes (optional)"
            className="notes-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {notes && (
            <div className="coach-notes">
              <span className="cn-label">Coach</span>
              <span className="cn-text">{notes}</span>
            </div>
          )}
          {/* Save */}
          <div className="pt-1">
            <button
              disabled={isSaving}
              className={`btn-save ${hasSaved ? "saved" : "unsaved"}`}
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
    </div>
  );
}
