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
import { getUserAccess } from "@/lib/billing/access";
import { UpgradeButton } from "../billing/UpgradeButton";

export function getStatusDisplay(status: string) {
  switch (status) {
    case "COMPLETED":
      return {
        icon: "✅",
        label: "Done",
        className: "done",
        bgClass: "bg-mint/10",
      };
    case "IN_PROGRESS":
      return {
        icon: "🔥",
        label: "In Progress",
        className: "in-progress",
        bgClass: "bg-yellow-400/10",
      };
    case "SKIPPED":
      return {
        icon: "⏭️",
        label: "Skipped",
        className: "skipped",
        bgClass: "bg-surface2",
      };
    default:
      return {
        icon: "⚠️",
        label: "Missed",
        className: "missed",
        bgClass: "bg-danger/10",
      };
  }
}

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const clientId = session?.user?.id;
  const access = await getUserAccess(clientId);
  console.log("access: ", access);
  // 👇 Add this block
  if (!access.hasAccess) {
    redirect("/billing");
  }
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
          Hello, <span className="break-words">{userName}</span>
        </h1>
        <p>You are staying consistent — great work.</p>
      </div>

      {/* Trial / Billing Banner */}
      {access.reason === "trial" &&
        access.trialEndsAt &&
        (() => {
          const daysLeft = Math.ceil(
            (new Date(access.trialEndsAt).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24),
          );
          return (
            <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-lg">⏳</span>
                <div>
                  <p className="text-yellow-400 text-sm font-semibold tracking-wide">
                    Free Trial
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining —
                    upgrade to keep access.
                  </p>
                </div>
              </div>
              <UpgradeButton />
            </div>
          );
        })()}

      {access.reason === "grandfathered" && (
        <div className="rounded-xl border border-lime-400/20 bg-lime-400/5 px-5 py-4 flex items-center gap-3">
          <span className="text-lg">🎁</span>
          <div>
            <p className="text-lime-400 text-sm font-semibold tracking-wide">
              Complimentary Access
            </p>
            <p className="text-white/40 text-xs mt-0.5">
              Full access, on us — forever.
            </p>
          </div>
        </div>
      )}

      {access.reason === "CANCELED" && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="text-red-400 text-sm font-semibold tracking-wide">
                Subscription Ended
              </p>
              <p className="text-white/40 text-xs mt-0.5">
                Reactivate to regain full access.
              </p>
            </div>
          </div>
          <Link
            href="/billing/reactivate"
            className="shrink-0 text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/20 px-4 py-2 rounded-lg transition-colors"
          >
            Reactivate
          </Link>
        </div>
      )}

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
      <div className="stat-card accent-card">
        <div className="big-num">Rest day!</div>

        <p className="text-sm text-gray-500 mt-1">
          No workouts scheduled today.
        </p>
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
        <ul className="wc-sub">
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
          const { icon, label, className, bgClass } = getStatusDisplay(
            w.status,
          );
          return (
            <li key={w.id}>
              <Link
                href={`/workouts/${w.id}`}
                className="flex items-center gap-3 bg-surface border border-surface2 rounded-2xl px-4 py-3 active:scale-[0.98] transition-transform feed-item"
              >
                <div className={`feed-icon ${bgClass}`}>{icon}</div>
                <div className="feed-info">
                  <p className="feed-name">{w.workout.name}</p>
                  <p className="feed-date">
                    {w.scheduledDate.toLocaleDateString()}
                  </p>
                </div>
                <span className={`feed-status ${className}`}>{label}</span>
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
  if (workouts.length === 0) return null;
  return (
    <div>
      <div className="flex items-center justify-between px-5 py-3">
        <h2 className="section-title">Missed</h2>
        <Link
          href="/workouts/missed"
          className="text-xs text-muted hover:text-orange-500 transition-colors"
        >
          See all →
        </Link>
      </div>

      <ul className="feed">
        {workouts.map((w) => {
          const { icon, label, className, bgClass } = getStatusDisplay(
            w.status,
          );
          return (
            <li key={w.id}>
              <Link
                href={`/workouts/${w.id}`}
                className="flex items-center gap-3 bg-surface border border-surface2 rounded-2xl px-4 py-3 active:scale-[0.98] transition-transform feed-item"
              >
                <div className={`feed-icon ${bgClass}`}>{icon}</div>
                <div className="feed-info">
                  <p className="feed-name">{w.workout.name}</p>
                  <p className="feed-date">
                    {w.scheduledDate.toLocaleDateString()}
                  </p>
                </div>
                <span className={`feed-status ${className}`}>{label}</span>
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
        <Link
          href="/workouts/history"
          className="text-xs text-muted hover:text-orange-500 transition-colors"
        >
          See all →
        </Link>
      </div>

      <ul className="feed">
        {workouts.map((w) => {
          const { icon, label, className, bgClass } = getStatusDisplay(
            w.status,
          );
          return (
            <li key={w.id}>
              <Link
                href={`/workouts/${w.id}`}
                className="flex items-center gap-3 bg-surface border border-surface2 rounded-2xl px-4 py-3 active:scale-[0.98] transition-transform feed-item"
              >
                <div className={`feed-icon ${bgClass}`}>{icon}</div>
                <div className="feed-info">
                  <p className="feed-name">{w.workout.name}</p>
                  <p className="feed-date">
                    {w.scheduledDate.toLocaleDateString()}
                  </p>
                </div>
                <span className={`feed-status ${className}`}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
