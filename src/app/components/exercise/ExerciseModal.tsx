"use client";

import { useEffect, useState } from "react";
import { ExerciseDetail } from "@/types/exercise";
import { getEmbedUrl } from "@/lib/video";

export default function ExerciseModal({
  exerciseId,
  onClose,
}: {
  exerciseId: string;
  onClose: () => void;
}) {
  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch(`/api/exercises/${exerciseId}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          setExercise(data);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [exerciseId]);

  if (!exercise && loading) {
    return (
      <>
        <div className="fixed inset-0 z-40 bg-black/40" />
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6">
            Loading…
          </div>
        </div>
      </>
    );
  }

  if (!exercise) return null;

  const embedUrl = exercise.videoUrl
    ? getEmbedUrl(exercise.videoUrl)
    : null;

    console.log('embed url:', embedUrl)
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 relative pointer-events-auto">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>

          <h2 className="text-xl font-semibold mb-2">
            {exercise.name}
          </h2>

          <div className="text-sm text-gray-500 mb-4">
            {exercise.type}
            {exercise.equipment && ` • ${exercise.equipment}`}
            {exercise.muscleGroup && ` • ${exercise.muscleGroup}`}
          </div>

          {/* 🎥 Video */}
          {embedUrl && (
            <div className="mb-4">
              {embedUrl.endsWith(".mp4") ? (
                <video
                  controls
                  className="w-full rounded-md"
                  src={embedUrl}
                />
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

            {exercise.substitutions.length === 0 && (
              <p className="text-sm text-gray-500">
                No substitutions available
              </p>
            )}

            <ul className="space-y-2">
              {exercise.substitutions.map((sub) => (
                <li key={sub.id} className="border p-2 rounded">
                  <div className="font-medium">{sub.name}</div>
                  {sub.note && (
                    <div className="text-sm text-gray-600">
                      {sub.note}
                    </div>
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
