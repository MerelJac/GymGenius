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
    className="btn-primary"
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
