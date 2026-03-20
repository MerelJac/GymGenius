import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Performed } from "@/types/prescribed";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EditableSetsTable } from "./ExerciseEditLogTable";

// ─── Types ────────────────────────────────────────────────────────────────────
type ExerciseLogRow = {
  id: string;
  workoutLog: { endedAt: Date | null; scheduledId: string | null };
  performed: Performed;
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

function fmtDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

/** Total volume across all sets that have weight × reps */
function totalVolume(performed: Performed): number {
  if (performed.kind === "timed") return 0;
  return performed.sets.reduce((acc, s) => {
    const w = "weight" in s ? (s.weight ?? 0) : 0;
    const r = "reps" in s ? (s.reps ?? 0) : 0;
    return acc + w * r;
  }, 0);
}

/** Best set = highest weight, or most reps for bodyweight */
function bestSetLabel(performed: Performed): string | null {
  if (performed.kind === "timed") return null;

  if (performed.kind === "bodyweight") {
    const best = performed.sets.reduce(
      (b, s) => (s.reps > b.reps ? s : b),
      performed.sets[0],
    );
    return best ? `${best.reps} reps` : null;
  }

  // strength / hybrid / core / mobility
  const withWeight = performed.sets.filter(
    (s) => "weight" in s && s.weight !== null,
  );
  if (!withWeight.length) return null;
  const best = withWeight.reduce((b, s) =>
    (s as { weight: number }).weight > (b as { weight: number }).weight ? s : b,
  );
  const w = (best as { weight: number }).weight;
  const r = "reps" in best ? best.reps : null;
  return r !== null ? `${w}lbs × ${r}` : `${w}lbs`;
}

// ─── Per-kind table renderers ─────────────────────────────────────────────────
function SetsTable({ performed }: { performed: Performed }) {
  if (performed.kind === "timed") {
    return (
      <div className="px-5 py-4 text-sm text-zinc-400">
        Duration:{" "}
        <span className="text-white font-semibold">
          {fmtDuration(performed.duration)}
        </span>
      </div>
    );
  }

  const headers: string[] = (() => {
    switch (performed.kind) {
      case "strength":
        return ["Set", "Weight", "Reps", "Volume"];
      case "hybrid":
        return ["Set", "Weight", "Reps", "Duration"];
      case "bodyweight":
        return ["Set", "Reps"];
      case "core":
      case "mobility":
        return ["Set", "Reps", "Weight", "Duration"];
    }
  })();

  return (
    <div className="px-5 py-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-zinc-600 text-xs uppercase tracking-widest">
            {headers.map((h) => (
              <th
                key={h}
                className={`pb-2 font-medium ${h === "Set" ? "text-left" : "text-right"}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {performed.sets.map((set, i) => (
            <tr key={i}>
              <td className="py-2 text-zinc-500">{i + 1}</td>

              {performed.kind === "strength" && (
                <>
                  <td className="py-2 text-right text-zinc-300 font-medium">
                    {"weight" in set && set.weight !== null ? (
                      <>
                        {set.weight}
                        <span className="text-zinc-600 text-xs ml-0.5">
                          lbs
                        </span>
                      </>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="py-2 text-right text-zinc-300 font-medium">
                    {"reps" in set ? set.reps : "—"}
                  </td>
                  <td className="py-2 text-right text-zinc-500">
                    {"weight" in set && set.weight && "reps" in set ? (
                      <>
                        {(set.weight * set.reps).toLocaleString()}
                        <span className="text-zinc-700 text-xs ml-0.5">
                          lbs
                        </span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                </>
              )}

              {performed.kind === "hybrid" && (
                <>
                  <td className="py-2 text-right text-zinc-300 font-medium">
                    {"weight" in set && set.weight !== null ? (
                      <>
                        {set.weight}
                        <span className="text-zinc-600 text-xs ml-0.5">
                          lbs
                        </span>
                      </>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="py-2 text-right text-zinc-300 font-medium">
                    {"reps" in set ? set.reps : "—"}
                  </td>
                  <td className="py-2 text-right text-zinc-500">
                    {"duration" in set && set.duration !== null
                      ? fmtDuration(set.duration)
                      : "—"}
                  </td>
                </>
              )}

              {performed.kind === "bodyweight" && (
                <td className="py-2 text-right text-zinc-300 font-medium">
                  {"reps" in set ? set.reps : "—"}
                </td>
              )}

              {(performed.kind === "core" || performed.kind === "mobility") && (
                <>
                  <td className="py-2 text-right text-zinc-300 font-medium">
                    {"reps" in set ? set.reps : "—"}
                  </td>
                  <td className="py-2 text-right text-zinc-300 font-medium">
                    {"weight" in set && set.weight !== null ? (
                      <>
                        {set.weight}
                        <span className="text-zinc-600 text-xs ml-0.5">
                          lbs
                        </span>
                      </>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="py-2 text-right text-zinc-500">
                    {"duration" in set && set.duration !== null
                      ? fmtDuration(set.duration)
                      : "—"}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ clientId: string; exerciseId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { exerciseId } = await params;
  const clientId = session.user.id;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const rawLogs = await prisma.exerciseLog.findMany({
    where: {
      exerciseId,
      workoutLog: {
        clientId,
        endedAt: { gte: sixMonthsAgo },
      },
    },
    include: {
      workoutLog: { select: { endedAt: true, scheduledId: true } },
    },
    orderBy: { workoutLog: { endedAt: "desc" } },
  });

  console.log("Fetched exercise logs:", rawLogs.slice(0, 5)); // Log only the first 5 logs for debugging

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
  });
  const exerciseName = exercise?.name ?? "Exercise";
  // `performed` comes back as Prisma's JsonValue — cast to our typed union
  const exerciseLogs: ExerciseLogRow[] = rawLogs.map((log) => ({
    ...log,
    performed: log.performed as unknown as Performed,
  }));

  const hasLogs = exerciseLogs.length > 0;

  return (
    <div className="min-h-screen text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.025]" />

      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* ── Header ── */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c6f135] mb-2">
            Last 6 months
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Exercise History
          </h1>
          <div className="flex flex-row gap-2">
            <p className="mt-2 text-sm text-zinc-500">{exerciseName} •</p>
            <p className="mt-2 text-sm text-zinc-500">
              {hasLogs
                ? `${exerciseLogs.length} session${exerciseLogs.length !== 1 ? "s" : ""} logged`
                : "No sessions recorded yet"}
            </p>
          </div>
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
              const best = bestSetLabel(log.performed);
              const isTimed = log.performed.kind === "timed";

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
                      <div>
                        <p className="font-semibold text-sm">
                          {fmt(log.workoutLog.endedAt)}
                        </p>
                        <p className="text-[11px] text-zinc-600 capitalize">
                          {log.performed.kind}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      {isTimed ? (
                        <span className="bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-full">
                          <span className="text-white font-semibold">
                            {fmtDuration(
                              (
                                log.performed as {
                                  kind: "timed";
                                  duration: number;
                                }
                              ).duration,
                            )}
                          </span>
                        </span>
                      ) : (
                        <>
                          {best && (
                            <span className="bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-full">
                              Best&nbsp;
                              <span className="text-white font-semibold">
                                {best}
                              </span>
                            </span>
                          )}
                          {log.workoutLog.scheduledId && (
                            <Link
                              href={`/workouts/${log.workoutLog.scheduledId}`}
                              className="bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-full"
                            >
                              View Workout →
                            </Link>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* per-kind table */}
                  <EditableSetsTable
                    logId={log.id}
                    clientId={clientId}
                    exerciseId={exerciseId}
                    initialPerformed={log.performed}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
