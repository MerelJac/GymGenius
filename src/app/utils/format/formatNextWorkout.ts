export function formatNextWorkout(date: Date) {
  const now = new Date();

  const todayLocal = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const workoutLocal = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  if (workoutLocal.getTime() === todayLocal.getTime()) {
    return "Today";
  }

  return workoutLocal.toLocaleDateString(undefined, {
    weekday: "long",
  });
}
