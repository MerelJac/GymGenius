import { Exercise } from "@/types/exercise";
import { Prescribed } from "@/types/prescribed";

export function formatPrescribed(p: Prescribed): string {
  // Strength / Hybrid (has weight)
  if ("sets" in p && "reps" in p && "weight" in p) {
    return `${p.sets}×${p.reps}${p.weight ? ` @ ${p.weight}` : ""}`;
  }

  // Bodyweight (no weight)
  if ("sets" in p && "reps" in p) {
    return `${p.sets}×${p.reps}`;
  }

  // Timed
  if ("duration" in p) {
    return `${p.duration}s`;
  }

  return "—";
}

export function buildPrescribed(
  exercise: Exercise,
  sets: number,
  reps: number,
  weight: number | null
): Prescribed {
  switch (exercise.type) {
    case "STRENGTH":
      return {
        kind: "strength",
        sets,
        reps,
        weight,
      };

    case "HYBRID":
      return {
        kind: "hybrid",
        sets,
        reps,
        weight,
      };

    case "BODYWEIGHT":
      return {
        kind: "bodyweight",
        sets,
        reps,
      };

    case "TIMED":
      return {
        kind: "timed",
        duration: reps * 10, // or whatever your UI decides
      };

    default:
      throw new Error(`Unsupported exercise type: ${exercise.type}`);
  }
}
