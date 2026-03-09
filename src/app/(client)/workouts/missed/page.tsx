// src/app/(client)/workouts/missed/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const PAGE_SIZE = 20;

export default async function MissedWorkoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1"));

  const clientId = session.user.id;
  const today = new Date();

  const [overdueWorkouts, total] = await Promise.all([
    prisma.scheduledWorkout.findMany({
      where: {
        clientId,
        scheduledDate: { lt: today },
        status: { notIn: ["COMPLETED", "SKIPPED"] },
      },
      include: {
        workout: { include: { program: true } },
      },
      orderBy: { scheduledDate: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.scheduledWorkout.count({
      where: {
        clientId,
        scheduledDate: { lt: today },
        status: { notIn: ["COMPLETED", "SKIPPED"] },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="text-muted text-sm hover:text-orange-500 transition-colors"
        >
          ← Back
        </Link>
        <h1 className="font-syne font-extrabold text-2xl text-foreground">
          ⚠️ Missed Workouts
        </h1>
        <span className="text-sm font-semibold px-2.5 py-1 rounded-full bg-surface2 text-muted">
          {total}
        </span>
      </div>

      {overdueWorkouts.length === 0 ? (
        <p className="text-sm text-muted">No missed workouts 🎉</p>
      ) : (
        <section className="gradient-bg border border-surface2 rounded-2xl overflow-hidden">
          <ul className="divide-y divide-surface2">
            {overdueWorkouts.map((w) => (
              <li key={w.id}>
                <Link
                  href={`/workouts/${w.id}`}
                  className="flex items-start justify-between px-5 py-3.5 border-l-2 border-l-transparent hover:border-l-danger/50 hover:bg-surface2/40 transition-all duration-150"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {w.workout.name}
                    </p>
                    <p className="text-xs text-muted mt-0.5 truncate">
                      {w.workout.program?.name ?? "No program"}
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm pt-2">
          {page > 1 ? (
            <Link
              href={`/workouts/missed?page=${page - 1}`}
              className="text-orange-500 hover:underline"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/workouts/missed?page=${page + 1}`}
              className="text-orange-500 hover:underline"
            >
              Next →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
