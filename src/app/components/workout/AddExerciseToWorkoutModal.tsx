"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/app/components/ui/Modal";
import { Exercise } from "@/types/exercise";
import { Prescribed } from "@/types/prescribed";
import { addExerciseToWorkout } from "@/app/(client)/workouts/[scheduledWorkoutId]/actions";
import { ExerciseSearch } from "./ExerciseSearch";
import { PrescribedEditor } from "./PrescribedEditor";
import { AddExerciseModal } from "@/app/(trainer)/exercises/components/AddExerciseModal";

export function AddExerciseToWorkoutModal({
  open,
  workoutLogId,
  sectionId,
  onClose,
}: {
  open: boolean;
  workoutLogId: string;
  sectionId?: string;
  onClose: () => void;
}) {
  const router = useRouter();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [prescribed, setPrescribed] = useState<Prescribed | null>(null);
  const [showCreateExerciseModal, setShowCreateExerciseModal] = useState(false);

  async function handleAdd() {
    if (!exercise || !prescribed) return;

    await addExerciseToWorkout(
      workoutLogId,
      exercise.id,
      prescribed,
      sectionId,
    );

    // Reset local state
    setExercise(null);
    setPrescribed(null);

    onClose();
    router.refresh();
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title="Add Exercise">
        <div className="space-y-4">
          <div className="flex flex-row gap-2 items-center justify-between">
            {/* Search existing exercises */}
            <ExerciseSearch onSelect={setExercise} />

            {/* Create new exercise button */}
            <button
              onClick={() => setShowCreateExerciseModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition"
            >
              + Create New Exercise
            </button>
          </div>
          {/* Selected Exercise + Prescribed */}
          {exercise && (
            <div className="space-y-3">
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

          {/* Add Button */}
          <button
            onClick={handleAdd}
            disabled={!exercise || !prescribed}
            className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Add to Workout
          </button>
        </div>
      </Modal>

      {/* Separate modal for creating exercise */}
      <AddExerciseModal
        open={showCreateExerciseModal}
        onClose={() => setShowCreateExerciseModal(false)}
        onCreated={(newExercise) => {
          setExercise(newExercise);
          setShowCreateExerciseModal(false);
        }}
      />
    </>
  );
}
