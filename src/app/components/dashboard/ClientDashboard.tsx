// src/components/dashboards/ClientDashboard.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ScheduledWorkoutDashboard } from "@/types/workout";

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const upcomingWorkouts = await prisma.scheduledWorkout.findMany({
    where: {
      clientId: session.user.id,
      scheduledDate: {
        gte: today,
      },
    },
    include: {
      workout: {
        include: {
          exercises: {
            include: {
              exercise: true,
            },
            orderBy: { order: "asc" },
          },
        },
      },
    },
    orderBy: {
      scheduledDate: "asc",
    },
    take: 5, // today + next few
  });

  const todaysWorkout = upcomingWorkouts.find(
    (w) => w.scheduledDate < tomorrow,
  );

  const futureWorkouts = upcomingWorkouts.filter(
    (w) => w.scheduledDate >= tomorrow,
  );

  const pastWorkouts = upcomingWorkouts.filter((w) => w.scheduledDate <= today);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Client Dashboard</h1>

      <TodayWorkout workout={todaysWorkout} />

      <UpcomingWorkouts workouts={futureWorkouts} />

      <PastWorkouts workouts={pastWorkouts} />

      <div className="rounded border p-4">
        <p>Progress overview (coming next)</p>
      </div>

      <div className="rounded border p-4">
        <p>Messages from your trainer (coming next)</p>
      </div>
    </div>
  );
}

function TodayWorkout({
  workout,
}: {
  workout: ScheduledWorkoutDashboard | undefined;
}) {
  if (!workout) {
    return (
      <div className="rounded border p-4 text-sm text-gray-500">
        No workout scheduled for today 🎉
      </div>
    );
  }

  return (
    <div className="rounded border p-4 space-y-2">
      <h2 className="font-medium">Today’s Workout</h2>

      <p className="text-sm text-gray-600">
        <Link href={`/workouts/${workout.id}`}>
          <button>{workout.workout.name}</button>
        </Link>
      </p>

      <ul className="text-sm list-disc pl-5">
        {workout.workout.exercises.map((we) => (
          <li key={we.id}>{we.exercise.name}</li>
        ))}
      </ul>

      <button className="mt-2 text-sm underline">Start workout</button>
    </div>
  );
}

function UpcomingWorkouts({
  workouts,
}: {
  workouts: ScheduledWorkoutDashboard[];
}) {
  if (workouts.length === 0) return null;

  return (
    <div className="rounded border p-4 space-y-2">
      <h2 className="font-medium">Coming up</h2>

      <ul className="text-sm space-y-1">
        {workouts.map((w) => (
          <li key={w.id} className="flex justify-between">
            <Link href={`/workouts/${w.id}`}>
              <span>{w.workout.name}</span>
            </Link>
            <span className="text-gray-500">
              {w.scheduledDate.toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PastWorkouts({ workouts }: { workouts: ScheduledWorkoutDashboard[] }) {
  if (workouts.length === 0) return null;

  return (
    <div className="rounded border p-4 space-y-2">
      <h2 className="font-medium">Coming up</h2>

      <ul className="text-sm space-y-1">
        {workouts.map((w) => (
          <li key={w.id} className="flex justify-between">
            <Link href={`/workouts/${w.id}`}>
              <span>{w.workout.name}</span>
            </Link>
            <span className="text-gray-500">
              {w.scheduledDate.toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
