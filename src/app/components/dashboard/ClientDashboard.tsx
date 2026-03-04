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
import { CreateWorkoutForLater } from "../workout/CreateWorkoutForLater";

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const clientId = session?.user?.id;
  const progress = await getClientProgressSummary(clientId);
  const stats = await getClientDashboardStats(clientId);
  const now = new Date();

  const pstNow = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }),
  );

  pstNow.setHours(0, 0, 0, 0);

  const today = pstNow;
  console.log(today, "today's date client dashboard");
  const profile = await prisma.profile.findUnique({
    where: { userId: clientId },
    include: {
      user: {
        include: {
          trainer: {
            include: {
              profile: true,
            },
          },
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

  const trainerForContact = {
    email: trainer.email,
    phone: trainer.profile?.phone ?? null,
    name:
      trainer.profile?.firstName || trainer.profile?.lastName
        ? `${trainer.profile?.firstName ?? ""} ${trainer.profile?.lastName ?? ""}`.trim()
        : null,
  };

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
    take: 8, // today + next few
  });

  const pastWorkouts = await prisma.scheduledWorkout.findMany({
    where: {
      clientId,
      scheduledDate: { lt: today },
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
    orderBy: { scheduledDate: "desc" },
    take: 8,
  });

  const todaysWorkout = upcomingWorkouts.find(
    (w) => w.scheduledDate < tomorrow,
  );
  const futureWorkouts = upcomingWorkouts.filter(
    (w) => w.scheduledDate >= tomorrow,
  );
  const completedWorkouts = pastWorkouts.filter(
    (w) => w.status === "COMPLETED",
  );

  const userName = profile.firstName ?? "diehard";

  const overdueWorkouts = pastWorkouts.filter((w) => w.status !== "COMPLETED");

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Greeting */}
      <div className="greeting">
        <h1>
          Hello, <span>{userName}</span>
        </h1>
        <p>You are staying consistent — great work.</p>
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

      <AdditionalWorkoutQuickAdd clientId={clientId} />
      <CreateWorkoutForLater clientId={clientId} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UpcomingWorkouts workouts={futureWorkouts} />
        <OverdueWorkouts workouts={overdueWorkouts} />
        <PastWorkouts workouts={completedWorkouts} />
      </div>

      {/* Placeholder cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProgressChanges
          clientId={clientId}
          strength={progress.strength}
          weight={progress.weight}
          bodyFat={progress.bodyFat}
        />

        <ContactTrainer trainer={trainerForContact} />
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
    <div className="workout-card">
      <div className="wc-top">
        <span className="wc-badge">Today&apos;s Workout</span>
        <span className="wc-date">
          {" "}
          {workout.scheduledDate.toLocaleDateString()}
        </span>
      </div>
      <div className="wc-title">
        {" "}
        <Link href={`/workouts/${workout.id}`}>{workout.workout.name}</Link>
      </div>
      <div className="wc-sub">
        <ul className="text-sm text-gray-700 list-disc pl-5 space-y-0.5">
          {workout.workout.workoutSections.flatMap((section) =>
            section.exercises.map((we) => (
              <li key={we.id}>{we.exercise?.name}</li>
            )),
          )}
        </ul>
      </div>

      {workout.status === "COMPLETED" ? (
        <Link href={`/workouts/${workout.id}`}>
          <button className="btn-primary">
            Completed <span className="btn-arrow">→</span>
          </button>
        </Link>
      ) : (
        <Link href={`/workouts/${workout.id}`}>
          <button className="btn-primary">
            View Workout <span className="btn-arrow">→</span>
          </button>
        </Link>
      )}
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
    <div>
      <div className="flex items-center justify-between px-5 py-3">
        <h2 className="section-title">Coming Up</h2>
        {/* <span className="text-xs text-muted">See all</span> */}
      </div>

      <ul className="feed">
        {workouts.map((w) => {
          const done = w.status === "COMPLETED";

          return (
            <li key={w.id}>
              <Link
                href={`/workouts/${w.id}`}
                className="flex items-center gap-3 bg-surface border border-surface2 rounded-2xl px-4 py-3 active:scale-[0.98] transition-transform feed-item"
              >
                {/* Icon */}
                <div
                  className={`feed-icon ${
                    done ? "bg-mint/10" : "bg-danger/10"
                  }`}
                >
                  {done ? "✅" : "⚠️"}
                </div>

                {/* Info */}
                <div className="feed-info">
                  <p className="feed-name">{w.workout.name}</p>
                  <p className="feed-date">
                    {w.scheduledDate.toLocaleDateString()}
                  </p>
                </div>

                {/* Status badge */}
                <span className={`feed-status ${done ? "done" : "missed"}`}>
                  {done ? "Done" : "Missed"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function OverdueWorkouts({
  workouts,
}: {
  workouts: ScheduledWorkoutDashboard[];
}) {
  console.log("overdue workouts", workouts.slice(0, 2));
  return (
    <div>
      <div className="flex items-center justify-between px-5 py-3">
        <h2 className="section-title">Missed</h2>
        {/* <span className="text-xs text-muted">See all</span> */}
      </div>

      <ul className="feed">
        {workouts.map((w) => {
          const done = w.status === "COMPLETED";

          return (
            <li key={w.id}>
              <Link
                href={`/workouts/${w.id}`}
                className="flex items-center gap-3 bg-surface border border-surface2 rounded-2xl px-4 py-3 active:scale-[0.98] transition-transform feed-item"
              >
                {/* Icon */}
                <div
                  className={`feed-icon ${
                    done ? "bg-mint/10" : "bg-danger/10"
                  }`}
                >
                  {done ? "✅" : "⚠️"}
                </div>

                {/* Info */}
                <div className="feed-info">
                  <p className="feed-name">{w.workout.name}</p>
                  <p className="feed-date">
                    {w.scheduledDate.toLocaleDateString()}
                  </p>
                </div>

                {/* Status badge */}
                <span className={`feed-status ${done ? "done" : "missed"}`}>
                  {done ? "Done" : "Missed"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PastWorkouts({ workouts }: { workouts: ScheduledWorkoutDashboard[] }) {
  if (workouts.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between px-5 py-3">
        <h2 className="section-title">Recent Activity</h2>
        {/* <span className="text-xs text-muted">See all</span> */}
      </div>

      <ul className="feed">
        {workouts.map((w) => {
          const done = w.status === "COMPLETED";

          return (
            <li key={w.id}>
              <Link
                href={`/workouts/${w.id}`}
                className="flex items-center gap-3 bg-surface border border-surface2 rounded-2xl px-4 py-3 active:scale-[0.98] transition-transform feed-item"
              >
                {/* Icon */}
                <div
                  className={`feed-icon ${
                    done ? "bg-mint/10" : "bg-danger/10"
                  }`}
                >
                  {done ? "✅" : "⚠️"}
                </div>

                {/* Info */}
                <div className="feed-info">
                  <p className="feed-name">{w.workout.name}</p>
                  <p className="feed-date">
                    {w.scheduledDate.toLocaleDateString()}
                  </p>
                </div>

                {/* Status badge */}
                <span className={`feed-status ${done ? "done" : "missed"}`}>
                  {done ? "Done" : "Missed"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
