import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Exercise } from "@/types/exercise";
import { ExerciseType, Prisma } from "@prisma/client";
import { Plus, Search, Video } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import ExerciseList from "./ExerciseList";

export default async function ExerciseLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }

  const userId = session.user.id;
  const userRole = session.user.role;

  const PAGE_SIZE = 20;

  const { q, page } = await searchParams;

  const query = q?.trim();
  const currentPage = Math.max(Number(page) || 1, 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const enumMatch = Object.values(ExerciseType).find(
    (v) => v.toLowerCase() === query?.toLowerCase(),
  );

  const where: Prisma.ExerciseWhereInput | undefined = query
    ? {
        OR: [
          {
            name: {
              contains: query,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            muscleGroup: {
              contains: query,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          ...(enumMatch
            ? [
                {
                  type: {
                    equals: enumMatch,
                  },
                },
              ]
            : []),
        ],
      }
    : undefined;

  const [exercises, totalCount] = await Promise.all([
    prisma.exercise.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.exercise.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="nav-logo">Exercise Library</h1>

        <Link href="/exercises/new" className="btn-primary">
          <Plus size={18} />{" "}
          {/* optional: import { Plus } from "lucide-react" */}
          Add Exercise
        </Link>
      </div>

      {/* Search Form */}
      <form method="GET" className="max-w-md">
        <div className="relative">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search exercises by name..."
            className="w-full px-4 py-2.5 pl-11 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition shadow-sm text-gray-200 placeholder:text-gray-400 text-base"
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />{" "}
          {/* optional: import { Search } from "lucide-react" */}
        </div>
      </form>

      {/* Exercise List */}
      {exercises.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            {query
              ? "No exercises match your search"
              : "No exercises in library yet"}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {query
              ? "Try adjusting your search or add a new exercise."
              : "Start building your exercise library to use in workouts."}
          </p>
          <Link
            href="/exercises/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            Add An Exercise
          </Link>
        </div>
      ) : (
        <ExerciseList
          exercises={exercises}
          userId={userId}
          userRole={userRole}
        />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 pt-4">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            const isActive = p === currentPage;
            return (
              <Link
                key={p}
                href={{
                  pathname: "/exercises",
                  query: {
                    ...(query ? { q: query } : {}),
                    page: p,
                  },
                }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition-all active:scale-[0.95] ${
                  isActive
                    ? "bg-lime-green text-black font-syne"
                    : "bg-surface2 text-muted border border-surface2 hover:border-lime-green/30 hover:text-lime-green"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
