"use client";

import { useRouter } from "next/navigation";
import { Exercise, ExerciseSubstitution } from "@prisma/client";
import { getEmbedUrl } from "@/lib/video";
type ExerciseWithSubs = Exercise & {
  substitutionsFrom: (ExerciseSubstitution & {
    substituteExercise: Exercise;
  })[];
};

export default function ExerciseModal({
  exercise,
}: {
  exercise: ExerciseWithSubs;
}) {
  const router = useRouter();
  const embedUrl = exercise.videoUrl ? getEmbedUrl(exercise.videoUrl) : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={() => router.back()}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 relative pointer-events-auto">
          {/* Close */}
          <button
            onClick={() => router.back()}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>

          <h2 className="text-xl font-semibold mb-2">{exercise.name}</h2>

          <div className="text-sm text-gray-500 mb-4">
            {exercise.type}
            {exercise.equipment && ` • ${exercise.equipment}`}
          </div>

          {/* 🎥 Video */}
          {embedUrl && (
            <div className="mb-4">
              {embedUrl.endsWith(".mp4") ? (
                <video controls className="w-full rounded-md" src={embedUrl} />
              ) : (
                <div className="relative aspect-video rounded-md overflow-hidden">
                  <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {exercise.notes && (
            <div className="mb-4">
              <h3 className="font-medium mb-1">Notes</h3>
              <p className="text-sm">{exercise.notes}</p>
            </div>
          )}

          {/* Substitutions */}
          <div>
            <h3 className="font-medium mb-2">Substitutions</h3>

            {exercise.substitutionsFrom.length === 0 && (
              <p className="text-sm text-gray-500">
                No substitutions available
              </p>
            )}

            <ul className="space-y-2">
              {exercise.substitutionsFrom.map((sub) => (
                <li key={sub.id} className="border p-2 rounded">
                  <div className="font-medium">
                    {sub.substituteExercise.name}
                  </div>

                  {sub.note && (
                    <div className="text-sm text-gray-600">{sub.note}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
