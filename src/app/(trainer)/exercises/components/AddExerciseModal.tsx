"use client";

import { startTransition } from "react";
import ExerciseForm from "@/app/components/exercise/ExerciseForm";
import { Modal } from "@/app/components/ui/Modal";
import { createExerciseAction } from "@/app/actions/exercises";
import { Exercise } from "@/types/exercise";

export function AddExerciseModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (exercise: Exercise) => void;
}) {
  async function action(formData: FormData) {
    const exercise = await createExerciseAction(formData);

    startTransition(() => {
      onCreated?.(exercise);
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Exercise">
      <ExerciseForm
        title="New Exercise"
        submitLabel="Add Exercise"
        action={action}
      />
    </Modal>
  );
}
