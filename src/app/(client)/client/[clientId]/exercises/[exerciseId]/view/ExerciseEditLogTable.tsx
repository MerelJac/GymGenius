"use client";

// components/EditableSetsTable.tsx
import {
  BodyweightPerformed,
  CorePerformed,
  HybridPerformed,
  MobilityPerformed,
  Performed,
  StrengthPerformed,
  TimedPerformed,
} from "@/types/prescribed";
import { useCallback, useState } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDuration(s: number) {
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

// ─── Inline editable cell ─────────────────────────────────────────────────────
function EditableCell({
  value,
  onCommit,
  suffix,
  className,
}: {
  value: number | null;
  onCommit: (v: number) => void;
  suffix?: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const open = () => {
    setDraft(value !== null ? String(value) : "");
    setEditing(true);
  };

  const commit = () => {
    const n = parseFloat(draft);
    if (!isNaN(n)) onCommit(n);
    setEditing(false);
  };

  if (editing) {
    return (
      <td className={`py-1.5 text-right ${className}`}>
        <input
          autoFocus
          type="number"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="w-20 text-right bg-zinc-800 border border-[#c6f135]/50 rounded px-2 py-0.5 text-white text-sm outline-none focus:ring-1 focus:ring-[#c6f135]/60"
        />
      </td>
    );
  }

  return (
    <td
      className={`py-1.5 text-right cursor-pointer group/cell ${className}`}
      onClick={open}
      title="Click to edit"
    >
      <span className="text-zinc-300 font-medium group-hover/cell:text-white transition-colors">
        {value !== null && value !== undefined ? value : "—"}
      </span>
      {suffix && value !== null && (
        <span className="text-zinc-600 text-xs ml-0.5">{suffix}</span>
      )}
      <span className="ml-1 opacity-0 group-hover/cell:opacity-100 transition-opacity text-zinc-600 text-xs">
        ✎
      </span>
    </td>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function EditableSetsTable({
  logId,
  clientId,
  exerciseId,
  initialPerformed,
}: {
  logId: string;
  clientId: string;
  exerciseId: string;
  initialPerformed: Performed;
}) {
  const [performed, setPerformed] = useState<Performed>(initialPerformed);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (next: Performed) => {
      setSaving(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/clients/${clientId}/exercises/${exerciseId}/logs/${logId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ performed: next }),
          },
        );
        if (!res.ok) throw new Error("Save failed");
        setPerformed(next);
      } catch {
        setError("Failed to save — please try again.");
      } finally {
        setSaving(false);
      }
    },
    [logId, clientId, exerciseId],
  );

  // ── Patch helpers per kind ──────────────────────────────────────────────────
  function patchStrengthSet(
    i: number,
    field: "reps" | "weight",
    value: number,
  ) {
    const p = performed as StrengthPerformed;
    const sets = p.sets.map((s, idx) =>
      idx === i ? { ...s, [field]: value } : s,
    );
    save({ ...p, sets });
  }

  function patchHybridSet(
    i: number,
    field: "reps" | "weight" | "duration",
    value: number,
  ) {
    const p = performed as HybridPerformed;
    const sets = p.sets.map((s, idx) =>
      idx === i ? { ...s, [field]: value } : s,
    );
    save({ ...p, sets });
  }

  function patchBodyweightSet(i: number, value: number) {
    const p = performed as BodyweightPerformed;
    const sets = p.sets.map((s, idx) =>
      idx === i ? { ...s, reps: value } : s,
    );
    save({ ...p, sets });
  }

  function patchCoreOrMobilitySet(
    i: number,
    field: "reps" | "weight" | "duration",
    value: number,
  ) {
    const p = performed as CorePerformed | MobilityPerformed;
    const sets = p.sets.map((s, idx) =>
      idx === i ? { ...s, [field]: value } : s,
    );
    save({ ...p, sets } as CorePerformed | MobilityPerformed);
  }

  function patchTimedDuration(value: number) {
    save({ ...(performed as TimedPerformed), duration: value });
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="px-5 py-4">
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

      {saving && (
        <p className="text-xs text-zinc-500 mb-2 animate-pulse">Saving…</p>
      )}

      {performed.kind === "timed" && (
        <div className="text-sm text-zinc-400 flex items-center gap-2">
          Duration:
          <EditableCell
            value={performed.duration}
            onCommit={patchTimedDuration}
            suffix="s"
            className="inline-flex"
          />
          <span className="text-zinc-600 text-xs">
            ({fmtDuration(performed.duration)})
          </span>
        </div>
      )}

      {performed.kind !== "timed" && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-600 text-xs uppercase tracking-widest">
              <th className="text-left pb-2 font-medium">Set</th>
              {(performed.kind === "strength" ||
                performed.kind === "hybrid") && (
                <>
                  <th className="text-right pb-2 font-medium">Reps</th>
                  <th className="text-right pb-2 font-medium">Weight</th>
                </>
              )}
              {performed.kind === "hybrid" && (
                <th className="text-right pb-2 font-medium">Duration</th>
              )}
              {performed.kind === "bodyweight" && (
                <th className="text-right pb-2 font-medium">Reps</th>
              )}
              {(performed.kind === "core" || performed.kind === "mobility") && (
                <>
                  <th className="text-right pb-2 font-medium">Reps</th>
                  <th className="text-right pb-2 font-medium">Weight</th>
                  <th className="text-right pb-2 font-medium">Duration</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {performed.kind === "strength" &&
              performed.sets.map((set, i) => (
                <tr key={i}>
                  <td className="py-1.5 text-zinc-500">{i + 1}</td>
                  <EditableCell
                    value={set.reps}
                    onCommit={(v) => patchStrengthSet(i, "reps", v)}
                  />
                  <EditableCell
                    value={set.weight}
                    onCommit={(v) => patchStrengthSet(i, "weight", v)}
                    suffix="lbs"
                  />
                </tr>
              ))}

            {performed.kind === "hybrid" &&
              performed.sets.map((set, i) => (
                <tr key={i}>
                  <td className="py-1.5 text-zinc-500">{i + 1}</td>

                  <EditableCell
                    value={set.reps}
                    onCommit={(v) => patchHybridSet(i, "reps", v)}
                  />
                  <EditableCell
                    value={set.weight}
                    onCommit={(v) => patchHybridSet(i, "weight", v)}
                    suffix="lbs"
                  />
                  <EditableCell
                    value={set.duration}
                    onCommit={(v) => patchHybridSet(i, "duration", v)}
                    suffix="s"
                  />
                </tr>
              ))}

            {performed.kind === "bodyweight" &&
              performed.sets.map((set, i) => (
                <tr key={i}>
                  <td className="py-1.5 text-zinc-500">{i + 1}</td>
                  <EditableCell
                    value={set.reps}
                    onCommit={(v) => patchBodyweightSet(i, v)}
                  />
                </tr>
              ))}

            {(performed.kind === "core" || performed.kind === "mobility") &&
              performed.sets.map((set, i) => (
                <tr key={i}>
                  <td className="py-1.5 text-zinc-500">{i + 1}</td>
                  <EditableCell
                    value={set.reps}
                    onCommit={(v) => patchCoreOrMobilitySet(i, "reps", v)}
                  />
                  <EditableCell
                    value={set.weight}
                    onCommit={(v) => patchCoreOrMobilitySet(i, "weight", v)}
                    suffix="lbs"
                  />
                  <EditableCell
                    value={set.duration}
                    onCommit={(v) => patchCoreOrMobilitySet(i, "duration", v)}
                    suffix="s"
                  />
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
