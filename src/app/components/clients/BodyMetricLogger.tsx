"use client";

import { useState } from "react";
import { addMyBodyMetric } from "@/app/(client)/profile/actions";

export function BodyMetricLogger() {
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    setLoading(true);

    await addMyBodyMetric(
      weight ? Number(weight) : null,
      bodyFat ? Number(bodyFat) : null,
    );

    setWeight("");
    setBodyFat("");
    setLoading(false);
  }

  return (
    <div className="flex gap-2 items-center flex-col">
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
        onClick={handleAdd}
        disabled={loading}
        className="border px-3 py-1 rounded"
      >
        {loading ? "Saving…" : "Add"}
      </button>
    </div>
  );
}
