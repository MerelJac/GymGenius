// src/app/(trainer)/missed-workouts/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const PAGE_SIZE = 20;

export default async function MissedWorkoutsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const trainerId = session.user.id;
  const page = Math.max(1, parseInt(searchParams.page ?? "1"));

  const [skipped, total] = await Promise.all([
    prisma.scheduledWorkout.findMany({
      where: {
        status: "SKIPPED",
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
        status: "SKIPPED",
        client: { trainerId },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/trainer" className="text-muted text-sm hover:text-orange-500 transition-colors">
          ← Back
        </Link>
        <h1 className="font-syne font-extrabold text-2xl text-foreground">
          ⚠️ Missed Workouts
        </h1>
        <span className="text-sm font-semibold px-2.5 py-1 rounded-full bg-surface2 text-muted">
          {total}
        </span>
      </div>

      {skipped.length === 0 ? (
        <p className="text-sm text-muted">No missed workouts 🎉</p>
      ) : (
        <section className="gradient-bg border border-surface2 rounded-2xl overflow-hidden">
          <ul className="divide-y divide-surface2">
            {skipped.map((w) => (
              <li
                key={w.id}
                className="flex items-start justify-between px-5 py-3.5 border-l-2 border-l-transparent hover:border-l-danger/50 hover:bg-surface2/40 transition-all duration-150"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
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
              </li>
            ))}
          </ul>
        </section>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm pt-2">
          {page > 1 ? (
            <Link href={`/missed-workouts?page=${page - 1}`} className="text-orange-500 hover:underline">
              ← Previous
            </Link>
          ) : <span />}
          <span className="text-muted">Page {page} of {totalPages}</span>
          {page < totalPages ? (
            <Link href={`/missed-workouts?page=${page + 1}`} className="text-orange-500 hover:underline">
              Next →
            </Link>
          ) : <span />}
        </div>
      )}
    </div>
  );
}