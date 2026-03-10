// components/ClientProgramProgress.tsx
"use client";
import Link from "next/link";
import { WorkoutStatus } from "@prisma/client";
import { ClientWithWorkouts } from "@/types/client";
import { ScheduledWorkout } from "@/types/workout";
import { useState, useTransition } from "react";
import { removeProgramFromClient } from "../(trainer)/programs/[programId]/actions";

export function ClientProgramProgress({
  client,
  showClientLink = true,
}: {
  client: ClientWithWorkouts;
  showClientLink?: boolean;
}) {
  const [pendingProgramId, setPendingProgramId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleRemoveClientFromProgram = (programId: string) => {
    if (!confirm("Remove this client from the program? This will permanently remove non-completed workouts from this client.")) return;
    setPendingProgramId(programId);
    startTransition(async () => {
      const result = await removeProgramFromClient(programId, client.id);
      if (!result.ok) {
        alert(result.error ?? "Failed to remove client from program");
      }
      setPendingProgramId(null);
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


  const initials =
    [client.profile?.firstName?.[0], client.profile?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="space-y-3">
      {/* Client header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-lime-green to-[#3dffa0] flex items-center justify-center font-syne font-bold text-black text-xs flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-syne font-bold text-sm text-foreground leading-tight">
              {client.profile?.firstName} {client.profile?.lastName}
            </p>
            <p className="text-xs text-muted">{client.email}</p>
          </div>
        </div>
        {showClientLink && (
          <Link
            href={`/clients/${client.id}`}
            className="text-xs font-semibold text-muted hover:text-lime-green transition-colors px-3 py-1.5 rounded-xl bg-surface2 border border-transparent hover:border-lime-green/20"
          >
            View →
          </Link>
        )}
      </div>

      {/* Programs */}
      <div className="space-y-3 pl-11">
        {programs.map(({ program, workouts }) => {
          const completed = workouts.filter(
            (w) => w.status === WorkoutStatus.COMPLETED,
          ).length;
          const percent =
            workouts.length > 0
              ? Math.round((completed / workouts.length) * 100)
              : 0;
          const isComplete = percent === 100;
          const isStarted = percent > 0;
          const isRemoving = pendingProgramId === program.id;
          return (
            <div key={program.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground truncate">
                  {program.name}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isComplete
                        ? "text-[#3dffa0] bg-[#3dffa0]/10"
                        : isStarted
                          ? "text-lime-green bg-lime-green/10"
                          : "text-muted bg-surface2"
                    }`}
                  >
                    {completed}/{workouts.length}
                  </span>

                  <button
                    onClick={() => handleRemoveClientFromProgram(program.id)}
                    disabled={isRemoving}
                    className="text-[11px] font-semibold text-danger hover:opacity-80 disabled:opacity-40 transition"
                  >
                    {isRemoving ? "Removing…" : "Remove"}
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-surface2 rounded-full h-1 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    background: isComplete
                      ? "#3dffa0"
                      : isStarted
                        ? "linear-gradient(90deg, #c8f135, #3dffa0)"
                        : "transparent",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
