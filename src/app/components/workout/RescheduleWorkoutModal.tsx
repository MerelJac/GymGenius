"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { rescheduleWorkout } from "@/app/(trainer)/clients/[clientId]/actions";

export function RescheduleWorkoutModal({
  scheduledWorkoutId,
  currentDate,
  onClose,
}: {
  scheduledWorkoutId: string;
  currentDate: Date;
  onClose: () => void;
}) {
  const [date, setDate] = useState(
    currentDate.toISOString().slice(0, 10),
  );
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    await rescheduleWorkout(scheduledWorkoutId, new Date(date));
    router.refresh();
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold">Reschedule workout</h2>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
