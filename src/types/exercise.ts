export type ExerciseType =
  | "STRENGTH"
  | "TIMED"
  | "HYBRID"
  | "BODYWEIGHT"
  | "MOBILITY"
  | "CORE"

export type Exercise = {
  id: string
  name: string
  type: ExerciseType

  equipment?: string | null
  muscleGroup?: string | null
  videoUrl?: string | null
  notes?: string | null

  // Ownership
  trainerId?: string | null // null = global/default exercise

  createdAt?: string
}

export type ExerciseDetail = {
  id: string;
  name: string;
  type: string;
  equipment: string | null;
  notes: string | null;
  videoUrl: string | null;
  substitutions: {
    id: string;
    name: string;
    note: string | null;
  }[];
};
