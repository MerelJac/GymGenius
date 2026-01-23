"use client";

import { useOptimistic, startTransition, useState } from "react";
import {
  addWorkoutExercise,
  updateWorkoutName,
  deleteWorkoutExercise,
  updateWorkoutDay,
} from "../(trainer)/programs/[programId]/actions";
import { WorkoutWithExercises } from "@/types/workout";
import { Exercise } from "@/types/exercise";
import { formatPrescribed } from "../utils/prescriptionFormatter";
import { WorkoutDay } from "@/types/enums";
import { Prescribed } from "@/types/prescribed";

export default function WorkoutCard({
  workout,
  exercises,
  programId,
  onDelete,
  onDuplicate,
}: {
  workout: WorkoutWithExercises;
  exercises: Exercise[];
  programId: string;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState<number | null>(null);
  const [name, setName] = useState(workout.name);
  const [editing, setEditing] = useState(false);
  const [day, setDay] = useState<WorkoutDay>(workout.day);
  const selectedExercise = exercises.find((e) => e.id === exerciseId);
  const [time, setTime] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const showStrengthFields =
    selectedExercise?.type === "STRENGTH" ||
    selectedExercise?.type === "HYBRID" ||
    selectedExercise?.type === "BODYWEIGHT";

  const showTimedFields = selectedExercise?.type === "TIMED";

  async function save() {
    setEditing(false);

    // optimistic: UI already updated
    startTransition(() => {
      updateWorkoutName(programId, workout.id, name);
    });
  }

  type WorkoutExercise = WorkoutWithExercises["exercises"][number];

  type OptimisticExerciseAction =
    | { type: "add"; exercise: WorkoutExercise }
    | { type: "remove"; id: string };

  const [optimisticExercises, updateOptimisticExercises] = useOptimistic<
    WorkoutWithExercises["exercises"],
    OptimisticExerciseAction
  >(workout.exercises, (state, action) => {
    if (action.type === "add") {
      return [...state, action.exercise];
    }

    if (action.type === "remove") {
      return state.filter((we) => we.id !== action.id);
    }

    return state;
  });

  function saveDay(newDay: WorkoutDay) {
    setDay(newDay);

    startTransition(() => {
      updateWorkoutDay(programId, workout.id, newDay);
    });
  }

  async function handleAddExercise() {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    let prescribed: Prescribed;

    switch (exercise.type) {
      case "TIMED":
        prescribed = {
          kind: "timed",
          duration: time ?? 0,
        };
        break;

      case "BODYWEIGHT":
        prescribed = {
          kind: "bodyweight",
          sets,
          reps,
        };
        break;

      case "HYBRID":
        prescribed = {
          kind: "hybrid",
          sets,
          reps,
          weight,
        };
        break;

      case "STRENGTH":
      default:
        prescribed = {
          kind: "strength",
          sets,
          reps,
          weight,
        };
    }

    const optimistic = {
      id: crypto.randomUUID(),
      order: optimisticExercises.length,
      exercise,
      prescribed,
      notes,
    };

    startTransition(() => {
      updateOptimisticExercises({
        type: "add",
        exercise: optimistic,
      });
    });

    await addWorkoutExercise(
      programId,
      workout.id,
      exerciseId,
      prescribed,
      notes,
    );

    // Resent notes after posting
    setNotes("");
  }

  async function handleDeleteExercise(workoutExerciseId: string) {
    startTransition(() => {
      updateOptimisticExercises({
        type: "remove",
        id: workoutExerciseId,
      });
    });

    await deleteWorkoutExercise(programId, workoutExerciseId);
  }

  return (
    <div className="border p-4 space-y-3">
      {/* Workout Name */}
      {editing ? (
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === "Enter" && save()}
          className="border px-2 py-1 font-medium w-full"
          autoFocus
        />
      ) : (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2
              className="font-medium cursor-pointer hover:underline"
              onClick={() => setEditing(true)}
            >
              {name}
            </h2>

            <select
              value={day}
              onChange={(e) => saveDay(e.target.value as WorkoutDay)}
              className="border px-2 py-1 text-xs rounded"
            >
              <option value="MONDAY">Mon</option>
              <option value="TUESDAY">Tue</option>
              <option value="WEDNESDAY">Wed</option>
              <option value="THURSDAY">Thu</option>
              <option value="FRIDAY">Fri</option>
              <option value="SATURDAY">Sat</option>
              <option value="SUNDAY">Sun</option>
            </select>
          </div>

          <div className="flex gap-2 text-xs">
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
      )}

      <ul className="space-y-1 text-sm">
        {optimisticExercises.map((we) => (
          <li key={we.id}>
            {we.exercise.name} — {formatPrescribed(we.prescribed)}
            {we.notes && (
              <div className="text-xs text-gray-500 italic mt-1">
                {we.notes}
              </div>
            )}
            <button
              onClick={() => handleDeleteExercise(we.id)}
              className="text-red-600 text-xs hover:underline ml-2"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {/* ADD EXERCISE */}
      <div className="flex gap-2 items-center">
        <select
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
          className="border p-1"
        >
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>

        {showStrengthFields && (
          <>
            <input
              type="number"
              value={sets}
              onChange={(e) => setSets(+e.target.value)}
              className="border w-14"
              placeholder="Sets"
            />

            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(+e.target.value)}
              className="border w-14"
              placeholder="Reps"
            />

            {selectedExercise?.type !== "BODYWEIGHT" && (
              <input
                type="number"
                value={weight ?? ""}
                onChange={(e) =>
                  setWeight(e.target.value ? +e.target.value : null)
                }
                className="border w-16"
                placeholder="Wt"
              />
            )}
          </>
        )}

        {showTimedFields && (
          <input
            type="number"
            value={time ?? ""}
            onChange={(e) => setTime(e.target.value ? +e.target.value : null)}
            className="border w-20"
            placeholder="Seconds"
          />
        )}

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Coach notes (tempo, cues, intent, recovery)"
          className="border p-2 text-sm w-full"
          rows={2}
        />

        <button onClick={handleAddExercise} className="text-sm underline">
          Add
        </button>
      </div>
    </div>
  );
}
