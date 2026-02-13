"use client";

import { useRef, useState } from "react";
import { Performed, Prescribed } from "@/types/prescribed";
import {
  alertTrainerOfCompletedWorkout,
  logExercise,
  startWorkout,
  stopWorkout,
} from "@/app/(client)/workouts/[scheduledWorkoutId]/actions";
import { ExerciseLogger } from "./ExerciseLogger";
import { ExerciseLog, ScheduledWorkoutWithLogs } from "@/types/workout";
import { ExerciseLogViewer } from "./ExerciseLogViewer";
import { useRouter } from "next/navigation";
import { assertPrescribed } from "@/app/utils/prescriptions/assertPrescribed";
import { AddExerciseToWorkout } from "./AddExerciseToWorkout";

export default function WorkoutRunner({
  scheduledWorkout,
}: {
  scheduledWorkout: ScheduledWorkoutWithLogs;
}) {
  const activeLog = scheduledWorkout.workoutLogs[0] ?? null;
  const isActive = activeLog?.status === "IN_PROGRESS" && !activeLog.endedAt;
  const router = useRouter();
  const clientId = scheduledWorkout.clientId;
  const isCompleted = activeLog?.status === "COMPLETED";
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(
    activeLog?.id ?? null,
  );
  const [finishingText, setFinishingText] = useState("Finish Workout");
  const [isFinishing, setIsFinishing] = useState(false);
  const [exerciseStates, setExerciseStates] = useState<
    {
      exerciseId: string;
      prescribed: Prescribed;
      performed: Performed;
      note: string;
      sectionId?: string | null;
    }[]
  >([]);

  const autoSaveFns = useRef<(() => Promise<void>)[]>([]);

  const logs: ExerciseLog[] = activeLog
    ? activeLog.exercises.map((log) => ({
        id: log.id,
        workoutLogId: activeLog.id,
        exerciseId: log.exerciseId,
        exerciseName: log.exercise.name,
        prescribed: assertPrescribed(log.prescribed),
        performed: log.performed as Performed,
        substitutedFrom: log.substitutedFrom ?? null,
        substitutionReason: log.substitutionReason ?? null,
      }))
    : [];

  if (isCompleted) {
    console.log("Completed workout logs:", logs);
    return (
      <>
        <div className="rounded bg-green-50 border p-3 text-green-700 my-4">
          Workout completed 🎉
        </div>

        <ExerciseLogViewer logs={logs} />
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
            autoSaveFns.current = []; // 🧼 CLEAR OLD REGISTRATIONS
            setWorkoutLogId(id);
            router.refresh();
          }}
        >
          Start workout
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            className="px-4 py-2 border rounded text-red-600"
            disabled={isFinishing}
            onClick={async () => {
              if (!workoutLogId || isFinishing) return;

              setIsFinishing(true);
              setFinishingText("Finishing...");

              // 🔐 Auto-save all unsaved exercises
              for (const ex of exerciseStates) {
                await logExercise(
                  workoutLogId,
                  ex.exerciseId,
                  ex.prescribed,
                  ex.performed,
                  ex.note,
                  ex.sectionId ?? null,
                );
              }

              await stopWorkout(workoutLogId);
              await alertTrainerOfCompletedWorkout(clientId, workoutLogId);
              setWorkoutLogId(null);
              router.refresh();
            }}
          >
            {finishingText}
          </button>
        </div>
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
              {section.exercises
                .filter(
                  (we) =>
                    !activeLog?.exercises.some(
                      (el) =>
                        el.exerciseId === we.exerciseId &&
                        el.sectionId === section.id,
                    ),
                )
                .map((we) => {
                  if (!we.exercise) return null;

                  return (
                    <ExerciseLogger
                      key={we.id}
                      exercise={we.exercise}
                      prescribed={assertPrescribed(we.prescribed)}
                      workoutLogId={workoutLogId}
                      clientId={clientId}
                      sectionId={section.id}
                      disabled={!isActive}
                      notes={we.notes}
                      onChange={(data) => {
                        setExerciseStates((prev) => {
                          const existing = prev.find(
                            (e) =>
                              e.exerciseId === data.exerciseId &&
                              e.sectionId === data.sectionId,
                          );

                          if (existing) {
                            return prev.map((e) =>
                              e.exerciseId === data.exerciseId &&
                              e.sectionId === data.sectionId
                                ? data
                                : e,
                            );
                          }

                          return [...prev, data];
                        });
                      }}
                    />
                  );
                })}
              {/* CLIENT-ADDED EXERCISES */}
              {activeLog?.exercises
                .filter((el) => el.sectionId === section.id)
                .map((el) => (
                  <ExerciseLogger
                    key={el.id}
                    exercise={el.exercise}
                    prescribed={assertPrescribed(el.prescribed)}
                    workoutLogId={workoutLogId}
                    clientId={clientId}
                    disabled={!isActive}
                    sectionId={section.id}
                    notes={el.substitutionReason ?? "Client-added exercise"}
                    isClientAdded // 👈 ADD THIS FLAG
                    exerciseLogId={el.id} // 👈 PASS LOG ID
                    onChange={(data) => {
                      setExerciseStates((prev) => {
                        const existing = prev.find(
                          (e) =>
                            e.exerciseId === data.exerciseId &&
                            e.sectionId === data.sectionId,
                        );

                        if (existing) {
                          return prev.map((e) =>
                            e.exerciseId === data.exerciseId &&
                            e.sectionId === data.sectionId
                              ? data
                              : e,
                          );
                        }

                        return [...prev, data];
                      });
                    }}
                  />
                ))}
            </ul>
            {workoutLogId && (
              <AddExerciseToWorkout
                workoutLogId={workoutLogId}
                sectionId={section.id}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
