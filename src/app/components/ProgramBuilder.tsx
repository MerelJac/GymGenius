"use client";

import { useOptimistic, startTransition } from "react";
import { createWorkout } from "../(trainer)/programs/[programId]/actions";
import WorkoutCard from "./WorkoutCard";
import { ProgramWithWorkouts, WorkoutWithExercises } from "@/types/workout";
import { Exercise } from "@/types/exercise";

export default function ProgramBuilder({ program, exercises } : {
    program: ProgramWithWorkouts, exercises: Exercise[]
}) {
  const [workouts, addOptimisticWorkout] = useOptimistic<
    WorkoutWithExercises[],
    WorkoutWithExercises
  >(
    program.workouts,
    (state, newWorkout) => [...state, newWorkout]
  )

  async function handleAddWorkout() {
    const optimisticWorkout = {
      id: crypto.randomUUID(),
      name: "New Workout",
      order: workouts.length,
      exercises: [],
    };

    startTransition(() => {
      addOptimisticWorkout(optimisticWorkout);
    });

    await createWorkout(program.id);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{program.name}</h1>

      <button onClick={handleAddWorkout} className="border px-3 py-1">
        + Add Workout
      </button>

      {workouts.map((workout) => (
        <WorkoutCard
          key={workout.id}
          workout={workout}
          exercises={exercises}
          programId={program.id}
        />
      ))}
    </div>
  );
}
