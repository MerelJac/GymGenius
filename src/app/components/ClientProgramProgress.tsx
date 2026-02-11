// components/ClientProgramProgress.tsx
"use client";
import Link from "next/link";
import { WorkoutStatus } from "@prisma/client";
import { ClientWithWorkouts } from "@/types/client";
import { ScheduledWorkout } from "@/types/workout";
import { useTransition } from "react";
import { removeProgramFromClient } from "../(trainer)/programs/[programId]/actions";

export function ClientProgramProgress({
  client,
  showClientLink = true,
}: {
  client: ClientWithWorkouts;
  showClientLink?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleRemoveClientFromProgram = (programId: string) => {
    if (!confirm("Remove this client from the program?")) return;

    startTransition(async () => {
      await removeProgramFromClient(programId, client.id);
    });
  };

  const programs = Object.values(
    client.scheduledWorkouts.reduce<
      Record<
        string,
        {
          program: { id: string; name: string };
          workouts: ScheduledWorkout[];
        }
      >
    >((acc, sw) => {
      const program = sw.workout.program;

      // 🔒 Guard against null
      if (!program) return acc;

      if (!acc[program.id]) {
        acc[program.id] = {
          program,
          workouts: [],
        };
      }

      acc[program.id].workouts.push(sw);
      return acc;
    }, {}),
  );
  const hasRemovableWorkouts = client.scheduledWorkouts.some(
    (w) =>
      w.status === WorkoutStatus.SCHEDULED ||
      w.status === WorkoutStatus.IN_PROGRESS,
  );

  if (programs.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
      {/* Client header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <div className="font-semibold text-gray-900">
            {client.profile?.firstName} {client.profile?.lastName}
          </div>
          <div className="text-xs text-gray-500">{client.email}</div>
        </div>

        {showClientLink && (
          <Link
            href={`/clients/${client.id}`}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition"
          >
            View
          </Link>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Program progress */}
      <div className="space-y-4">
        {programs.map(({ program, workouts }) => {
          const completed = workouts.filter(
            (w) => w.status === WorkoutStatus.COMPLETED,
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
            <div key={program.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm gap-4">
                <span className="font-medium text-gray-900">
                  {program.name}
                </span>

                <div className="flex items-center gap-3">
                  <span className="text-gray-500">
                    {statusLabel} · {completed}/{workouts.length}
                  </span>

                  {hasRemovableWorkouts && (
                    <button
                      onClick={() => handleRemoveClientFromProgram(program.id)}
                      disabled={isPending}
                      className="
      text-xs font-medium text-red-600 hover:text-red-700
      disabled:opacity-50 disabled:cursor-not-allowed
    "
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    percent === 100
                      ? "bg-green-600"
                      : percent > 0
                        ? "bg-green-500"
                        : "bg-gray-300"
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
