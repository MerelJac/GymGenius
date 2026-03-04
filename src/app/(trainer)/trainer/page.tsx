import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ClientProgramProgress } from "@/app/components/ClientProgramProgress";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TrainerHomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const trainerId = session.user.id;
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT", trainerId },
    include: {
      profile: true,
      scheduledWorkouts: {
        include: { workout: { include: { program: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const missedWorkouts = clients.flatMap((client) =>
    client.scheduledWorkouts
      .filter((w) => w.status === "SKIPPED")
      .map((w) => ({
        id: w.id,
        clientName: `${client.profile?.firstName ?? ""} ${client.profile?.lastName ?? ""}`,
        workoutName: w.workout.name,
        programName: w.workout.program?.name,
        date: w.scheduledDate,
      })),
  );

  const recentlyCompleted = clients.flatMap((client) =>
    client.scheduledWorkouts
      .filter((w) => w.status === "COMPLETED")
      .map((w) => ({
        id: w.id,
        clientName: `${client.profile?.firstName ?? ""} ${client.profile?.lastName ?? ""}`,
        workoutName: w.workout.name,
        programName: w.workout.program?.name,
        date: w.scheduledDate,
      })),
  );

  const recentMissedWorkouts = [...missedWorkouts]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  const recentCompletedWorkouts = [...recentlyCompleted]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Page header */}
      <div>
        <h1 className="font-syne font-extrabold text-3xl text-foreground tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted mt-1">
          Here&apos;s an overview of your clients&apos; training activity
        </p>
      </div>

      {/* CLIENT PROGRESS */}
      <section className="bg-surface border border-surface2 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface2">
          <h2 className="font-syne font-bold text-base text-foreground">
            Client Program Progress
          </h2>
          <span className="text-xs text-muted">{clients.length} clients</span>
        </div>
        <div className="divide-y divide-surface2">
          {clients.map((client) => (
            <div key={client.id} className="px-5 py-4">
              <ClientProgramProgress client={client} />
            </div>
          ))}
          {clients.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-muted italic">No clients assigned yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* MISSED + COMPLETED side by side on larger screens */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* MISSED WORKOUTS */}
        <section className="bg-surface border border-surface2 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-surface2">
            <div className="w-2 h-2 rounded-full bg-danger flex-shrink-0" />
            <h2 className="font-syne font-bold text-base text-foreground">Missed Workouts</h2>
          </div>
          {recentMissedWorkouts.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-muted italic">No missed workouts 🎉</p>
            </div>
          ) : (
            <ul className="divide-y divide-surface2">
              {recentMissedWorkouts.map((w) => (
                <li key={w.id} className="flex items-start justify-between px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {w.clientName}
                    </p>
                    <p className="text-xs text-muted mt-0.5 truncate">
                      {w.workoutName}
                      {w.programName && ` · ${w.programName}`}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted flex-shrink-0 ml-3 mt-0.5">
                    {w.date.toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* RECENTLY COMPLETED */}
        <section className="bg-surface border border-surface2 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-surface2">
            <div className="w-2 h-2 rounded-full bg-[#3dffa0] flex-shrink-0" />
            <h2 className="font-syne font-bold text-base text-foreground">Recently Completed</h2>
          </div>
          {recentCompletedWorkouts.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-muted italic">No completed workouts yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-surface2">
              {recentCompletedWorkouts.map((w) => (
                <li key={w.id}>
                  <Link
                    href={`/view-workouts/${w.id}`}
                    className="flex items-start justify-between px-5 py-3.5 hover:bg-surface2 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {w.clientName}
                      </p>
                      <p className="text-xs text-muted mt-0.5 truncate">
                        {w.workoutName}
                        {w.programName && ` · ${w.programName}`}
                      </p>
                    </div>
                    <span className="text-[11px] text-muted flex-shrink-0 ml-3 mt-0.5">
                      {w.date.toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>
    </div>
  );
}