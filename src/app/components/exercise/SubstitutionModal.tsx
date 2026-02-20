"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Prescribed } from "@/types/prescribed";

type Exercise = {
  id: string;
  name: string;
};

export default function SubstitutionModal({
  exerciseId,
  workoutLogId,
  sectionId,
  prescribed,
  onClose,
}: {
  exerciseId: string;
  workoutLogId: string;
  sectionId?: string;
  prescribed?: Prescribed | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [subs, setSubs] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSubs() {
      const res = await fetch(`/api/exercises/${exerciseId}/substitutions`);
      const data = await res.json();
      setSubs(data);
    }
    loadSubs();
  }, [exerciseId]);

  async function handleSubstitute(newExerciseId: string) {
    setLoading(true);

    await fetch("/api/workouts/substitute", {
      method: "POST",
      body: JSON.stringify({
        workoutLogId,
        sectionId,
        oldExerciseId: exerciseId,
        newExerciseId,
        prescribed,
      }),
    });

    setLoading(false);
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 space-y-4">
        <h3 className="font-semibold text-lg">Substitute Exercise</h3>

        {subs.length === 0 ? (
          <p className="text-sm text-gray-500">No substitutions available</p>
        ) : (
          subs.map((ex) => (
            <button
              key={ex.id}
              onClick={() => handleSubstitute(ex.id)}
              disabled={loading}
              className="w-full text-left p-3 rounded-lg border hover:bg-gray-50"
            >
              {ex.name}
            </button>
          ))
        )}

        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
