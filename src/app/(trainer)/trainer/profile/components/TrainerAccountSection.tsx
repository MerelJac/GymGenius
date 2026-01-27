"use client";

import { useState, startTransition } from "react";
import { Pencil, X } from "lucide-react";
import { updateTrainerProfile } from "../actions";

type TrainerAccountSectionProps = {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
};

export function TrainerAccountSection({
  firstName: initialFirstName,
  lastName: initialLastName,
  email,
}: TrainerAccountSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(initialFirstName ?? "");
  const [lastName, setLastName] = useState(initialLastName ?? "");
  const [saving, setSaving] = useState(false);

  function handleSave() {
    setSaving(true);

    startTransition(async () => {
      await updateTrainerProfile(firstName, lastName);
      setSaving(false);
      setIsEditing(false);
    });
  }

  return (
    <>
      {/* ACCOUNT INFO CARD */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Account Info
          </h2>

          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <Pencil size={14} />
            Edit
          </button>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <dt className="text-gray-500 font-medium">Name</dt>
            <dd className="mt-1 text-gray-900">
              {initialFirstName ?? "—"} {initialLastName ?? ""}
            </dd>
          </div>

          <div>
            <dt className="text-gray-500 font-medium">Email</dt>
            <dd className="mt-1 text-gray-900">{email}</dd>
          </div>
        </dl>
      </section>

      {/* EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-semibold mb-4">
              Edit Account Info
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg border text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
