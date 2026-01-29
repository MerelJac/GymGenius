"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/app/components/ui/Modal";
import { Exercise } from "@/types/exercise";
import { Prescribed } from "@/types/prescribed";
import { addExerciseToWorkout } from "@/app/(client)/workouts/[scheduledWorkoutId]/actions";
import { ExerciseSearch } from "./AddExerciseModal";
import { PrescribedEditor } from "./PrescribedEditor";

export function AddExerciseToWorkoutModal({
  open,
  workoutLogId,
  sectionId,
  onClose,
}: {
  open: boolean;
  workoutLogId: string;
  sectionId: string |undefined;
  onClose: () => void;
}) {

  const router = useRouter();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [prescribed, setPrescribed] = useState<Prescribed | null>(null);

  async function handleAdd() {
    if (!exercise || !prescribed) return;

    await addExerciseToWorkout(workoutLogId, exercise.id, prescribed, sectionId);
    onClose();
    router.refresh();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Exercise">
      <ExerciseSearch onSelect={setExercise} />

      {exercise && (
        <div className="mt-4 space-y-3">
          <div className="text-sm text-gray-700">
            Selected: <strong>{exercise.name}</strong>
          </div>

          <PrescribedEditor
            exercise={exercise}
            value={prescribed}
            onChange={setPrescribed}
          />
        </div>
      )}

      <button
        onClick={handleAdd}
        disabled={!exercise || !prescribed}
        className="mt-6 w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Add to Workout
      </button>
    </Modal>
  );
}
