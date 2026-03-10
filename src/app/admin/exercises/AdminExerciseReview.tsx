"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveExercise } from "./actions";
import Link from "next/link";
import { Exercise } from "@prisma/client";

export default function AdminExerciseReview({
  exercises,
}: {
  exercises: Exercise[];
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="space-y-8">
      <h1 className="nav-logo">Review Trainer Exercises</h1>

      {exercises.length === 0 ? (
        <div className="gradient-bg border border-surface2 rounded-2xl p-10 text-center">
          <p className="text-muted">No exercises pending review.</p>
        </div>
      ) : (
        <div className="gradient-bg border border-surface2 rounded-2xl overflow-hidden divide-y divide-surface2">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4
                hover:bg-surface2/50 hover:pl-6 transition-all duration-150 group
                border-l-2 border-l-transparent hover:border-l-lime-green/50"
            >
              <div className="min-w-0">
                <h2 className="font-syne font-bold text-sm text-foreground truncate group-hover:text-lime-green transition-colors">
                  {exercise.name}
                </h2>
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

                {/* <button
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await skipExercise(exercise.id);
                      router.refresh();
                    })
                  }
                  className="px-3 py-1.5 text-sm font-semibold bg-surface2 text-muted border border-surface2 rounded-lg hover:border-lime-green/30 hover:text-lime-green transition"
                >
                  Skip
                </button> */}

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
