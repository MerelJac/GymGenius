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
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Your Profile</h1>

      {/* Profile */}
      <section className="border rounded p-4 space-y-1">
        <h2 className="font-medium">Personal Info</h2>

        <div className="text-sm">
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div>
            <ClientProfileEditor
              firstName={user.profile?.firstName}
              lastName={user.profile?.lastName}
            />
            <strong>Name:</strong> {user.profile?.firstName}{" "}
            {user.profile?.lastName}
          </div>
          {user.profile?.experience && (
            <div>
              <strong>Experience:</strong> {user.profile.experience}
            </div>
          )}
          {user.profile?.injuryNotes && (
            <div className="text-red-600">
              <strong>Injuries:</strong> {user.profile.injuryNotes}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming */}
      <section className="border rounded p-4">
        <h2 className="font-medium mb-2">Upcoming Workouts</h2>

        {user.scheduledWorkouts.length === 0 ? (
          <p className="text-sm text-gray-500">No upcoming workouts</p>
        ) : (
          <ul className="text-sm space-y-1">
            {user.scheduledWorkouts.map((sw) => (
              <li key={sw.id} className="flex justify-between">
                <span>{sw.workout.name}</span>
                <span className="text-gray-500">
                  {sw.scheduledDate.toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent Body Metrics */}
      <section className="border rounded p-4 space-y-2">
        <h2 className="font-medium">Log Body Metrics</h2>
        <BodyMetricLogger />
      </section>

      {/* Recent History */}
      <section className="border rounded p-4">
        <h2 className="font-medium mb-2">Recent Workouts</h2>

        {user.workoutLogs.length === 0 ? (
          <p className="text-sm text-gray-500">No completed workouts yet</p>
        ) : (
          <ul className="text-sm space-y-1">
            {user.workoutLogs.map((log) => (
              <li key={log.id}>
                Completed on {log.createdAt.toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </section>
      <LogoutButton/>
    </div>
  );
}
