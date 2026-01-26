// src/app/client/workouts/[scheduledWorkoutId]/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import WorkoutRunner from "@/app/components/workout/WorkoutRunner";
import { BackButton } from "@/app/components/BackButton";

export default async function ClientWorkoutPage({
  params,
}: {
  params: { scheduledWorkoutId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();

const scheduledWorkout = await prisma.scheduledWorkout.findFirst({
  where: {
    id: params.scheduledWorkoutId,
    clientId: session.user.id,
  },
  include: {
    workout: {
      include: {
        workoutSections: {
          orderBy: { order: "asc" },
          include: {
            exercises: {
              orderBy: { order: "asc" },
              include: {
                exercise: true,
              },
            },
          },
        },
      },
    },
    workoutLogs: {
      orderBy: { createdAt: "desc" },
      take: 1,
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


  if (!scheduledWorkout) return notFound();

  return (
    <>
      <BackButton route={"/dashboard"} />
      <WorkoutRunner scheduledWorkout={scheduledWorkout} />
    </>
  );
}
