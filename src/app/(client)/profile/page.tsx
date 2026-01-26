// src/app/(client)/profile/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { BodyMetricLogger } from "@/app/components/clients/BodyMetricLogger";
import { ClientProfileEditor } from "@/app/components/clients/ClientProfileEditor";
import { LogoutButton } from "@/app/components/Logout";

export default async function ClientProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      bodyMetrics: true,
      scheduledWorkouts: {
        orderBy: { scheduledDate: "asc" },
        take: 5,
        include: {
          workout: true,
        },
      },
      workoutLogs: {
        where: { status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) return notFound();

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
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-3 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Personal Info</h2>

        <div className="text-sm space-y-1">
          <div>
            <span className="font-medium text-gray-700">Email:</span>{" "}
            <span className="text-gray-900">{user.email}</span>
          </div>

          <div className="space-y-1">
            <span className="font-medium text-gray-700">Name:</span>

            <div className="text-gray-900">
              {user.profile?.firstName} {user.profile?.lastName}
            </div>
          </div>

          {user.profile?.experience && (
            <div>
              <span className="font-medium text-gray-700">Experience:</span>{" "}
              <span className="text-gray-900">{user.profile.experience}</span>
            </div>
          )}

          {user.profile?.injuryNotes && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              <span className="font-medium">Injuries:</span>{" "}
              {user.profile.injuryNotes}
            </div>
          )}
        </div>
      </section>

      <ClientProfileEditor
        clientId={user.id}
        firstName={user.profile?.firstName}
        lastName={user.profile?.lastName}
      />
      {/* Upcoming Workouts */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-3 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Upcoming Workouts
        </h2>

        {user.scheduledWorkouts.length === 0 ? (
          <p className="text-sm text-gray-500">
            No upcoming workouts scheduled
          </p>
        ) : (
          <ul className="text-sm space-y-2">
            {user.scheduledWorkouts.map((sw) => (
              <li key={sw.id} className="flex justify-between items-center">
                <span className="text-gray-900">{sw.workout.name}</span>
                <span className="text-gray-500">
                  {sw.scheduledDate.toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Body Metrics */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-3 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Log Body Metrics
        </h2>
        <BodyMetricLogger />
      </section>

      {/* Workout History */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-3 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Recent Workouts</h2>

        {user.workoutLogs.length === 0 ? (
          <p className="text-sm text-gray-500">No completed workouts yet</p>
        ) : (
          <ul className="text-sm space-y-2">
            {user.workoutLogs.map((log) => (
              <li key={log.id} className="flex justify-between items-center">
                <span className="text-gray-900">Workout completed</span>
                <span className="text-gray-500">
                  {log.createdAt.toLocaleDateString()}
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
