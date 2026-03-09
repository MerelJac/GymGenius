import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Pagination } from "@/app/components/Pagination";

const PAGE_SIZE = 20;

export default async function MyWorkoutsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();
  const userId = session.user.id;
  const page = Math.max(1, parseInt(searchParams.page ?? "1"));

  const [workouts, total] = await Promise.all([
    prisma.scheduledWorkout.findMany({
      where: {
        clientId: userId,
        workout: { programId: `__client-workouts-${userId}` },
      },
      include: { workout: true },
      orderBy: { scheduledDate: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.scheduledWorkout.count({
      where: {
        clientId: userId,
        workout: { programId: `__client-workouts-${userId}` },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="text-muted text-sm hover:text-orange-500 transition-colors">
          ← Back
        </Link>
        <h1 className="section-title">Workouts You Created</h1>
      </div>

      {workouts.length === 0 ? (
        <p className="text-sm text-gray-500">No workouts found.</p>
      ) : (
        <ul className="feed">
          {workouts.map((sw) => (
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

      <Pagination page={page} totalPages={totalPages} basePath="/workouts/my" />
    </div>
  );
}