"use client";

import { useState, startTransition } from "react";
import { updateClientProfile } from "@/app/(trainer)/clients/[clientId]/actions";

export function ClientProfileEditor({
  firstName: initialFirstName,
  lastName: initialLastName,
}: {
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
      await updateClientProfile(firstName, lastName);
      setSaving(false);
      setIsEditing(false);
    });
  }

  return (
    <div className="border rounded p-4 space-y-3">
      <h2 className="font-semibold"> Profile</h2>
      {isEditing ? (
        <>
          <div className="flex gap-2">
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="border px-2 py-1 w-full"
            />

            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="border px-2 py-1 w-full"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="border px-3 py-1 rounded text-sm disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>

            <button
              onClick={() => setIsEditing(false)}
              disabled={saving}
              className="text-sm underline text-gray-500"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <div className="flex justify-between items-center">
          <p className="text-sm">
            {firstName} {lastName}
          </p>

          <button
            onClick={() => setIsEditing(true)}
            className="text-sm underline"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}
