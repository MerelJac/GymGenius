"use client";

import { useState } from "react";
import { Performed, Prescribed } from "@/types/prescribed";
import {
  startWorkout,
  stopWorkout,
} from "@/app/(client)/workouts/[scheduledWorkoutId]/actions";
import { ExerciseLogger } from "./ExerciseLogger";
import { ScheduledWorkoutWithLogs } from "@/types/workout";
import { ExerciseLogViewer } from "./ExerciseLogViewer";

export default function WorkoutRunner({
  scheduledWorkout,
}: {
  scheduledWorkout: ScheduledWorkoutWithLogs;
}) {
  const activeLog = scheduledWorkout.workoutLogs[0] ?? null;

  const isActive = activeLog?.status === "IN_PROGRESS" && !activeLog.endedAt;

  const isCompleted = activeLog?.status === "COMPLETED";
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(
    activeLog?.id ?? null,
  );

  if (isCompleted) {
    return (
      <>
        <div className="rounded bg-green-50 border p-3 text-green-700">
          Workout completed 🎉
        </div>

        <ExerciseLogViewer
          logs={activeLog.exercises.map((log) => ({
            ...log,
            prescribed: log.prescribed as Prescribed,
            performed: log.performed as Performed,
          }))}
        />
      </>
    );
  }

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
            if (!workoutLogId) return;

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
             notes={we.notes}
            prescribed={we.prescribed as Prescribed}
            workoutLogId={workoutLogId}
            disabled={!isActive}
          />
        ))}
      </ul>
    </div>
  );
}
