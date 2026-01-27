"use client";

import { useState, startTransition } from "react";
import { updateClientProfile } from "@/app/(trainer)/clients/[clientId]/actions";

export function ClientProfileEditor({
  clientId,
  firstName: initialFirstName,
  lastName: initialLastName,
  dob: initialDob,
  experience: initialExperience,
  injuryNotes: initialInjuryNotes,
  phone: initalPhone,
  email: initialEmail,
  onSave,
}: {
  clientId: string;
  firstName?: string;
  email?: string;
  lastName?: string;
  phone?: string | null;
  dob?: Date | null;
  experience?: string | null;
  injuryNotes?: string | null;
  onSave?: () => void;
}) {
  const [firstName, setFirstName] = useState(initialFirstName ?? "");
  const [lastName, setLastName] = useState(initialLastName ?? "");
  const [dob, setDob] = useState(
    initialDob ? initialDob.toISOString().split("T")[0] : "",
  );
  const [phone, setPhone] = useState(initalPhone ?? "");
  const [email, setEmail] = useState(initialEmail ?? "");

  const [experience, setExperience] = useState(initialExperience ?? "");
  const [injuryNotes, setInjuryNotes] = useState(initialInjuryNotes ?? "");

  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  function handleSave() {
    setSaving(true);

    startTransition(async () => {
      await updateClientProfile(clientId, {
        firstName,
        lastName,
        dob: dob ? new Date(dob) : null,
        experience: experience || null,
        injuryNotes: injuryNotes || null,
        phone: phone || null,
        email: email || null,
      });

      setSaving(false);
      setIsEditing(false);
      onSave?.();
    });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5 max-h-screen overflow-scroll">
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition shadow-sm text-base"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition shadow-sm text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone
            </label>
            <input
              type="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Training Experience
            </label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. Beginner, 2 years lifting, former athlete"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Injuries or limitations
            </label>
            <textarea
              value={injuryNotes}
              onChange={(e) => setInjuryNotes(e.target.value)}
              rows={3}
              placeholder="Anything your trainer should know"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
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
        <div className="space-y-4 py-2">
          {/* NAME */}
          <div className="text-gray-900">
            <span className="text-xl font-semibold">
              {firstName || "—"} {lastName || ""}
            </span>
            {!firstName && !lastName && (
              <span className="ml-2 text-sm text-gray-400 italic">
                (not set)
              </span>
            )}
          </div>

          {/* email */}
          <div>
            <span className="block text-gray-500">Email</span>
            <span className="font-medium text-gray-900">
              {email || "Not set"}
            </span>
          </div>
          {/* phone */}
          <div>
            <span className="block text-gray-500">Phone</span>
            <span className="font-medium text-gray-900">
              {phone || "Not set"}
            </span>
          </div>

          {/* DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {/* DOB */}
            <div>
              <span className="block text-gray-500">Date of Birth</span>
              <span className="font-medium text-gray-900">
                {dob ? new Date(dob).toLocaleDateString() : "Not set"}
              </span>
            </div>

            {/* EXPERIENCE */}
            <div>
              <span className="block text-gray-500">Experience</span>
              <span className="font-medium text-gray-900">
                {experience || "Not set"}
              </span>
            </div>
          </div>

          {/* INJURIES */}
          <div>
            <span className="block text-sm text-gray-500 mb-1">
              Injuries / Limitations
            </span>

            {injuryNotes ? (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {injuryNotes}
              </div>
            ) : (
              <span className="text-sm text-gray-400 italic">
                None reported
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
