"use client";

import { useState, startTransition } from "react";
import { Pencil, X } from "lucide-react";
import { updateTrainerProfile } from "../actions";
import { createPortal } from "react-dom";

type TrainerAccountSectionProps = {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phone: string | null | undefined;
};

export function TrainerAccountSection({
  firstName: initialFirstName,
  lastName: initialLastName,
  email: initialEmail,
  phone: initialPhone,
}: TrainerAccountSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(initialFirstName ?? "");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [error, setError] = useState<string | null | undefined>(null);

  const [phone, setPhone] = useState(initialPhone ?? "");

  const [lastName, setLastName] = useState(initialLastName ?? "");
  const [saving, setSaving] = useState(false);

  function handleSave() {
    setSaving(true);

    startTransition(async () => {
      setError(null);
      const result = await updateTrainerProfile(
        firstName,
        lastName,
        email,
        phone,
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaving(false);
      setIsEditing(false);
    });
  }

  return (
    <>
      {/* ACCOUNT INFO CARD */}
      {/* ACCOUNT INFO CARD */}
      <section className="gradient-bg border border-surface2 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface2">
          <h2 className="font-syne font-bold text-base text-foreground">
            Account Info
          </h2>
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface2 border border-transparent hover:border-lime-green/30 hover:text-lime-green text-muted text-xs font-semibold transition-all active:scale-[0.97]"
          >
            <Pencil size={12} />
            Edit
          </button>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-surface2">
          <div className="px-5 py-4 space-y-0.5">
            <dt className="text-[10px] font-semibold tracking-widest uppercase text-muted">
              Name
            </dt>
            <dd className="font-syne font-bold text-sm text-foreground mt-1">
              {initialFirstName ?? "—"} {initialLastName ?? ""}
            </dd>
          </div>
          <div className="px-5 py-4 space-y-0.5">
            <dt className="text-[10px] font-semibold tracking-widest uppercase text-muted">
              Email
            </dt>
            <dd className="font-syne font-bold text-sm text-foreground mt-1">
              {email}
            </dd>
          </div>
        </dl>
      </section>

      {/* EDIT MODAL */}
      {isEditing &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40 gradient-bg backdrop-blur-sm"
              onClick={() => setIsEditing(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-5 pointer-events-none">
              <div className="bg-surface border border-surface2 rounded-2xl w-full max-w-md pointer-events-auto overflow-hidden">
                {/* Modal header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-surface2">
                  <h3 className="font-syne font-bold text-base text-foreground">
                    Edit Account Info
                  </h3>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="w-8 h-8 rounded-xl bg-surface2 flex items-center justify-center text-muted hover:text-foreground transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Fields */}
                <div className="p-5 space-y-4">
                  {[
                    {
                      label: "First Name",
                      value: firstName,
                      onChange: setFirstName,
                      type: "text",
                    },
                    {
                      label: "Last Name",
                      value: lastName,
                      onChange: setLastName,
                      type: "text",
                    },
                    {
                      label: "Email",
                      value: email,
                      onChange: setEmail,
                      type: "email",
                    },
                    {
                      label: "Phone",
                      value: phone,
                      onChange: setPhone,
                      type: "tel",
                    },
                  ].map(({ label, value, onChange, type }) => (
                    <div key={label}>
                      <label className="block text-[10px] font-semibold tracking-widest uppercase text-muted mb-1.5">
                        {label}
                      </label>
                      <input
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-4 py-2.5 bg-background border border-surface2 rounded-xl text-foreground text-sm placeholder:text-muted focus:border-lime-green/50 focus:ring-1 focus:ring-lime-green/30 outline-none transition"
                      />
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-surface2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl bg-surface2 text-muted text-sm font-medium hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-lime-green text-black font-syne font-bold text-sm hover:opacity-90 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}

      {error && <p className="text-danger text-sm">{error}</p>}
    </>
  );
}
