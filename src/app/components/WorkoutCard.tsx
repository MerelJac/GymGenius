"use client";

import { useOptimistic, startTransition, useState } from "react";
import {
  addWorkoutExercise,
  updateWorkoutName,
  deleteWorkoutExercise,
} from "../(trainer)/programs/[programId]/actions";

export default function WorkoutCard({ workout, exercises, programId }) {
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState<number | null>(null);
  const [name, setName] = useState(workout.name);
  const [editing, setEditing] = useState(false);

  async function save() {
    setEditing(false);

    // optimistic: UI already updated
    startTransition(() => {
      updateWorkoutName(programId, workout.id, name);
    });
  }

  const [optimisticExercises, updateOptimisticExercises] = useOptimistic(
    workout.exercises,
    (state, action) => {
      if (action.type === "add") {
        return [...state, action.exercise];
      }

      if (action.type === "remove") {
        return state.filter((we) => we.id !== action.id);
      }

      return state;
    },
  );

  async function handleAddExercise() {
  const exercise = exercises.find((e) => e.id === exerciseId)
  if (!exercise) return

  const prescribed = {
    sets,
    reps,
    weight,
  }

  const optimistic = {
    id: crypto.randomUUID(),
    exercise,
    prescribed,
  }

  startTransition(() => {
    updateOptimisticExercises({
      type: "add",
      exercise: optimistic,
    })
  })

  await addWorkoutExercise(
    programId,
    workout.id,
    exerciseId,
    prescribed
  )
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
        <h2
          className="font-medium cursor-pointer hover:underline"
          onClick={() => setEditing(true)}
        >
          {name}
        </h2>
      )}

      <ul className="space-y-1 text-sm">
        {optimisticExercises.map((we) => (
          <li key={we.id}>
            {we.exercise.name} — {we.prescribed.sets}×{we.prescribed.reps}
            {we.prescribed.weight ? ` @ ${we.prescribed.weight}` : ""}
            <button
              onClick={() => handleDeleteExercise(we.id)}
              className="text-red-600 text-xs hover:underline"
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

        <input
          type="number"
          value={weight ?? ""}
          onChange={(e) => setWeight(e.target.value ? +e.target.value : null)}
          className="border w-16"
          placeholder="Wt"
        />

        <button onClick={handleAddExercise} className="text-sm underline">
          Add
        </button>
      </div>
    </div>
  );
}
