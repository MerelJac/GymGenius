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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Review Trainer Exercises</h1>

      {exercises.length === 0 && (
        <p className="text-gray-500">No exercises pending review.</p>
      )}

      {exercises.map((exercise) => (
        <div
          key={exercise.id}
          className="bg-white border rounded-xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-semibold text-lg">{exercise.name}</h2>
              <p className="mt-2 text-sm text-gray-700">
                {exercise.notes || "No notes"}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await approveExercise(exercise.id);
                    router.refresh(); // 🔥 THIS is the key
                  })
                }
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md"
              >
                Approve
              </button>

              <button className="px-3 py-1 text-sm bg-gray-200 rounded-md">
                Skip
              </button>

              <Link
                href={`/exercises/${exercise.id}/edit`}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
              >
                Edit Exercise
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}