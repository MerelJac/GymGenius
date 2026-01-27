export type StrengthProgress = {
  exerciseName: string;
  previous1RM: number;
  current1RM: number;
};

export type ProgressChangesProps = {
  strength: StrengthProgress[];
  weight?: {
    previous: number;
    current: number;
  } | null;
  bodyFat?: {
    previous: number;
    current: number;
  } | null;
};

export type ProgressSummary = {
  strength: {
    exerciseName: string
    previous1RM: number
    current1RM: number
  }[]
  weight?: {
    previous: number
    current: number
  }
  bodyFat?: {
    previous: number
    current: number
  }
}