import { prisma } from "@/lib/prisma";
import { Exercise } from "@/types/exercise";
import Link from "next/link";

export default async function ExerciseLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim();

  const exercises = await prisma.exercise.findMany({
    where: query
      ? {
          name: {
            contains: query,
            mode: "insensitive",
          },
        }
      : undefined,
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex justify-between mb-4 items-center">
        <h1 className="text-xl font-semibold">Exercise Library</h1>
        <Link href="/exercises/new" className="underline">
          Add Exercise
        </Link>
      </div>

      {/* Search */}
      <form method="GET" className="mb-4">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search exercises…"
          className="border px-3 py-2 w-full max-w-sm"
        />
      </form>

      <ul className="space-y-2">
        {exercises.map((ex: Exercise) => (
          <li key={ex.id} className="border p-3 flex justify-between">
            <div>
              <div className="font-medium">{ex.name}</div>
              <div className="text-sm text-gray-500">{ex.type}</div>
            </div>

            <Link
              href={`/exercises/${ex.id}/edit`}
              className="underline"
            >
              Edit
            </Link>
          </li>
        ))}
      </ul>

      {exercises.length === 0 && (
        <div className="text-sm text-gray-500 mt-4">
          No exercises found.
        </div>
      )}
    </div>
  );
}
