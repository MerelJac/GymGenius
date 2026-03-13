// src/app/(client)/profile/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { BodyMetricLogger } from "@/app/components/clients/BodyMetricLogger";
import { LogoutButton } from "@/app/components/Logout";
import ClientProfileSection from "@/app/components/clients/ClientProfileSection";
import { ClientProfilePageUser } from "@/types/client";
import Link from "next/link";
import { BillingManagerServer } from "@/app/components/billing/BillingManagerServer";
import { Suspense } from "react";

// ─── Skeletons ────────────────────────────────────────────────────────────────

function FeedSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2 animate-pulse px-1">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 rounded-2xl bg-surface2" />
      ))}
    </div>
  );
}

function MetricsSkeleton() {
  return <div className="h-40 rounded-2xl bg-surface2 animate-pulse" />;
}

function BillingSkeleton() {
  return <div className="h-24 rounded-2xl bg-surface2 animate-pulse" />;
}

// ─── Async data components ────────────────────────────────────────────────────

async function WorkoutsSection({ userId }: { userId: string }) {
  // Run both queries in parallel instead of sequentially
  const [user, userCreatedWorkouts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        bodyMetrics: true,
        scheduledWorkouts: {
          where: { status: "SCHEDULED" },
          orderBy: { scheduledDate: "desc" },
          take: 15,
          include: { workout: true },
        },
        workoutLogs: {
          where: { status: "COMPLETED" },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { scheduled: { include: { workout: true } } },
        },
        additionalWorkouts: {
          orderBy: { performedAt: "desc" },
          take: 5,
          include: { type: true },
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        bodyMetrics: true,
        scheduledWorkouts: {
          where: { status: "COMPLETED" },
          orderBy: { scheduledDate: "desc" },
          take: 15,
          include: { workout: true },
        },
        workoutLogs: {
          where: { status: "COMPLETED" },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { scheduled: { include: { workout: true } } },
        },
        additionalWorkouts: {
          orderBy: { performedAt: "desc" },
          take: 5,
          include: { type: true },
        },
      },
    }),
  ]);

  if (!user || !userCreatedWorkouts) return notFound();

  console.log("Scheduled workouts: ", user.scheduledWorkouts);
  console.log("userCreated workouts: ", userCreatedWorkouts);

  const upcomingWorkouts = user.scheduledWorkouts.filter(
    (sw) => !sw.workout.programId?.startsWith("__client-workouts-"),
  );
  const myWorkouts = userCreatedWorkouts.scheduledWorkouts.filter(
    (sw) => sw.workout.programId === `__client-workouts-${userId}`,
  );

  type HistoryItem =
    | { kind: "scheduled"; id: string; title: string; date: Date; href: string }
    | { kind: "additional"; id: string; title: string; date: Date; notes: string | null; distance: number | null; duration: number | null };

  const historyItems: HistoryItem[] = [
    ...user.workoutLogs.map((log) => ({
      kind: "scheduled" as const,
      id: log.id,
      title: log.scheduled?.workout?.name ?? "Workout",
      date: log.createdAt,
      href: `/workouts/${log.scheduledId}`,
    })),
    ...user.additionalWorkouts.map((w) => ({
      kind: "additional" as const,
      id: w.id,
      title: w.type.name,
      date: w.performedAt,
      notes: w.notes,
      duration: w.duration,
      distance: w.distance,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  return (
    <>
      {/* Upcoming Workouts */}
      <div>
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="section-title">Upcoming Workouts</h2>
        </div>
        {upcomingWorkouts.length === 0 ? (
          <p className="text-sm text-gray-500">No upcoming workouts scheduled</p>
        ) : (
          <ul className="feed">
            {upcomingWorkouts.map((sw) => (
              <li key={sw.id}>
                <Link
                  href={`/workouts/${sw.id}`}
                  className="flex items-center gap-3 bg-surface border border-surface2 rounded-2xl px-4 py-3 active:scale-[0.98] transition-transform feed-item"
                >
                  <div className="feed-info">
                    <p className="feed-name">{sw.workout.name}</p>
                    <p className="feed-date">{sw.scheduledDate.toLocaleDateString()}</p>
                  </div>
                  <span className="btn-arrow">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* My Workouts */}
      <div>
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="section-title">Workouts You Created</h2>
          <Link href="/workouts/my" className="text-xs text-muted hover:text-orange-500 transition-colors">
            See all →
          </Link>
        </div>
        {myWorkouts.length === 0 ? (
          <p className="text-sm text-gray-500">No client created workouts</p>
        ) : (
          <ul className="feed">
            {myWorkouts.map((sw) => (
              <li key={sw.id}>
                <Link
                  href={`/workouts/${sw.id}`}
                  className="flex items-center gap-3 bg-surface border border-surface2 rounded-2xl px-4 py-3 active:scale-[0.98] transition-transform feed-item"
                >
                  <div className="feed-info">
                    <p className="feed-name">{sw.workout.name}</p>
                    <p className="feed-date">{sw.scheduledDate.toLocaleDateString()}</p>
                  </div>
                  <span className="btn-arrow">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Body Metrics */}
      <section className="trainer-card">
        <div className="flex items-center justify-between mb-4 flex-col">
          <h2 className="section-title">Body Metrics</h2>
          <BodyMetricLogger />
        </div>
        {user.bodyMetrics.length === 0 ? (
          <p className="text-sm text-muted italic">No body metrics logged yet.</p>
        ) : (
          <div className="body-stat">
            {user.bodyMetrics
              .slice()
              .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
              .map((metric) => (
                <div key={metric.id} className="bs-stat">
                  <div className="flex gap-5 text-right">
                    <div>
                      <p className="bs-label">Weight</p>
                      <p className="bs-val">{metric.weight ? `${metric.weight} lb` : "—"}</p>
                    </div>
                    <div>
                      <p className="bs-label">Body Fat</p>
                      <p className="bs-val">{metric.bodyFat ? `${metric.bodyFat}%` : "—"}</p>
                    </div>
                    <div>
                      <p className="bs-label">Logged</p>
                      <p className="bs-val-sub-label">{new Date(metric.recordedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="section-header">Recent Activity</h2>
          <Link href="/workouts/history" className="text-xs text-muted hover:text-orange-500 transition-colors">
            See all →
          </Link>
        </div>
        {historyItems.length === 0 ? (
          <p className="text-sm text-muted px-5">No activity logged yet</p>
        ) : (
          <ul className="px-5 flex flex-col gap-2">
            {historyItems.map((item) => {
              const isAdditional = item.kind === "additional";
              const content = (
                <>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${isAdditional ? "bg-lime-green/10" : "bg-mint/10"}`}>
                    {isAdditional ? "😎" : "💪"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="feed-name">{item.title}</p>
                    <p className="feed-date">{item.date.toLocaleDateString()}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${isAdditional ? "text-lime-green bg-lime-green/10" : "text-mint bg-mint/10"}`}>
                    {isAdditional ? "Extra" : "Workout"}
                  </span>
                </>
              );
              return (
                <li key={`${item.kind}-${item.id}`}>
                  {item.kind === "scheduled" ? (
                    <Link href={item.href} className="flex items-center gap-3 bg-surface border border-surface2 rounded-2xl px-4 py-3 active:scale-[0.98] transition-transform">
                      {content}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 bg-surface border border-surface2 rounded-2xl px-4 py-3">
                      {content}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

async function ProfileSection({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, bodyMetrics: true, scheduledWorkouts: false, workoutLogs: false, additionalWorkouts: false },
  }) as ClientProfilePageUser | null;

  if (!user) return notFound();
  return <ClientProfileSection user={user} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ClientProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();

  const userId = session.user.id;

  // Fetch just enough for the header instantly
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { firstName: true },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header — instant */}
      <div className="greeting">
        <h1>Your Profile</h1>
        <p className="text-sm text-gray-500">Manage your personal details and training history</p>
      </div>

      {/* Profile card — streams in quickly (profile + bodyMetrics only) */}
      <Suspense fallback={<div className="h-32 rounded-2xl bg-surface2 animate-pulse" />}>
        <ProfileSection userId={userId} />
      </Suspense>

      {/* All workout sections — streams in together once both parallel queries resolve */}
      <Suspense fallback={
        <div className="space-y-8">
          <FeedSkeleton rows={4} />
          <FeedSkeleton rows={3} />
          <MetricsSkeleton />
          <FeedSkeleton rows={4} />
        </div>
      }>
        <WorkoutsSection userId={userId} />
      </Suspense>

      {/* Billing — streams in independently, often slowest */}
      <Suspense fallback={<BillingSkeleton />}>
        <BillingManagerServer />
      </Suspense>

      {/* Logout — instant client component */}
      <div className="pt-2 flex justify-center">
        <LogoutButton />
      </div>
    </div>
  );
}