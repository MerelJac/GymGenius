// src/components/dashboards/ClientDashboard.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ScheduledWorkoutDashboard } from "@/types/workout";
import { AdditionalWorkoutQuickAdd } from "../workout/AdditionalWorkoutQuickAdd";
import { ClientDashboardStats } from "../clients/ClientDashboardStats";
import { getClientDashboardStats } from "@/lib/clients/getClientDashboardStats";
import { getClientProgressSummary } from "@/lib/clients/clientProgress";
import { ProgressChanges } from "../clients/ProgressChanges";
import { redirect } from "next/navigation";
import { ContactTrainer } from "../clients/ContactTrainer";

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const clientId = session?.user?.id;
  const progress = await getClientProgressSummary(clientId);
  const stats = await getClientDashboardStats(clientId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const profile = await prisma.profile.findUnique({
    where: { userId: clientId },
    include: {
      user: {
        include: {
          trainer: true, // assumes User → trainer relation
        },
      },
    },
  });

  if (!profile?.waiverSignedAt) {
    redirect("/waiver");
  }

  const trainer = profile.user?.trainer;

  if (!trainer) {
    throw new Error("Trainer not found for client");
  }

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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
        <p className="text-sm text-gray-600">
          Nice to see you! You’re staying consistent — great work.
        </p>
      </div>

      <div className="space-y-6">
        <ClientDashboardStats
          streak={stats.onPlanStreak}
          completed={stats.completedThisWeek}
          scheduled={stats.scheduledThisWeek}
          nextWorkoutDate={stats.nextWorkoutDate}
        />
      </div>

      <TodayWorkout workout={todaysWorkout} />

      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
        <AdditionalWorkoutQuickAdd clientId={clientId} />
      </section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UpcomingWorkouts workouts={futureWorkouts} />
        <PastWorkouts workouts={pastWorkouts} />
      </div>

      {/* Placeholder cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-500 italic">
          <ProgressChanges
            strength={progress.strength}
            weight={progress.weight}
            bodyFat={progress.bodyFat}
          />
        </div>

        <ContactTrainer trainer={trainer} />
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
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-sm text-green-800">
        🎉 No workout scheduled for today — enjoy the rest day!
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Today’s Workout</h2>
        <span className="text-sm text-gray-500">
          {workout.scheduledDate.toLocaleDateString()}
        </span>
      </div>

      <Link
        href={`/workouts/${workout.id}`}
        className="text-blue-700 font-medium hover:underline text-lg"
      >
        {workout.workout.name}
      </Link>

      <ul className="text-sm text-gray-700 list-disc pl-5 space-y-0.5">
        {workout.workout.workoutSections.flatMap((section) =>
          section.exercises.map((we) => (
            <li key={we.id}>{we.exercise?.name}</li>
          )),
        )}
      </ul>

      <div className="pt-2">
        {workout.status === "COMPLETED" ? (
          <Link href={`/workouts/${workout.id}`}>
            <span className="inline-block px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium">
              Workout completed ✅
            </span>
          </Link>
        ) : (
          <Link href={`/workouts/${workout.id}`}>
            <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">
              Start workout
            </button>
          </Link>
        )}
      </div>
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
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
      <h2 className="font-semibold text-gray-900">Coming up</h2>

      <ul className="text-sm space-y-2">
        {workouts.map((w) => (
          <li key={w.id} className="flex justify-between items-center">
            <Link
              href={`/workouts/${w.id}`}
              className="text-gray-900 hover:underline"
            >
              {w.workout.name}
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
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
      <h2 className="font-semibold text-gray-900">Completed</h2>

      <ul className="text-sm space-y-2">
        {workouts.map((w) => (
          <li key={w.id} className="flex justify-between items-center">
            <Link
              href={`/workouts/${w.id}`}
              className="text-gray-900 hover:underline"
            >
              {w.workout.name}
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
