// components/ClientProgramProgress.tsx
import Link from "next/link";
import { WorkoutStatus } from "@prisma/client";

type ScheduledWorkout = {
  status: WorkoutStatus;
  workout: {
    program: {
      id: string;
      name: string;
    };
  };
};

type ClientWithWorkouts = {
  id: string;
  email: string;
  profile?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  scheduledWorkouts: ScheduledWorkout[];
};

export function ClientProgramProgress({
  client,
  showClientLink = true,
}: {
  client: ClientWithWorkouts;
  showClientLink?: boolean;
}) {
  const programs = Object.values(
    client.scheduledWorkouts.reduce<Record<
      string,
      {
        program: { id: string; name: string };
        workouts: ScheduledWorkout[];
      }
    >>((acc, sw) => {
      const program = sw.workout.program;

      if (!acc[program.id]) {
        acc[program.id] = {
          program,
          workouts: [],
        };
      }

      acc[program.id].workouts.push(sw);
      return acc;
    }, {})
  );

  if (programs.length === 0) return null;

  return (
    <div className="border rounded p-4 space-y-3">
      {/* Client header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium">
            {client.profile?.firstName} {client.profile?.lastName}
          </div>
          <div className="text-xs text-gray-500">{client.email}</div>
        </div>

        {showClientLink && (
          <Link
            href={`/clients/${client.id}`}
            className="text-sm underline"
          >
            View
          </Link>
        )}
      </div>

      {/* Program progress */}
      <div className="space-y-2">
        {programs.map(({ program, workouts }) => {
          const completed = workouts.filter(
            (w) => w.status === WorkoutStatus.COMPLETED
          ).length;

          const percent =
            workouts.length > 0
              ? Math.round((completed / workouts.length) * 100)
              : 0;

          const statusLabel =
            percent === 0
              ? "Not started"
              : percent === 100
              ? "Completed"
              : "In progress";

          return (
            <div key={program.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{program.name}</span>
                <span className="text-gray-600">
                  {statusLabel} · {completed}/{workouts.length}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                <div
                  className={`h-2 ${
                    percent === 100 ? "bg-green-600" : "bg-green-500"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
