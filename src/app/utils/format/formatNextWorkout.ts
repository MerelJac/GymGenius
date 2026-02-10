import { normalizeDate } from "./formatDateFromInput";

export function formatNextWorkout(date: Date) {
  const today = normalizeDate(new Date());
  const workoutDay = normalizeDate(date);

  if (workoutDay.getTime() === today.getTime()) {
    return "Today";
  }

  return workoutDay.toLocaleDateString(undefined, {
    weekday: "long",
  });
}
