import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();

  const trainerId = session.user.id;

  const scheduledWorkout = await prisma.scheduledWorkout.findFirst({
    where: {
      id: params.scheduledWorkoutId,
      // Only return the workout if the client belongs to the requesting trainer or themselves (client is viewing their own workout)
      OR: [
        { client: { trainerId } },
        { clientId: session.user.id },
      ],
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
        <div className="greeting">
          <h1>Workout completed!</h1>
        </div>
      )}

      <ExerciseLogViewer logs={logs} />
    </div>
  );
}