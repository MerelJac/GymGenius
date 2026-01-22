import type { ExerciseType , Exercise} from "./exercise"

export type Workout = {
  id: string
  programId: string
  name: string
  order: number
  createdAt?: string
}

export type Prescription = {
  sets?: number
  reps?: number
  weight?: number
  durationSeconds?: number
  distanceMeters?: number
}

export type WorkoutExercise = {
  id: string
  workoutId: string
  exerciseId: string
  order: number

  type: ExerciseType
  prescription: Prescription
}

export type WorkoutExerciseWithExercise = WorkoutExercise & {
  exercise: Exercise
}
