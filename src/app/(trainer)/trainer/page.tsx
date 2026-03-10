import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ClientProgramProgress } from "@/app/components/ClientProgramProgress";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { TrainerStats } from "./profile/components/TrainerStats";
import { getUserAccess } from "@/lib/billing/access";
import BillingStatusNotice from "@/app/components/billing/BillingStatusNotice";

export default async function TrainerHomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const access = await getUserAccess(session?.user?.id);
  console.log("access: ", access);
  // 👇 Add this block
  if (!access.hasAccess) {
    redirect("/billing");
  }

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

  const trainer = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      clients: {
        include: {
          profile: true,
          scheduledWorkouts: {
            select: { status: true },
          },
        },
      },
    },
  });

  if (!trainer) return notFound();

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page header */}
      <div>
        <h1 className="font-syne font-extrabold text-3xl text-foreground tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted mt-1">
          Here&apos;s an overview of your clients&apos; training activity
        </p>
      </div>

        <BillingStatusNotice access={access} />
      {/* Quick stats row */}

      <TrainerStats trainer={trainer} />

      {/* CLIENT PROGRESS */}
      <section className="gradient-bg border border-surface2 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface2">
          <h2 className="font-syne font-bold text-base text-foreground">
            Client Program Progress
          </h2>
          <span className="text-sm font-semibold px-2.5 py-1 rounded-full bg-surface2 text-muted">
            {clients.length} clients
          </span>
        </div>
        <div className="divide-y divide-surface2">
          {clients.map((client) => (
            <div
              key={client.id}
              className="px-5 py-4 gap-4 
        hover:bg-surface2/50 hover:pl-6 transition-all duration-150 group
        border-l-2 border-l-transparent hover:border-l-lime-green/50"
            >
              <ClientProgramProgress client={client} />
            </div>
          ))}
          {clients.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-muted italic">
                No clients assigned yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* MISSED + COMPLETED */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* MISSED */}
        <section className="gradient-bg border border-surface2 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface2">
            <h2 className="font-syne font-bold text-sm text-foreground">
              ⚠️ Missed Workouts
            </h2>{" "}
            <Link
              href="/missed-workouts"
              className="text-xs text-muted hover:text-orange-500 transition-colors"
            >
              See all →
            </Link>
          </div>
          {recentMissedWorkouts.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-muted">No missed workouts 🎉</p>
            </div>
          ) : (
            <ul className="divide-y divide-surface2">
              {recentMissedWorkouts.map((w) => (
                <li
                  key={w.id}
                  className="flex items-start justify-between px-5 py-3.5 border-l-2 border-l-transparent hover:border-l-danger/50 hover:bg-surface2/40 transition-all duration-150"
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
                  <span className="text-sm text-muted flex-shrink-0 ml-3 mt-0.5">
                    {w.date.toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* COMPLETED */}
        <section className="gradient-bg border border-surface2 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface2">
            <h2 className="font-syne font-bold text-sm text-foreground">
              ✅ Recently Completed
            </h2>
            <Link
              href="/trainer/completed-workouts"
              className="text-xs text-muted hover:text-orange-500 transition-colors"
            >
              See all →
            </Link>
          </div>
          {recentCompletedWorkouts.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-muted">No completed workouts yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-surface2">
              {recentCompletedWorkouts.map((w) => (
                <li key={w.id}>
                  <Link
                    href={`/view-workouts/${w.id}`}
                    className="flex items-start justify-between px-5 py-3.5 border-l-2 border-l-transparent hover:border-l-[#3dffa0]/50 hover:bg-surface2/40 transition-all duration-150 group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-[#3dffa0] transition-colors truncate">
                        {w.clientName}
                      </p>
                      <p className="text-xs text-muted mt-0.5 truncate">
                        {w.workoutName}
                        {w.programName && ` · ${w.programName}`}
                      </p>
                    </div>
                    <span className="text-sm text-muted flex-shrink-0 ml-3 mt-0.5">
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
