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
import BillingStatusNotice from "../billing/BillingStatusNotice";
import { Suspense } from "react";
import { CreateWorkoutForNow } from "../workout/CreateWorkoutForNow";

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

// ─── Skeletons ────────────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 rounded-2xl bg-surface2" />
      ))}
    </div>
  );
}

function WorkoutCardSkeleton() {
  return <div className="h-40 rounded-2xl bg-surface2 animate-pulse" />;
}

function FeedSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 rounded-2xl bg-surface2" />
      ))}
    </div>
  );
}

function ProgressSkeleton() {
  return <div className="h-48 rounded-2xl bg-surface2 animate-pulse" />;
}

// ─── Async data components ────────────────────────────────────────────────────

async function StatsSection({ clientId }: { clientId: string }) {
  const stats = await getClientDashboardStats(clientId);
  return (
    <ClientDashboardStats
      streak={stats.onPlanStreak}
      completed={stats.completedThisWeek}
      scheduled={stats.scheduledThisWeek}
      nextWorkoutDate={stats.nextWorkoutDate}
    />
  );
}

async function WorkoutsSection({ clientId }: { clientId: string }) {
  const now = new Date();
  const pstNow = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }),
  );
  pstNow.setHours(0, 0, 0, 0);
  const today = pstNow;
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const [upcomingWorkouts, pastWorkouts] = await Promise.all([
    prisma.scheduledWorkout.findMany({
      where: {
        clientId,
        scheduledDate: { gte: today },
      },
      include: {
        workout: {
          include: {
            workoutSections: {
              orderBy: { order: "asc" },
              include: {
                exercises: {
                  orderBy: { order: "asc" },
                  include: { exercise: true },
                },
              },
            },
          },
        },
      },
      orderBy: { scheduledDate: "asc" },
      take: 8,
    }),
    prisma.scheduledWorkout.findMany({
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
                  include: { exercise: true },
                },
              },
            },
          },
        },
      },
      orderBy: { scheduledDate: "desc" },
      take: 8,
    }),
  ]);

  const todaysWorkout = upcomingWorkouts.find(
    (w) => w.scheduledDate < tomorrow,
  );
  const futureWorkouts = upcomingWorkouts.filter(
    (w) => w.scheduledDate >= tomorrow,
  );
  const completedWorkouts = pastWorkouts.filter(
    (w) => w.status === "COMPLETED",
  );
  const overdueWorkouts = pastWorkouts.filter((w) => w.status !== "COMPLETED");

  return (
    <>
      <TodayWorkout workout={todaysWorkout} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UpcomingWorkouts workouts={futureWorkouts} />
        <OverdueWorkouts workouts={overdueWorkouts} />
        <PastWorkouts workouts={completedWorkouts} />
      </div>
    </>
  );
}

async function ProgressSection({ clientId }: { clientId: string }) {
  const progress = await getClientProgressSummary(clientId);
  return (
    <ProgressChanges
      clientId={clientId}
      strength={progress.strength}
      weight={progress.weight}
      bodyFat={progress.bodyFat}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const clientId = session.user.id;

  // Fast sequential gates — these must resolve before we can render anything meaningful
  const [access, profile] = await Promise.all([
    getUserAccess(clientId),
    prisma.profile.findUnique({
      where: { userId: clientId },
      include: {
        user: {
          include: {
            trainer: { include: { profile: true } },
          },
        },
      },
    }),
  ]);

  console.log("access: ", access);

  if (!access.hasAccess) redirect("/billing");
  if (!profile?.waiverSignedAt) redirect("/waiver");

  const trainer = profile.user?.trainer;
  if (!trainer) throw new Error("Trainer not found for client");

  const trainerForContact = {
    email: trainer.email,
    phone: trainer.profile?.phone ?? null,
    name:
      trainer.profile?.firstName || trainer.profile?.lastName
        ? `${trainer.profile?.firstName ?? ""} ${trainer.profile?.lastName ?? ""}`.trim()
        : null,
  };

  const userName = profile.firstName ?? "diehard";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Greeting — instant, no data needed */}
      <div className="greeting">
        <h1>
          Hello, <span className="break-words">{userName}</span>
        </h1>
        <p>You are staying consistent — great work.</p>
      </div>

      <BillingStatusNotice access={access} />

      {/* Stats — streams in independently */}
      <div className="space-y-6">
        <Suspense fallback={<StatsSkeleton />}>
          <StatsSection clientId={clientId} />
        </Suspense>
      </div>

      {/* Workouts (today + upcoming + overdue + past) — biggest query, streams in */}
      <Suspense
        fallback={
          <div className="space-y-6">
            <WorkoutCardSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeedSkeleton />
              <FeedSkeleton />
            </div>
          </div>
        }
      >
        <WorkoutsSection clientId={clientId} />
      </Suspense>

      {/* Quick-add tools — client components, render instantly */}
<CreateWorkoutForNow clientId={clientId} />
      <CreateWorkoutForLater clientId={clientId} />
      <AdditionalWorkoutQuickAdd clientId={clientId} />

      {/* Progress + contact — streams in last (slowest query) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Suspense fallback={<ProgressSkeleton />}>
          <ProgressSection clientId={clientId} />
        </Suspense>
        <ContactTrainer trainer={trainerForContact} />
      </div>
    </div>
  );
}

// ─── UI components (unchanged) ───────────────────────────────────────────────

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
          {workout.scheduledDate.toLocaleDateString()}
        </span>
      </div>
      <div className="wc-title">
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
      <Link href={`/workouts/${workout.id}`}>
        <button className="btn-primary">
          {workout.status === "COMPLETED" ? "Completed" : "View Workout"}{" "}
          <span className="btn-arrow">→</span>
        </button>
      </Link>
    </div>
  );
}

function WorkoutFeedList({
  workouts,
}: {
  workouts: ScheduledWorkoutDashboard[];
}) {
  return (
    <ul className="feed">
      {workouts.map((w) => {
        const { icon, label, className, bgClass } = getStatusDisplay(w.status);
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
      </div>
      <WorkoutFeedList workouts={workouts} />
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
      <WorkoutFeedList workouts={workouts} />
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
      <WorkoutFeedList workouts={workouts} />
    </div>
  );
}
