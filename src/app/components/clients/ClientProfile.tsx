"use client";

import { useState } from "react";
import {
  addBodyMetric,
  deleteClient,
} from "@/app/(trainer)/clients/[clientId]/actions";
import { TrainerClientProfile } from "@/types/client";
import {
  ScheduledWorkoutWithProgram,
  ScheduledWorkoutWithWorkout,
} from "@/types/workout";
import { ClientProfileEditor } from "./ClientProfileEditor";
import { BackButton } from "../BackButton";
import { useRouter } from "next/navigation";
import { AlertCircle, Trash } from "lucide-react";
import WorkoutCalendarWeek from "../CalendarScheduledWorkout";
import { SyncProgramButton } from "../programs/SyncProgramButton";
import { formatDateFromInputReturnString } from "@/app/utils/format/formatDateFromInput";

export default function ClientProfile({
  client,
  scheduledWorkouts,
}: {
  client: TrainerClientProfile;
  scheduledWorkouts: ScheduledWorkoutWithWorkout[];
}) {
  type ProgramGroup = {
    program: {
      id: string;
      name: string;
    } 
    workouts: ScheduledWorkoutWithProgram[];
  };

  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null | undefined>(null);

  const router = useRouter();

  async function handleAddMetric() {
    await addBodyMetric(
      client.id,
      weight ? Number(weight) : null,
      bodyFat ? Number(bodyFat) : null,
    );

    setWeight("");
    setBodyFat("");
  }

  const programs = Object.values(
    client.scheduledWorkouts.reduce<Record<string, ProgramGroup>>((acc, sw) => {
      const program = sw.workout.program;
      // 🔒 Guard against null
      if (!program) return acc;

      if (!acc[program.id]) {
        acc[program.id] = {
          program: {
            id: program.id,
            name: program.name,
          },
          workouts: [],
        };
      }

      acc[program.id].workouts.push(sw);
      return acc;
    }, {}),
  );

  async function handleDeleteClient() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this client?\n\nThis action is irreversible.",
    );

    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    try {
      const result = await deleteClient(client.id);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push("/clients");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete client");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header with back + name */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <BackButton route={"/clients"} />

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {client.profile?.firstName} {client.profile?.lastName}
          <span className="text-gray-500 font-normal text-xl ml-3">
            {client.email}
          </span>
        </h1>
      </div>

      {/* Profile editor */}
      <ClientProfileEditor
        clientId={client.id}
        firstName={client.profile?.firstName}
        lastName={client.profile?.lastName}
        dob={client.profile?.dob}
        experience={client.profile?.experience}
        injuryNotes={client.profile?.injuryNotes}
        phone={client.profile?.phone}
        email={client.email}
      />

      {/* Basic info */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-sm">
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <dt className="text-gray-500 font-medium">Joined</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(client.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </dd>
          </div>

          <div>
            <dt className="text-gray-500 font-medium">Waiver Signed</dt>
            <dd className="mt-1 text-gray-900">
              {client.profile?.waiverSignedAt ? (
                new Date(client.profile.waiverSignedAt).toLocaleDateString(
                  undefined,
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )
              ) : (
                <>
                  <AlertCircle
                    size={16}
                    className="text-amber-500 cursor-help"
                  />

                  {/* Tooltip */}
                  <div
                    className="
          absolute left-1/2 top-full mt-2 -translate-x-1/2
          whitespace-nowrap
          rounded-md bg-gray-900 px-2 py-1
          text-xs text-white
          opacity-0 group-hover:opacity-100
          pointer-events-none
          transition
          z-50
        "
                  >
                    Waiver has not been signed
                  </div>
                </>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* Add metric form */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Log New Measurement
        </h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[140px]">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Weight (lb)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 172.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-base"
            />
          </div>

          <div className="min-w-[140px]">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Body Fat %
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 18.4"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-base"
            />
          </div>

          <button
            onClick={handleAddMetric}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!weight.trim() && !bodyFat.trim()}
          >
            Add Measurement
          </button>
        </div>
      </div>

      {/* Metrics history */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Progress History
        </h2>

        {client.bodyMetrics.length === 0 ? (
          <p className="text-gray-500 italic py-4">
            No measurements recorded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {client.bodyMetrics.map((m) => (
              <div
                key={m.id}
                className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 text-sm"
              >
                <div className="text-gray-600">
                  {new Date(m.recordedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="font-medium text-gray-900">
                  {m.weight ? `${m.weight} lb` : "–"} •{" "}
                  {m.bodyFat ? `${m.bodyFat}%` : "–"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assigned Programs */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Assigned Programs
        </h2>

        {programs.length === 0 ? (
          <p className="text-gray-500 italic py-4">No programs assigned yet.</p>
        ) : (
          <div className="space-y-5">
            {programs.map(({ program, workouts }) => {
              const completed = workouts.filter(
                (w) => w.status === "COMPLETED",
              ).length;
              const total = workouts.length;
              const progress = total ? (completed / total) * 100 : 0;

              
              return (
                <div
                  key={program.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4"
                >
                  <WorkoutCalendarWeek scheduledWorkouts={scheduledWorkouts} />

                  <SyncProgramButton
                    clientId={client.id}
                    programId={program.id}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {program.name}
                    </h3>
                    <span className="text-sm font-medium text-gray-600">
                      {completed} / {total} completed
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Workout list */}
                  <ul className="space-y-3 text-sm text-gray-700">
                    {workouts.map((w) => (
                      <li
                        key={w.id}
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2 border-b border-gray-100 last:border-0 last:pb-0"
                      >
                        <div>
                          <span className="font-medium">{w.workout.name}</span>
                          <span className="text-gray-500 ml-2">
                            • {formatDateFromInputReturnString(w.scheduledDate)}
                          </span>
                        </div>
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full uppercase tracking-wide ${
                            w.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : w.status === "SKIPPED"
                                ? "bg-red-100 text-red-800"
                                : w.status === "IN_PROGRESS"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {w.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Additional Workouts */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Additional Activity
        </h2>

        {client.additionalWorkouts.length === 0 ? (
          <p className="text-gray-500 italic py-4">
            No additional activity logged.
          </p>
        ) : (
          <ul className="space-y-3 text-sm">
            {client.additionalWorkouts.map((w) => (
              <li
                key={w.id}
                className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0"
              >
                <div className="space-y-0.5">
                  <div className="font-medium text-gray-900">{w.type.name}</div>

                  <div className="text-gray-500 text-xs">
                    {w.duration
                      ? `${w.duration} min`
                      : "Duration not specified"}
                    {w.distance != null && ` • ${w.distance} mi`}
                  </div>

                  {w.notes && (
                    <div className="text-gray-500 italic py-4 text-xs">
                      “{w.notes}”
                    </div>
                  )}
                </div>

                <div className="text-gray-500 text-sm">
                  {formatDateFromInputReturnString(w.performedAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Danger zone */}
      <div className="border border-red-200 bg-red-50 rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-semibold text-red-800 uppercase tracking-wide">
          Danger Zone
        </h2>

        <p className="text-sm text-red-700">
          Deleting a client will permanently remove all workouts, metrics, and
          activity associated with this client.
        </p>

        <button
          onClick={handleDeleteClient}
          disabled={deleting}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          <Trash size={16} />
          {deleting ? "Deleting…" : "Delete Client"}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
