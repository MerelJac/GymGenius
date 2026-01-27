import { TrainerWithClientsAndWorkouts } from "@/types/trainer";
import { StatCard } from "./StatsCard";

export function TrainerStats({
  trainer,
}: {
  trainer: TrainerWithClientsAndWorkouts;
}) {
  const allWorkouts = trainer.clients.flatMap(
    (client) => client.scheduledWorkouts
  );

  const completed = allWorkouts.filter(
    (w) => w.status === "COMPLETED"
  ).length;

  const skipped = allWorkouts.filter(
    (w) => w.status === "SKIPPED"
  ).length;

  const adherence =
    completed + skipped > 0
      ? `${Math.round((completed / (completed + skipped)) * 100)}%`
      : "—";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <StatCard label="Clients" value={trainer.clients.length} />
      <StatCard label="Workouts Completed" value={completed} />
      <StatCard label="Missed Workouts" value={skipped} />
      <StatCard label="Adherence" value={adherence} />
    </div>
  );
}
