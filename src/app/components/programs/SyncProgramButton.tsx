// src/app/components/clients/SyncProgramButton.tsx
"use client";

import { useState } from "react";
import { appendProgramWorkoutsToClient } from "@/app/(trainer)/programs/[programId]/actions";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

export function SyncProgramButton({
  clientId,
  programId,
}: {
  clientId: string;
  programId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState<number | null>(null);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    setAdded(null);

    const result = await appendProgramWorkoutsToClient(
      programId,
      clientId,
    );

    if (result.ok) {
      setAdded(result.added);
      router.refresh(); // pull in new scheduled workouts
    }

    setLoading(false);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className="
          inline-flex items-center gap-2
          px-4 py-2 text-sm font-medium
          rounded-lg border border-gray-300
          bg-white text-gray-700
          hover:bg-gray-50
          disabled:opacity-50
        "
      >
        <RefreshCcw size={16} />
        {loading ? "Syncing…" : "Add new workouts"}
      </button>

      {added !== null && (
        <span className="text-sm text-gray-500">
          {added === 0
            ? "No new workouts to add"
            : `${added} workout${added > 1 ? "s" : ""} added`}
        </span>
      )}
    </div>
  );
}
