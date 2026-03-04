"use client";
import { useState, startTransition } from "react";
import { updateClientProfile } from "@/app/(trainer)/clients/[clientId]/actions";
import { ResendInviteButton } from "../ResendEmailButton";
import { formatDateFromInputReturnString } from "@/app/utils/format/formatDateFromInput";
import { formatPhoneDisplay } from "@/app/utils/format/formatPhoneNumber";
import { Pencil } from "lucide-react";

const inputClass = "w-full px-4 py-2.5 bg-surface2 border border-surface2 rounded-xl text-foreground text-sm placeholder:text-muted focus:border-lime-green/50 focus:ring-1 focus:ring-lime-green/30 outline-none transition";
const labelClass = "block text-[10px] font-semibold tracking-widest uppercase text-muted mb-1.5";

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
  const [dob, setDob] = useState(initialDob ? initialDob.toISOString().split("T")[0] : "");
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
    <div className="p-5 space-y-5">

      {/* ── EDIT FORM ── */}
      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>First Name</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name" autoFocus className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Date of Birth</label>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
              className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Phone</label>
            <input type="tel" value={phone ? formatPhoneDisplay(phone) : ""}
              onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Training Experience</label>
            <textarea value={experience} onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. Beginner, 2 years lifting, former athlete"
              rows={3} className={inputClass + " resize-none"} />
          </div>

          <div>
            <label className={labelClass}>Injuries / Limitations</label>
            <textarea value={injuryNotes} onChange={(e) => setInjuryNotes(e.target.value)}
              placeholder="Anything your trainer should know"
              rows={3} className={inputClass + " resize-none"} />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 bg-lime-green text-black font-syne font-bold text-sm rounded-xl hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button onClick={() => setIsEditing(false)} disabled={saving}
              className="px-5 py-2.5 bg-surface2 text-muted font-medium text-sm rounded-xl hover:text-foreground transition disabled:opacity-50">
              Cancel
            </button>
          </div>
        </div>

      ) : (
        /* ── READ VIEW ── */
        <div className="space-y-0 divide-y divide-surface2">

          {/* Name + edit button */}
          <div className="flex items-center justify-between pb-4">
            <div>
              <p className={labelClass}>Name</p>
              <p className="font-syne font-bold text-base text-foreground">
                {firstName || lastName ? `${firstName} ${lastName}`.trim() : "—"}
              </p>
            </div>
            <button onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface2 text-muted hover:text-lime-green transition-colors text-sm font-medium">
              <Pencil size={13} />
            </button>
          </div>

          {/* Email */}
          <div className="py-3.5">
            <p className={labelClass}>Email</p>
            <p className="text-sm font-medium text-foreground">{email || "Not set"}</p>
          </div>

          {/* Resend invite */}
          <div className="py-3.5 flex items-center gap-3">
            <ResendInviteButton email={email} />
            <span className="text-sm text-muted">Resend Invitation Email</span>
          </div>

          {/* Phone */}
          <div className="py-3.5">
            <p className={labelClass}>Phone</p>
            <p className="text-sm font-medium text-foreground">
              {phone ? formatPhoneDisplay(phone) : "Not set"}
            </p>
          </div>

          {/* DOB + Experience */}
          <div className="grid grid-cols-2 gap-4 py-3.5">
            <div>
              <p className={labelClass}>Date of Birth</p>
              <p className="text-sm font-medium text-foreground">
                {dob ? formatDateFromInputReturnString(dob) : "Not set"}
              </p>
            </div>
            <div>
              <p className={labelClass}>Experience</p>
              <p className="text-sm font-medium text-foreground">
                {experience || "Not set"}
              </p>
            </div>
          </div>

          {/* Injuries */}
          <div className="pt-3.5">
            <p className={labelClass}>Injuries / Limitations</p>
            {injuryNotes ? (
              <div className="mt-1.5 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger/90">
                {injuryNotes}
              </div>
            ) : (
              <p className="text-sm text-muted italic">None reported</p>
            )}
          </div>

        </div>
      )}
    </div>
  );
}