import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Performed } from "@/types/prescribed";
import { ExerciseLog } from "@/types/workout";
import { ExerciseLogViewer } from "@/app/components/workout/ExerciseLogViewer";
import { assertPrescribed } from "@/app/utils/prescriptions/assertPrescribed";
import { BackButton } from "@/app/components/BackButton";

export default async function ViewWorkoutPage({
  params,
}: {
  params: { scheduledWorkoutId: string };
}) {
  const scheduledWorkout = await prisma.scheduledWorkout.findUnique({
    where: {
      id: params.scheduledWorkoutId,
    },
    include: {
      workoutLogs: {
        include: {
          exercises: {
            include: {
              exercise: true,
            },
          },
        },
      },
    },
  });

  if (!scheduledWorkout) {
    return notFound();
  }

  const activeLog = scheduledWorkout.workoutLogs[0] ?? null;
  const isCompleted = activeLog?.status === "COMPLETED";

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

  return (
    <div className="max-w-4xl mx-auto py-8">
                <BackButton route="/trainer" />
        
      {isCompleted && (
        <div className="rounded bg-green-50 border p-3 text-green-700 mb-6">
          Workout completed 🎉
        </div>
      )}

      <ExerciseLogViewer logs={logs} />
    </div>
  );
}