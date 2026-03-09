// src/app/(trainer)/completed-workouts/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Pagination } from "@/app/components/Pagination";

const PAGE_SIZE = 20;

export default async function CompletedWorkoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const trainerId = session.user.id;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1"));

  const [completed, total] = await Promise.all([
    prisma.scheduledWorkout.findMany({
      where: {
        status: "COMPLETED",
        client: { trainerId },
      },
      include: {
        client: { include: { profile: true } },
        workout: { include: { program: true } },
      },
      orderBy: { scheduledDate: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.scheduledWorkout.count({
      where: {
        status: "COMPLETED",
        client: { trainerId },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/trainer"
          className="text-muted text-sm hover:text-orange-500 transition-colors"
        >
          ← Back
        </Link>
        <h1 className="font-syne font-extrabold text-2xl text-foreground">
          ✅ Completed Workouts
        </h1>
        <span className="text-sm font-semibold px-2.5 py-1 rounded-full bg-surface2 text-muted">
          {total}
        </span>
      </div>

      {completed.length === 0 ? (
        <p className="text-sm text-muted">No completed workouts yet.</p>
      ) : (
        <section className="gradient-bg border border-surface2 rounded-2xl overflow-hidden">
          <ul className="divide-y divide-surface2">
            {completed.map((w) => (
              <li key={w.id}>
                <Link
                  href={`/view-workouts/${w.id}`}
                  className="flex items-start justify-between px-5 py-3.5 border-l-2 border-l-transparent hover:border-l-[#3dffa0]/50 hover:bg-surface2/40 transition-all duration-150 group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-[#3dffa0] transition-colors truncate">
                      {w.client.profile?.firstName} {w.client.profile?.lastName}
                    </p>
                    <p className="text-xs text-muted mt-0.5 truncate">
                      {w.workout.name}
                      {w.workout.program?.name && ` · ${w.workout.program.name}`}
                    </p>
                  </div>
                  <span className="text-sm text-muted flex-shrink-0 ml-3 mt-0.5">
                    {w.scheduledDate.toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Pagination page={page} totalPages={totalPages} basePath="/completed-workouts" />
    </div>
  );
}