// src/app/components/clients/ClientProfileSection.tsx
"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { ClientProfileEditor } from "./ClientProfileEditor";
import { ClientProfilePageUser } from "@/types/client";

export default function ClientProfileSection({
  user,
}: {
  user: ClientProfilePageUser;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      {/* Profile Card */}
      <section className="bg-white border rounded-xl p-6 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Personal Info</h2>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded hover:bg-gray-100"
          >
            <Pencil size={16} />
          </button>
        </div>

        <div className="text-sm space-y-1">
          <div>
            <span className="font-medium">Email:</span> {user.email}
          </div>
          <div>
            <span className="font-medium">Name:</span> {user.profile?.firstName}{" "}
            {user.profile?.lastName}
          </div>
          <div>
            <span className="font-medium">DOB:</span>{" "}
            {user.profile?.dob
              ? new Date(user.profile.dob).toLocaleDateString()
              : "N/A"}
          </div>
          <div>
            <span className="font-medium">Experience:</span>{" "}
            {user.profile?.experience}
          </div>

          {user.profile?.injuryNotes && (
            <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700">
              <strong>Injuries:</strong> {user.profile.injuryNotes}
            </div>
          )}

          {user.profile?.waiverSignedAt && (
            <div>
              <span className="font-medium">
                Signed Waiver {user.profile?.waiverVersion}:
              </span>{" "}
              <a className="underline" target="_blank" href="/waiver">
                {new Date(user.profile?.waiverSignedAt).toLocaleDateString()}
              </a>
            </div>
          )}
        </div>
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

            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>

            <ClientProfileEditor
              clientId={user.id}
              firstName={user.profile?.firstName}
              lastName={user.profile?.lastName}
              dob={user.profile?.dob}
              experience={user.profile?.experience}
              injuryNotes={user.profile?.injuryNotes}
              onSave={() => setIsEditing(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
