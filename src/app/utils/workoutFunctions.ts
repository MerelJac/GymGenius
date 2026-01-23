import { Performed, Prescribed } from "@/types/prescribed";
export function buildPerformedFromPrescribed(
  prescribed: Prescribed
): Performed {
  switch (prescribed.kind) {
    case "strength":
    case "hybrid":
      return {
        kind: prescribed.kind,
        sets: Array.from({ length: prescribed.sets }, () => ({
          reps: prescribed.reps,
          weight: prescribed.weight,
        })),
      };

    case "bodyweight":
      return {
        kind: "bodyweight",
        sets: Array.from({ length: prescribed.sets }, () => ({
          reps: prescribed.reps,
        })),
      };

    case "timed":
      return {
        kind: "timed",
        duration: prescribed.duration,
      };
  }
}




export function renderPrescribed(prescribed: Prescribed) {
  switch (prescribed.kind) {
    case "strength":
    case "hybrid":
      return `${prescribed.sets} × ${prescribed.reps}${
        prescribed.weight ? ` @ ${prescribed.weight} lb` : ""
      }`;

    case "bodyweight":
      return `${prescribed.sets} × ${prescribed.reps}`;

    case "timed":
      return `${prescribed.duration} seconds`;

    default:
      return "";
  }
}
