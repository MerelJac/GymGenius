"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { AddAdditionalWorkout } from "./AddAdditionalWorkout";

export function AdditionalWorkoutQuickAdd({
  clientId,
}: {
  clientId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Add additional activity
        </h2>

        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded p-1 hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Log additional workout
            </h3>

            <AddAdditionalWorkout
              clientId={clientId}
              onSaved={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
