export function formatNextWorkout(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const workoutDay = new Date(date);
  workoutDay.setHours(0, 0, 0, 0);

  if (workoutDay.getTime() === today.getTime()) {
    return "Today";
  }

  return workoutDay.toLocaleDateString(undefined, {
    weekday: "long",
  });
}