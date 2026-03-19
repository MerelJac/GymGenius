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
  const [mergeSource, setMergeSource] = useState<ExerciseWithTrainer | null>(null);
  const router = useRouter();

  const mergeCompatible = mergeSource
    ? exercises.filter(
        (e) => e.id !== mergeSource.id && e.type === mergeSource.type
      )
    : [];

  return (
    <div className="space-y-8">
      <h1 className="nav-logo">Review Trainer Exercises</h1>

      {/* Merge banner */}
      {mergeSource && (
        <div className="border border-yellow-400/30 bg-yellow-400/5 rounded-2xl px-5 py-4 space-y-2">
          <p className="text-sm font-semibold text-yellow-300">
            Merging: <span className="text-foreground">{mergeSource.name}</span>
            <span className="text-muted font-normal"> → select a target below</span>
          </p>
          {mergeCompatible.length === 0 ? (
            <p className="text-xs text-muted">No compatible exercises to merge into.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {mergeCompatible.map((target) => (
                <button
                  key={target.id}
                  disabled={isPending}
                  onClick={() => {
                    if (
                      !confirm(
                        `Merge "${mergeSource.name}" INTO "${target.name}"?\n\nAll logs, 1RM records, and workout references will be repointed to "${target.name}". This cannot be undone.`
                      )
                    )
                      return;
                    startTransition(async () => {
                      await mergeExercises(mergeSource.id, target.id);
                      setMergeSource(null);
                      router.refresh();
                    });
                  }}
                  className="px-3 py-1.5 text-sm font-semibold bg-yellow-400 text-black rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  → {target.name}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setMergeSource(null)}
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
                      mergeSource?.id === exercise.id ? null : exercise
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
                <Link href={`/exercises/${exercise.id}/edit`} className="btn-primary">
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