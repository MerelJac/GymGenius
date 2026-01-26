"use client";

import { useState } from "react";
import { Performed, Prescribed } from "@/types/prescribed";
import {
  startWorkout,
  stopWorkout,
} from "@/app/(client)/workouts/[scheduledWorkoutId]/actions";
import { ExerciseLogger } from "./ExerciseLogger";
import { ExerciseLog, ScheduledWorkoutWithLogs } from "@/types/workout";
import { ExerciseLogViewer } from "./ExerciseLogViewer";
import { useRouter } from "next/navigation";
import { assertPrescribed } from "@/app/utils/assertPrescribed";

export default function WorkoutRunner({
  scheduledWorkout,
}: {
  scheduledWorkout: ScheduledWorkoutWithLogs;
}) {
  console.log('schedueld workouts', scheduledWorkout)
  const activeLog = scheduledWorkout.workoutLogs[0] ?? null;
  const isActive = activeLog?.status === "IN_PROGRESS" && !activeLog.endedAt;
  const router = useRouter();

  const isCompleted = activeLog?.status === "COMPLETED";
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(
    activeLog?.id ?? null,
  );


const logs: ExerciseLog[] =
  scheduledWorkout.workout.workoutSections.flatMap((section) =>
    section.exercises.map((we) => {
      const log = activeLog.exercises.find(
        (l) => l.exerciseId === we.exercise?.id
      );

      return {
        id: log?.id ?? `planned-${we.id}`,
        workoutLogId: activeLog.id,
        exerciseId: we.exercise!.id,
        exerciseName: we.exercise!.name,

        // 🔑 FIX: assert the JSON → domain type
        prescribed: assertPrescribed(we.prescribed),

        // 🔑 FIX: cast performed safely
        performed: log?.performed
          ? (log.performed as Performed)
          : null,

        substitutedFrom: log?.substitutedFrom ?? null,
        substitutionReason: log?.substitutionReason ?? null,
      };
    })
  );


  if (isCompleted) {
    return (
      <>
        <div className="rounded bg-green-50 border p-3 text-green-700">
          Workout completed 🎉
        </div>

        <ExerciseLogViewer
          logs={logs}
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
            router.refresh();
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
            router.refresh();
          }}
        >
          Finish workout
        </button>
      )}

      {/* EXERCISES */}
      <div className="space-y-6">
        {scheduledWorkout.workout.workoutSections.map((section) => (
          <div key={section.id} className="space-y-3">
            {/* SECTION HEADER */}
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
              {section.title}
            </h3>

            <ul className="space-y-3">
              {section.exercises.map((we) => {
                if (!we.exercise) return null;

                return (
                  <ExerciseLogger
                    key={we.id}
                    exercise={we.exercise}
                    prescribed={assertPrescribed(we.prescribed)}
                    workoutLogId={workoutLogId}
                    disabled={!isActive}
                    notes={we.notes}
                  />
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
