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
      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Personal Info</h2>
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
          >
            <Pencil size={16} />
            Edit
          </button>
        </div>

        {/* Name */}
        <div>
          <span className="block text-gray-500">Name</span>
          <span className="font-medium text-gray-900">
            {user.profile?.firstName || "—"} {user.profile?.lastName || ""}
          </span>
        </div>
        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          {/* Email */}
          <div>
            <span className="block text-gray-500">Email</span>
            <span className="font-medium text-gray-900 break-all">
              {user.email}
            </span>
          </div>

          {/* Phone */}
          <div>
            <span className="block text-gray-500">Phone</span>
            {user.profile?.phone ? (
              <a
                href={`tel:${user.profile.phone}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {user.profile.phone}
              </a>
            ) : (
              <span className="text-gray-400 italic">Not provided</span>
            )}
          </div>

          {/* DOB */}
          <div>
            <span className="block text-gray-500">Date of Birth</span>
            <span className="font-medium text-gray-900">
              {user.profile?.dob
                ? new Date(user.profile.dob).toLocaleDateString()
                : "N/A"}
            </span>
          </div>

          {/* Experience */}
          <div className="sm:col-span-2">
            <span className="block text-gray-500">Training Experience</span>
            <span className="font-medium text-gray-900">
              {user.profile?.experience || "Not specified"}
            </span>
          </div>
        </div>

        {/* Injuries */}
        {user.profile?.injuryNotes && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <span className="font-medium">Injuries / Limitations</span>
            <p className="mt-1">{user.profile.injuryNotes}</p>
          </div>
        )}

        {/* Waiver */}
        {user.profile?.waiverSignedAt && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">
              Signed Waiver {user.profile.waiverVersion}:
            </span>{" "}
            <a
              className="text-blue-600 hover:underline"
              target="_blank"
              href="/waiver"
            >
              {new Date(user.profile.waiverSignedAt).toLocaleDateString()}
            </a>
          </div>
        )}
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
              phone={user.profile?.phone}
              email={user.email}
              onSave={() => setIsEditing(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
