export type BodyweightPrescribed = {
  kind: "bodyweight";
  sets: number;
  reps: number;
};

export type HybridPrescribed = {
  kind: "hybrid";
  sets: number;
  reps: number;
  weight: number | null;
};

export type StrengthPrescribed = {
  kind: "strength";
  sets: number;
  reps: number;
  weight: number | null;
};

export type TimedPrescribed = {
  kind: "timed";
  duration: number;
};

export type Prescribed =
  | StrengthPrescribed
  | TimedPrescribed
  | BodyweightPrescribed
  | HybridPrescribed;

  export type BodyweightPerformed = {
  kind: "bodyweight";
  sets: number;
  reps: number;
};

export type HybridPerformed = {
  kind: "hybrid";
  sets: number;
  reps: number;
  weight: number | null;
};

export type StrengthPerformed = {
  kind: "strength";
  sets: number;
  reps: number;
  weight: number | null;
};

export type TimedPerformed = {
  kind: "timed";
  duration: number;
};

export type Performed =
  | StrengthPerformed
  | TimedPerformed
  | BodyweightPerformed
  | HybridPerformed;
