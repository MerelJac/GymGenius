import { renderPrescribed } from "@/app/utils/workoutFunctions";
import { Prescribed } from "@/types/prescribed";
import { ExerciseLog } from "@/types/workout";

export function ExerciseLogViewer({ logs }: { logs: ExerciseLog[] }) {
  return (
    <ul className="space-y-4">
      {logs.map((log, index) => (
        <li
          key={`${log.id}-${index}`}
          className="rounded-xl border border-gray-200 bg-white p-4 space-y-4 shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">
              {log.exerciseName ?? "Exercise"}
            </h4>
            <div className="flex flex-col items-center justify-between gap-2">
              {log.substitutedFrom && (
                <span className="text-xs text-green-400">Substituted</span>
              )}
              <span className="text-xs text-gray-400">Logged</span>
            </div>
          </div>

          {/* Prescribed */}
          <div className="text-sm text-gray-600 bg-gray-50 border rounded-lg px-3 py-2">
            <span className="font-medium text-gray-700">Prescribed:</span>{" "}
            {log.prescribed
              ? renderPrescribed(log.prescribed as Prescribed)
              : "N/A"}
          </div>

          {/* Performed */}
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Performed
            </div>

            {/* Timed */}
            {log.performed?.kind === "timed" && (
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-sm font-medium w-24 text-gray-700">
                  Time
                </span>
                <span className="text-sm text-gray-900">
                  {log.performed.duration} seconds
                </span>
              </div>
            )}

            {/* Strength / Hybrid */}
            {(log.performed?.kind === "strength" ||
              log.performed?.kind === "hybrid") && (
              <div className="space-y-2">
                {log.performed.sets.map((set, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2"
                  >
                    <span className="text-sm font-medium w-14 text-gray-700">
                      Set {index + 1}
                    </span>

                    <span className="text-sm text-gray-900">
                      {set.reps} reps
                    </span>

                    {set.weight != null && (
                      <span className="text-sm text-gray-500">
                        @ {set.weight} lb
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* CORE & MOBILITY */}
            {(log.performed?.kind === "core" ||
              log.performed?.kind === "mobility") && (
              <div className="space-y-3">
                {(() => {
                  const sets = log.performed.sets;
                  const firstDuration = sets[0]?.duration;
                  const sameDuration =
                    firstDuration != null &&
                    sets.every((s) => s.duration === firstDuration);

                  return (
                    <>
                      {/* Sets */}
                      <div className="space-y-2">
                        {sets.map((set, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 flex-wrap gap-2"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-medium text-gray-500">
                                Set {index + 1}
                              </span>

                              {set.reps != null && (
                                <span className="text-sm text-gray-900">
                                  {set.reps} reps
                                </span>
                              )}

                              {set.duration != null && (
                                <span className="text-xs text-gray-500">
                                  • {set.duration}s
                                </span>
                              )}

                              {set.weight != null && (
                                <span className="text-xs text-gray-500">
                                  @ {set.weight} lb
                                </span>
                              )}
                            </div>

                            {/* Optional cue */}
                            <span className="text-xs text-gray-400 italic">
                              controlled
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Bodyweight */}
            {log.performed?.kind === "bodyweight" && (
              <div className="space-y-2">
                {log.performed.sets.map((set, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2"
                  >
                    <span className="text-sm font-medium w-14 text-gray-700">
                      Set {index + 1}
                    </span>
                    <span className="text-sm text-gray-900">
                      {set.reps} reps
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes / substitution */}
          {log.substitutionReason && (
            <div className="text-sm text-gray-600 italic bg-gray-50 border rounded-lg px-3 py-2">
              Notes: {log.substitutionReason}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
