// src/app/client/workouts/[scheduledWorkoutId]/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import WorkoutRunner from "@/app/components/workout/WorkoutRunner";

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
          exercises: {
            include: { exercise: true },
            orderBy: { order: "asc" },
          },
        },
      },
      workoutLogs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          exercises: {
            include: {
              exercise: true, // 👈 so viewer can show names
            },
          },
        },
      },
    },
  });

  if (!scheduledWorkout) return notFound();

  return <WorkoutRunner scheduledWorkout={scheduledWorkout} />;
}
