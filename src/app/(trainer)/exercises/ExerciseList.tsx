"use client";
import { useState } from "react";
import Link from "next/link";
import { Video } from "lucide-react";
import ExerciseModal from "@/app/components/exercise/ExerciseModal";
import { Exercise } from "@/types/exercise";

export default function ExerciseList({
  exercises,
  userId,
  userRole,
}: {
  exercises: Exercise[];
  userId: string;
  userRole: string;
}) {
  const [viewingExerciseId, setViewingExerciseId] = useState<string | null>(null);

  return (
    <>
      <div className="gradient-bg border border-surface2 rounded-2xl overflow-hidden divide-y divide-surface2">
        {exercises.map((ex) => {
          const canEdit = userRole === "ADMIN" || ex.trainerId === userId;
          return (
            <div
              key={ex.id}
              className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4
                hover:bg-surface2/50 hover:pl-6 transition-all duration-150 group
                border-l-2 border-l-transparent hover:border-l-lime-green/50"
            >
              <div className="min-w-0">
                <div className="font-syne font-bold text-sm text-foreground truncate group-hover:text-lime-green transition-colors">
                  {ex.name}
                </div>
                <div className="text-sm text-muted mt-0.5 flex flex-row flex-wrap items-center gap-1">
                  {ex.type} • {ex.muscleGroup}
                  {ex.videoUrl && <><span> • </span><Video size={12} /></>}
                </div>
              </div>
              {canEdit ? (
                <Link href={`/exercises/${ex.id}/edit`} className="btn-primary">
                  Edit
                </Link>
              ) : (
                <button
                  onClick={() => setViewingExerciseId(ex.id)}
                  className="text-xs text-muted px-3 py-1.5 rounded-xl bg-surface2 border border-surface2 hover:border-lime-green/30 hover:text-lime-green transition-colors"
                >
                  View
                </button>
              )}
            </div>
          );
        })}
      </div>

      {viewingExerciseId && (
        <ExerciseModal
          exerciseId={viewingExerciseId}
          onClose={() => setViewingExerciseId(null)}
        />
      )}
    </>
  );
}