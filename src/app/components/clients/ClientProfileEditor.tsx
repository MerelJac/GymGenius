"use client";

import { useState, startTransition } from "react";
import { updateClientProfile } from "@/app/(trainer)/clients/[clientId]/actions";

export function ClientProfileEditor({
  clientId,
  firstName: initialFirstName,
  lastName: initialLastName,
}: {
  clientId: string;
  firstName?: string;
  lastName?: string;
}) {
  const [firstName, setFirstName] = useState(initialFirstName ?? "");
  const [lastName, setLastName] = useState(initialLastName ?? "");
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  function handleSave() {
    setSaving(true);

    startTransition(async () => {
      await updateClientProfile(clientId, firstName, lastName);
      setSaving(false);
      setIsEditing(false);
    });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Profile Information
        </h2>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span>Edit</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                First Name
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                autoFocus
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Last Name
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm min-w-[100px]"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>

            <button
              onClick={() => setIsEditing(false)}
              disabled={saving}
              className="px-5 py-2.5 text-gray-700 font-medium hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between py-2">
          <div className="text-gray-900">
            <span className="font-medium text-lg">
              {firstName || "—"} {lastName || ""}
            </span>
            {!firstName && !lastName && (
              <span className="text-gray-400 italic ml-2 text-sm">
                (not set)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
