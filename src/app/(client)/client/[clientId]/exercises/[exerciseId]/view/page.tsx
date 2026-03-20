import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
type SetLog = {
  id: string;
  setNumber: number;
  reps: number;
  weight: number;
  unit?: string | null;
};

type ExerciseLog = {
  id: string;
  workoutLog: { endedAt: Date | null };
  sets: SetLog[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function totalVolume(sets: SetLog[]) {
  return sets.reduce((acc, s) => acc + s.reps * (s.weight ?? 0), 0);
}

function bestSet(sets: SetLog[]) {
  if (!sets.length) return null;
  return sets.reduce((best, s) => (s.weight > best.weight ? s : best));
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function ExerciseDetailPage({
  params,
}: {
  params: { exerciseId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const clientId = session.user.id;
  const { exerciseId } = params;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Direct DB call — safe in a server component, no relative fetch needed
  const exerciseLogs: ExerciseLog[] = await prisma.exerciseLog.findMany({
    where: {
      exerciseId,
      workoutLog: {
        clientId,
        endedAt: { gte: sixMonthsAgo },
      },
    },
    include: {
      sets: { orderBy: { setNumber: "asc" } },
      workoutLog: { select: { endedAt: true } },
    },
    orderBy: { workoutLog: { endedAt: "desc" } },
  });

  const hasLogs = exerciseLogs.length > 0;

  return (
    <div className="min-h-screen bg-[#0e0f11] text-white">
      {/* subtle grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6">

        {/* ── Header ── */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c6f135] mb-2">
            Last 6 months
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Exercise History
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            {hasLogs
              ? `${exerciseLogs.length} session${exerciseLogs.length !== 1 ? "s" : ""} logged`
              : "No sessions recorded yet"}
          </p>
        </div>

        {/* ── Empty state ── */}
        {!hasLogs && (
          <div className="rounded-2xl border border-dashed border-zinc-800 py-20 flex flex-col items-center gap-3 text-zinc-600">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
              />
            </svg>
            <p className="text-sm">Complete a workout to see logs here.</p>
          </div>
        )}

        {/* ── Log cards ── */}
        {hasLogs && (
          <div className="space-y-5">
            {exerciseLogs.map((log, i) => {
              const best = bestSet(log.sets);
              const volume = totalVolume(log.sets);

              return (
                <div
                  key={log.id}
                  className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden"
                >
                  {/* card header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-[#c6f135]/10 border border-[#c6f135]/25 flex items-center justify-center text-[#c6f135] text-xs font-bold">
                        {exerciseLogs.length - i}
                      </span>
                      <span className="font-semibold text-sm">
                        {fmt(log.workoutLog.endedAt)}
                      </span>
                    </div>

                    {/* summary pills */}
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      {best && (
                        <span className="bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-full">
                          Best&nbsp;
                          <span className="text-white font-semibold">
                            {best.weight}
                            {best.unit ?? "kg"} × {best.reps}
                          </span>
                        </span>
                      )}
                      <span className="bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-full">
                        Vol&nbsp;
                        <span className="text-white font-semibold">
                          {volume.toLocaleString()}
                          {log.sets[0]?.unit ?? "kg"}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* sets table */}
                  <div className="px-5 py-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-zinc-600 text-xs uppercase tracking-widest">
                          <th className="text-left pb-2 font-medium">Set</th>
                          <th className="text-right pb-2 font-medium">
                            Weight
                          </th>
                          <th className="text-right pb-2 font-medium">Reps</th>
                          <th className="text-right pb-2 font-medium">
                            Volume
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {log.sets.map((set) => (
                          <tr key={set.id}>
                            <td className="py-2 text-zinc-500">
                              {set.setNumber}
                            </td>
                            <td className="py-2 text-right text-zinc-300 font-medium">
                              {set.weight}
                              <span className="text-zinc-600 text-xs ml-0.5">
                                {set.unit ?? "kg"}
                              </span>
                            </td>
                            <td className="py-2 text-right text-zinc-300 font-medium">
                              {set.reps}
                            </td>
                            <td className="py-2 text-right text-zinc-500">
                              {(set.reps * set.weight).toLocaleString()}
                              <span className="text-zinc-700 text-xs ml-0.5">
                                {set.unit ?? "kg"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}