"use client";
import { AddExerciseModal } from "@/app/(trainer)/exercises/components/AddExerciseModal";
import { Plus } from "lucide-react";
import { useState } from "react";
 
export function AddExerciseButton() {
  const [open, setOpen] = useState(false);
 
  return (
    <>
      <button onClick={() => setOpen(true)}>
        <Plus size={12} />
      </button>
      <AddExerciseModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => setOpen(false)}
      />
    </>
  );
}
 