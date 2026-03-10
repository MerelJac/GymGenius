import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Pagination } from "@/app/components/Pagination";
import MyWorkoutsList from "./MyWorkoutsList";

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
        <Link
          href="/profile"
          className="text-muted text-sm hover:text-orange-500 transition-colors"
        >
          ← Back
        </Link>
        <h1 className="section-title">Workouts You Created</h1>
      </div>

      {workouts.length === 0 ? (
        <p className="text-sm text-gray-500">No workouts found.</p>
      ) : (
          <MyWorkoutsList workouts={workouts} />
      )}

      <Pagination page={page} totalPages={totalPages} basePath="/workouts/my" />
    </div>
  );
}
