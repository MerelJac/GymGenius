"use client";

import { useState } from "react";
import { Prescribed } from "@/types/prescribed";
import { startWorkout, stopWorkout } from "@/app/(client)/workouts/[scheduleWorkoutId]/actions";
import { ExerciseLogger } from "./ExerciseLogger";
import { ScheduledWorkoutWithLogs } from "@/types/workout";

export default function WorkoutRunner({
  scheduledWorkout,
}: {
  scheduledWorkout: ScheduledWorkoutWithLogs;
}) {
  const activeLog = scheduledWorkout.workoutLogs[0] ?? null;
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(
    activeLog?.id ?? null
  );

  const isActive = !!workoutLogId;

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">
        {scheduledWorkout.workout.name}
      </h1>

      {/* START / STOP */}
      {!isActive ? (
        <button
          className="px-4 py-2 border rounded"
          onClick={async () => {
            const id = await startWorkout(scheduledWorkout.id);
            setWorkoutLogId(id);
          }}
        >
          Start workout
        </button>
      ) : (
        <button
          className="px-4 py-2 border rounded text-red-600"
          onClick={async () => {
            await stopWorkout(workoutLogId);
            setWorkoutLogId(null);
          }}
        >
          Finish workout
        </button>
      )}

      {/* EXERCISES */}
      <ul className="space-y-3">
        {scheduledWorkout.workout.exercises.map((we) => (
          <ExerciseLogger
            key={we.id}
            exercise={we.exercise}
            prescribed={we.prescribed as Prescribed}
            workoutLogId={workoutLogId}
            disabled={!isActive}
          />
        ))}
      </ul>
    </div>
  );
}
