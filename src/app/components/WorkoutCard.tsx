"use client";
import { useOptimistic, startTransition, useState, useEffect } from "react";
import {
  addWorkoutExercise,
  updateWorkoutName,
  deleteWorkoutExercise,
  updateWorkoutDay,
} from "../(trainer)/programs/[programId]/actions";
import { WorkoutWithSections } from "@/types/workout"; // ← update this type!
import { Exercise } from "@/types/exercise";
import { formatPrescribed } from "../utils/prescriptionFormatter";
import { WorkoutDay } from "@/types/enums";
import { Prescribed } from "@/types/prescribed";
import Link from "next/link";

export default function WorkoutCard({
  workout,
  exercises,
  programId,
  onDelete,
  onDuplicate,
}: {
  workout: WorkoutWithSections;
  exercises: Exercise[];
  programId: string;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id || "");
  const [sectionId, setSectionId] = useState("");

  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState<number | null>(null);
  const [time, setTime] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const [name, setName] = useState(workout.name);
  const [editing, setEditing] = useState(false);
  const [day, setDay] = useState<WorkoutDay>(workout.day);

  const selectedExercise = exercises.find((e) => e.id === exerciseId);

  const showStrengthFields =
    selectedExercise?.type === "STRENGTH" ||
    selectedExercise?.type === "HYBRID" ||
    selectedExercise?.type === "BODYWEIGHT";

  const showTimedFields = selectedExercise?.type === "TIMED";

  // ── Optimistic updates for sections + nested exercises ──
  const [optimisticSections, updateOptimisticSections] = useOptimistic(
    workout.sections,
    (
      currentSections,
      action:
        | { type: "add-exercise"; sectionId: string; exercise: any }
        | { type: "remove-exercise"; exerciseId: string },
    ) => {
      switch (action.type) {
        case "add-exercise":
          return currentSections.map((section) =>
            section.id === action.sectionId
              ? {
                  ...section,
                  exercises: [...section.exercises, action.exercise],
                }
              : section,
          );

        case "remove-exercise":
          return currentSections.map((section) => ({
            ...section,
            exercises: section.exercises.filter(
              (e) => e.id !== action.exerciseId,
            ),
          }));

        default:
          return currentSections;
      }
    },
  );

  useEffect(() => {
    if (!sectionId && workout.sections?.length) {
      setSectionId(workout.sections[0].id);
    }
  }, [workout.sections, sectionId]);

  function saveName() {
    setEditing(false);
    startTransition(() => {
      updateWorkoutName(programId, workout.id, name);
    });
  }

  function saveDay(newDay: WorkoutDay) {
    setDay(newDay);
    startTransition(() => {
      updateWorkoutDay(programId, workout.id, newDay);
    });
  }

  async function handleAddExercise() {
    if (!exerciseId || !sectionId) return;

    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    let prescribed: Prescribed;

    if (showTimedFields) {
      prescribed = { kind: "timed", duration: time ?? 0 };
    } else if (exercise.type === "BODYWEIGHT") {
      prescribed = { kind: "bodyweight", sets, reps };
    } else if (exercise.type === "HYBRID") {
      prescribed = { kind: "hybrid", sets, reps, weight };
    } else {
      // STRENGTH + fallback
      prescribed = { kind: "strength", sets, reps, weight };
    }

    // Optimistic shape should roughly match what your backend returns
    const optimisticExercise = {
      id: crypto.randomUUID(), // temporary id
      order:
        optimisticSections.find((s) => s.id === sectionId)?.exercises.length ??
        0,
      sectionId, // important for relation
      exercise, // full exercise object
      exerciseId,
      prescribed,
      notes: notes || null,
    };

    // Optimistic UI update
    updateOptimisticSections({
      type: "add-exercise",
      sectionId,
      exercise: optimisticExercise,
    });

    // Real server call
    try {
      await addWorkoutExercise(
        programId,
        workout.id,
        sectionId, // ← now required
        exerciseId,
        prescribed,
        notes.trim() || undefined,
      );
      setNotes(""); // clear only on success
    } catch (err) {
      console.error("Failed to add exercise", err);
      // TODO: rollback optimistic update (more advanced)
    }
  }

  async function handleDeleteExercise(workoutExerciseId: string) {
    // Optimistic remove
    updateOptimisticSections({
      type: "remove-exercise",
      exerciseId: workoutExerciseId,
    });

    try {
      await deleteWorkoutExercise(programId, workoutExerciseId);
    } catch (err) {
      console.error("Delete failed", err);
      // TODO: revert optimistic state
    }
  }

  return (
    <div className="border p-4 space-y-4 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        {editing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
            className="border px-3 py-1.5 font-medium flex-1 min-w-[200px]"
            autoFocus
          />
        ) : (
          <h2
            className="font-semibold text-lg cursor-pointer hover:underline"
            onClick={() => setEditing(true)}
          >
            {name}
          </h2>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="border px-2 py-1 text-sm rounded"
          >
            {workout.sections?.map((section) => (
              <option key={section.id} value={section.id}>
                {section.title}
              </option>
            ))}
          </select>

          <select
            value={day}
            onChange={(e) => saveDay(e.target.value as WorkoutDay)}
            className="border px-2 py-1 text-sm rounded"
          >
            <option value="MONDAY">Mon</option>
            <option value="TUESDAY">Tue</option>
            <option value="WEDNESDAY">Wed</option>
            <option value="THURSDAY">Thu</option>
            <option value="FRIDAY">Fri</option>
            <option value="SATURDAY">Sat</option>
            <option value="SUNDAY">Sun</option>
          </select>

          <div className="flex gap-3 text-sm">
            <button
              onClick={onDuplicate}
              className="text-blue-600 hover:underline"
            >
              Duplicate
            </button>
            <button onClick={onDelete} className="text-red-600 hover:underline">
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Sections + Exercises */}
      <div className="space-y-5">
        {optimisticSections.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No sections yet. Add one to start building this workout.
          </p>
        ) : (
          optimisticSections.map((section) => (
            <div key={section.id} className="border rounded-md p-3 bg-gray-50">
              <h3 className="font-semibold uppercase text-xs text-gray-600 mb-2.5 tracking-wide">
                {section.title}
              </h3>

              <ul className="space-y-2">
                {section.exercises.map((we) => (
                  <li
                    key={we.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex gap-2 items-baseline">
                      <Link
                        href={`/exercises/${we.exercise.id}/modal`}
                        scroll={false}
                        className="text-blue-700 underline hover:text-blue-900"
                      >
                        {we.exercise.name}
                      </Link>

                      <span className="text-gray-600">
                        — {formatPrescribed(we.prescribed)}
                      </span>

                      {we.notes && (
                        <span className="text-gray-500 text-xs italic">
                          ({we.notes})
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteExercise(we.id)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      {/* Add new exercise form */}
      <div className="border-t pt-4 mt-2">
        <div className="flex flex-wrap gap-2 items-end">
          <div className="min-w-[180px]">
            <select
              value={exerciseId}
              onChange={(e) => setExerciseId(e.target.value)}
              className="border px-3 py-1.5 w-full rounded"
            >
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>

          {showStrengthFields && (
            <>
              <input
                type="number"
                value={sets}
                onChange={(e) => setSets(Number(e.target.value))}
                placeholder="Sets"
                className="border px-2 py-1.5 w-16 rounded"
              />
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                placeholder="Reps"
                className="border px-2 py-1.5 w-16 rounded"
              />
              {selectedExercise?.type !== "BODYWEIGHT" && (
                <input
                  type="number"
                  value={weight ?? ""}
                  onChange={(e) =>
                    setWeight(e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="Weight"
                  className="border px-2 py-1.5 w-20 rounded"
                />
              )}
            </>
          )}

          {showTimedFields && (
            <input
              type="number"
              value={time ?? ""}
              onChange={(e) =>
                setTime(e.target.value ? Number(e.target.value) : null)
              }
              placeholder="Seconds"
              className="border px-2 py-1.5 w-24 rounded"
            />
          )}

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes / tempo / cues / rest"
            className="border px-3 py-2 text-sm flex-1 min-w-[220px] rounded resize-none"
            rows={2}
          />

          <button
            onClick={handleAddExercise}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium"
            disabled={!exerciseId || !sectionId}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
