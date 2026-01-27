import { prisma } from "@/lib/prisma";
import { WorkoutStatus } from "@prisma/client";

export async function getClientDashboardStats(clientId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const workouts = await prisma.scheduledWorkout.findMany({
    where: {
      clientId,
      scheduledDate: {
        gte: new Date(today.getTime() - 30 * 86400000),
      },
    },
    orderBy: { scheduledDate: "asc" },
  });

  // ---------- ON-PLAN STREAK ----------
  let streak = 0;

  if (workouts.length > 0) {
    const firstWorkoutDate = new Date(workouts[0].scheduledDate);
    firstWorkoutDate.setHours(0, 0, 0, 0);

    const hasAnyCompleted = workouts.some(
      (w) => w.status === WorkoutStatus.COMPLETED
    );

    if (hasAnyCompleted) {
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);

        // Stop before program started
        if (date < firstWorkoutDate) break;

        const dayWorkouts = workouts.filter(
          (w) =>
            new Date(w.scheduledDate).toDateString() ===
            date.toDateString()
        );

        const hasScheduled = dayWorkouts.length > 0;
        const completed = dayWorkouts.some(
          (w) => w.status === WorkoutStatus.COMPLETED
        );

        // On-plan logic
        if (!hasScheduled || completed) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  // ---------- THIS WEEK ----------
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - startOfWeek.getDay());

  const weekWorkouts = workouts.filter(
    (w) => w.scheduledDate >= startOfWeek
  );

  const completedThisWeek = weekWorkouts.filter(
    (w) => w.status === WorkoutStatus.COMPLETED
  ).length;

  // ---------- NEXT WORKOUT ----------
  const nextWorkout = await prisma.scheduledWorkout.findFirst({
    where: {
      clientId,
      scheduledDate: { gt: today },
      status: WorkoutStatus.SCHEDULED,
    },
    orderBy: { scheduledDate: "asc" },
  });

  return {
    onPlanStreak: streak,
    completedThisWeek,
    scheduledThisWeek: weekWorkouts.length,
    nextWorkoutDate: nextWorkout?.scheduledDate ?? null,
  };
}
