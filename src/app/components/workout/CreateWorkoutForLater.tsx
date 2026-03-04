"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createWorkoutForLater } from "@/app/(client)/workouts/actions";

export function CreateWorkoutForLater({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [addWorkoutName, setAddWorkoutName] = useState("");

  return (
    <>
      {/* Trigger */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Create Strength Workout for Later
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
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-lg max-h-[80vh] overflow-y-scroll">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded p-1 hover:bg-gray-100"
            >
              <X size={18} />
            </button>
            <div className="flex flex-col gap-2">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Name your workout.
              </h3>

              <input
                className="w-full border rounded px-3 py-2"
                value={addWorkoutName}
                placeholder={"Workout name"}
                onChange={(e) => setAddWorkoutName(e.target.value)}
              />

              <button
                className="w-full bg-blue-600 text-white rounded px-4 py-2"
                onClick={async () => {
                  await createWorkoutForLater(
                    clientId,
                    addWorkoutName,
                  );
                }}
              >
                Create Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
