import { Prisma, WorkoutDay, WorkoutStatus } from "@prisma/client"
import type { ExerciseType , Exercise} from "./exercise"
import { Prescribed } from "./prescribed"

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


export type WorkoutWithExercises = {
  id: string
  name: string
  order: number
  exercises: {
    id: string
    order: number
    prescribed: Prescribed
    exercise: Exercise
  }[],
  day: WorkoutDay
}

export type ProgramWithWorkouts = {
  id: string
  name: string
  workouts: WorkoutWithExercises[]
}


export type ScheduledWorkoutWithProgram = {
  id: string;
  scheduledDate: Date;
  status: WorkoutStatus;
  workout: {
    id: string;
    name: string;
    program: {
      id: string;
      name: string;
    };
  };
};


export type ScheduledWorkoutDashboard = Prisma.ScheduledWorkoutGetPayload<{
  include: {
    workout: {
      include: {
        exercises: {
          include: {
            exercise: true;
          };
        };
      };
    };
  };
}>;

export type ScheduledWorkoutWithLogs = Prisma.ScheduledWorkoutGetPayload<{
  include: {
    workout: {
      include: {
        exercises: {
          include: {
            exercise: true;
          };
        };
      };
    };
    workoutLogs: true;
  };
}>;