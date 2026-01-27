"use client";

import { useState } from "react";
import { AddExerciseModal } from "./AddExerciseModal";
import { Exercise } from "@/types/exercise";

export function ExerciseQuickAdd({
  onCreated,
}: {
  onCreated: (exercise: Exercise) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white-600 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
      >
        + Add Exercise
      </button>

      <AddExerciseModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={(exercise) => {
          onCreated(exercise);
        }}
      />
    </>
  );
}
