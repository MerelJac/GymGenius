"use client";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { approveExercise, mergeExercises } from "./actions";
import Link from "next/link";
import { Exercise, User, Profile } from "@prisma/client";

type ExerciseWithTrainer = Exercise & {
  trainer: (User & { profile: Profile | null }) | null;
};

export default function AdminExerciseReview({
  exercises,
}: {
  exercises: ExerciseWithTrainer[];
}) {
  const [isPending, startTransition] = useTransition();
  const [mergeSource, setMergeSource] = useState<ExerciseWithTrainer | null>(
    null,
  );
  const router = useRouter();

  const mergeCompatible = mergeSource
    ? exercises.filter(
        (e) => e.id !== mergeSource.id && e.type === mergeSource.type,
      )
    : [];

  const [mergeTargetSearch, setMergeTargetSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ExerciseWithTrainer[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  async function handleSearch(query: string) {
    setMergeTargetSearch(query);
    if (query.length < 2) return setSearchResults([]);
    setIsSearching(true);
    const res = await fetch(
      `/api/exercises/search?q=${encodeURIComponent(query)}&type=${mergeSource?.type ?? ""}`,
    );
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Search failed");
      setIsSearching(false);
      return;
    }
    setSearchResults(data);
    setIsSearching(false);
  }

  function handleMerge(sourceId: string, targetId: string) {
    startTransition(async () => {
      const result = await mergeExercises(sourceId, targetId);
      if (!result || !result.success) {
        alert(result?.message || "Merge failed");
        return;
      }
      setMergeSource(null);
      setMergeTargetSearch("");
      setSearchResults([]);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <h1 className="nav-logo">Review Trainer Exercises</h1>

      {/* Merge banner */}
      {mergeSource && (
        <div className="border border-yellow-400/30 bg-yellow-400/5 rounded-2xl px-5 py-4 space-y-4">
          <p className="text-sm font-semibold text-yellow-300">
            Merging: <span className="text-foreground">{mergeSource.name}</span>
          </p>

          {/* Merge into another pending exercise */}
          {mergeCompatible.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted uppercase tracking-wider">
                Pending exercises
              </p>
              <div className="flex flex-wrap gap-2">
                {mergeCompatible.map((target) => (
                  <MergeTargetButton
                    key={target.id}
                    name={target.name}
                    type={target.type}    
                    onConfirm={() => handleMerge(mergeSource.id, target.id)}
                    isPending={isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Merge into global library exercise */}
          <div className="space-y-2">
            <p className="text-xs text-muted uppercase tracking-wider">
              Search global library
            </p>
            <input
              type="text"
              value={mergeTargetSearch}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={`Search ${mergeSource.type.toLowerCase()} exercises...`}
              className="w-full px-3 py-2 text-sm rounded-lg bg-surface2 border border-surface2 focus:border-yellow-400/50 focus:outline-none"
            />
            {isSearching && <p className="text-xs text-muted">Searching...</p>}
            {searchResults.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {searchResults.map((target) => (
                  <MergeTargetButton
                    key={target.id}
                    name={target.name}
                    type={target.type}
                    onConfirm={() => handleMerge(mergeSource.id, target.id)}
                    isPending={isPending}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setMergeSource(null);
              setMergeTargetSearch("");
              setSearchResults([]);
            }}
            className="text-xs text-muted hover:text-foreground transition"
          >
            Cancel
          </button>
        </div>
      )}

      {exercises.length === 0 ? (
        <div className="gradient-bg border border-surface2 rounded-2xl p-10 text-center">
          <p className="text-muted">No exercises pending review.</p>
        </div>
      ) : (
        <div className="gradient-bg border border-surface2 rounded-2xl overflow-hidden divide-y divide-surface2">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4
                hover:bg-surface2/50 hover:pl-6 transition-all duration-150 group
                border-l-2 ${mergeSource?.id === exercise.id ? "border-l-yellow-400" : "border-l-transparent hover:border-l-lime-green/50"}`}
            >
              <div className="min-w-0">
                <h2 className="font-syne font-bold text-sm text-foreground truncate group-hover:text-lime-green transition-colors">
                  {exercise.name}
                </h2>
                <p className="mt-0.5 text-xs text-muted/60">
                  {exercise.trainerId
                    ? `By ${exercise.trainer?.profile?.firstName ?? "Unknown trainer"}`
                    : "Global exercise"}
                </p>
                <p className="mt-0.5 text-xs text-muted/40 uppercase tracking-wider">
                  {exercise.type}
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  {exercise.notes || "No notes"}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await approveExercise(exercise.id);
                      router.refresh();
                    })
                  }
                  className="px-3 py-1.5 text-sm font-semibold bg-lime-green text-black rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    setMergeSource(
                      mergeSource?.id === exercise.id ? null : exercise,
                    )
                  }
                  className={`px-3 py-1.5 text-sm font-semibold rounded-lg border transition ${
                    mergeSource?.id === exercise.id
                      ? "bg-yellow-400/10 border-yellow-400/50 text-yellow-300"
                      : "bg-surface2 border-surface2 text-muted hover:border-yellow-400/30 hover:text-yellow-300"
                  }`}
                >
                  Merge
                </button>
                <Link
                  href={`/exercises/${exercise.id}/edit`}
                  className="btn-primary"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MergeTargetButton({
  name,
  type,
  onConfirm,
  isPending,
}: {
  name: string;
  type: string;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (
          !confirm(
            `Merge into "${name}"? All logs, 1RM records, and workout references will be repointed. This cannot be undone.`,
          )
        )
          return;
        onConfirm();
      }}
      className="px-3 py-1.5 text-sm font-semibold bg-yellow-400 text-black rounded-lg hover:opacity-90 transition disabled:opacity-50"
    >
      → {name} ({type})
    </button>
  );
}
