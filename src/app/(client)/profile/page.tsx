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
import { ArrowRight } from "lucide-react";

export default async function ClientProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();

  const user: ClientProfilePageUser | null = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      bodyMetrics: true,
      scheduledWorkouts: {
        where: {
          status: "SCHEDULED",
        },
        orderBy: { scheduledDate: "asc" },
        take: 15,
        include: {
          workout: true,
        },
      },
      workoutLogs: {
        where: { status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          scheduled: {
            include: {
              workout: true,
            },
          },
        },
      },
      additionalWorkouts: {
        orderBy: { performedAt: "desc" },
        take: 5,
        include: {
          type: true,
        },
      },
    },
  });

  const userCreatedWorkouts: ClientProfilePageUser | null =
    await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        bodyMetrics: true,
        scheduledWorkouts: {
          where: {
            status: "COMPLETED",
          },
          orderBy: { scheduledDate: "desc" },
          take: 15,
          include: {
            workout: true,
          },
        },
        workoutLogs: {
          where: { status: "COMPLETED" },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            scheduled: {
              include: {
                workout: true,
              },
            },
          },
        },
        additionalWorkouts: {
          orderBy: { performedAt: "desc" },
          take: 5,
          include: {
            type: true,
          },
        },
      },
    });

  if (!user) return notFound();
  if (!userCreatedWorkouts) return notFound();

  console.log("Schedueld workouts: ", user.scheduledWorkouts);
  console.log("userCreated workouts: ", userCreatedWorkouts);

  const upcomingWorkouts = user.scheduledWorkouts.filter(
    (sw) => !sw.workout.programId?.startsWith("__client-workouts-"),
  );

  const myWorkouts = userCreatedWorkouts.scheduledWorkouts.filter(
    (sw) => sw.workout.programId === `__client-workouts-${user.id}`,
  );
  type HistoryItem =
    | {
        kind: "scheduled";
        id: string;
        title: string;
        date: Date;
        href: string;
      }
    | {
        kind: "additional";
        id: string;
        title: string;
        date: Date;
        notes: string | null;
        distance: number | null;
        duration: number | null;
      };

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
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-sm text-gray-500">
          Manage your personal details and training history
        </p>
      </div>

      {/* Profile */}
      <ClientProfileSection user={user} />
      {/* Upcoming Workouts */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-3 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Upcoming Workouts
        </h2>

        {upcomingWorkouts.length === 0 ? (
          <p className="text-sm text-gray-500">
            No upcoming workouts scheduled
          </p>
        ) : (
          <ul className="text-sm space-y-2">
            {upcomingWorkouts.map((sw) => (
              <li key={sw.id} className="flex justify-between items-center">
                <Link
                  href={`/workouts/${sw.workout.id}`}
                  className="text-gray-900 hover:underline flex flex-row items-center gap-2"
                >
                  {sw.workout.name}
                  <ArrowRight size={10} />
                </Link>

                <span className="text-gray-500">
                  {sw.scheduledDate.toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Client Made  Workouts */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-3 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Workouts You Created
        </h2>

        {myWorkouts.length === 0 ? (
          <p className="text-sm text-gray-500">No client created workouts</p>
        ) : (
          <ul className="text-sm space-y-2">
            {myWorkouts.map((sw) => (
              <li key={sw.id} className="flex justify-between items-center">
                <Link
                  href={`/workouts/${sw.id}`}
                  className="text-gray-900 hover:underline flex flex-row items-center gap-2"
                >
                  {sw.workout.name}
                  <ArrowRight size={10} />
                </Link>

                <span className="text-gray-500">
                  {sw.scheduledDate.toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Body Metrics */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Body Metrics</h2>

        <BodyMetricLogger />

        {user.bodyMetrics.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No body metrics logged yet.
          </p>
        ) : (
          <div className="space-y-3">
            {user.bodyMetrics
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.recordedAt).getTime() -
                  new Date(a.recordedAt).getTime(),
              )
              .map((metric) => (
                <div
                  key={metric.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm"
                >
                  {/* LEFT */}
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900">
                      {new Date(metric.recordedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex gap-4 text-right">
                    <div>
                      <div className="text-xs text-gray-500">Weight</div>
                      <div className="font-medium">
                        {metric.weight ? `${metric.weight} lb` : "—"}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Body Fat</div>
                      <div className="font-medium">
                        {metric.bodyFat ? `${metric.bodyFat}%` : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Workout History */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-3 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>

        {historyItems.length === 0 ? (
          <p className="text-sm text-gray-500">No activity logged yet</p>
        ) : (
          <ul className="text-sm space-y-2">
            {historyItems.map((item) => (
              <li
                key={`${item.kind}-${item.id}`}
                className="flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  {item.kind === "scheduled" ? (
                    <Link
                      href={item.href}
                      className="font-medium text-gray-900 hover:underline hover:text-blue-600 flex flex-row gap-2 items-center"
                    >
                      {item.title}
                       <ArrowRight size={10} />
                    </Link>
                  ) : (
                    <span className="font-medium text-gray-900">
                      {item.title}
                      {item.notes && ` • ${item.notes}`}
                      {item.duration && ` • ${item.duration} min`}
                      {item.distance && ` • ${item.distance} miles`}
                    </span>
                  )}

                  {item.kind === "additional" && (
                    <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                      Additional
                    </span>
                  )}
                </div>

                <span className="text-gray-500 pl-2">
                  {item.date.toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Logout */}
      <div className="pt-2 text-center">
        <LogoutButton />
      </div>
    </div>
  );
}
