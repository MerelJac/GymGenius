"use client";

import { useOptimistic, startTransition } from "react";
import {
  createWorkout,
  deleteWorkout,
  duplicateWorkout,
} from "../(trainer)/programs/[programId]/actions";
import WorkoutCard from "./WorkoutCard";
import { ProgramWithWorkouts, WorkoutWithExercises } from "@/types/workout";
import { Exercise } from "@/types/exercise";

type WorkoutAction =
  | { type: "add"; workout: WorkoutWithExercises }
  | { type: "remove"; id: string };

export default function ProgramBuilder({
  program,
  exercises,
}: {
  program: ProgramWithWorkouts;
  exercises: Exercise[];
}) {
  const [optimisticWorkouts, updateOptimisticWorkouts] = useOptimistic<
    WorkoutWithExercises[],
    WorkoutAction
  >(program.workouts, (state, action) => {
    switch (action.type) {
      case "add":
        return [...state, action.workout];

      case "remove":
        return state.filter((w) => w.id !== action.id);

      default:
        return state;
    }
  });

  async function handleAddWorkout() {
    const optimisticWorkout: WorkoutWithExercises = {
      id: crypto.randomUUID(),
      name: "New Workout",
      order: optimisticWorkouts.length,
      exercises: [],
    };

    startTransition(() => {
      updateOptimisticWorkouts({
        type: "add",
        workout: optimisticWorkout,
      });
    });

    await createWorkout(program.id);
  }

  async function handleDeleteWorkout(workout: WorkoutWithExercises) {
    startTransition(() => {
      updateOptimisticWorkouts({
        type: "remove",
        id: workout.id,
      });
    });

    await deleteWorkout(program.id, workout.id);
  }

  async function handleDuplicateWorkout(workout: WorkoutWithExercises) {
    const optimisticCopy: WorkoutWithExercises = {
      ...workout,
      id: crypto.randomUUID(),
      name: `${workout.name} (Copy)`,
    };

    startTransition(() => {
      updateOptimisticWorkouts({
        type: "add",
        workout: optimisticCopy,
      });
    });

    await duplicateWorkout(program.id, workout.id);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{program.name}</h1>

      <button
        onClick={handleAddWorkout}
        className="border px-3 py-1 rounded"
      >
        + Add Workout
      </button>

      {optimisticWorkouts.map((workout) => (
        <WorkoutCard
          key={workout.id}
          workout={workout}
          exercises={exercises}
          programId={program.id}
          onDelete={() => handleDeleteWorkout(workout)}
          onDuplicate={() => handleDuplicateWorkout(workout)}
        />
      ))}
    </div>
  );
}
