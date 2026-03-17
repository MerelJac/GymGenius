"use client";
import { useState, useTransition } from "react";
import { Modal } from "@/app/components/ui/Modal";
import { copyWorkoutToProgram } from "@/app/(trainer)/programs/[programId]/actions";
import { Copy } from "lucide-react";

type Program = { id: string; name: string };

export function CopyWorkoutToProgramButton({
  workoutId,
  workoutName,
  currentProgramId,
  allPrograms,
}: {
  workoutId: string;
  workoutName: string;
  currentProgramId: string;
  allPrograms: Program[];
}) {
  const [open, setOpen] = useState(false);
  const [targetProgramId, setTargetProgramId] = useState("");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const otherPrograms = allPrograms.filter((p) => p.id !== currentProgramId);

  function handleCopy() {
    if (!targetProgramId) return;
    startTransition(async () => {
      const result = await copyWorkoutToProgram(workoutId, targetProgramId);
      if (result.ok) {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          setTargetProgramId("");
        }, 1200);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="wba-btn"
        title="Copy to another program"
      >
        <Copy size={16} /> Copy to...
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={`Copy "${workoutName}" to...`}>
        <div className="space-y-4">
          {otherPrograms.length === 0 ? (
            <p className="text-sm text-muted">No other programs available.</p>
          ) : (
            <>
              <select
                value={targetProgramId}
                onChange={(e) => setTargetProgramId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-surface2 rounded-xl text-sm text-foreground outline-none focus:border-lime-green/50"
              >
                <option value="">Select a program...</option>
                {otherPrograms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleCopy}
                disabled={!targetProgramId || isPending}
                className="w-full py-2.5 bg-lime-green text-black font-syne font-bold text-sm rounded-xl hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                {success ? "Copied ✓" : isPending ? "Copying..." : "Copy Workout"}
              </button>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}