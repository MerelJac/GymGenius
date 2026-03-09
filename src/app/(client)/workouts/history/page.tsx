import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Pagination } from "@/app/components/Pagination";

const PAGE_SIZE = 20;

export default async function WorkoutHistoryPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();
  const userId = session.user.id;
  const page = Math.max(1, parseInt(searchParams.page ?? "1"));

  const [logs, additionalWorkouts, totalLogs, totalAdditional] = await Promise.all([
    prisma.workoutLog.findMany({
      where: { clientId: userId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      include: { scheduled: { include: { workout: true } } },
    }),
    prisma.additionalWorkout.findMany({
      where: { clientId: userId },
      orderBy: { performedAt: "desc" },
      include: { type: true },
    }),
    prisma.workoutLog.count({ where: { clientId: userId, status: "COMPLETED" } }),
    prisma.additionalWorkout.count({ where: { clientId: userId } }),
  ]);

  // Merge, sort, paginate in memory (reasonable for history)
  type HistoryItem =
    | { kind: "scheduled"; id: string; title: string; date: Date; href: string }
    | { kind: "additional"; id: string; title: string; date: Date; duration: number | null; distance: number | null };

  const all: HistoryItem[] = [
    ...logs.map((log) => ({
      kind: "scheduled" as const,
      id: log.id,
      title: log.scheduled?.workout?.name ?? "Workout",
      date: log.createdAt,
      href: `/workouts/${log.scheduledId}`,
    })),
    ...additionalWorkouts.map((w) => ({
      kind: "additional" as const,
      id: w.id,
      title: w.type.name,
      date: w.performedAt,
      duration: w.duration,
      distance: w.distance,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const totalPages = Math.ceil(all.length / PAGE_SIZE);
  const items = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="text-muted text-sm hover:text-orange-500 transition-colors">
          ← Back
        </Link>
        <h1 className="section-title">Activity History</h1>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted">No activity logged yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => {
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

      <Pagination page={page} totalPages={totalPages} basePath="/workouts/history" />
    </div>
  );
}