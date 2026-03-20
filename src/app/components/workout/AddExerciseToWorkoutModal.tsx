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
import { Plus } from "lucide-react";

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
    setExercise(null);
    setPrescribed(null);
    onClose();
    router.refresh();
  }

  function handleSelectExercise(ex: Exercise) {
    setExercise(ex);
    setPrescribed(getDefaultPrescribed(ex));
  }

  function getDefaultPrescribed(exercise: Exercise): Prescribed {
    switch (exercise.type) {
      case "TIMED":
        return { kind: "timed", duration: 30 };
      case "HYBRID":
        return {
          kind: "hybrid",
          sets: 3,
          reps: 10,
          weight: null,
          duration: null,
        };
      case "BODYWEIGHT":
        return { kind: "bodyweight", sets: 3, reps: 10 };
      case "CORE":
        return {
          kind: "core",
          sets: 3,
          reps: 10,
          weight: null,
          duration: null,
        };
      case "MOBILITY":
        return {
          kind: "mobility",
          sets: 3,
          reps: 10,
          weight: null,
          duration: null,
        };
      case "STRENGTH":
      default:
        return { kind: "strength", sets: 3, reps: 10, weight: null };
    }
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title="Add Exercise">
        <div className="space-y-4">
          {/* Search + Create row */}
          <div className="flex gap-2 items-center flex-col">
            <div className="flex-1">
              <ExerciseSearch onSelect={handleSelectExercise} />
            </div>
            <button
              onClick={() => setShowCreateExerciseModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface2 border border-surface2 text-muted hover:text-lime-green hover:border-lime-green/30 transition-colors text-xs font-medium flex-shrink-0"
            >
              <Plus size={13} />
              New
            </button>
          </div>

          {/* Selected exercise */}
          {exercise && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-lime-green/5 border border-lime-green/15 rounded-xl px-3 py-2">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-lime-green/70">
                  Selected
                </span>
                <span className="text-sm text-foreground font-medium">
                  {exercise.name}
                </span>
              </div>

              <PrescribedEditor
                exercise={exercise}
                value={prescribed}
                onChange={setPrescribed}
              />

              <p className="text-xs text-center text-muted">
                Adjust sets & reps then add.
              </p>
            </div>
          )}

          {/* Add button */}
          <button
            onClick={handleAdd}
            disabled={!exercise || !prescribed}
            className={
              !exercise || !prescribed
                ? "w-full py-2.5 rounded-xl font-syne font-bold text-sm bg-lime-green text-black opacity-30 cursor-not-allowed"
                : "w-full py-2.5 rounded-xl font-syne font-bold text-sm bg-lime-green text-black hover:opacity-90 active:scale-[0.98] transition"
            }
          >
            Add to Workout
          </button>
        </div>
      </Modal>
      <AddExerciseModal
        open={showCreateExerciseModal}
        onClose={() => setShowCreateExerciseModal(false)}
        onCreated={(newExercise) => {
          handleSelectExercise(newExercise);
          setShowCreateExerciseModal(false);
        }}
      />
    </>
  );
}
