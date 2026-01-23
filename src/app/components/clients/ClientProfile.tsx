"use client";

import { useState } from "react";
import Link from "next/link";
import { addBodyMetric } from "@/app/(trainer)/clients/[clientId]/actions";
import { Client } from "@/types/client";
import { ScheduledWorkoutWithProgram } from "@/types/workout";

export default function ClientProfile({ client }: { client: Client }) {
  type ProgramGroup = {
  program: {
    id: string;
    name: string;
  };
  workouts: ScheduledWorkoutWithProgram[];
};


  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");

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
  client.scheduledWorkouts.reduce<Record<string, ProgramGroup>>(
    (acc, sw) => {
      const program = sw.workout.program;

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
    },
    {},
  ),
);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <Link
          href={`/clients`}
          className="border px-3 py-1 rounded text-sm hover:bg-gray-50"
        >
          Back
        </Link>
        <h1 className="text-2xl font-semibold">
          {client.profile?.firstName} {client.profile?.lastName} {client.email}
        </h1>
      </div>

      {/* Profile Summary */}
      <div className="flex gap-2 items-start text-sm text-gray-600 flex-col">
        <p>
          Joined:{" "}
          {new Date(client.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p>Email: {client.email}</p>
      </div>

      {/* Add metric */}
      <div className="flex gap-2 items-center">
        <input
          type="number"
          step="0.1"
          placeholder="Weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="border px-2 py-1"
        />

        <input
          type="number"
          step="0.1"
          placeholder="BF %"
          value={bodyFat}
          onChange={(e) => setBodyFat(e.target.value)}
          className="border px-2 py-1"
        />

        <button onClick={handleAddMetric} className="border px-3 py-1 rounded">
          Add
        </button>
      </div>

      {/* Metrics history */}
      <div>
        <h2 className="font-semibold mb-2">Progress</h2>

        <ul className="space-y-1 text-sm">
          {client.bodyMetrics.map((m) => (
            <li key={m.id}>
              {new Date(m.recordedAt).toLocaleDateString()} — {m.weight ?? "–"}{" "}
              lb, {m.bodyFat ?? "–"}%
            </li>
          ))}
        </ul>
      </div>
      {/* Assigned Programs */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Programs</h2>

        {programs.length === 0 && (
          <p className="text-sm text-gray-500">No programs assigned yet.</p>
        )}

        {programs.map(({ program, workouts }) => {
          const completed = workouts.filter(
            (w) => w.status === "COMPLETED",
          ).length;

          return (
            <div key={program.id} className="border rounded p-4 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{program.name}</h3>
                <span className="text-sm text-gray-600">
                  {completed} / {workouts.length} completed
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                <div
                  className="bg-green-500 h-2"
                  style={{
                    width: `${(completed / workouts.length) * 100 || 0}%`,
                  }}
                />
              </div>

              {/* Workout list */}
              <ul className="text-sm text-gray-600 space-y-1">
                {workouts.map((w) => (
                  <li key={w.id} className="flex justify-between">
                    <span>
                      {w.workout.name} —{" "}
                      {new Date(w.scheduledDate).toLocaleDateString()}
                    </span>
                    <span className="uppercase text-xs">{w.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
