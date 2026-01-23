"use client";

import { useState } from "react";
import { addBodyMetric } from "@/app/(trainer)/clients/[clientId]/actions";

export default function ClientProfile({ client }: { client: any }) {
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");

  async function handleAddMetric() {
    await addBodyMetric(
      client.id,
      weight ? Number(weight) : null,
      bodyFat ? Number(bodyFat) : null
    );

    setWeight("");
    setBodyFat("");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {client.profile?.firstName} {client.profile?.lastName}
      </h1>

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

        <button
          onClick={handleAddMetric}
          className="border px-3 py-1 rounded"
        >
          Add
        </button>
      </div>

      {/* Metrics history */}
      <div>
        <h2 className="font-semibold mb-2">Progress</h2>

        <ul className="space-y-1 text-sm">
          {client.bodyMetrics.map((m) => (
            <li key={m.id}>
              {new Date(m.recordedAt).toLocaleDateString()} —{" "}
              {m.weight ?? "–"} lb, {m.bodyFat ?? "–"}%
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
